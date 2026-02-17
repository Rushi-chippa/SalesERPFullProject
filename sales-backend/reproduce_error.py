import requests
import json

url = "http://localhost:8000/auth/register"
headers = {"Content-Type": "application/json"}
data = {
    "company_name": "Test Company",
    "industry": "Tech",
    "company_size": "1-10",
    "phone": "1234567890",
    "address": "123 Test St",
    "full_name": "Test User",
    "email": "testuser@example.com",
    "password": "testpassword123"
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    try:
        error_detail = response.json().get("detail")
        print(f"Error Detail: {error_detail}")
        with open("full_error.txt", "w", encoding="utf-8") as f:
            f.write(str(error_detail))
    except:
        print(f"Response Text: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
