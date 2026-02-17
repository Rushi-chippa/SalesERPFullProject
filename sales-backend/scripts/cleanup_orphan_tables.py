from sqlalchemy import create_engine, inspect, MetaData, Table
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal
from auth.models import Company

import argparse

def cleanup_orphan_tables():
    """
    Finds and drops dynamic tables that do not have a corresponding company in the database.
    """
    parser = argparse.ArgumentParser(description="Cleanup orphan company tables.")
    parser.add_argument("--force", action="store_true", help="Force deletion without confirmation")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        # 1. Get all valid company names
        companies = db.query(Company).all()
        # Sanitize company names to match table naming convention
        valid_table_names = {
            "".join(c if c.isalnum() else "_" for c in company.name) 
            for company in companies
        }
        
        print(f"Valid Company Tables supposed to exist: {valid_table_names}")

        # 2. Inspect database for existing tables
        inspector = inspect(engine)
        all_tables = inspector.get_table_names()
        
        # 3. Identify Orphan Tables
        # Correct list of system tables based on codebase inspection
        system_tables = {
            "users", "companies", "products", "sales", 
            "categories", "customers", "alembic_version"
        }
        
        orphan_tables = []
        for table in all_tables:
            if table in system_tables:
                continue
            
            # If table is NOT in valid_table_names, it might be an orphan
            if table not in valid_table_names:
                orphan_tables.append(table)

        if not orphan_tables:
            print("No orphan tables found.")
            return

        print(f"Found {len(orphan_tables)} orphan tables: {orphan_tables}")
        
        if not args.force:
            confirm = input("Do you want to delete these tables? (yes/no): ")
            if confirm.lower() != "yes":
                print("Operation cancelled.")
                return
        else:
            print("Force deletion enabled. Proceeding...")

        # 4. Drop Orphan Tables
        metadata = MetaData()
        with engine.connect() as conn:
            for table_name in orphan_tables:
                print(f"Dropping table: {table_name}...")
                try:
                    conn.execute(f"DROP TABLE IF EXISTS \"{table_name}\"")
                    print(f"Dropped {table_name}")
                except Exception as e:
                    print(f"Error dropping {table_name}: {e}")
            conn.commit()

        print("Cleanup complete.")

    finally:
        db.close()

if __name__ == "__main__":
    cleanup_orphan_tables()
