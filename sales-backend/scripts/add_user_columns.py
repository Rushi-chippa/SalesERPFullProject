import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
from sqlalchemy import text

def add_user_columns():
    db = SessionLocal()
    try:
        # Check and add phone
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            print("Added phone column")
        except Exception as e:
            print(f"phone column might already exist: {e}")
            db.rollback()

        # Check and add region
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN region VARCHAR"))
            print("Added region column")
        except Exception as e:
            print(f"region column might already exist: {e}")
            db.rollback()

        # Check and add sales_target
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN sales_target INTEGER"))
            print("Added sales_target column")
        except Exception as e:
            print(f"sales_target column might already exist: {e}")
            db.rollback()
            
        db.commit()
        print("Migration completed successfully")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_user_columns()
