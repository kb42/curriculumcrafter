#!/usr/bin/env python3
"""
Test MySQL connection and verify data import
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_mysql_url():
    host = os.getenv('MYSQL_HOST')
    port = os.getenv('MYSQL_PORT', '3306')
    database = os.getenv('MYSQL_DATABASE')
    user = os.getenv('MYSQL_USER')
    password = os.getenv('MYSQL_PASSWORD')

    if not all([host, database, user, password]):
        raise ValueError("Missing MySQL credentials in .env file!")

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"

def main():
    print("=" * 70)
    print("MySQL Connection Test")
    print("=" * 70)

    try:
        mysql_url = get_mysql_url()
    except ValueError as e:
        print(f"❌ Error: {e}")
        return

    print(f"\nConnecting to:")
    print(f"  Host: {os.getenv('MYSQL_HOST')}")
    print(f"  Port: {os.getenv('MYSQL_PORT', '3306')}")
    print(f"  Database: {os.getenv('MYSQL_DATABASE')}")
    print(f"  User: {os.getenv('MYSQL_USER')}")

    try:
        engine = create_engine(mysql_url, echo=False)

        with engine.connect() as conn:
            # Test connection
            result = conn.execute(text("SELECT VERSION()"))
            version = result.fetchone()[0]
            print(f"\n✓ Connected successfully!")
            print(f"  MySQL Version: {version}")

            # Check tables
            print("\n" + "=" * 70)
            print("Checking Tables")
            print("=" * 70)

            tables = [
                'User', 'Student', 'Academic_Plan', 'Planned_Course',
                'Course_Catalog', 'Prerequisite', 'Requirement', 'AP_Credits'
            ]

            for table in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.fetchone()[0]
                    status = "✓" if count > 0 or table in ['User', 'Student', 'Academic_Plan', 'Planned_Course', 'AP_Credits'] else "⚠"
                    print(f"  {status} {table}: {count} rows")
                except Exception as e:
                    print(f"  ❌ {table}: Error - {e}")

            print("\n" + "=" * 70)
            print("Connection test completed successfully!")
            print("=" * 70)

    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your .env file has correct MySQL credentials")
        print("2. Verify your network can reach the MySQL server")
        print("3. Check if MySQL port is open (firewall)")
        print("4. For Aiven: Make sure SSL is configured if required")

if __name__ == '__main__':
    main()
