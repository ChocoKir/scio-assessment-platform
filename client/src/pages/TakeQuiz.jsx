import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import './takequiz.css'; // Importing the separated CSS file

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
    const [proctorStatus, setProctorStatus] = useState("#5B4FFF");
    const [proctorMessage, setProctorMessage] = useState("Initializing cameras...");

    // 1. DATA SETUP
    useEffect(() => {
        const storedUser = localStorage.getItem('EduX_user');
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

    // 1.5. PRE-FLIGHT CAMERA CHECK
    useEffect(() => {
        let activeStream = null;
        const initCamera = async () => {
            console.log('Initializing camera...');
            try {
                activeStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    } 
                });
                console.log('Camera stream obtained:', activeStream);
                setCameraStream(activeStream);
                setCameraReady(true);
                console.log('Camera ready state set to true');
            } catch (err) {
                console.error('Camera initialization error:', err);
                setNotify({ message: `Camera access denied: ${err.message}`, type: 'error' });
            }
        };
        initCamera();

        return () => {
            if (activeStream) {
                console.log('Cleaning up camera stream');
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

    // 5. AI VISION ENGINE
    useEffect(() => {
        if (!examStarted || !cameraStream) return;

        if (videoRef.current) {
            console.log('Assigning stream to video element:', cameraStream);
            videoRef.current.srcObject = cameraStream;
            videoRef.current.onloadedmetadata = () => {
                console.log('Video metadata loaded, playing video');
                videoRef.current.play().catch(err => console.error('Video play error:', err));
            };
        }

        wsRef.current = new WebSocket("ws://localhost:8000/ws/proctor");

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProctorMessage(data.message);

            const color = data.status === "green" ? "#10b981" : data.status === "red" ? "#ef4444" : "#f59e0b";
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
                const detectedSecurityIssues = tabSwitches + (telemetry.phoneDetected ? 1 : 0) + (telemetry.multipleFacesDetected ? 1 : 0) + (telemetry.faceMissingDetected ? 1 : 0);
                const integrityStatus = detectedSecurityIssues > 0 ? 'BREACH_DETECTED' : 'VERIFIED';

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
                        faceMissingDetected: telemetry.faceMissingDetected,
                        security_violations: detectedSecurityIssues,
                        integrity_status: integrityStatus
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
        if (p >= 90) return { l: 'S', c: '#5B4FFF' };
        if (p >= 75) return { l: 'A', c: '#10b981' };
        if (p >= 60) return { l: 'B', c: '#f59e0b' };
        return { l: 'F', c: '#ef4444' };
    };

    // --- VIEW 1: BOOT LOADER ---
    if (!quiz || !user) return (
        <div className="EduX-layout">
            <div className="loader-container">BOOTING_EduX_OS_V3</div>
        </div>
    );

    // --- VIEW 2: RESULTS ---
    if (isSubmitted && gradeReport) {
        const rank = getRank(gradeReport.percentage);
        return (
            <div className="EduX-layout">
                <header className="EduX-navbar">
                    <div className="nav-logo"><span className="logo-icon">s</span> EduX_</div>
                    <div className="nav-profile">
                        <div className="profile-text">PROFILE<br/><strong>{user.name || 'ABC'}</strong></div>
                        <button className="nav-btn" onClick={() => navigate('/dashboard')}>EXIT</button>
                    </div>
                </header>
                <main className="EduX-content">
                    <div className="section-tag">SECTION: RESULTS</div>
                    <div className="hero-text">
                        <h1>Assessment<span>Complete.</span></h1>
                        <p>ID: {quizId.toUpperCase()}</p>
                    </div>
                    
                    <div className="stats-grid results-grid">
                        <div className="stat-card">
                            <small>PERFORMANCE_RANK</small>
                            <div className="rank-display" style={{ color: rank.c }}>{rank.l}</div>
                            <div className="stat-value">{gradeReport.percentage}%</div>
                            <span className="stat-label">{gradeReport.final_score} / {gradeReport.total_possible} PTS</span>
                        </div>
                        <div className="stat-card ai-feedback-card">
                            <small>AI_ANALYSIS</small>
                            <div className="feedback-list">
                                {gradeReport.detailed_results.map((res, i) => (
                                    <div key={i} className="feedback-item" style={{ borderLeftColor: res.awarded_marks > 0 ? '#10b981' : '#ef4444' }}>
                                        <p className="feedback-q">Q{i+1}: {res.question}</p>
                                        <p className="feedback-a">{res.ai_feedback}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --- VIEW 3: WAITING ROOM ---
    if (!examStarted) {
        return (
            <div className="EduX-layout">
                <header className="EduX-navbar">
                    <div className="nav-logo"><span className="logo-icon">s</span> EduX_</div>
                    <div className="nav-links">
                        <span className="active">DASHBOARD</span>
                        <span>HOST_SESSION</span>
                        <span>JOIN_SESSION</span>
                    </div>
                    <div className="nav-profile">
                        <div className="profile-text">PROFILE<br/><strong>{user.name || 'ABC'}</strong></div>
                        <button className="nav-btn" onClick={() => navigate('/dashboard')}>LOGOUT</button>
                    </div>
                </header>

                <main className="EduX-content">
                    <div className="section-tag">SECTION: INITIALIZATION</div>
                    <div className="hero-text">
                        <h1>System<span>Check.</span></h1>
                        <p>Verify your hardware integrity before proceeding to the secure session for: <strong>{quiz.title}</strong></p>
                    </div>

                    <div className="stats-grid init-grid">
                        <div className="stat-card">
                            <small>CAMERA_HARDWARE</small>
                            <div className="stat-value" style={{ color: cameraReady ? '#1a1a2e' : '#9ca3af' }}>
                                {cameraReady ? 'DETECTED' : 'WAITING'}
                            </div>
                            <span className="stat-label text-indigo">status</span>
                        </div>
                        <div className="stat-card">
                            <small>AI_ENGINE</small>
                            <div className="stat-value" style={{ color: systemReady ? '#1a1a2e' : '#9ca3af' }}>
                                {systemReady ? 'ONLINE' : 'BOOTING'}
                            </div>
                            <span className="stat-label text-indigo">secure</span>
                        </div>
                        <div className="stat-card action-card">
                            <button 
                                onClick={handleStartExam} 
                                disabled={!systemReady || !cameraReady} 
                                className={`submit-btn ${(!systemReady || !cameraReady) ? 'loading' : ''}`}
                            >
                                {(systemReady && cameraReady) ? 'START SECURE ASSESSMENT' : 'INITIALIZING...'}
                            </button>
                        </div>
                    </div>
                </main>
                <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />
            </div>
        );
    }

    // --- VIEW 4: EXAM INTERFACE ---
    return (
        <div className={`EduX-layout ${isRedAlert ? 'red-alert' : ''}`}>
            <header className="EduX-navbar exam-navbar">
                <div className="nav-logo"><span className="logo-icon">s</span> EduX_</div>
                <div className="nav-timer">
                    <span className="time-text" style={{ color: timeLeft < 60 ? '#ef4444' : '#1a1a2e' }}>{formatTime(timeLeft)}</span>
                    <small>TIME_REMAINING</small>
                </div>
                <div className="nav-actions">
                    <button className="submit-btn compact-btn" onClick={processSubmission} disabled={isGrading}>
                        {isGrading ? 'PROCESSING...' : 'SUBMIT EXAM'}
                    </button>
                </div>
            </header>

            <main className="EduX-content split-layout">
                {/* Left Side: Questions */}
                <div className="assessment-pane">
                    <div className="section-tag" style={{ marginBottom: '30px' }}>SECTION: ASSESSMENT</div>
                    <form onSubmit={(e) => { e.preventDefault(); processSubmission(); }}>
                        {quiz.questions.map((q, i) => (
                            <div key={q._id} className="question-block">
                                <div className="q-meta"><span className="text-indigo">Q{String(i+1).padStart(3, '0')}</span> / {q.marks} PTS</div>
                                <h3 className="q-text">{q.question}</h3>
                                
                                <div className="answer-area">
                                    {q.type === 'mcq' ? (
                                        <div className="mcq-grid">
                                            {q.options?.map((opt, oIndex) => (
                                                <label key={oIndex} className={`mcq-card ${answers[q._id] === opt ? 'selected' : ''}`}>
                                                    <input type="radio" name={`q-${q._id}`} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswerChange(q._id, opt)} required />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <textarea className="text-area" placeholder="Enter your response..." value={answers[q._id] || ''} onChange={(e) => handleAnswerChange(q._id, e.target.value)} required />
                                    )}
                                </div>
                            </div>
                        ))}
                    </form>
                </div>

                {/* Right Side: Dashboard Widget Proctor Style */}
                <aside className="proctor-pane">
                    <div className="stat-card video-card" style={{ borderColor: proctorStatus }}>
                        <div className="card-header">
                            <small>PROCTOR_FEED</small>
                            <span className="status-dot" style={{ background: proctorStatus }}></span>
                        </div>
                        <div className="video-container">
                            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                            <img ref={processedImgRef} alt="AI Feed" className="ai-feed-stream" style={{ display: 'none' }} />
                            <div className="scan-line" style={{ background: proctorStatus }}></div>
                        </div>
                        <div className="proctor-message">{proctorMessage}</div>
                    </div>

                    <div className="stat-card telemetry-card">
                        <small>SESSION_TELEMETRY</small>
                        <div className="telemetry-row">
                            <span>VIOLATIONS</span>
                            <strong style={{ color: violations > 0 ? '#ef4444' : '#10b981' }}>{violations} flags</strong>
                        </div>
                        <div className="telemetry-row">
                            <span>PROGRESS</span>
                            <strong>{Object.keys(answers).length} / {quiz.questions.length} ans</strong>
                        </div>
                    </div>
                </aside>
            </main>
            <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />
        </div>
    );
};

export default TakeQuiz;