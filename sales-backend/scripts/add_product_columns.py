import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from sqlalchemy import text

def add_product_columns():
    db = SessionLocal()
    try:
        # Check and add sku
        try:
            db.execute(text("ALTER TABLE products ADD COLUMN sku VARCHAR"))
            print("Added sku column")
        except Exception as e:
            print(f"sku column might already exist: {e}")
            db.rollback()

        # Check and add quantity
        try:
            db.execute(text("ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0"))
            print("Added quantity column")
        except Exception as e:
            print(f"quantity column might already exist: {e}")
            db.rollback()
            
        db.commit()
        print("Product migration completed successfully")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_product_columns()
