import requests
import json
import os
import time
from sqlalchemy import create_engine, inspect, MetaData, Table
from dotenv import load_dotenv

# Load env from parent directory if not found
if not os.path.exists(".env"):
    load_dotenv("../.env")
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found.")
    exit(1)

engine = create_engine(DATABASE_URL)

BASE_URL = "http://localhost:8000"

def run_test():
    # Loop to wait for server to be up
    for i in range(5):
        try:
            requests.get(BASE_URL)
            break
        except:
            print(f"Waiting for server... {i}")
            time.sleep(2)
            
    timestamp = int(time.time())
    company_name = f"TestCorp{timestamp}"
    email = f"admin{timestamp}@test.com"
    password = "password123"
    
    print(f"Registering company: {company_name}")
    data = {
        "company_name": company_name,
        "industry": "Tech",
        "email": email,
        "full_name": "Admin",
        "password": password
    }
    # requests automatically sets content-type to application/x-www-form-urlencoded if data is dict
    # but auth/router.py uses Form(...), so this is correct.
    try:
        r = requests.post(f"{BASE_URL}/auth/register", data=data)
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    if r.status_code != 200:
        print(f"Failed to register company: {r.status_code} {r.text}")
        return
    
    resp_json = r.json()
    token = resp_json["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    company_id = resp_json["company"]["id"]
    print(f"Company registered. ID: {company_id}")
    
    # Register Salesman
    salesman_email = f"sales{timestamp}@test.com"
    salesman_data = {
        "email": salesman_email,
        "full_name": "Sales Man",
        "password": "password123",
        "company_id": company_id,
        "employee_id": f"EMP{timestamp}",
        "phone": "1234567890",
        "region": "North",
        "sales_target": 50000
    }
    
    print("Registering salesman...")
    r = requests.post(f"{BASE_URL}/auth/register-salesman", json=salesman_data, headers=headers)
    if r.status_code != 200:
        print(f"Failed to register salesman: {r.status_code} {r.text}")
        return
    
    print("Salesman registered.")
    
    # Verify DB
    print("Verifying DB table...")
    inspector = inspect(engine)
    # Sanitize name logic check
    table_name = "".join(c if c.isalnum() else "_" for c in company_name)
    print(f"Checking for table: {table_name}")
    
    if inspector.has_table(table_name):
        print(f"SUCCESS: Table '{table_name}' exists!")
        
        # Check content
        with engine.connect() as conn:
            t = Table(table_name, MetaData(), autoload_with=engine)
            result = conn.execute(t.select())
            rows = result.fetchall()
            print(f"Rows in table: {len(rows)}")
            if len(rows) > 0:
                print(f"Row 1 email: {rows[0].email}") # accessing by attribute if column name matches
                if rows[0].email == salesman_email:
                    print("SUCCESS: Salesman data found in dynamic table!")
                else:
                    print("FAILURE: Email mismatch.")
            else:
                print("FAILURE: Table empty.")
    else:
        print(f"FAILURE: Table '{table_name}' does not exist.")

if __name__ == "__main__":
    run_test()
