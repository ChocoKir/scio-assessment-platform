import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import html2pdf from 'html2pdf.js'; // ➲ IMPORTED PDF ENGINE

const Analytics = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    // --- STATE CORE ---
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notify, setNotify] = useState({ message: '', type: '' });
    const [expandedId, setExpandedId] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');
        if (!storedUser || JSON.parse(storedUser).role !== 'teacher') {
            setNotify({ message: 'Access denied. Teacher access required.', type: 'error' });
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
        }

        const fetchAnalytics = async () => {
            if (!quizId) return;
            try {
                const response = await fetch(`http://localhost:5000/api/submissions/quiz/${quizId.trim()}`);
                const data = await response.json();
                if (response.ok) {
                    setSubmissions(data);
                } else {
                    setNotify({ message: 'Could not load data. Please try again.', type: 'error' });
                }
            } catch (error) {
                setNotify({ message: 'Connection error. Please try again.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [quizId, navigate]);

    // --- HANDLERS ---
    const toggleDetails = (subId) => {
        setExpandedId(expandedId === subId ? null : subId);
        if (expandedId !== subId) {
            setNotify({ message: 'Loading results...', type: 'info' });
        }
    };

    // --- DELETE ALL RESULTS ---
    const handlePurgeAll = async () => {
        if (!window.confirm("Delete all student results for this assessment? (Assessment will remain)")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/submissions/quiz/${quizId}`, { method: 'DELETE' });
            if (response.ok) {
                setSubmissions([]);
                setNotify({ message: 'All results deleted successfully.', type: 'success' });
            }
        } catch (e) {
            setNotify({ message: 'Failed to delete results.', type: 'error' });
        }
    };

    // ➲ UPGRADE: PDF GENERATOR ENGINE
    const exportPDF = (subId, studentName) => {
        setNotify({ message: 'Generating report...', type: 'info' });
        const element = document.getElementById(`report-${subId}`);

        // Temporarily hide UI buttons during the print capture
        const buttons = element.querySelectorAll('button');
        buttons.forEach(btn => btn.style.display = 'none');

        const opt = {
            margin:       0.5,
            filename:     `SCIO_Intel_${studentName.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#050505' }, // Matches dark UI
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore UI buttons after generation
            buttons.forEach(btn => btn.style.display = 'block');
            setNotify({ message: 'Report saved successfully.', type: 'success' });
        });
    };

    if (loading) return <div className="loader-root orbitron"><div className="pulse">Loading...</div></div>;

    const averageScore = submissions.length > 0
        ? (submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length).toFixed(1)
        : 0;

    return (
        <div className="analytics-root">
            <div className="analytics-container">
                {/* --- HUD HEADER --- */}
                <header className="intel-header">
                    <div className="header-left">
                        <button onClick={() => navigate('/dashboard')} className="back-btn orbitron">← COMMAND_HUB</button>
                        <h1 className="orbitron main-title">ASSESSMENT_<span className="accent">ANALYTICS</span></h1>
                        <p className="id-tag">ASSESSMENT_ID: {quizId?.toUpperCase()}</p>
                    </div>

                    <div className="header-right">
                        <div className="avg-box glass-panel">
                            <div className="label orbitron">CLASS_AVERAGE</div>
                            <div className="score orbitron" style={{ color: averageScore >= 70 ? '#00ffa3' : '#ff4d4d' }}>{averageScore}%</div>
                        </div>
                        <button className="purge-all-btn orbitron" onClick={handlePurgeAll}>DELETE_ALL</button>
                    </div>
                </header>

                {/* --- KPI MODULE --- */}
                <div className="kpi-grid">
                    {[
                        { label: 'STUDENTS', val: submissions.length },
                        { label: 'SYSTEM_STATUS', val: 'NOMINAL', highlight: true },
                        { label: 'CAMERA', val: 'YOLO_V8' },
                        { label: 'SECURITY', val: 'AES_256' }
                    ].map((kpi, i) => (
                        <div key={i} className={`kpi-card glass-panel ${kpi.highlight ? 'active-kpi' : ''}`}>
                            <small className="orbitron">{kpi.label}</small>
                            <div className="val">{kpi.val}</div>
                        </div>
                    ))}
                </div>

                <h2 className="section-label orbitron">STUDENT_RESULTS</h2>

                <div className="candidate-grid">
                    {submissions.length === 0 ? (
                        <div className="empty-state glass-panel orbitron">No results found</div>
                    ) : (
                        submissions.map((sub) => {
                                    const hasIssues = sub.tabSwitches > 0 || sub.phoneDetected || sub.multipleFacesDetected || sub.faceMissingDetected;

                            return (
                                // THE PDF TARGET ID
                                <div key={sub._id} id={`report-${sub._id}`} className={`candidate-card glass-panel ${expandedId === sub._id ? 'expanded' : ''} ${hasIssues ? 'breach-border' : ''}`}>

                                    <div className="badge-container">
                                        {sub.phoneDetected && <span className="v-badge critical orbitron">⚠️ PHONE_DETECTED</span>}
                                        {sub.multipleFacesDetected && <span className="v-badge warning orbitron">⚠️ MULTIPLE_FACES</span>}
                                        {sub.faceMissingDetected && <span className="v-badge warning orbitron">⚠️ FACE_MISSING</span>}
                                        {sub.tabSwitches > 0 && <span className="v-badge info orbitron">TABS: {sub.tabSwitches}</span>}
                                    </div>

                                    <div className="card-main-info">
                                        <div>
                                            <h3 className="candidate-name">{sub.studentName}</h3>
                                            <div className="sync-date orbitron">SYNC: {new Date(sub.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className="score-block">
                                            <div className="candidate-score orbitron" style={{ color: sub.percentage >= 70 ? '#00ffa3' : '#ff4d4d' }}>{sub.percentage}%</div>
                                            <div className="pts-label mono">{sub.final_score} / {sub.total_possible} PTS</div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <div className="security-status orbitron">
                                            STATUS: {hasIssues ? <span className="fail-text">🔴 ISSUES_DETECTED</span> : <span className="pass-text">🟢 SECURE</span>}
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button onClick={() => toggleDetails(sub._id)} className={`details-btn orbitron ${expandedId === sub._id ? 'active' : ''}`}>
                                                {expandedId === sub._id ? 'HIDE_DETAILS' : 'VIEW_DETAILS'}
                                            </button>

                                            {/* PDF EXPORT BUTTON */}
                                            {expandedId === sub._id && (
                                                <button onClick={() => exportPDF(sub._id, sub.studentName)} className="pdf-btn orbitron">
                                                    📥 EXPORT_PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {expandedId === sub._id && (
                                        <div className="detailed-intel-pane">
                                            <div className="pane-header orbitron">AI_ANALYSIS:</div>
                                            <div className="feedback-list">
                                                {sub.detailed_results?.map((res, i) => (
                                                    <div key={i} className="feedback-item" style={{ borderLeftColor: res.awarded_marks > (res.possible_marks / 2) ? '#00ffa3' : '#ff4d4d' }}>
                                                        <p className="q-text mono"><strong>Question {i+1}:</strong> {res.question}</p>
                                                        <p className="s-answer italic">"{res.student_answer || "NO_ANSWER"}"</p>
                                                        <div className="ai-eval">
                                                            <span className="orbitron label">AI_ANALYSIS:</span> {res.ai_feedback}
                                                            <div className="marks-pill orbitron">SCORE: {res.awarded_marks} / {res.possible_marks}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />

            <style>{`
                .analytics-root { min-height: 100vh; background: #fafafa; color: #1a1a2e; padding: 40px; font-family: 'Inter', sans-serif; position: relative; overflow-x: hidden; }
                .analytics-container { max-width: 1400px; margin: 0 auto; z-index: 10; position: relative; }
                
                .intel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
                .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 20px; }
                .main-title { font-size: 42px; margin: 0; letter-spacing: 4px; color: #1a1a2e; }
                .accent { color: #5B4FFF; }
                .id-tag { color: #6b7280; font-size: 11px; margin-top: 10px; font-family: monospace; letter-spacing: 2px; }
                
                .back-btn { background: rgba(255,255,255,0.02); border: 1px solid #e5e7eb; color: #6b7280; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 11px; transition: 0.3s; margin-bottom: 20px; }
                .back-btn:hover { background: #5B4FFF; color: #ffffff; box-shadow: 0 4px 12px rgba(91, 79, 255, 0.25); }
                
                .purge-all-btn { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 10px 20px; border-radius: 8px; font-size: 10px; cursor: pointer; transition: 0.3s; }
                .purge-all-btn:hover { background: #ef4444; color: #ffffff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25); }

                .avg-box { padding: 25px 40px; text-align: right; border: 1px solid rgba(91, 79, 255, 0.2); border-radius: 15px; background: #ffffff; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .avg-box .score { font-size: 56px; font-weight: 900; line-height: 1; margin-top: 5px; color: #1a1a2e; }
                .label { font-size: 10px; color: #6b7280; letter-spacing: 2px; }

                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 60px; }
                .glass-panel { background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; backdrop-filter: none; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .kpi-card { padding: 25px; text-align: center; border-radius: 20px; }
                .active-kpi { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }

                .section-label { margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; color: #1a1a2e; font-size: 14px; }
                .candidate-grid { display: grid; grid-template-columns: 1fr; gap: 25px; }
                .candidate-card { padding: 40px; transition: 0.4s; position: relative; border-radius: 25px; background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.08); }
                .candidate-card.expanded { border-color: #5B4FFF; background: rgba(91, 79, 255, 0.02); }
                .breach-border { border-color: rgba(239, 68, 68, 0.3) !important; }
                
                .badge-container { display: flex; gap: 10px; margin-bottom: 20px; }
                .v-badge { font-size: 9px; padding: 6px 12px; border-radius: 5px; font-weight: 900; letter-spacing: 1px; }
                .v-badge.critical { background: #ef4444; color: #ffffff; }
                .v-badge.warning { background: #f59e0b; color: #1a1a2e; }
                .v-badge.info { background: #6b7280; color: #ffffff; }

                .card-main-info { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #111; padding-bottom: 25px; margin-bottom: 25px; }
                .candidate-name { font-size: 30px; margin: 0; font-weight: 800; color: #1a1a2e; }
                .sync-date { color: #6b7280; font-size: 10px; margin-top: 8px; }
                .candidate-score { font-size: 48px; font-weight: 900; color: #1a1a2e; }
                .pts-label { text-align: right; font-size: 12px; color: #6b7280; }

                .card-actions { display: flex; justify-content: space-between; align-items: center; }
                .fail-text { color: #ff4d4d; } .pass-text { color: #00ffa3; }
                
                .details-btn { padding: 12px 25px; background: transparent; border: 1px solid #e5e7eb; color: #6b7280; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 11px; }
                .details-btn:hover { border-color: #5B4FFF; color: #ffffff; }
                .details-btn.active { background: #5B4FFF; color: #ffffff; }
                
                .pdf-btn { padding: 12px 25px; background: #10b981; color: #ffffff; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 11px; }
                .pdf-btn:hover { box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25); transform: translateY(-2px); }

                .detailed-intel-pane { margin-top: 40px; padding-top: 40px; border-top: 1px dashed #222; animation: slideUp 0.4s ease-out; }
                .pane-header { color: #00d2ff; font-size: 11px; margin-bottom: 30px; letter-spacing: 3px; }
                .feedback-item { padding: 25px; background: rgba(255,255,255,0.02); border-radius: 18px; margin-bottom: 20px; border-left: 4px solid; }
                .q-text { font-size: 15px; margin-bottom: 10px; color: #ccc; }
                .s-answer { color: #888; margin-bottom: 20px; font-size: 14px; }
            `}</style>
        </div>
    );
};

export default Analytics;