"""
SQLAlchemy Database Models for CurriculumCrafter
MySQL/MariaDB compatible with JWT authentication support
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Index

db = SQLAlchemy()

# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================

class User(db.Model):
    """User authentication table - stores login credentials"""
    __tablename__ = 'User'

    UserID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    PasswordHash = db.Column(db.String(255), nullable=False)
    NetID = db.Column(db.String(20), db.ForeignKey('Student.NetID', ondelete='CASCADE'), unique=True, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to Student
    student = db.relationship('Student', back_populates='user', uselist=False)

    def __repr__(self):
        return f'<User {self.Username} (NetID: {self.NetID})>'

    def to_dict(self):
        """Convert user to dictionary (exclude password)"""
        return {
            'UserID': self.UserID,
            'Username': self.Username,
            'NetID': self.NetID,
            'CreatedAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }


# ============================================================================
# STUDENT & ACADEMIC MODELS
# ============================================================================

class Student(db.Model):
    """Student information table"""
    __tablename__ = 'Student'

    NetID = db.Column(db.String(20), primary_key=True)
    Name = db.Column(db.String(100), nullable=False)
    Expected_Graduation = db.Column(db.Numeric(3, 1))  # e.g., 4.0 for senior
    MajorID = db.Column(db.String(100))

    # Relationships
    user = db.relationship('User', back_populates='student', uselist=False)
    academic_plans = db.relationship('AcademicPlan', back_populates='student', cascade='all, delete-orphan')
    ap_credits = db.relationship('APCredit', back_populates='student', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Student {self.NetID} - {self.Name}>'

    def to_dict(self):
        """Convert student to dictionary"""
        return {
            'NetID': self.NetID,
            'Name': self.Name,
            'Expected_Graduation': float(self.Expected_Graduation) if self.Expected_Graduation else None,
            'MajorID': self.MajorID
        }


class AcademicPlan(db.Model):
    """Academic plan table - each student can have multiple plans"""
    __tablename__ = 'Academic_Plan'

    PlanID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CreationDate = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    NetID = db.Column(db.String(20), db.ForeignKey('Student.NetID', ondelete='CASCADE'))

    # Relationships
    student = db.relationship('Student', back_populates='academic_plans')
    planned_courses = db.relationship('PlannedCourse', back_populates='plan', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<AcademicPlan {self.PlanID} for {self.NetID}>'

    def to_dict(self):
        """Convert plan to dictionary"""
        return {
            'PlanID': self.PlanID,
            'CreationDate': self.CreationDate.isoformat() if self.CreationDate else None,
            'NetID': self.NetID
        }


# ============================================================================
# COURSE MODELS
# ============================================================================

class CourseCatalog(db.Model):
    """Course catalog - all available courses"""
    __tablename__ = 'Course_Catalog'

    CourseID = db.Column(db.String(20), primary_key=True)
    Credits = db.Column(db.Integer)

    # Relationships
    prerequisites = db.relationship('Prerequisite', foreign_keys='Prerequisite.CourseID',
                                    back_populates='course', cascade='all, delete-orphan')
    prerequisite_of = db.relationship('Prerequisite', foreign_keys='Prerequisite.PrerequisiteID',
                                      back_populates='prerequisite_course', cascade='all, delete-orphan')
    planned_courses = db.relationship('PlannedCourse', back_populates='course', cascade='all, delete-orphan')
    requirements = db.relationship('Requirement', back_populates='course')
    ap_credits = db.relationship('APCredit', back_populates='course')

    def __repr__(self):
        return f'<Course {self.CourseID} ({self.Credits} credits)>'

    def to_dict(self):
        """Convert course to dictionary"""
        return {
            'CourseID': self.CourseID,
            'Credits': self.Credits
        }


class PlannedCourse(db.Model):
    """Courses planned in an academic plan"""
    __tablename__ = 'Planned_Course'

    PlanID = db.Column(db.Integer, db.ForeignKey('Academic_Plan.PlanID', ondelete='CASCADE'), primary_key=True)
    CourseID = db.Column(db.String(20), db.ForeignKey('Course_Catalog.CourseID', ondelete='CASCADE'), primary_key=True)
    Semester = db.Column(db.String(20))

    # Relationships
    plan = db.relationship('AcademicPlan', back_populates='planned_courses')
    course = db.relationship('CourseCatalog', back_populates='planned_courses')

    def __repr__(self):
        return f'<PlannedCourse {self.CourseID} in Plan {self.PlanID} ({self.Semester})>'

    def to_dict(self):
        """Convert planned course to dictionary"""
        return {
            'PlanID': self.PlanID,
            'CourseID': self.CourseID,
            'Semester': self.Semester,
            'Credits': self.course.Credits if self.course else None
        }


class Prerequisite(db.Model):
    """Course prerequisites"""
    __tablename__ = 'Prerequisite'

    CourseID = db.Column(db.String(20), db.ForeignKey('Course_Catalog.CourseID', ondelete='CASCADE'), primary_key=True)
    PrerequisiteID = db.Column(db.String(20), db.ForeignKey('Course_Catalog.CourseID', ondelete='CASCADE'), primary_key=True)

    # Relationships
    course = db.relationship('CourseCatalog', foreign_keys=[CourseID], back_populates='prerequisites')
    prerequisite_course = db.relationship('CourseCatalog', foreign_keys=[PrerequisiteID], back_populates='prerequisite_of')

    def __repr__(self):
        return f'<Prerequisite {self.PrerequisiteID} for {self.CourseID}>'

    def to_dict(self):
        """Convert prerequisite to dictionary"""
        return {
            'CourseID': self.CourseID,
            'PrerequisiteID': self.PrerequisiteID,
            'PrerequisiteCredits': self.prerequisite_course.Credits if self.prerequisite_course else None
        }


# ============================================================================
# MAJOR REQUIREMENTS
# ============================================================================

class Requirement(db.Model):
    """Major requirements"""
    __tablename__ = 'Requirement'

    RequirementID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    MajorID = db.Column(db.String(100))
    Credits = db.Column(db.Integer)
    CourseID = db.Column(db.String(20), db.ForeignKey('Course_Catalog.CourseID', ondelete='SET NULL'))

    # Relationship
    course = db.relationship('CourseCatalog', back_populates='requirements')

    # Index for faster major lookups
    __table_args__ = (
        Index('idx_major', 'MajorID'),
    )

    def __repr__(self):
        return f'<Requirement {self.RequirementID} for {self.MajorID}>'

    def to_dict(self):
        """Convert requirement to dictionary"""
        return {
            'RequirementID': self.RequirementID,
            'MajorID': self.MajorID,
            'Credits': self.Credits,
            'CourseID': self.CourseID
        }


# ============================================================================
# AP CREDITS
# ============================================================================

class APCredit(db.Model):
    """AP Credit mappings for students"""
    __tablename__ = 'AP_Credits'

    NetID = db.Column(db.String(20), db.ForeignKey('Student.NetID', ondelete='CASCADE'), primary_key=True)
    CourseName = db.Column(db.String(100), primary_key=True)
    Score = db.Column(db.Integer)
    CourseID = db.Column(db.String(20), db.ForeignKey('Course_Catalog.CourseID', ondelete='SET NULL'))

    # Relationships
    student = db.relationship('Student', back_populates='ap_credits')
    course = db.relationship('CourseCatalog', back_populates='ap_credits')

    def __repr__(self):
        return f'<APCredit {self.CourseName} (Score: {self.Score}) for {self.NetID}>'

    def to_dict(self):
        """Convert AP credit to dictionary"""
        return {
            'NetID': self.NetID,
            'CourseName': self.CourseName,
            'Score': self.Score,
            'CourseID': self.CourseID
        }
