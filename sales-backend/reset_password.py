from sqlalchemy import create_engine, text
from database import DATABASE_URL
from auth.utils import get_password_hash

def reset_password():
    try:
        engine = create_engine(DATABASE_URL)
        new_password = "password123"
        hashed_pwd = get_password_hash(new_password)
        target_email = "rushichippa7350@gmail.com"
        
        with engine.connect() as conn:
            # Update password
            conn.execute(
                text("UPDATE users SET hashed_password = :pwd WHERE email = :email"),
                {"pwd": hashed_pwd, "email": target_email}
            )
            conn.commit()
            print(f"Password for {target_email} reset to '{new_password}'")
            
    except Exception as e:
        print(f"Error resetting password: {e}")

if __name__ == "__main__":
    reset_password()
