from flask import Flask, jsonify, request, g
import sqlite3
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '../../doc/database.db')

def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        # Enable foreign key support
        g.db.execute('PRAGMA foreign_keys = ON;')
    return g.db

@app.teardown_appcontext
def close_db(exception):
    """
    Closes the database again at the end of the request.
    """
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """
    Initializes the database by creating tables from schema.sql if the database doesn't exist.
    """
    if not os.path.exists(DB_PATH):
        with sqlite3.connect(DB_PATH) as conn:
            with open(os.path.join(BASE_DIR, '../../doc/schema.sql'), 'r') as f:
                conn.executescript(f.read())
        print("Database initialized and schema created.")
    else:
        print("Database already exists.")

def execute_query(query, args=(), one=False, commit=False):
    """
    Helper function to execute a database query.
    """
    conn = get_db()
    cursor = conn.execute(query, args)
    data = cursor.fetchall()
    if commit:
        conn.commit()
    cursor.close()
    if one:
        return dict(data[0]) if data else None
    else:
        return [dict(row) for row in data]

init_db()

@app.route('/api/students', methods=['GET'])
def get_students():
    query = "SELECT * FROM Student"
    students = execute_query(query)
    return jsonify(students)

@app.route('/api/courses', methods=['GET'])
def get_courses():
    query = "SELECT * FROM Course_Catalog"
    courses = execute_query(query)
    return jsonify(courses)

@app.route('/api/student/<netid>/plans', methods=['GET'])
def get_student_plans(netid):
    query = """
        SELECT PlanID, CreationDate, NetID
        FROM Academic_Plan
        WHERE NetID IS NOT NULL AND LOWER(NetID) = LOWER(?)
    """
    plans = execute_query(query, (netid,))
    if not plans:
        return jsonify({"error": "No academic plans found for this student"}), 404
    return jsonify(plans)

@app.route('/api/plan/<int:planid>', methods=['GET'])
def get_plan(planid):
    query = """
        SELECT pc.PlanID, pc.CourseID, pc.Semester, cc.Credits
        FROM Planned_Course pc
        JOIN Course_Catalog cc ON pc.CourseID = cc.CourseID
        WHERE pc.PlanID = ?
    """
    courses = execute_query(query, (planid,))
    return jsonify(courses)

@app.route('/api/majors', methods=['GET'])
def get_majors():
    query = "SELECT DISTINCT MajorID FROM Requirement"
    majors = execute_query(query)
    return jsonify(majors)

@app.route('/api/course/<courseid>/prerequisites', methods=['GET'])
def get_prerequisites(courseid):
    query = """
        SELECT p.CourseID, p.PrerequisiteID, c.Credits AS PrerequisiteCredits
        FROM Prerequisite p
        JOIN Course_Catalog c ON p.PrerequisiteID = c.CourseID
        WHERE p.CourseID = ?
    """
    prerequisites = execute_query(query, (courseid,))
    return jsonify(prerequisites)

@app.route('/api/create-account', methods=['POST'])
def create_account():
    data = request.get_json()
    name = data.get('name')
    netid = data.get('netid')
    major = data.get('majorid')
    graduation = data.get('egrad')

    if not all([name, netid, major, graduation]):
        return jsonify({"error": "All fields are required"}), 400

    existing_student = execute_query(
        "SELECT * FROM Student WHERE NetID = ?",
        (netid,),
        one=True
    )

    if existing_student:
        return jsonify({"error": "Account with this NetID already exists"}), 409

    try:
        execute_query(
            "INSERT INTO Student (NetID, Name, Expected_Graduation, MajorID) VALUES (?, ?, ?, ?)",
            (netid, name, graduation, major),
            commit=True
        )
        return jsonify({"message": "Account created successfully"}), 201
    except sqlite3.IntegrityError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """
    Validate login credentials by checking the Student table.
    """
    data = request.get_json()
    netid = data.get('netid')
    name = data.get('name')

    if not all([netid, name]):
        return jsonify({"error": "NetID and Name are required"}), 400

    user = execute_query(
        "SELECT * FROM Student WHERE NetID = ? AND Name = ?",
        (netid, name),
        one=True
    )

    if user:
        return jsonify({"message": "Login successful!", "user": user}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/courses/search', methods=['GET'])
def search_courses():
    search_term = request.args.get('q', '').lower()
    query = """
        SELECT CourseID 
        FROM Course_Catalog 
        WHERE LOWER(CourseID) LIKE ?
        LIMIT 50
    """
    courses = execute_query(query, (f"%{search_term}%",))
    return jsonify(courses)

@app.route('/api/course/<courseid>/prerequisite-graph', methods=['GET'])
def get_prerequisite_graph(courseid):
    """
    Recursively fetch all prerequisites and construct graph data.
    """
    def fetch_prerequisites(courseid, visited):
        if courseid in visited:
            return []
        visited.add(courseid)
        query = """
            SELECT p.CourseID, p.PrerequisiteID
            FROM Prerequisite p
            WHERE p.CourseID = ?
        """
        prerequisites = execute_query(query, (courseid,))
        edges = [{"from": prereq["PrerequisiteID"], "to": prereq["CourseID"]} for prereq in prerequisites]
        for prereq in prerequisites:
            edges.extend(fetch_prerequisites(prereq["PrerequisiteID"], visited))
        return edges

    visited = set()
    graph_edges = fetch_prerequisites(courseid, visited)
    nodes = [{"id": course, "label": course} for course in visited]
    return jsonify({"nodes": nodes, "edges": graph_edges})

@app.route('/api/update-account', methods=['PUT'])
def update_account():
    data = request.get_json()
    netid = data.get('netid')
    name = data.get('name')
    major = data.get('majorid')
    graduation = data.get('egrad')

    if not netid:
        return jsonify({"error": "NetID is required for updating information"}), 400

    try:
        existing_student = execute_query(
            "SELECT * FROM Student WHERE NetID = ?",
            (netid,),
            one=True
        )

        if not existing_student:
            return jsonify({"error": "Account with this NetID does not exist"}), 404

        execute_query(
            """
            UPDATE Student
            SET Name = ?, MajorID = ?, Expected_Graduation = ?
            WHERE NetID = ?
            """,
            (name or existing_student["Name"], major or existing_student["MajorID"],
             graduation or existing_student["Expected_Graduation"], netid),
            commit=True
        )
        return jsonify({"message": "Information updated successfully"}), 200
    except sqlite3.IntegrityError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/plan', methods=['POST'])
def add_plan():
    data = request.get_json()
    netid = data.get('netid')

    if not netid:
        return jsonify({"error": "NetID is required"}), 400

    try:
        # Find the lowest available PlanID
        query = "SELECT MAX(PlanID) AS max_planid FROM Academic_Plan"
        result = execute_query(query, one=True)
        max_planid = result["max_planid"] if result["max_planid"] is not None else 0
        new_planid = max_planid + 1

        # Add the new plan with only the date
        execute_query(
            "INSERT INTO Academic_Plan (PlanID, CreationDate, NetID) VALUES (?, date('now'), ?)",
            (new_planid, netid),
            commit=True
        )
        return jsonify({"message": f"Plan added successfully with PlanID {new_planid}.", "planid": new_planid}), 201
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/api/course', methods=['POST'])
def add_course():
    data = request.get_json()
    planid = data.get('planid')
    courseid = data.get('courseid').strip().upper()  # Ensure uppercase
    semester = data.get('semester').strip().upper()  # Ensure uppercase

    print(f"Received payload: PlanID={planid}, CourseID={courseid}, Semester={semester}")

    if not all([planid, courseid, semester]):
        return jsonify({"error": "All fields (planid, courseid, semester) are required"}), 400

    try:
        # Check if the PlanID exists
        plan_exists = execute_query("SELECT 1 FROM Academic_Plan WHERE PlanID = ?", (planid,), one=True)
        print(f"Plan exists check: {plan_exists}")
        if not plan_exists:
            return jsonify({"error": f"PlanID {planid} does not exist"}), 404

        # Check if CourseID exists
        course_exists = execute_query("SELECT 1 FROM Course_Catalog WHERE LOWER(CourseID) = LOWER(?)", (courseid,), one=True)
        print(f"Course exists check: {course_exists}")
        if not course_exists:
            return jsonify({"error": f"CourseID {courseid} does not exist in Course_Catalog"}), 404

        # Check for duplicate entries
        duplicate_check = execute_query(
            "SELECT 1 FROM Planned_Course WHERE PlanID = ? AND CourseID = ?",
            (planid, courseid),
            one=True
        )
        print(f"Duplicate entry check: {duplicate_check}")
        if duplicate_check:
            return jsonify({"error": f"Course {courseid} is already added to PlanID {planid}"}), 409

        # Add the course
        execute_query(
            "INSERT INTO Planned_Course (PlanID, CourseID, Semester) VALUES (?, ?, ?)",
            (planid, courseid, semester),
            commit=True
        )
        print("Course added successfully")
        return jsonify({"message": f"Course {courseid} added to PlanID {planid} successfully"}), 201
    except sqlite3.IntegrityError as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/api/plan/<int:planid>', methods=['DELETE'])
def delete_plan(planid):
    try:
        execute_query("DELETE FROM Academic_Plan WHERE PlanID = ?", (planid,), commit=True)
        return jsonify({"message": "Plan deleted successfully"}), 200
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/plan/<int:planid>/course/<courseid>', methods=['DELETE'])
def delete_course(planid, courseid):
    try:
        print(f"Attempting to delete CourseID={courseid.upper()} from PlanID={planid}")
        
        execute_query(
            "DELETE FROM Planned_Course WHERE PlanID = ? AND LOWER(CourseID) = LOWER(?)",
            (planid, courseid),
            commit=True
        )
        
        print("Delete operation executed successfully.")
        return jsonify({"message": f"Course {courseid} removed from PlanID {planid} successfully"}), 200
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)