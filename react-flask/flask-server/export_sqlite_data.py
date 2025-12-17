#!/usr/bin/env python3
"""
Export course data from SQLite database to JSON files.
This preserves Course_Catalog, Prerequisite, and Requirement data for MySQL migration.
"""

import sqlite3
import json
import os

# Database path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

def export_table_to_json(cursor, table_name, output_file):
    """Export a table to JSON file."""
    print(f"Exporting {table_name}...")

    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    # Get column names
    column_names = [description[0] for description in cursor.description]

    # Convert rows to list of dictionaries
    data = []
    for row in rows:
        data.append(dict(zip(column_names, row)))

    # Write to JSON file
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"✓ Exported {len(data)} rows from {table_name} to {output_file}")
    return len(data)

def main():
    """Main export function."""
    print("=" * 60)
    print("SQLite to JSON Export Script")
    print("=" * 60)

    if not os.path.exists(DB_PATH):
        print(f"❌ Error: Database not found at {DB_PATH}")
        return

    # Connect to SQLite database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Export tables
    tables_to_export = {
        'Course_Catalog': 'course_catalog.json',
        'Prerequisite': 'prerequisites.json',
        'Requirement': 'requirements.json'
    }

    total_rows = 0
    for table_name, output_file in tables_to_export.items():
        try:
            count = export_table_to_json(cursor, table_name, os.path.join(BASE_DIR, output_file))
            total_rows += count
        except sqlite3.Error as e:
            print(f"❌ Error exporting {table_name}: {e}")

    # Close connection
    conn.close()

    print("=" * 60)
    print(f"✓ Export complete! Total rows exported: {total_rows}")
    print("=" * 60)
    print("\nGenerated files:")
    for output_file in tables_to_export.values():
        file_path = os.path.join(BASE_DIR, output_file)
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"  - {output_file} ({size} bytes)")

    print("\nNext steps:")
    print("1. Review the exported JSON files")
    print("2. Configure your MySQL credentials in .env")
    print("3. Run: python init_mysql_db.py")

if __name__ == '__main__':
    main()
