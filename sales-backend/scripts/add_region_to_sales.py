import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

def add_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE sales ADD COLUMN region VARCHAR"))
            conn.commit()
            print("Successfully added 'region' column to 'sales' table.")
        except Exception as e:
            print(f"Error (column might already exist): {e}")

if __name__ == "__main__":
    add_column()
