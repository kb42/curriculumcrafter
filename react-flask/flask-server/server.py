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

@app.route('/api/course/<courseid>/prerequisites', methods=['GET'])
def get_prerequisites(courseid):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.CourseID, p.PrerequisiteID, c.Credits AS PrerequisiteCredits
        FROM Prerequisite p
        JOIN Course_Catalog c ON p.PrerequisiteID = c.CourseID
        WHERE p.CourseID = ?
    """, (courseid,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

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

@app.route('/api/courses/search', methods=['GET'])
def search_courses():
    query = request.args.get('q', '').lower()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT CourseID FROM Course_Catalog WHERE LOWER(CourseID) LIKE ?", (f"%{query}%",))
    courses = cursor.fetchall()
    conn.close()
    return jsonify([dict(course) for course in courses])


if __name__ == '__main__':
    app.run(debug=True)
