import requests
import time
import os
from dotenv import load_dotenv

if not os.path.exists(".env"):
    load_dotenv("../.env")
else:
    load_dotenv()

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

    # 1. Register a new Manager & Company
    timestamp = int(time.time())
    email_mgr = f"mgr{timestamp}@test.com"
    data_mgr = {
        "company_name": f"AnalyticsCorp{timestamp}",
        "industry": "Tech",
        "email": email_mgr,
        "full_name": "Manager One",
        "password": "password123"
    }
    r = requests.post(f"{BASE_URL}/auth/register", data=data_mgr)
    if r.status_code != 200:
        print(f"Register failed: {r.text}")
        return
    token_mgr = r.json()["access_token"]
    company_id = r.json()["company"]["id"]
    headers_mgr = {"Authorization": f"Bearer {token_mgr}"}
    
    # 2. Register Salesman
    email_sales = f"sales{timestamp}@test.com"
    data_sales = {
        "email": email_sales,
        "full_name": "Salesman One",
        "password": "password123",
        "company_id": company_id,
        "employee_id": f"S{timestamp}",
        "sales_target": 10000
    }
    r = requests.post(f"{BASE_URL}/auth/register-salesman", json=data_sales, headers=headers_mgr)
    if r.status_code != 200:
        print(f"Salesman register failed: {r.text}")
        return
    token_sales = r.json()["access_token"]
    headers_sales = {"Authorization": f"Bearer {token_sales}"}
    
    # 3. Create Product (as Manager)
    prod_data = {"name": "TestProduct", "price": 100.0, "category": "General", "stock": 100}
    r = requests.post(f"{BASE_URL}/api/products/", json=prod_data, headers=headers_mgr)
    prod_id = r.json()["id"]
    
    # 4. Record Sales (as Salesman)
    # Backend expects: product_id, quantity, amount, customer_name, region
    # And user_id is inferred
    print("Recording sales...")
    sales_data = [
        {"product_id": prod_id, "quantity": 2, "amount": 200.0, "customer_name": "Cust A", "region": "North"},
        {"product_id": prod_id, "quantity": 1, "amount": 100.0, "customer_name": "Cust B", "region": "South"},
        {"product_id": prod_id, "quantity": 5, "amount": 500.0, "customer_name": "Cust C", "region": "North"}
    ]
    
    for s in sales_data:
        r = requests.post(f"{BASE_URL}/api/sales/", json=s, headers=headers_sales)
        if r.status_code != 200:
            print(f"Sale failed: {r.text}")
            
    # 5. Get Dashboard Stats
    print("Fetching Dashboard Stats...")
    r = requests.get(f"{BASE_URL}/api/analytics/salesman/dashboard", headers=headers_sales)
    if r.status_code == 200:
        stats = r.json()
        print("SUCCESS: Retrieved stats")
        print(f"Total Sales: {stats['kpi']['total_sales']}")
        print(f"Region Data: {stats['charts']['region_distribution']}")
        
        if stats['kpi']['total_sales'] == 800.0:
             print("VERIFIED: Total sales match calculation.")
        else:
             print(f"FAILURE: Expected 800.0, got {stats['kpi']['total_sales']}")
             
        regions = {d['name']: d['value'] for d in stats['charts']['region_distribution']}
        if regions.get('North') == 700.0 and regions.get('South') == 100.0:
            print("VERIFIED: Region distribution matches.")
        else:
            print(f"FAILURE: Region data mismatch: {regions}")
            
    else:
        print(f"Failed to get stats: {r.status_code} {r.text}")

if __name__ == "__main__":
    run_test()
