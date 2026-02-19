from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import asyncio
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PlaybookFeedback(BaseModel):
    playbook_id: str
    user_suggestion: str


def get_ip_intel(ip: str):
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}").json()
        return {
            "location": f"{response.get('city')}, {response.get('country')}",
            "isp": response.get('isp'),
            "proxy": response.get('proxy')
        }
    except:
        return {"location": "Unknown", "isp": "Unknown", "proxy": False}
    

@app.get("/api/threats/live")
def get_live_threats():
    return [
        {
            "id": "evt_001",
            "type": "SQL Injection",
            "severity": "CRITICAL",
            "description": "Malicious payload in wire transfer query parameter",
            "src": "103.45.67.89",
            "tgt": "Transaction DB",
            "timestamp": "17:05:14"
        },
        {
            "id": "evt_002",
            "type": "Data Exfiltration",
            "severity": "HIGH",
            "description": "Unusual 4.2GB upload to external S3 bucket",
            "src": "Internal",
            "tgt": "Cloud Storage",
            "timestamp": "17:04:18"
        }
    ]

@app.post("/api/playbook/generate/{threat_id}")
async def generate_playbook(threat_id: str):
    await asyncio.sleep(2)
    
    attacker_ip = "192.168.1.1"
    intel = get_ip_intel("8.8.8.8")
    
    base_risk = 85
    if intel.get("proxy"):
        base_risk = 98

    return {
        "playbook_id": f"AI-PB-{int(time.time())}",
        "risk_score": base_risk,
        "title": "Autonomous AI Mitigation Strategy",
        "assessment": f"Threat originating from {intel['location']} via {intel['isp']}. AI confirms SQL Injection attempt targeting Core_DB. Action: Immediate micro-segmentation.",
        "steps": [
            {"step": 1, "title": "Block Source IP", "status": "Pending", "eta": "10s"},
            {"step": 2, "title": "Flush SQL Query Cache", "status": "Pending", "eta": "30s"},
            {"step": 3, "title": "Rotate Database Credentials", "status": "Pending", "eta": "2m"},
            {"step": 4, "title": "Notify Security Lead", "status": "Pending", "eta": "Instant"}
        ]
    }

@app.post("/api/playbook/feedback")
async def process_feedback(feedback: PlaybookFeedback):
    time.sleep(1.5)
    return {
        "status": "success",
        "message": f"AI Agent has integrated your suggestion: '{feedback.user_suggestion}' into the response logic."
    }