import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from sqlalchemy import text

def add_sale_columns():
    db = SessionLocal()
    try:
        # Check and add customer_name
        try:
            db.execute(text("ALTER TABLE sales ADD COLUMN customer_name VARCHAR"))
            print("Added customer_name column")
        except Exception as e:
            print(f"customer_name column might already exist: {e}")
            db.rollback()

        # Check and add notes
        try:
            db.execute(text("ALTER TABLE sales ADD COLUMN notes VARCHAR"))
            print("Added notes column")
        except Exception as e:
            print(f"notes column might already exist: {e}")
            db.rollback()
            
        db.commit()
        print("Sales migration completed successfully")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sale_columns()
