// client/src/pages/QuizAnalytics.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification'; // ➲ Integrated HUD

const QuizAnalytics = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notify, setNotify] = useState({ message: '', type: '' }); // ➲ HUD State

    useEffect(() => {
        // Fetching mission-critical intelligence from the backend
        fetch(`http://localhost:5000/api/submissions/quiz/${quizId}`)
            .then(res => res.json())
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(err => {
                setNotify({ message: 'LINK_FAILURE: Could not retrieve intelligence.', type: 'error' });
                setLoading(false);
            });
    }, [quizId]);

    const totalStudents = submissions.length;
    const averageScore = totalStudents > 0
        ? (submissions.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents).toFixed(1)
        : 0;

    // --- CSV Export Logic ---
    const downloadCSV = () => {
        if (submissions.length === 0) {
            setNotify({ message: 'EXPORT_ERR: No data streams detected.', type: 'error' });
            return;
        }

        setNotify({ message: 'COMPILING: Generating CSV log file...', type: 'info' });

        const headers = ['Student Name', 'Points Earned', 'Total Points', 'Percentage', 'Tab Switches'];
        const rows = submissions.map(sub => [
            `"${sub.studentName}"`, sub.final_score, sub.total_possible, `"${sub.percentage}%"`, sub.tabSwitches || 0
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `SCIO_INTEL_REPORT_${quizId.toUpperCase()}.csv`);
        link.click();

        setNotify({ message: 'SUCCESS: Intelligence logs exported.', type: 'success' });
    };

    if (loading) {
        return (
            <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00d2ff', fontFamily: 'Orbitron', letterSpacing: '5px' }}>
                <div className="pulse">RETRIVING_MISSION_DATA...</div>
            </div>
        );
    }

    return (
        <div className="analytics-root">
            <div className="scanline"></div>

            <div className="content-container">
                {/* --- TOP HUD NAVIGATION --- */}
                <header className="hud-header">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="orbitron back-btn"
                        >
                            ← HUB_BASE
                        </button>
                        <h1 className="orbitron main-title">
                            MISSION_<span style={{ color: '#00d2ff' }}>ANALYTICS</span>
                        </h1>
                        <div className="id-badge orbitron">QUIZ_ID: {quizId.toUpperCase()}</div>
                    </div>

                    <div className="effectiveness-module">
                        <div className="orbitron label">CLASS_EFFECTIVENESS</div>
                        <div className="score-display orbitron">{averageScore}%</div>
                        <button onClick={downloadCSV} className="export-btn orbitron">
                            📥 EXPORT_DATA_LOGS
                        </button>
                    </div>
                </header>

                {/* --- KPI GRID --- */}
                <div className="kpi-grid">
                    <div className="kpi-card glass-panel">
                        <h3 className="orbitron">CANDIDATES_SYNCED</h3>
                        <p className="orbitron">{totalStudents}</p>
                    </div>
                    <div className="kpi-card glass-panel highlight">
                        <h3 className="orbitron" style={{ color: '#00d2ff' }}>AI_STATUS</h3>
                        <p className="orbitron">NOMINAL</p>
                    </div>
                    <div className="kpi-card glass-panel">
                        <h3 className="orbitron">ENCRYPTION</h3>
                        <p className="orbitron">SECURE</p>
                    </div>
                </div>

                {/* --- CANDIDATE FEED --- */}
                <h2 className="orbitron feed-title">➲ CANDIDATE_ACTIVITY_LOGS</h2>

                {submissions.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <p className="orbitron">NO_DATA_STREAMS_DETECTED</p>
                    </div>
                ) : (
                    <div className="candidate-grid">
                        {submissions.map((sub) => (
                            <div key={sub._id} className="candidate-card glass-panel">
                                {/* Violation HUD */}
                                {sub.tabSwitches > 0 && (
                                    <div className="violation-tag orbitron">
                                        ⚠️ PROTOCOL_BREACH: {sub.tabSwitches}
                                    </div>
                                )}

                                <div className="card-header">
                                    <div>
                                        <h3 className="student-name">{sub.studentName}</h3>
                                        <div className="timestamp orbitron">SYNC: {new Date(sub.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="grade-display">
                                        <div className="percent orbitron" style={{ color: sub.percentage >= 70 ? '#00ffa3' : '#ff4d4d' }}>{sub.percentage}%</div>
                                        <div className="pts">{sub.final_score} / {sub.total_possible} PTS</div>
                                    </div>
                                </div>

                                <details className="details-module">
                                    <summary className="orbitron">VIEW_NEURAL_DEBRIEF</summary>
                                    <div className="feedback-container">
                                        {sub.detailed_results.map((q, i) => (
                                            <div key={i} className="feedback-item" style={{ borderLeftColor: q.awarded_marks === q.possible_marks ? '#00ffa3' : '#ff4d4d' }}>
                                                <p className="q-text"><strong>Q:</strong> {q.question}</p>
                                                <p className="a-text">"{q.student_answer}"</p>
                                                <div className="ai-note">
                                                    <strong className="orbitron">AI_EVAL:</strong> {q.ai_feedback}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ➲ Tactical Notification HUD */}
            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            <style>{`
                .analytics-root { background: #050505; min-height: 100vh; padding: 60px; color: #fff; font-family: 'Inter', sans-serif; position: relative; overflow-x: hidden; }
                .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 100; }
                
                .content-container { maxWidth: 1400px; margin: 0 auto; position: relative; z-index: 10; }
                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
                
                .hud-header { display: flex; justify-content: space-between; align-items: flex-start; marginBottom: 60px; }
                .main-title { fontSize: 48px; margin: 0; fontWeight: 900; textShadow: 0 0 30px rgba(0,210,255,0.3); }
                .back-btn { background: rgba(255,255,255,0.02); border: 1px solid #222; color: #00d2ff; padding: 12px 24px; borderRadius: 12px; cursor: pointer; marginBottom: 25px; fontSize: 11px; transition: 0.3s; }
                .back-btn:hover { border-color: #00d2ff; background: rgba(0,210,255,0.05); }
                .id-badge { fontSize: 10px; padding: 5px 12px; background: rgba(0,210,255,0.1); color: #00d2ff; borderRadius: 20px; border: 1px solid #00d2ff33; display: inline-block; marginTop: 10px; }
                
                .effectiveness-module { textAlign: right; }
                .effectiveness-module .label { fontSize: 10px; color: #444; marginBottom: 5px; }
                .effectiveness-module .score-display { fontSize: 64px; fontWeight: 900; color: #00d2ff; lineHeight: 1; textShadow: 0 0 40px rgba(0,210,255,0.2); }
                .export-btn { marginTop: 20px; padding: 12px 24px; background: linear-gradient(45deg, #28a745, #1e7e34); color: #fff; border: none; borderRadius: 12px; fontWeight: 900; cursor: pointer; fontSize: 11px; boxShadow: 0 10px 20px rgba(40, 167, 69, 0.2); transition: 0.3s; }
                .export-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }

                .kpi-grid { display: grid; gridTemplateColumns: repeat(3, 1fr); gap: 30px; marginBottom: 60px; }
                .kpi-card { padding: 40px; textAlign: center; }
                .kpi-card h3 { fontSize: 11px; color: #444; marginBottom: 15px; }
                .kpi-card p { fontSize: 42px; fontWeight: 900; margin: 0; }
                .kpi-card.highlight { border-color: rgba(0, 210, 255, 0.2); background: rgba(0, 210, 255, 0.03); }

                .feed-title { fontSize: 14px; color: #333; marginBottom: 30px; letterSpacing: 4px; }
                .candidate-grid { display: grid; gridTemplateColumns: repeat(auto-fill, minmax(500px, 1fr)); gap: 30px; }
                .candidate-card { padding: 40px; position: relative; overflow: hidden; transition: 0.4s; }
                .candidate-card:hover { transform: translateY(-8px); border-color: #00d2ff55 !important; boxShadow: 0 20px 40px rgba(0,0,0,0.4); }

                .violation-tag { position: absolute; top: 0; right: 0; background: #dc3545; color: #fff; padding: 8px 20px; borderRadius: 0 24px 0 24px; fontSize: 9px; fontWeight: 900; boxShadow: 0 0 20px rgba(220, 53, 69, 0.4); }
                .card-header { display: flex; justify-content: space-between; alignItems: center; marginBottom: 30px; }
                .student-name { margin: 0 0 5px 0; fontSize: 28px; fontWeight: 800; }
                .timestamp { fontSize: 10px; color: #444; }
                .grade-display { textAlign: right; }
                .grade-display .percent { fontSize: 42px; fontWeight: 900; }
                .grade-display .pts { fontSize: 11px; color: #666; }

                .details-module summary { color: #00d2ff; fontWeight: 900; fontSize: 11px; cursor: pointer; padding: 15px 0; borderTop: 1px solid #111; outline: none; }
                .feedback-container { marginTop: 25px; display: flex; flexDirection: column; gap: 20px; }
                .feedback-item { padding: 20px; background: rgba(0,0,0,0.3); borderRadius: 15px; borderLeft: 4px solid; }
                .feedback-item .q-text { fontSize: 14px; fontWeight: 700; margin: 0 0 10px 0; }
                .feedback-item .a-text { fontSize: 13px; color: #888; fontStyle: italic; margin: 0 0 15px 0; lineHeight: 1.6; }
                .ai-note { padding: 12px; background: rgba(0, 210, 255, 0.05); borderRadius: 8px; fontSize: 12px; color: #00d2ff; border: 1px solid rgba(0, 210, 255, 0.1); }

                .pulse { animation: pulseHUD 2s infinite; }
                @keyframes pulseHUD { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #222; borderRadius: 10px; }
            `}</style>
        </div>
    );
};

export default QuizAnalytics;