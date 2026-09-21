import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const TakeQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // --- CORE STATE ARCHITECTURE ---
    const [user, setUser] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [gradeReport, setGradeReport] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [systemReady, setSystemReady] = useState(false);

    // 2. CAMERA SETUP
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);

    // 3. TIMER & MONITORING
    const [timeLeft, setTimeLeft] = useState(300);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [violations, setViolations] = useState(0);
    const [notify, setNotify] = useState({ message: '', type: '' });

    const [isRedAlert, setIsRedAlert] = useState(false);
    const audioCtxRef = useRef(null);

    const [telemetry, setTelemetry] = useState({
        phoneDetected: false,
        multipleFacesDetected: false,
        faceMissingDetected: false
    });

    // 4. VISION ENGINE REFS ---
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const wsRef = useRef(null);
    const processedImgRef = useRef(null);
    const [proctorStatus, setProctorStatus] = useState("orange");
    const [proctorMessage, setProctorMessage] = useState("Initializing cameras...");

    // 1. CAMERA SETUP
    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');
        if (!storedUser) return navigate('/login');
        setUser(JSON.parse(storedUser));

        const fetchQuiz = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
                const data = await response.json();
                if (response.ok) {
                    setQuiz(data);
                    if (data.timeLimit) setTimeLeft(data.timeLimit * 60);
                }
            } catch (error) {
                setNotify({ message: 'Could not load assessment. Please try again.', type: 'error' });
            }
        };
        fetchQuiz();
        const bootTimer = setTimeout(() => setSystemReady(true), 2500);
        return () => clearTimeout(bootTimer);
    }, [quizId, navigate]);

    // 1.5. PRE-FLIGHT CAMERA CHECK (Runs immediately on load)
    useEffect(() => {
        let activeStream = null;
        const initCamera = async () => {
            try {
                // Asks for permission on the waiting screen
                activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraStream(activeStream);
                setCameraReady(true);
            } catch (err) {
                setNotify({ message: 'Access denied. Teacher access required.', type: 'error' });
            }
        };
        initCamera();

        // Cleanup: Turns off the webcam light when they leave the page
        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. HANDLERSIZER
    const triggerRedAlert = () => {
        setIsRedAlert(true);
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(600, audioCtxRef.current.currentTime);
            osc.frequency.setValueAtTime(1200, audioCtxRef.current.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
            osc.start();
            osc.stop(audioCtxRef.current.currentTime + 0.4);
        }
        setTimeout(() => setIsRedAlert(false), 2000);
    };

    // 3. SECURITY OVERRIDE (Anti-Cheat Blocks)
    useEffect(() => {
        if (!examStarted || isSubmitted) return;
        const preventAction = (e) => e.preventDefault();

        const handleSecurityBreach = () => {
            if (document.hidden || !document.fullscreenElement) {
                setTabSwitches(prev => prev + 1);
                triggerRedAlert();
                setNotify({ message: 'Security breach detected. Please stay focused on the assessment.', type: 'error' });
            }
        };

        document.addEventListener('contextmenu', preventAction);
        document.addEventListener('copy', preventAction);
        document.addEventListener('cut', preventAction);
        document.addEventListener('paste', preventAction);
        document.addEventListener('fullscreenchange', handleSecurityBreach);
        document.addEventListener('visibilitychange', handleSecurityBreach);

        return () => {
            document.removeEventListener('contextmenu', preventAction);
            document.removeEventListener('copy', preventAction);
            document.removeEventListener('cut', preventAction);
            document.removeEventListener('paste', preventAction);
            document.removeEventListener('fullscreenchange', handleSecurityBreach);
            document.removeEventListener('visibilitychange', handleSecurityBreach);
        };
    }, [examStarted, isSubmitted]);

    // 4. QUANTUM TIMER
    useEffect(() => {
        if (!examStarted || isSubmitted || isGrading) return;
        if (timeLeft <= 0) {
            processSubmission();
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, isSubmitted, isGrading, examStarted]);

    // 5. AI VISION ENGINE (Attaches stream & starts WebSocket)
    useEffect(() => {
        if (!examStarted || !cameraStream) return;

        // Attach the already-running stream to the video element
        if (videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }

        wsRef.current = new WebSocket("ws://localhost:8000/ws/proctor");

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProctorMessage(data.message);

            const color = data.status === "green" ? "#00ffa3" : data.status === "red" ? "#ff4d4d" : "#ffc107";
            setProctorStatus(color);

            if (data.status === "red") triggerRedAlert();

            if (data.phone) {
                setTelemetry(prev => ({ ...prev, phoneDetected: true }));
                setViolations(prev => prev + 1);
                setNotify({ message: 'Phone detected. This is a security violation.', type: 'error' });
            }
            if (data.persons > 1) {
                setTelemetry(prev => ({ ...prev, multipleFacesDetected: true }));
                setViolations(prev => prev + 1);
                setNotify({ message: 'Multiple subjects detected. This is a security violation.', type: 'error' });
            }
            if (data.persons === 0) {
                setTelemetry(prev => ({ ...prev, faceMissingDetected: true }));
                setViolations(prev => prev + 1);
                setNotify({ message: 'Face not detected. Please remain visible.', type: 'warning' });
            }

            if (data.frame && processedImgRef.current) {
                processedImgRef.current.src = data.frame;
            }
        };

        const frameInterval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
                const context = canvasRef.current.getContext('2d');
                canvasRef.current.width = 640;
                canvasRef.current.height = 480;
                context.drawImage(videoRef.current, 0, 0, 640, 480);
                wsRef.current.send(canvasRef.current.toDataURL('image/jpeg', 0.6));
            }
        }, 1000);

        return () => {
            clearInterval(frameInterval);
            if (wsRef.current) wsRef.current.close();
            // We do NOT stop the camera track here, it is handled by the initial useEffect cleanup
        };
    }, [examStarted, cameraStream]);

    // 6. THE MASTER SUBMISSION
    const processSubmission = async () => {
        setIsGrading(true);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

        const payload = quiz.questions.map(q => ({
            question_id: q._id,
            question: q.question,
            expected_answer: q.expected_answer,
            marks: q.marks,
            student_answer: answers[q._id] || ""
        }));

        try {
            const gradeResponse = await fetch('http://localhost:8000/api/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: payload })
            });
            const gradeData = await gradeResponse.json();

            if (gradeData.status === 'error') throw new Error(gradeData.message);

            if (gradeResponse.ok) {
                setGradeReport(gradeData);

                await fetch(`http://localhost:5000/api/submissions/quiz/${quizId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentName: user.name,
                        final_score: gradeData.final_score,
                        total_possible: gradeData.total_possible,
                        percentage: gradeData.percentage,
                        detailed_results: gradeData.detailed_results,
                        tabSwitches,
                        phoneDetected: telemetry.phoneDetected,
                        multipleFacesDetected: telemetry.multipleFacesDetected,
                        faceMissingDetected: telemetry.faceMissingDetected
                    })
                });

                setIsSubmitted(true);
                setNotify({ message: 'Loading results...', type: 'info' });
            }
        } catch (error) {
            setNotify({ message: 'Could not load results. Please try again.', type: 'error' });
        } finally {
            setIsGrading(false);
        }
    };

    const handleAnswerChange = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [questionId]: text }));
    };

    // ➲ UPGRADE: Start Exam (Fullscreen now works perfectly)
    const handleStartExam = () => {
        document.documentElement.requestFullscreen().catch(() => {});
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current.resume();
        setExamStarted(true);
                setNotify({ message: 'Connection established.', type: 'success' });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getRank = (p) => {
        if (p >= 90) return { l: 'S', c: '#00d2ff' };
        if (p >= 75) return { l: 'A', c: '#00ffa3' };
        if (p >= 60) return { l: 'B', c: '#ffc107' };
        return { l: 'F', c: '#ff4d4d' };
    };

    // --- RENDER LOGIC ---

    if (!quiz || !user) return (
        <div className="boot-loader">
            <div className="pulse orbitron">BOOTING_SCIO_OS_V3</div>
        </div>
    );

    if (isSubmitted && gradeReport) {
        const rank = getRank(gradeReport.percentage);
        return (
            <div className="results-root">
                <div className="results-container glass-panel">
                    <header className="results-header">
                        <h1 className="orbitron">ASSESSMENT_COMPLETE</h1>
                        <p className="mono">ID: {quizId.toUpperCase()}</p>
                    </header>
                    <div className="results-grid">
                        <div className="analysis-panel glass-panel">
                            <div className="panel-label orbitron">AI_ANALYSIS</div>
                            <div className="feedback-list">
                                {gradeReport.detailed_results.map((res, i) => (
                                    <div key={i} className="feedback-item" style={{ borderLeftColor: res.awarded_marks > 0 ? '#00ffa3' : '#ff4d4d' }}>
                                        <p className="q-text mono"><strong>Question {i+1}:</strong> {res.question}</p>
                                        <p className="ai-note italic">"{res.ai_feedback}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rank-panel glass-panel">
                            <div className="panel-label orbitron">PERFORMANCE_RANK</div>
                            <div className="rank-letter" style={{ color: rank.c }}>{rank.l}</div>
                            <div className="percentage-text orbitron">{gradeReport.percentage}%</div>
                            <div className="raw-score mono">{gradeReport.final_score} / {gradeReport.total_possible} PTS</div>
                            <button onClick={() => navigate('/dashboard')} className="return-btn orbitron">RETURN_TO_DASHBOARD</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!examStarted) {
        return (
            <div className="waiting-root">
                <div className="waiting-content">
                    <h1 className="orbitron waiting-title">{quiz.title}</h1>
                    <div className="system-checks">
                        {/* ➲ UPGRADE: Dynamic Sensor Checking */}
                        <div className="check-box glass-panel">
                            <small className="orbitron">CAMERA</small>
                            <div className="status-text" style={{ color: cameraReady ? '#10b981' : '#f59e0b' }}>
                                {cameraReady ? 'Ready' : 'Waiting for permission...'}
                            </div>
                        </div>
                        <div className="check-box glass-panel">
                            <small className="orbitron">SYSTEM</small>
                            <div className="status-text" style={{ color: '#10b981' }}>Online</div>
                        </div>
                        <div className="check-box glass-panel">
                            <small className="orbitron">AI</small>
                            <div className="status-text" style={{ color: systemReady ? '#10b981' : '#6b7280' }}>
                                {systemReady ? 'Ready' : 'Loading...'}
                            </div>
                        </div>
                    </div>

                    {/* ➲ UPGRADE: Button waits for camera to be allowed */}
                    <button onClick={handleStartExam} disabled={!systemReady || !cameraReady} className={`init-btn orbitron ${(systemReady && cameraReady) ? 'ready' : ''}`}>
                        {(systemReady && cameraReady) ? 'Start Assessment' : 'Preparing hardware...'}
                    </button>
                </div>
                <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />
            </div>
        );
    }

    return (
        <div className={`exam-hud-root ${isRedAlert ? 'red-alert-active' : ''}`}>
            <header className="hud-header">
                <div className="orbitron session-id">SESSION_#{quizId.slice(-4)}</div>
                <div className="timer-module">
                    <div className="time-display orbitron" style={{ color: timeLeft < 60 ? '#ff4d4d' : '#00d2ff' }}>{formatTime(timeLeft)}</div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}></div></div>
                </div>
                <div className="strike-module">
                    <small className="orbitron">VIOLATIONS</small>
                    <div className="status-text" style={{ color: violations > 0 ? '#ef4444' : '#10b981' }}>{violations}</div>
                </div>
            </header>

            <div className="proctor-hud" style={{ borderColor: proctorStatus, boxShadow: isRedAlert ? '0 0 50px #ff4d4d' : 'none' }}>
                <div className="laser-line" style={{ background: proctorStatus }}></div>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <video ref={videoRef} autoPlay muted style={{ position: 'absolute', opacity: 0 }}></video>
                <img ref={processedImgRef} alt="AI VISION" className="ai-view-img" />
                <div className="proctor-msg orbitron" style={{ background: proctorStatus }}>{proctorMessage}</div>
            </div>

            <main className="question-stream">
                <form onSubmit={(e) => { e.preventDefault(); processSubmission(); }}>
                    {quiz.questions.map((q, i) => (
                        <div key={q._id} className="question-node">
                            <div className="node-number orbitron">0{i+1}</div>
                            <div className="node-content glass-panel">
                                <p className="q-prompt">{q.question}</p>
                                <div className="answer-zone">
                                    {q.type === 'mcq' ? (
                                        <div className="mcq-options-container">
                                            {q.options?.map((opt, oIndex) => (
                                                <label key={oIndex} className={`mcq-label mono ${answers[q._id] === opt ? 'selected' : ''}`}>
                                                    <input type="radio" name={`question-${q._id}`} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswerChange(q._id, opt)} required />
                                                    <span className="mcq-text">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <textarea rows="4" className="text-answer-input mono" placeholder="Type your answer..." value={answers[q._id] || ''} onChange={(e) => handleAnswerChange(q._id, e.target.value)} required />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="submit-container">
                        <button type="submit" disabled={isGrading} className={`finalize-btn orbitron ${isGrading ? 'loading' : ''}`}>
                            {isGrading ? 'Processing...' : 'Submit Assessment'}
                        </button>
                    </div>
                </form>
            </main>
            <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />
            <style>
                {`
                .exam-hud-root, .waiting-root, .results-root { min-height: 100vh; background: #fafafa; color: #1a1a2e; font-family: 'Inter', sans-serif; transition: background-color 0.15s ease-in-out; }
                
                .red-alert-active { background: #fef2f2 !important; }

                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
                .mono { font-family: 'JetBrains Mono', monospace; }
                .italic { font-style: italic; }

                .hud-header { position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; padding: 20px 60px; display: flex; justify-content: space-between; align-items: center; }
                .time-display { font-size: 32px; font-weight: 900; color: #1a1a2e; }
                .progress-track { height: 3px; width: 200px; background: #e5e7eb; margin-top: 5px; border-radius: 50px; overflow: hidden; }
                .progress-fill { height: 100%; background: #5B4FFF; transition: 0.5s; box-shadow: 0 0 10px #5B4FFF; }
                
                .proctor-hud { position: fixed; bottom: 40px; right: 40px; width: 300px; border-radius: 25px; border: 2px solid #5B4FFF; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); z-index: 1000; transition: 0.3s; background: #ffffff; }
                .ai-view-img { width: 100%; display: block; filter: grayscale(0.2) contrast(1.2); }
                .proctor-msg { color: #1a1a2e; padding: 12px; font-size: 10px; font-weight: 900; text-align: center; text-transform: uppercase; }
                .laser-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; box-shadow: 0 0 15px currentColor; animation: scanHUD 3s linear infinite; z-index: 2; }

                .question-stream { max-width: 1000px; margin: 0 auto; padding: 60px 40px; }
                .question-node { display: grid; grid-template-columns: 80px 1fr; gap: 20px; margin-bottom: 50px; }
                .node-number { font-size: 24px; color: #6b7280; text-align: right; margin-top: 20px; }
                .node-content { padding: 40px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; background: #ffffff; }
                .q-prompt { font-size: 18px; margin-bottom: 30px; line-height: 1.6; color: #1a1a2e; }
                
                .text-answer-input { width: 100%; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; color: #1a1a2e; outline: none; transition: 0.3s; font-size: 14px; }
                .text-answer-input:focus { border-color: #5B4FFF; box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1); }

                .mcq-options-container { display: flex; flex-direction: column; gap: 15px; }
                .mcq-label { display: flex; align-items: center; gap: 15px; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; cursor: pointer; transition: 0.3s; }
                .mcq-label.selected { border-color: #5B4FFF; background: rgba(91, 79, 255, 0.05); color: #1a1a2e; }
                .mcq-label input { display: none; }

                .finalize-btn { width: 100%; padding: 25px; background: #1a1a2e; color: #ffffff; border: none; border-radius: 15px; font-weight: 600; font-size: 18px; cursor: pointer; transition: 0.3s; }
                .finalize-btn:hover { background: #5B4FFF; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.25); }
                .finalize-btn.loading { background: #f5f5f5; color: #5B4FFF; cursor: not-allowed; }

                .waiting-content { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; position: relative; }
                .waiting-title { font-size: 48px; color: #1a1a2e; margin-bottom: 40px; text-shadow: 0 0 20px rgba(91, 79, 255, 0.3); }
                
                .system-checks { display: flex; gap: 20px; margin-bottom: 40px; }
                .check-box { padding: 20px 30px; border-radius: 15px; text-align: center; border: 1px solid rgba(91, 79, 255, 0.2); background: #ffffff; }
                .check-box small { color: #6b7280; letter-spacing: 2px; }
                .status-text { font-weight: 900; font-size: 18px; margin-top: 10px; color: #1a1a2e; }

                .init-btn { padding: 20px 50px; background: #f5f5f5; color: #1a1a2e; border: none; border-radius: 15px; font-size: 16px; transition: 0.3s; letter-spacing: 2px; font-weight: 900; }
                .init-btn.ready { background: #5B4FFF; color: #ffffff; cursor: pointer; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .init-btn.ready:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.25); }

                .results-root { display: flex; justify-content: center; align-items: center; padding: 40px; background: #fafafa; }
                .results-container { width: 100%; max-width: 1100px; padding: 60px; background: #ffffff; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .rank-letter { font-size: 160px; font-weight: 900; line-height: 1; margin: 20px 0; text-shadow: 0 0 40px currentColor; color: #1a1a2e; }
                .return-btn { width: 100%; padding: 20px; background: #1a1a2e; color: #ffffff; border: none; border-radius: 12px; cursor: pointer; transition: 0.3s; margin-top: 40px; font-weight: bold; }
                .return-btn:hover { background: #5B4FFF; color: #ffffff; }

                @keyframes scanHUD { 0% { top: 0%; } 100% { top: 100%; } }
                .boot-loader { height: 100vh; display: flex; justify-content: center; align-items: center; background: #fafafa; color: #5B4FFF; font-size: 20px; }
                `}
            </style>
        </div>
    );
};

export default TakeQuiz;