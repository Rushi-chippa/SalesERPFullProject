from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def  add_logo_column():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        try:
            # Check if column exists (PostgreSQL specific query)
            # Or just try to add and catch error if exists
            # We'll try to add it.
            print("Attempting to add logo_url column...")
            connection.execute(text("ALTER TABLE companies ADD COLUMN logo_url VARCHAR"))
            connection.commit()
            print("Successfully added logo_url column.")
        except Exception as e:
            print(f"Error (maybe column already exists): {e}")

if __name__ == "__main__":
    add_logo_column()
