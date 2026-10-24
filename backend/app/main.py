import os
import secrets
import subprocess
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

app = FastAPI()

# ---------------------------------------------------------------------------
# Security – HTTP Basic Auth (credentials supplied via env vars)
# ---------------------------------------------------------------------------
security = HTTPBasic()
USERNAME = os.getenv("APP_USERNAME", "admin")
PASSWORD = os.getenv("APP_PASSWORD", "password")

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    correct_user = secrets.compare_digest(credentials.username, USERNAME)
    correct_pass = secrets.compare_digest(credentials.password, PASSWORD)
    if not (correct_user and correct_pass):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return credentials.username

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/skills", dependencies=[Depends(verify_credentials)])
def run_skill():
    """Execute the installed design‑taste‑frontend skill and return its output.
    The skill runs as a subprocess via `npx`. Any error is reported as a 500.
    """
    try:
        # Run the skill without interactive prompts
        result = subprocess.run(
            ["npx", "skills", "use", "design-taste-frontend", "-y"],
            capture_output=True,
            text=True,
            timeout=30,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Skill execution timed out")
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr.strip())
    return {"output": result.stdout.strip()}
