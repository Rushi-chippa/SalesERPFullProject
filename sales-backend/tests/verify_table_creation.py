import requests
import time
import sys
import os
from sqlalchemy import create_engine, inspect

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import DATABASE_URL

BASE_URL = "http://localhost:8001"

def verify_table_creation():
    timestamp = int(time.time())
    company_name = f"TableTest{timestamp}"
    email = f"admin{timestamp}@tabletest.com"
    
    print(f"Registering company: {company_name}...")
    
    data = {
        "company_name": company_name,
        "industry": "Testing",
        "email": email,
        "full_name": "Table Tester",
        "password": "password123"
    }
    
    try:
        r = requests.post(f"{BASE_URL}/auth/register", data=data) # Using data= for Form
        if r.status_code != 200:
            print(f"Registration failed: {r.status_code} {r.text}")
            return
            
        print("Registration successful.")
        
        # Check DB for table
        expected_table_name = company_name # Since it's alphanumeric
        
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        if inspector.has_table(expected_table_name):
            print(f"SUCCESS: Table '{expected_table_name}' exists!")
        else:
            print(f"FAILURE: Table '{expected_table_name}' does NOT exist!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_table_creation()
