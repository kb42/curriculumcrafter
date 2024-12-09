from flask import Flask, jsonify, request, g
from flask_cors import CORS
import os
import mysql.connector # type: ignore
from mysql.connector import IntegrityError, errorcode # type: ignore

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA_PATH = os.path.join(BASE_DIR, '../../doc/sqlite_dump.sql')

# MySQL configuration
DB_CONFIG = {
    'host': 'localhost',      # MySQL server host
    'user': 'root',  # MySQL username
    'password': 'Goswami3011',  # MySQL password
    'database': 'curriculum',  # MySQL database name
}

def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database']
        )
        g.db.row_factory = None  # Optional: MySQL doesn’t have an equivalent of `sqlite3.Row`
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
    try:
        # Connect to MySQL server
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        cursor = conn.cursor()

        # Check if the database exists
        cursor.execute("SHOW DATABASES;")
        databases = [db[0] for db in cursor.fetchall()]
        if DB_CONFIG['database'] not in databases:
            # Create the database
            cursor.execute(f"CREATE DATABASE {DB_CONFIG['database']};")
            print(f"Database '{DB_CONFIG['database']}' created.")
        else:
            print(f"Database '{DB_CONFIG['database']}' already exists.")

        # Use the database
        conn.database = DB_CONFIG['database']

        # Initialize schema
        with open(SCHEMA_PATH, 'r') as f:
            schema = f.read()
            for statement in schema.split(';'):  # Execute each statement
                if statement.strip():
                    cursor.execute(statement)
            conn.commit()

        print("Schema initialized.")

    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Access denied: Check your username or password.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist, and creation failed.")
        else:
            print(f"Error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def execute_query(query, args=(), one=False, commit=False):
    """
    Helper function to execute a database query.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)  # Fetch rows as dictionaries
    cursor.execute(query, args)

    data = cursor.fetchall()  # Fetch all rows
    if commit:
        conn.commit()  # Commit changes for INSERT/UPDATE/DELETE operations

    cursor.close()

    if one:
        return data[0] if data else None  # Return a single row as a dictionary
    else:
        return data  # Return a list of rows as dictionaries

def execute_transaction(queries):
    """
    Helper function to execute multiple queries as a transaction.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # Start transaction
        for query, args in queries:
            cursor.execute(query, args)

        # Commit transaction if all queries succeed
        conn.commit()
    except Exception as e:
        # Rollback transaction on any error
        conn.rollback()
        print("Transaction failed:", e)
        raise
    finally:
        cursor.close()

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

@app.route('/api/ap-course-mapping', methods=['GET'])
def get_ap_course_mapping():
    course_name = request.args.get('courseName')
    score = request.args.get('score')
    
    if not course_name or not score:
        return jsonify({"error": "Course name and score are required"}), 400
    
    query = """
    SELECT CourseID 
    FROM AP_Credits 
    WHERE LOWER(CourseName) = LOWER(%s) AND Score = %s
    """
    
    try:
        result = execute_query(query, (course_name, score), one=True)
        if result:
            return jsonify(result)
        return jsonify({"error": "No course mapping found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/ap-courses', methods=['GET'])
def get_unique_ap_courses():
    print("Fetching unique AP courses...")  # Debug print
    query = """
    SELECT DISTINCT CourseName 
    FROM AP_Credits 
    ORDER BY CourseName
    """
    try:
        courses = execute_query(query)
        print(f"Found AP courses: {courses}")  # Debug print
        return jsonify(courses)
    except Exception as e:
        print(f"Error fetching AP courses: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/<netid>/plans', methods=['GET'])
def get_student_plans(netid):
    query = """
        SELECT PlanID, CreationDate, NetID
        FROM Academic_Plan
        WHERE NetID IS NOT NULL AND LOWER(NetID) = LOWER(%s)
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
        WHERE pc.PlanID = %s
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
        WHERE p.CourseID = %s
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
        "SELECT * FROM Student WHERE NetID = %s",
        (netid,),
        one=True
    )

    if existing_student:
        return jsonify({"error": "Account with this NetID already exists"}), 409

    try:
        execute_query(
            "INSERT INTO Student (NetID, Name, Expected_Graduation, MajorID) VALUES (%s, %s, %s, %s)",
            (netid, name, graduation, major),
            commit=True
        )
        return jsonify({"message": "Account created successfully"}), 201
    except IntegrityError as e:
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
        "SELECT * FROM Student WHERE NetID = %s AND Name = %s",
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
        WHERE LOWER(CourseID) LIKE %s
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
            WHERE p.CourseID = %s
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
            "SELECT * FROM Student WHERE NetID = %s",
            (netid,),
            one=True
        )

        if not existing_student:
            return jsonify({"error": "Account with this NetID does not exist"}), 404

        execute_query(
            """
            UPDATE Student
            SET Name = %s, MajorID = %s, Expected_Graduation = %s
            WHERE NetID = %s
            """,
            (name or existing_student["Name"], major or existing_student["MajorID"],
             graduation or existing_student["Expected_Graduation"], netid),
            commit=True
        )
        return jsonify({"message": "Information updated successfully"}), 200
    except IntegrityError as e:
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
            "INSERT INTO Academic_Plan (PlanID, CreationDate, NetID) VALUES (%s, DATE(NOW()), %s)",
            (new_planid, netid),
            commit=True
        )
        return jsonify({"message": f"Plan added successfully with PlanID {new_planid}.", "planid": new_planid}), 201
    except IntegrityError as e:
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
        plan_exists = execute_query("SELECT 1 FROM Academic_Plan WHERE PlanID = %s", (planid,), one=True)
        print(f"Plan exists check: {plan_exists}")
        if not plan_exists:
            return jsonify({"error": f"PlanID {planid} does not exist"}), 404

        # Check if CourseID exists
        course_exists = execute_query("SELECT 1 FROM Course_Catalog WHERE LOWER(CourseID) = LOWER(%s)", (courseid,), one=True)
        print(f"Course exists check: {course_exists}")
        if not course_exists:
            return jsonify({"error": f"CourseID {courseid} does not exist in Course_Catalog"}), 404

        # Check for duplicate entries
        duplicate_check = execute_query(
            "SELECT 1 FROM Planned_Course WHERE PlanID = %s AND CourseID = %s",
            (planid, courseid),
            one=True
        )
        print(f"Duplicate entry check: {duplicate_check}")
        if duplicate_check:
            return jsonify({"error": f"Course {courseid} is already added to PlanID {planid}"}), 409

        # Add the course
        execute_query(
            "INSERT INTO Planned_Course (PlanID, CourseID, Semester) VALUES (%s, %s, %s)",
            (planid, courseid, semester),
            commit=True
        )
        print("Course added successfully")
        return jsonify({"message": f"Course {courseid} added to PlanID {planid} successfully"}), 201
    except IntegrityError as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/api/plan/<int:planid>', methods=['DELETE'])
def delete_plan(planid):
    try:
        execute_query("DELETE FROM Academic_Plan WHERE PlanID = %s", (planid,), commit=True)
        return jsonify({"message": "Plan deleted successfully"}), 200
    except IntegrityError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/plan/<int:planid>/course/<courseid>', methods=['DELETE'])
def delete_course(planid, courseid):
    try:
        print(f"Attempting to delete CourseID={courseid.upper()} from PlanID={planid}")
        
        execute_query(
            "DELETE FROM Planned_Course WHERE PlanID = %s AND LOWER(CourseID) = LOWER(%s)",
            (planid, courseid),
            commit=True
        )
        
        print("Delete operation executed successfully.")
        return jsonify({"message": f"Course {courseid} removed from PlanID {planid} successfully"}), 200
    except IntegrityError as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/students/total-credits/<netid>', methods=['GET'])
def get_total_credits(netid):
    """
    Retrieves the total planned credits for a given student using a transaction.
    Parameters:
        netid (str): The NetID of the student.
    Returns:
        JSON response with total planned credits or an error message.
    """
    query = """
    SELECT DISTINCT s.NetID, s.Name, SUM(cc.Credits) AS Total_Planned_Credits
    FROM Student s
    JOIN Academic_Plan ap ON s.NetID = ap.NetID
    JOIN Planned_Course pc ON ap.PlanID = pc.PlanID
    JOIN Course_Catalog cc ON pc.CourseID = cc.CourseID
    WHERE s.NetID = %s
    GROUP BY s.NetID, s.Name
    ORDER BY Total_Planned_Credits DESC
    LIMIT 15;
    """
    queries = [(query, (netid,))]

    try:
        result = execute_transaction(queries)
        return jsonify(result)
    except Exception as e:
        print(f"Failed to fetch total credits for NetID {netid}: {e}")
        return jsonify({"error": f"Failed to fetch total credits for NetID {netid}"}), 500

@app.route('/api/students/requirements/<netid>', methods=['GET'])
def find_students_fulfilling_requirements(netid):
    """
    Retrieves planned courses that fulfill requirements for a specific student using a transaction.
    Parameters:
        netid (str): The NetID of the student.
    Returns:
        JSON response with planned courses fulfilling requirements or an error message.
    """
    query = """
    SELECT DISTINCT s.NetID, s.Name, r.MajorID, r.CourseID
    FROM Student s
    JOIN Academic_Plan ap ON s.NetID = ap.NetID
    JOIN Planned_Course pc ON ap.PlanID = pc.PlanID
    JOIN Requirement r ON r.CourseID = pc.CourseID
    WHERE r.MajorID = s.MajorID AND s.NetID = %s
    LIMIT 15;
    """
    queries = [(query, (netid,))]

    try:
        result = execute_transaction(queries)
        return jsonify(result)
    except Exception as e:
        print(f"Failed to fetch students fulfilling requirements for NetID {netid}: {e}")
        return jsonify({"error": f"Failed to fetch students fulfilling requirements for NetID {netid}"}), 500


if __name__ == '__main__':
    app.run(debug=True)