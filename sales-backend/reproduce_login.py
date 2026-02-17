
import requests
import uuid
import sys

BASE_URL = "http://localhost:8001"

def test_flow():
    # 1. Register
    email = f"test_{uuid.uuid4()}@example.com"
    password = "password123"
    print(f"Testing with email: {email}")
    
    register_data = {
        "email": email,
        "password": password,
        "full_name": "Test User",
        "company_name": "Test Corp",
        "industry": "Tech"
    }
    
    print("Attempting registration...")
    try:
        reg_response = requests.post(f"{BASE_URL}/auth/register", data=register_data)
        print(f"Register Status: {reg_response.status_code}")
        if reg_response.status_code != 200:
            print(f"Register Failed: {reg_response.text}")
            return
        
        print("Registration successful.")
        
        # 2. Login
        print("Attempting login...")
        login_data = {
            "username": email, # OAuth2PasswordRequestForm expects username, not email field
            "password": password
        }
        # Note: router.login expects schemas.LoginRequest which has email/password? 
        # Let's check router.py again.
        # router.py: def login(login_data: schemas.LoginRequest...
        # schemas.LoginRequest likely has email, password.
        # But wait, the frontend might be sending JSON or Form data?
        # api.js sends JSON usually.
        # Let's check schemas.py to be sure what LoginRequest expects.
        
        # If it expects JSON:
        login_json = {
            "email": email,
            "password": password
        }
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_json)
        print(f"Login Status: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_flow()
