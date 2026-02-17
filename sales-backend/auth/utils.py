from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import sys

# Configuration (Move to env vars in production)
SECRET_KEY = "salesportal_secret_key_change_this_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
# Circular import avoidance: We cannot import valid models here easily if they import utils.
# We will do dynamic import or move this to a separate dependencies.py
# For now, let's keep it simple and assume models is importable.
from auth import models # This works if models doesn't import utils (it doesn't seems so)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # DEBUG LOGGING
        print(f"DEBUG: Validating token: {token[:10]}...") 
        sys.stdout.flush()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"DEBUG: Decoded payload: {payload}")
        sys.stdout.flush()
        username: str = payload.get("sub")
        if username is None:
            print("DEBUG: Username is None in payload")
            sys.stdout.flush()
            raise credentials_exception
    except JWTError as e:
        print(f"DEBUG: JWTError: {e}")
        sys.stdout.flush()
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == username).first()
    if user is None:
        print(f"DEBUG: User not found for email: {username}")
        raise credentials_exception
    
    print(f"DEBUG: User authenticated: {user.email}")
    sys.stdout.flush()
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
