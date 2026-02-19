from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import asyncio
import requests

app = FastAPI()

# This allows your React frontend to talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- MODELS ---
class PlaybookFeedback(BaseModel):
    playbook_id: str
    user_suggestion: str


# --- HELPER: Real-time Threat Intel ---
def get_ip_intel(ip: str):
    try:
        # Using a real free API for the demo!
        response = requests.get(f"http://ip-api.com/json/{ip}").json()
        return {
            "location": f"{response.get('city')}, {response.get('country')}",
            "isp": response.get('isp'),
            "proxy": response.get('proxy')
        }
    except:
        return {"location": "Unknown", "isp": "Unknown", "proxy": False}
    

# 1. Endpoint for the Live Threat Feed
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

# 2. Endpoint to simulate the AI generating a playbook
@app.post("/api/playbook/generate/{threat_id}")
async def generate_playbook(threat_id: str):
    # 1. Simulate "AI Reasoning" time
    await asyncio.sleep(2)
    
    # 2. Mock external Intel Lookup
    attacker_ip = "192.168.1.1" # In a real app, this comes from logs
    intel = get_ip_intel("8.8.8.8") # Using Google IP for demo stability
    
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
    # This simulates a "Human-in-the-loop" interaction
    time.sleep(1.5)
    return {
        "status": "success",
        "message": f"AI Agent has integrated your suggestion: '{feedback.user_suggestion}' into the response logic."
    }