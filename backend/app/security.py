import os
import secrets
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials

security = HTTPBasic()

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    username = os.getenv("APP_USERNAME", "admin")
    password = os.getenv("APP_PASSWORD", "password")
    if not (secrets.compare_digest(credentials.username, username) and secrets.compare_digest(credentials.password, password)):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return credentials.username
