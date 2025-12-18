"""
CurriculumCrafter Flask Server with MySQL and JWT Authentication
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)
from sqlalchemy import func
from datetime import datetime, timedelta
import bcrypt
import os
from dotenv import load_dotenv

# Import models
from models import (
    db, User, Student, AcademicPlan, CourseCatalog,
    PlannedCourse, Prerequisite, Requirement, APCredit
)

# Load environment variables
load_dotenv()

# ============================================================================
# APP CONFIGURATION
# ============================================================================

app = Flask(__name__)
CORS(app)

# MySQL Configuration
def get_mysql_url():
    host = os.getenv('MYSQL_HOST')
    port = os.getenv('MYSQL_PORT', '3306')
    database = os.getenv('MYSQL_DATABASE')
    user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')

    if not all([host, database, user, password]):
        raise ValueError("Missing MySQL credentials in .env file!")

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"

app.config['SQLALCHEMY_DATABASE_URI'] = get_mysql_url()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 280,
    'pool_pre_ping': True,
}

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
    seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with username and password"""
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    netid = data.get('netid')
    major = data.get('majorid')
    graduation = data.get('egrad')

    # Validate required fields
    if not all([username, password, name, netid, major, graduation]):
        return jsonify({"error": "All fields are required"}), 400

    # Check if username already exists
    if User.query.filter_by(Username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    # Check if netid already exists
    if Student.query.filter_by(NetID=netid).first():
        return jsonify({"error": "NetID already exists"}), 409

    try:
        # Create student first
        student = Student(
            NetID=netid,
            Name=name,
            Expected_Graduation=graduation,
            MajorID=major
        )
        db.session.add(student)
        db.session.flush()  # Get NetID without committing

        # Create user
        password_hash = hash_password(password)
        user = User(
            Username=username,
            PasswordHash=password_hash,
            NetID=netid
        )
        db.session.add(user)
        db.session.commit()

        return jsonify({
            "message": "Account created successfully",
            "netid": netid
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login with username and password, returns JWT token"""
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({"error": "Username and password are required"}), 400

    # Find user
    user = User.query.filter_by(Username=username).first()

    if not user or not verify_password(password, user.PasswordHash):
        return jsonify({"error": "Invalid credentials"}), 401

    # Get student info
    student = Student.query.filter_by(NetID=user.NetID).first()

    # Create JWT token
    access_token = create_access_token(identity=user.NetID)

    return jsonify({
        "access_token": access_token,
        "netid": user.NetID,
        "name": student.Name if student else None,
        "majorid": student.MajorID if student else None,
        "egrad": float(student.Expected_Graduation) if student and student.Expected_Graduation else None
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information (requires JWT token)"""
    netid = get_jwt_identity()

    user = User.query.filter_by(NetID=netid).first()
    student = Student.query.filter_by(NetID=netid).first()

    if not user or not student:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "username": user.Username,
        "netid": student.NetID,
        "name": student.Name,
        "majorid": student.MajorID,
        "egrad": float(student.Expected_Graduation) if student.Expected_Graduation else None
    }), 200


@app.route('/api/auth/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update student profile (requires JWT token)"""
    netid = get_jwt_identity()
    data = request.get_json()

    student = Student.query.filter_by(NetID=netid).first()
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Update fields if provided
    if 'name' in data:
        student.Name = data['name']
    if 'majorid' in data:
        student.MajorID = data['majorid']
    if 'egrad' in data:
        student.Expected_Graduation = data['egrad']

    try:
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Update failed: {str(e)}"}), 500


# ============================================================================
# PUBLIC ENDPOINTS (No JWT required)
# ============================================================================

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get all courses (public)"""
    courses = CourseCatalog.query.all()
    return jsonify([course.to_dict() for course in courses])


@app.route('/api/majors', methods=['GET'])
def get_majors():
    """Get all majors (public)"""
    majors = db.session.query(Requirement.MajorID).distinct().all()
    return jsonify([{"MajorID": m[0]} for m in majors if m[0]])


@app.route('/api/course/<courseid>/prerequisites', methods=['GET'])
def get_prerequisites(courseid):
    """Get prerequisites for a course (public)"""
    prerequisites = Prerequisite.query.filter_by(CourseID=courseid).all()
    return jsonify([prereq.to_dict() for prereq in prerequisites])


@app.route('/api/courses/search', methods=['GET'])
def search_courses():
    """Search courses by ID (public)"""
    search_term = request.args.get('q', '').lower()
    courses = CourseCatalog.query.filter(
        CourseCatalog.CourseID.ilike(f'%{search_term}%')
    ).limit(50).all()
    return jsonify([course.to_dict() for course in courses])


@app.route('/api/course/<courseid>/prerequisite-graph', methods=['GET'])
def get_prerequisite_graph(courseid):
    """Get prerequisite graph for a course (public)"""
    def fetch_prerequisites(courseid, visited):
        if courseid in visited:
            return []
        visited.add(courseid)

        prerequisites = Prerequisite.query.filter_by(CourseID=courseid).all()
        edges = [{
            "from": prereq.PrerequisiteID,
            "to": prereq.CourseID
        } for prereq in prerequisites]

        for prereq in prerequisites:
            edges.extend(fetch_prerequisites(prereq.PrerequisiteID, visited))

        return edges

    visited = set()
    graph_edges = fetch_prerequisites(courseid, visited)
    nodes = [{"id": course, "label": course, "isRoot": course == courseid} for course in visited]

    return jsonify({"nodes": nodes, "edges": graph_edges})


# ============================================================================
# PROTECTED ENDPOINTS (JWT Required)
# ============================================================================

@app.route('/api/students', methods=['GET'])
@jwt_required()
def get_students():
    """Get all students (protected)"""
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students])


@app.route('/api/student/<netid>/plans', methods=['GET'])
@jwt_required()
def get_student_plans(netid):
    """Get academic plans for a student (protected)"""
    current_netid = get_jwt_identity()

    # Users can only access their own plans
    if current_netid != netid:
        return jsonify({"error": "Unauthorized access"}), 403

    plans = AcademicPlan.query.filter_by(NetID=netid).all()

    if not plans:
        return jsonify({"error": "No academic plans found for this student"}), 404

    return jsonify([plan.to_dict() for plan in plans])


@app.route('/api/plan/<int:planid>', methods=['GET'])
@jwt_required()
def get_plan(planid):
    """Get courses in a plan (protected)"""
    current_netid = get_jwt_identity()

    # Verify plan belongs to current user
    plan = AcademicPlan.query.filter_by(PlanID=planid).first()
    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    if plan.NetID != current_netid:
        return jsonify({"error": "Unauthorized access"}), 403

    courses = PlannedCourse.query.filter_by(PlanID=planid).all()
    return jsonify([course.to_dict() for course in courses])


@app.route('/api/plan', methods=['POST'])
@jwt_required()
def add_plan():
    """Create a new academic plan (protected)"""
    current_netid = get_jwt_identity()

    try:
        plan = AcademicPlan(
            NetID=current_netid,
            CreationDate=datetime.utcnow().date()
        )
        db.session.add(plan)
        db.session.commit()

        return jsonify({
            "message": "Plan created successfully",
            "planid": plan.PlanID
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create plan: {str(e)}"}), 500


@app.route('/api/plan/<int:planid>', methods=['DELETE'])
@jwt_required()
def delete_plan(planid):
    """Delete an academic plan (protected)"""
    current_netid = get_jwt_identity()

    plan = AcademicPlan.query.filter_by(PlanID=planid).first()
    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    if plan.NetID != current_netid:
        return jsonify({"error": "Unauthorized access"}), 403

    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"message": "Plan deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete plan: {str(e)}"}), 500


@app.route('/api/course', methods=['POST'])
@jwt_required()
def add_course():
    """Add a course to a plan (protected)"""
    current_netid = get_jwt_identity()
    data = request.get_json()

    planid = data.get('planid')
    courseid = data.get('courseid')
    semester = data.get('semester')

    if not all([planid, courseid, semester]):
        return jsonify({"error": "PlanID, CourseID, and Semester are required"}), 400

    # Verify plan belongs to current user
    plan = AcademicPlan.query.filter_by(PlanID=planid).first()
    if not plan or plan.NetID != current_netid:
        return jsonify({"error": "Unauthorized access to plan"}), 403

    # Verify course exists
    course = CourseCatalog.query.filter_by(CourseID=courseid).first()
    if not course:
        return jsonify({"error": "Course not found"}), 404

    # Check if course already in plan
    existing = PlannedCourse.query.filter_by(PlanID=planid, CourseID=courseid).first()
    if existing:
        return jsonify({"error": "Course already in plan"}), 409

    try:
        planned_course = PlannedCourse(
            PlanID=planid,
            CourseID=courseid,
            Semester=semester
        )
        db.session.add(planned_course)
        db.session.commit()

        return jsonify({"message": "Course added to plan"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to add course: {str(e)}"}), 500


@app.route('/api/plan/<int:planid>/course/<courseid>', methods=['DELETE'])
@jwt_required()
def delete_course(planid, courseid):
    """Delete a course from a plan (protected)"""
    current_netid = get_jwt_identity()

    # Verify plan belongs to current user
    plan = AcademicPlan.query.filter_by(PlanID=planid).first()
    if not plan or plan.NetID != current_netid:
        return jsonify({"error": "Unauthorized access"}), 403

    planned_course = PlannedCourse.query.filter_by(
        PlanID=planid,
        CourseID=courseid
    ).first()

    if not planned_course:
        return jsonify({"error": "Course not found in plan"}), 404

    try:
        db.session.delete(planned_course)
        db.session.commit()
        return jsonify({"message": "Course removed from plan"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete course: {str(e)}"}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired", "type": "token_expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Invalid token", "type": "invalid_token"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Authorization token required", "type": "missing_token"}), 401


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    print("=" * 70)
    print("CurriculumCrafter Server (MySQL + JWT)")
    print("=" * 70)
    print(f"Database: {os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DATABASE')}")
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print("=" * 70)

    app.run(host='0.0.0.0', port=port, debug=debug)
