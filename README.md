# ➲ SCIO AI: Neural Core V3

SCIO AI is a next-generation, anti-cheat examination platform. It leverages a dual-backend microservice architecture combining Node.js for data routing and Python for real-time computer vision and generative AI grading.

## 🏗️ System Architecture

1. **Frontend Interface (React/Vite):** Runs on `localhost:5173`. High-security Cyberpunk UI with native browser lock-downs and WebRTC streaming.
2. **Mainframe Router (Node.js/Express):** Runs on `localhost:5000`. Handles MongoDB CRUD operations, user authentication, and mission telemetry.
3. **Neural Engine (Python/FastAPI):** Runs on `localhost:8000`. Houses the YOLOv8 real-time proctoring WebSocket and the Google Gemini 2.5 Flash grading algorithm.

---

## ⚙️ Initial Setup & Installation

You will need **Node.js**, **Python 3.10+**, and a running **MongoDB** instance (local or Atlas) to boot the SCIO Core.

### 1. The Mainframe (Node.js)
Open a terminal and navigate to the `server` directory:
\`\`\`bash
cd server
npm install
\`\`\`
* Create a `.env` file in the `server` folder and add your database key: `MONGO_URI=your_mongodb_connection_string`
* Boot the server: `npm run dev` (or `node index.js`)

### 2. The Neural Engine (Python)
Open a second terminal and navigate to the `ai-engine` directory. It is highly recommended to use a virtual environment.
\`\`\`bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install fastapi uvicorn pydantic google-generativeai opencv-python numpy ultralytics python-dotenv requests python-multipart
\`\`\`
* Create a `.env` file in the `ai-engine` folder and add your AI key: `GOOGLE_API_KEY=your_gemini_api_key`
* Boot the engine: `python main.py`
  *(Note: The first time you run this, it will automatically download the ~20MB `yolov8s.pt` weight file).*

### 3. The Client UI (React)
Open a third terminal and navigate to the `client` directory:
\`\`\`bash
cd client
npm install
\`\`\`
* Boot the UI: `npm run dev`

---

## 🛡️ Security Features
* **Optical Proctoring:** Real-time YOLOv8 detection for unauthorized devices (phones) and multiple faces.
* **Terminal Focus:** Native event listeners detect tab-switching and loss of full-screen focus, logging strikes to the database.
* **Red Alert Protocol:** Web Audio API synthesis and visual UI shifts alert candidates immediately upon breach detection.
* **AI Debriefing:** Gemini 2.5 evaluates written answers dynamically, providing personalized feedback and grading beyond simple multiple-choice.