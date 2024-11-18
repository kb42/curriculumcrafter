from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '../../doc/database.db')

def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row 
    return conn

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Student")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/student/<netid>/plans', methods=['GET'])
def get_student_plans(netid):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Academic_Plan WHERE NetID = ?", (netid,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/plan/<planid>', methods=['GET'])
def get_plan(planid):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pc.PlanID, pc.CourseID, pc.Semester, cc.Credits
        FROM Planned_Course pc
        JOIN Course_Catalog cc ON pc.CourseID = cc.CourseID
        WHERE pc.PlanID = ?
    """, (planid,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/courses', methods=['GET'])
def get_courses():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Course_Catalog")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/course/<courseid>/prerequisites', methods=['GET'])
def get_prerequisites(courseid):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT PrerequisiteID 
        FROM Prerequisite 
        WHERE CourseID = ?
    """, (courseid,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])
    
if __name__ == '__main__':
    app.run(debug=True)
