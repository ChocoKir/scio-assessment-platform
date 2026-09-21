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
        // Fetching assessment results from backend
        fetch(`http://localhost:5000/api/submissions/quiz/${quizId}`)
            .then(res => res.json())
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(err => {
                setNotify({ message: 'Connection error. Could not retrieve results.', type: 'error' });
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
            setNotify({ message: 'No data available to export.', type: 'error' });
            return;
        }

        setNotify({ message: 'Generating CSV report...', type: 'info' });

        const headers = ['Student Name', 'Points Earned', 'Total Points', 'Percentage', 'Tab Switches'];
        const rows = submissions.map(sub => [
            `"${sub.studentName}"`, sub.final_score, sub.total_possible, `"${sub.percentage}%"`, sub.tabSwitches || 0
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `EduX_INTEL_REPORT_${quizId.toUpperCase()}.csv`);
        link.click();

        setNotify({ message: 'Report exported successfully.', type: 'success' });
    };

    if (loading) {
        return (
            <div style={{ background: '#000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00d2ff', fontFamily: 'Orbitron', letterSpacing: '5px' }}>
                <div className="pulse">Loading results...</div>
            </div>
        );
    }

    return (
        <div className="analytics-root">
            <div className="content-container" style={{ maxWidth: '100%' }}>
                {/* --- TOP HUD NAVIGATION --- */}
                <header className="hud-header">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="orbitron back-btn"
                        >
                            ← DASHBOARD
                        </button>
                        <h1 className="orbitron main-title">
                            ASSESSMENT_<span style={{ color: '#5B4FFF' }}>ANALYTICS</span>
                        </h1>
                        <div className="id-badge orbitron">ASSESSMENT_ID: {quizId.toUpperCase()}</div>
                    </div>

                    <div className="effectiveness-module">
                        <div className="orbitron label">CLASS_AVERAGE</div>
                        <div className="score-display orbitron">{averageScore}%</div>
                        <button onClick={downloadCSV} className="export-btn orbitron">
                            📥 EXPORT_CSV
                        </button>
                    </div>
                </header>

                {/* --- KPI GRID --- */}
                <div className="kpi-grid">
                    <div className="kpi-card glass-panel">
                        <h3 className="orbitron">STUDENTS_COMPLETED</h3>
                        <p className="orbitron">{totalStudents}</p>
                    </div>
                    <div className="kpi-card glass-panel highlight">
                        <h3 className="orbitron" style={{ color: '#5B4FFF' }}>AI_STATUS</h3>
                        <p className="orbitron">NOMINAL</p>
                    </div>
                    <div className="kpi-card glass-panel">
                        <h3 className="orbitron">SECURITY</h3>
                        <p className="orbitron">SECURE</p>
                    </div>
                </div>

                {/* --- CANDIDATE FEED --- */}
                <h2 className="orbitron feed-title">STUDENT_RESULTS</h2>

                {submissions.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <p className="orbitron">No results found</p>
                    </div>
                ) : (
                    <div className="candidate-grid">
                        {submissions.map((sub) => (
                            <div key={sub._id} className="candidate-card glass-panel">
                                {/* Violation HUD */}
                                {sub.tabSwitches > 0 && (
                                    <div className="violation-tag orbitron">
                                        ⚠️ TAB_SWITCHES: {sub.tabSwitches}
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
                                    <summary className="orbitron">VIEW_DETAILED_RESULTS</summary>
                                    <div className="feedback-container">
                                        {sub.detailed_results.map((q, i) => (
                                            <div key={i} className="feedback-item" style={{ borderLeftColor: q.awarded_marks === q.possible_marks ? '#00ffa3' : '#ff4d4d' }}>
                                                <p className="q-text"><strong>Q:</strong> {q.question}</p>
                                                <p className="a-text">"{q.student_answer}"</p>
                                                <div className="ai-note">
                                                    <strong className="orbitron">AI_ANALYSIS:</strong> {q.ai_feedback}
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
                .analytics-root { background: #fafafa; min-height: 100vh; padding: 40px; color: #1a1a2e; font-family: 'Inter', sans-serif; position: relative; overflow-x: hidden; }
                .content-container { max-width: 1600px; margin: 0 auto; position: relative; z-index: 10; }
                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
                
                .hud-header { display: flex; justify-content: space-between; align-items: flex-start; marginBottom: 60px; }
                .main-title { fontSize: 48px; margin: 0; fontWeight: 900; textShadow: 0 0 30px rgba(91, 79, 255, 0.3); color: #1a1a2e; }
                .back-btn { background: rgba(255,255,255,0.02); border: 1px solid #e5e7eb; color: #6b7280; padding: 12px 24px; borderRadius: 12px; cursor: pointer; marginBottom: 25px; fontSize: 11px; transition: 0.3s; }
                .back-btn:hover { border-color: #5B4FFF; background: rgba(91, 79, 255, 0.05); color: #5B4FFF; }
                .id-badge { fontSize: 10px; padding: 5px 12px; background: rgba(91, 79, 255, 0.1); color: #5B4FFF; borderRadius: 20px; border: 1px solid rgba(91, 79, 255, 0.2); display: inline-block; marginTop: 10px; }
                
                .effectiveness-module { textAlign: right; }
                .effectiveness-module .label { fontSize: 10px; color: #6b7280; marginBottom: 5px; }
                .effectiveness-module .score-display { fontSize: 64px; fontWeight: 900; color: #5B4FFF; lineHeight: 1; textShadow: 0 0 40px rgba(91, 79, 255, 0.2); }
                .export-btn { marginTop: 20px; padding: 12px 24px; background: #1a1a2e; color: #ffffff; border: none; borderRadius: 12px; fontWeight: 600; cursor: pointer; fontSize: 11px; boxShadow: 0 4px 24px rgba(0, 0, 0, 0.12); transition: 0.3s; }
                .export-btn:hover { background: #5B4FFF; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.25); }

                .kpi-grid { display: grid; gridTemplateColumns: repeat(3, 1fr); gap: 30px; marginBottom: 60px; }
                .kpi-card { padding: 40px; textAlign: center; background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .kpi-card h3 { fontSize: 11px; color: #6b7280; marginBottom: 15px; }
                .kpi-card p { fontSize: 42px; fontWeight: 900; margin: 0; color: #1a1a2e; }
                .kpi-card.highlight { border-color: #5B4FFF; background: rgba(91, 79, 255, 0.05); }

                .feed-title { fontSize: 14px; color: #1a1a2e; marginBottom: 30px; letterSpacing: 4px; }
                .candidate-grid { display: grid; gridTemplateColumns: repeat(auto-fill, minmax(500px, 1fr)); gap: 30px; }
                .candidate-card { padding: 40px; position: relative; overflow: hidden; transition: 0.4s; background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .candidate-card:hover { transform: translateY(-8px); border-color: #5B4FFF !important; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); }

                .violation-tag { position: absolute; top: 0; right: 0; background: #ef4444; color: #ffffff; padding: 8px 20px; borderRadius: 0 24px 0 24px; fontSize: 9px; fontWeight: 900; boxShadow: 0 4px 12px rgba(239, 68, 68, 0.25); }
                .card-header { display: flex; justify-content: space-between; alignItems: center; marginBottom: 30px; }
                .student-name { margin: 0 0 5px 0; fontSize: 28px; fontWeight: 800; color: #1a1a2e; }
                .timestamp { fontSize: 10px; color: #6b7280; }
                .grade-display { textAlign: right; }
                .grade-display .percent { fontSize: 42px; fontWeight: 900; color: #1a1a2e; }
                .grade-display .pts { fontSize: 11px; color: #6b7280; }

                .details-module summary { color: #5B4FFF; fontWeight: 900; fontSize: 11px; cursor: pointer; padding: 15px 0; borderTop: 1px solid #e5e7eb; outline: none; }
                .feedback-container { marginTop: 25px; display: flex; flexDirection: column; gap: 20px; }
                .feedback-item { padding: 20px; background: #ffffff; border-radius: 15px; border-left: 4px solid; border: 1px solid rgba(255, 255, 255, 0.08); }
                .feedback-item .q-text { fontSize: 14px; fontWeight: 700; margin: 0 0 10px 0; color: #1a1a2e; }
                .feedback-item .a-text { fontSize: 13px; color: #6b7280; fontStyle: italic; margin: 0 0 15px 0; lineHeight: 1.6; }
                .ai-note { padding: 12px; background: rgba(91, 79, 255, 0.05); borderRadius: 8px; fontSize: 12px; color: #1a1a2e; border: 1px solid rgba(91, 79, 255, 0.1); }

                .pulse { animation: pulseHUD 2s infinite; }
                @keyframes pulseHUD { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #6b7280; borderRadius: 10px; }
            `}</style>
        </div>
    );
};

export default QuizAnalytics;