from sqlalchemy import create_engine, inspect, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sales.db") # Default to sqlite if not set
print(f"Connecting to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables found: {tables}")

if "users" in tables:
    with engine.connect() as conn:
        print("\nUsers:")
        target_email = "rushichippa7350@gmail.com"
        result = conn.execute(text("SELECT id, email, role, company_id, hashed_password FROM users WHERE email = :email"), {"email": target_email})
        user = result.fetchone()
        if user:
            print(f"USER_FOUND: YES")
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print(f"CompanyID: {user.company_id}")
            print(f"HashStart: {user.hashed_password[:10]}...")
        else:
            print(f"USER_FOUND: NO")
            print(f"Target: {target_email}")

        print("\nFirst 2 Users:")
        result = conn.execute(text("SELECT id, email FROM users LIMIT 2"))
        for row in result:
            print(f"User: {row.id}, {row.email}")
else:
    print("Users table not found!")

if "companies" in tables:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, name FROM companies"))
        print("\nCompanies:")
        for row in result:
            print(row)

if "sales" in tables:
    with engine.connect() as conn:
        print("\nSales Table Columns:")
        result = conn.execute(text("SELECT * FROM sales LIMIT 1"))
        if result.returns_rows:
            row = result.fetchone()
            if row:
                print(f"Keys: {row._mapping.keys()}")
                print(f"Sample Row: {row}")
            else:
                print("Sales table is empty.")
else:
    print("\nSales table NOT found!")
