import requests
import json
import random

BASE_URL = "http://localhost:8001"
# Use a random email to avoid conflict
RANDOM_ID = random.randint(1000, 9999)
EMAIL = f"salesman{RANDOM_ID}@test.com"
PASSWORD = "password123"

def register_and_login():
    # 1. Register Manager/Salesman (Using manager for simplicity to create products/sales)
    # Ideally we should register a manager, create product, then register salesman? 
    # Or just use the manager to create sales (Managers can also create sales in this system logic)
    
    print(f"Registering user {EMAIL}...")
    register_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": "Test Salesman",
        "company_name": f"Test Corp {RANDOM_ID}",
        "industry": "Tech", # Added missing field
        "role": "manager" 
    }
    
    # Use data= for Form data
    resp = requests.post(f"{BASE_URL}/auth/register", data=register_data)
    if resp.status_code != 200:
        print(f"Registration failed: {resp.text}")
        # Try login if already exists
        return login()
        
    print("Registration successful.")
    return login()

def login():
    print(f"Logging in {EMAIL}...")
    login_data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    # Login endpoint expects JSON
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return None
    
    return resp.json()["access_token"]

def create_product(token):
    print("Creating product...")
    headers = {"Authorization": f"Bearer {token}"}
    product_data = {
        "name": f"Product {RANDOM_ID}",
        "description": "Test Product",
        "price": 100.0,
        "category": "Test"
    }
    resp = requests.post(f"{BASE_URL}/api/products/", json=product_data, headers=headers)
    if resp.status_code not in [200, 201]:
        print(f"Create product failed: {resp.text}")
        return None
    return resp.json()["id"]

def create_sale(token, product_id):
    print("Creating sale...")
    headers = {"Authorization": f"Bearer {token}"}
    sale_data = {
        "product_id": product_id,
        "quantity": 5,
        "amount": 500.0,
        "date": "2023-10-27", # Simple Date Format
        "customer_name": "Test Trader",
        "region": "Test Region",
        "notes": "Test Note"
    }
    resp = requests.post(f"{BASE_URL}/api/sales/", json=sale_data, headers=headers)
    if resp.status_code not in [200, 201]:
        print(f"Create sale failed: {resp.text}")
        return None
    
    print("Sale created successfully!")
    return resp.json()

def main():
    token = register_and_login()
    if not token:
        return
        
    product_id = create_product(token)
    if not product_id:
        return
        
    sale = create_sale(token, product_id)
    if sale:
        print(json.dumps(sale, indent=2))
        
    # Check Dashboard Stats
    print("Checking Dashboard Stats...")
    headers = {"Authorization": f"Bearer {token}"}
    stats_resp = requests.get(f"{BASE_URL}/api/analytics/salesman/dashboard", headers=headers)
    if stats_resp.status_code == 200:
        print("Dashboard Stats: Success")
        print(json.dumps(stats_resp.json(), indent=2))
    else:
        print(f"Dashboard Stats Failed: {stats_resp.text}")

if __name__ == "__main__":
    main()
