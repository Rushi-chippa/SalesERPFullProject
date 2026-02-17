from sqlalchemy import create_engine, text
import sys
import os

# Add parent directory to path to import database config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import DATABASE_URL

def add_employee_id_column():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN employee_id VARCHAR"))
            conn.commit()
            print("Successfully added 'employee_id' column to 'users' table.")
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error (column might already exist): {e}")

if __name__ == "__main__":
    add_employee_id_column()
