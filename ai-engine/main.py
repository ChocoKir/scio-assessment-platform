# ai-engine/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
import cv2
import numpy as np
import base64
from ultralytics import YOLO
import uvicorn
import os
import time
import requests
from dotenv import load_dotenv

# --- 🛰️ SECURITY & UPLINK CONFIGURATION ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("➲ [CRITICAL ERROR]: GOOGLE_API_KEY not found in .env file.")

genai.configure(api_key=GOOGLE_API_KEY)

# The Node.js Core endpoint for real-time breach alerts
NODE_MAINFRAME_URL = "http://localhost:5000/api/alerts/trigger"

# ➲ UPGRADE: Using gemini-2.5-flash (The 2026 Workhorse)
model = genai.GenerativeModel(
    'gemini-2.5-flash',
    generation_config={"response_mime_type": "application/json"}
)

app = FastAPI(title="SCIO_NEURAL_CORE_V3_FINAL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizRequest(BaseModel):
    title: str
    topic: str
    numQuestions: int
    sourceText: str = "Focus on academic computer science principles."

class AnswerItem(BaseModel):
    question_id: str
    question: str
    expected_answer: str
    marks: int
    student_answer: str

class GradeRequest(BaseModel):
    answers: list[AnswerItem]

# Vision model initialization
vision_model = YOLO('yolov8s.pt')

@app.get("/")
def health_check():
    return {"status": "NOMINAL", "core": "GEMINI_2.5_FLASH", "vision": "YOLO_V8S_ACTIVE"}

# --- ➲ 1. MISSION GENERATION ---
@app.post("/api/generate")
async def generate_quiz(req: QuizRequest):
    print(f"➲ SYNC: Generating {req.numQuestions} units for: {req.topic}")
    prompt = f"""
    You are an expert examiner. Generate {req.numQuestions} high-quality questions about {req.topic}.
    Format: Valid JSON array of objects.
    Keys: "id" (int), "question" (string), "expected_answer" (string), "marks" (int).
    """
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return {"status": "success", "questions": json.loads(clean_text)}
    except Exception as e:
        print(f"➲ ERR: Generation failed - {str(e)}")
        return {"status": "error", "message": str(e)}

# --- ➲ 2. NEURAL GRADING ---
@app.post("/api/grade")
async def grade_exam(req: GradeRequest):
    print(f"➲ SYNC: Grading {len(req.answers)} student responses...")
    exam_data = [i.dict() for i in req.answers]

    prompt = f"""
    Grade these answers strictly but fairly. Return ONLY a JSON array:
    [ {{"question_id": "string", "awarded_marks": int, "ai_feedback": "string"}} ]
    Data: {json.dumps(exam_data)}
    """
    try:
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        ai_grades = json.loads(clean_text)

        total_possible = sum(i.marks for i in req.answers)
        grade_lookup = {g["question_id"]: g for g in ai_grades}
        detailed = []
        total_score = 0

        for item in req.answers:
            res = grade_lookup.get(item.question_id, {"awarded_marks": 0, "ai_feedback": "AI_MISS_RETRY"})
            awarded = min(res["awarded_marks"], item.marks) # Cap marks at max
            total_score += awarded
            detailed.append({**item.dict(), "awarded_marks": awarded, "ai_feedback": res["ai_feedback"]})

        return {
            "status": "success",
            "final_score": total_score,
            "total_possible": total_possible,
            "percentage": round((total_score / total_possible) * 100) if total_possible > 0 else 0,
            "detailed_results": detailed
        }
    except Exception as e:
        print(f"➲ ERR: Grading failed - {str(e)}")
        return {"status": "error", "message": str(e)}

# --- ➲ 3. OPTICAL PROCTORING & REAL-TIME ALERTS ---
@app.websocket("/ws/proctor")
async def proctor_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            header, encoded = data.split(",", 1)
            nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Run YOLO inference
            results = vision_model(frame, classes=[0, 67], conf=0.4, verbose=False)
            annotated_frame = results[0].plot()

            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_out = base64.b64encode(buffer).decode('utf-8')

            persons = sum(1 for box in results[0].boxes if int(box.cls[0]) == 0)
            phone = any(int(box.cls[0]) == 67 for box in results[0].boxes)

            msg, status = "NOMINAL", "green"
            is_breach = False

            # Determine security status
            if phone:
                msg, status, is_breach = "⚠️ PHONE_DETECTED", "red", True
            elif persons > 1:
                msg, status, is_breach = f"⚠️ MULTIPLE_SUBJECTS ({persons})", "red", True
            elif persons == 0:
                msg, status = "⚠️ SUBJECT_MISSING", "orange"

            # ➲ THE MAINFRAME WEBHOOK: Send real-time alerts to Node.js (Throttled to 10s)
            current_time = time.time()
            last_alert = getattr(websocket, "last_alert_time", 0)

            if is_breach and (current_time - last_alert > 10):
                try:
                    alert_payload = {
                        "alertType": msg,
                        "severity": "CRITICAL"
                    }
                    requests.post(NODE_MAINFRAME_URL, json=alert_payload, timeout=2)
                    websocket.last_alert_time = current_time
                    print(f"➲ [MAINFRAME UPLINK]: Real-time breach reported to Node: {msg}")
                except Exception as e:
                    print(f"➲ [MAINFRAME UPLINK ERR]: Could not reach Node Server - {e}")

            # Send telemetry back to React HUD
            await websocket.send_json({
                "status": status,
                "message": msg,
                "phone": phone,
                "persons": persons,
                "frame": f"data:image/jpeg;base64,{frame_out}"
            })

    except WebSocketDisconnect:
        print("➲ [PROCTOR_SYSTEM]: WebSocket Connection Closed.")
        pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)