#!/usr/bin/env python3
"""
Initialize MySQL database and import data from exported JSON files.
This creates all tables and imports Course_Catalog, Prerequisite, and Requirement data.
"""

import json
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import db, CourseCatalog, Prerequisite, Requirement
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_mysql_url():
    """Construct MySQL connection URL from environment variables"""
    host = os.getenv('MYSQL_HOST')
    port = os.getenv('MYSQL_PORT', '3306')
    database = os.getenv('MYSQL_DATABASE')
    user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')

    if not all([host, database, user, password]):
        raise ValueError(
            "Missing MySQL credentials! Please check your .env file.\n"
            "Required: MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD"
        )

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"

def test_connection(engine):
    """Test database connection"""
    print("Testing MySQL connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT VERSION()"))
            version = result.fetchone()[0]
            print(f"✓ Connected to MySQL version: {version}")
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def create_tables(engine):
    """Create all tables"""
    print("\nCreating database tables...")
    from models import db

    # Import Base from models
    from models import User, Student, AcademicPlan, CourseCatalog, PlannedCourse
    from models import Prerequisite, Requirement, APCredit

    # Create all tables
    db.metadata.create_all(engine)
    print("✓ All tables created successfully")

def import_json_data(session, json_file, model_class, description):
    """Import data from JSON file into database"""
    file_path = os.path.join(BASE_DIR, json_file)

    if not os.path.exists(file_path):
        print(f"⚠ Warning: {json_file} not found. Skipping import.")
        return 0

    print(f"Importing {description} from {json_file}...")

    with open(file_path, 'r') as f:
        data = json.load(f)

    count = 0
    for item in data:
        try:
            obj = model_class(**item)
            session.add(obj)
            count += 1
        except Exception as e:
            print(f"  ⚠ Warning: Failed to import item {item}: {e}")

    try:
        session.commit()
        print(f"✓ Imported {count} {description}")
        return count
    except Exception as e:
        session.rollback()
        print(f"❌ Error importing {description}: {e}")
        return 0

def main():
    """Main initialization function"""
    print("=" * 70)
    print("MySQL Database Initialization Script")
    print("=" * 70)

    # Get MySQL connection URL
    try:
        mysql_url = get_mysql_url()
    except ValueError as e:
        print(f"❌ Error: {e}")
        return

    # Create engine
    print(f"\nConnecting to MySQL...")
    print(f"Host: {os.getenv('MYSQL_HOST')}")
    print(f"Database: {os.getenv('MYSQL_DATABASE')}")

    try:
        engine = create_engine(mysql_url, echo=False)
    except Exception as e:
        print(f"❌ Failed to create engine: {e}")
        return

    # Test connection
    if not test_connection(engine):
        return

    # Create tables
    create_tables(engine)

    # Create session
    Session = sessionmaker(bind=engine)
    session = Session()

    # Import data
    print("\n" + "=" * 70)
    print("Importing Course Data")
    print("=" * 70)

    total_imported = 0

    # Import Course Catalog
    count = import_json_data(
        session,
        'course_catalog.json',
        CourseCatalog,
        'courses'
    )
    total_imported += count

    # Import Prerequisites
    count = import_json_data(
        session,
        'prerequisites.json',
        Prerequisite,
        'prerequisites'
    )
    total_imported += count

    # Import Requirements
    count = import_json_data(
        session,
        'requirements.json',
        Requirement,
        'requirements'
    )
    total_imported += count

    # Close session
    session.close()

    print("\n" + "=" * 70)
    print("Database Initialization Complete!")
    print("=" * 70)
    print(f"Total records imported: {total_imported}")
    print("\nTables created:")
    print("  ✓ User (empty - users will register)")
    print("  ✓ Student (empty - created on registration)")
    print("  ✓ Academic_Plan (empty - created by students)")
    print("  ✓ Planned_Course (empty - populated by students)")
    print("  ✓ Course_Catalog (populated with course data)")
    print("  ✓ Prerequisite (populated with prerequisite data)")
    print("  ✓ Requirement (populated with major requirements)")
    print("  ✓ AP_Credits (empty - populated by students)")

    print("\nNext steps:")
    print("1. Verify data import: Run test_mysql_connection.py")
    print("2. Start the new Flask server: python server_mysql.py")
    print("3. Test registration endpoint")
    print("4. Update React frontend to use new auth")

if __name__ == '__main__':
    main()
