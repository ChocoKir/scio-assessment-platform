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

    // 1. 🛰️ DATA UPLINK
    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');
        if (!storedUser || JSON.parse(storedUser).role !== 'teacher') {
            setNotify({ message: 'ACCESS_DENIED: Teacher clearance required.', type: 'error' });
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
                    setNotify({ message: 'DATA_FAILURE: Mission logs missing.', type: 'error' });
                }
            } catch (error) {
                setNotify({ message: 'LINK_FAILURE: Core unreachable.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [quizId, navigate]);

    // 2. ⚔️ TACTICAL HANDLERS
    const toggleDetails = (subId) => {
        setExpandedId(expandedId === subId ? null : subId);
        if (expandedId !== subId) {
            setNotify({ message: 'DECRYPTING: Neural data stream active.', type: 'info' });
        }
    };

    // ➲ UPGRADE: Purge All Mission Logs
    const handlePurgeAll = async () => {
        if (!window.confirm("➲ CRITICAL: Wipe all candidate logs for this mission? (Quiz will remain)")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/submissions/quiz/${quizId}`, { method: 'DELETE' });
            if (response.ok) {
                setSubmissions([]);
                setNotify({ message: 'ARCHIVE_CLEARED: All logs purged.', type: 'success' });
            }
        } catch (e) {
            setNotify({ message: 'PURGE_ERROR: System rejected request.', type: 'error' });
        }
    };

    // ➲ UPGRADE: PDF GENERATOR ENGINE
    const exportPDF = (subId, studentName) => {
        setNotify({ message: 'GENERATING_REPORT: Compiling PDF...', type: 'info' });
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
            setNotify({ message: 'REPORT_EXPORTED: Saved to local drive.', type: 'success' });
        });
    };

    if (loading) return <div className="loader-root orbitron"><div className="pulse">RETRIEVING_MISSION_INTEL...</div></div>;

    const averageScore = submissions.length > 0
        ? (submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length).toFixed(1)
        : 0;

    return (
        <div className="analytics-root">
            <div className="scanline"></div>

            <div className="analytics-container">
                {/* --- HUD HEADER --- */}
                <header className="intel-header">
                    <div className="header-left">
                        <button onClick={() => navigate('/dashboard')} className="back-btn orbitron">← COMMAND_HUB</button>
                        <h1 className="orbitron main-title">MISSION_<span className="accent">ANALYTICS</span></h1>
                        <p className="id-tag">EXAM_ID: {quizId?.toUpperCase()}</p>
                    </div>

                    <div className="header-right">
                        <div className="avg-box glass-panel">
                            <div className="label orbitron">CLASS_AVERAGE</div>
                            <div className="score orbitron" style={{ color: averageScore >= 70 ? '#00ffa3' : '#ff4d4d' }}>{averageScore}%</div>
                        </div>
                        <button className="purge-all-btn orbitron" onClick={handlePurgeAll}>PURGE_ARCHIVE</button>
                    </div>
                </header>

                {/* --- KPI MODULE --- */}
                <div className="kpi-grid">
                    {[
                        { label: 'CANDIDATES', val: submissions.length },
                        { label: 'AI_STABILITY', val: 'NOMINAL', highlight: true },
                        { label: 'VISION', val: 'YOLO_V8S' },
                        { label: 'ENCRYPTION', val: 'AES_256' }
                    ].map((kpi, i) => (
                        <div key={i} className={`kpi-card glass-panel ${kpi.highlight ? 'active-kpi' : ''}`}>
                            <small className="orbitron">{kpi.label}</small>
                            <div className="val">{kpi.val}</div>
                        </div>
                    ))}
                </div>

                <h2 className="section-label orbitron">➲ CANDIDATE_ACTIVITY_LOGS</h2>

                <div className="candidate-grid">
                    {submissions.length === 0 ? (
                        <div className="empty-state glass-panel orbitron">NO_DATA_ARCHIVED_IN_CORE</div>
                    ) : (
                        submissions.map((sub) => {
                            const hasBreach = sub.tabSwitches > 0 || sub.phoneDetected || sub.multipleFacesDetected || sub.faceMissingDetected;

                            return (
                                // ➲ THE PDF TARGET ID
                                <div key={sub._id} id={`report-${sub._id}`} className={`candidate-card glass-panel ${expandedId === sub._id ? 'expanded' : ''} ${hasBreach ? 'breach-border' : ''}`}>

                                    <div className="badge-container">
                                        {sub.phoneDetected && <span className="v-badge critical orbitron">⚠️ PHONE_DET</span>}
                                        {sub.multipleFacesDetected && <span className="v-badge warning orbitron">⚠️ MULTI_SUBJ</span>}
                                        {sub.faceMissingDetected && <span className="v-badge warning orbitron">⚠️ MISSING</span>}
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
                                            INTEGRITY: {hasBreach ? <span className="fail-text">🔴_COMPROMISED</span> : <span className="pass-text">🟢_SECURE</span>}
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button onClick={() => toggleDetails(sub._id)} className={`details-btn orbitron ${expandedId === sub._id ? 'active' : ''}`}>
                                                {expandedId === sub._id ? 'HIDE_INTEL' : 'DECRYPT_LOGS'}
                                            </button>

                                            {/* ➲ PDF EXPORT BUTTON */}
                                            {expandedId === sub._id && (
                                                <button onClick={() => exportPDF(sub._id, sub.studentName)} className="pdf-btn orbitron">
                                                    📥 EXPORT_PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {expandedId === sub._id && (
                                        <div className="detailed-intel-pane">
                                            <div className="pane-header orbitron">➲ NEURAL_DEBRIEF_STREAM:</div>
                                            <div className="feedback-list">
                                                {sub.detailed_results?.map((res, i) => (
                                                    <div key={i} className="feedback-item" style={{ borderLeftColor: res.awarded_marks > (res.possible_marks / 2) ? '#00ffa3' : '#ff4d4d' }}>
                                                        <p className="q-text mono"><strong>UNIT_{i+1}:</strong> {res.question}</p>
                                                        <p className="s-answer italic">"{res.student_answer || "NULL_INPUT"}"</p>
                                                        <div className="ai-eval">
                                                            <span className="orbitron label">AI_ANALYSIS:</span> {res.ai_feedback}
                                                            <div className="marks-pill orbitron">MARKS: {res.awarded_marks} / {res.possible_marks}</div>
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
                .analytics-root { min-height: 100vh; background: #020202; color: #fff; padding: 60px; font-family: 'Inter', sans-serif; position: relative; overflow-x: hidden; }
                .analytics-container { maxWidth: 1300px; margin: 0 auto; z-index: 10; position: relative; }
                
                .intel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; }
                .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 20px; }
                .main-title { font-size: 42px; margin: 0; letter-spacing: 4px; }
                .accent { color: #00d2ff; }
                .id-tag { color: #444; font-size: 11px; margin-top: 10px; font-family: monospace; letter-spacing: 2px; }
                
                .back-btn { background: rgba(255,255,255,0.02); border: 1px solid #222; color: #00d2ff; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 11px; transition: 0.3s; margin-bottom: 20px; }
                .back-btn:hover { background: #00d2ff; color: #000; box-shadow: 0 0 20px rgba(0,210,255,0.4); }
                
                .purge-all-btn { background: transparent; border: 1px solid #ff4d4d; color: #ff4d4d; padding: 10px 20px; border-radius: 8px; font-size: 10px; cursor: pointer; transition: 0.3s; }
                .purge-all-btn:hover { background: #ff4d4d; color: #000; box-shadow: 0 0 15px rgba(255, 77, 77, 0.4); }

                .avg-box { padding: 25px 40px; text-align: right; border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 15px; background: rgba(10,10,10,0.8); backdrop-filter: blur(20px); }
                .avg-box .score { font-size: 56px; font-weight: 900; line-height: 1; margin-top: 5px; }
                .label { font-size: 10px; color: #555; letter-spacing: 2px; }

                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 60px; }
                .glass-panel { background: rgba(10, 10, 10, 0.85); border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 20px; backdrop-filter: blur(20px); }
                .kpi-card { padding: 25px; text-align: center; border-radius: 20px; }
                .active-kpi { border-color: #00ffa355; background: rgba(0, 255, 163, 0.05); }

                .section-label { margin-bottom: 30px; border-bottom: 1px solid #111; padding-bottom: 15px; color: #444; font-size: 14px; }
                .candidate-grid { display: grid; grid-template-columns: 1fr; gap: 25px; }
                .candidate-card { padding: 40px; transition: 0.4s; position: relative; border-radius: 25px; }
                .candidate-card.expanded { border-color: #00d2ff55; background: rgba(0, 210, 255, 0.02); }
                .breach-border { border-color: rgba(255, 77, 77, 0.3) !important; }
                
                .badge-container { display: flex; gap: 10px; margin-bottom: 20px; }
                .v-badge { font-size: 9px; padding: 6px 12px; border-radius: 5px; font-weight: 900; letter-spacing: 1px; }
                .v-badge.critical { background: #ff4d4d; color: #000; }
                .v-badge.warning { background: #ffc107; color: #000; }
                .v-badge.info { background: #111; color: #00d2ff; border: 1px solid #00d2ff33; }

                .card-main-info { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #111; padding-bottom: 25px; margin-bottom: 25px; }
                .candidate-name { font-size: 30px; margin: 0; font-weight: 800; color: #eee; }
                .sync-date { color: #444; font-size: 10px; margin-top: 8px; }
                .candidate-score { font-size: 48px; font-weight: 900; }
                .pts-label { text-align: right; font-size: 12px; color: #555; }

                .card-actions { display: flex; justify-content: space-between; align-items: center; }
                .fail-text { color: #ff4d4d; } .pass-text { color: #00ffa3; }
                
                .details-btn { padding: 12px 25px; background: transparent; border: 1px solid #333; color: #888; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 11px; }
                .details-btn:hover { border-color: #00d2ff; color: #fff; }
                .details-btn.active { background: #333; color: #fff; }
                
                .pdf-btn { padding: 12px 25px; background: #00ffa3; color: #000; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 11px; }
                .pdf-btn:hover { box-shadow: 0 0 15px rgba(0,255,163,0.5); transform: translateY(-2px); }

                .detailed-intel-pane { margin-top: 40px; padding-top: 40px; border-top: 1px dashed #222; animation: slideUp 0.4s ease-out; }
                .pane-header { color: #00d2ff; font-size: 11px; margin-bottom: 30px; letter-spacing: 3px; }
                .feedback-item { padding: 25px; background: rgba(255,255,255,0.02); border-radius: 18px; margin-bottom: 20px; border-left: 4px solid; }
                .q-text { font-size: 15px; margin-bottom: 10px; color: #ccc; }
                .s-answer { color: #888; margin-bottom: 20px; font-size: 14px; }
                .ai-eval { padding: 18px; background: rgba(0,0,0,0.4); border-radius: 12px; font-size: 14px; position: relative; border: 1px solid #111; color: #999; }
                .ai-eval .label { color: #00d2ff; margin-right: 10px; }
                .marks-pill { position: absolute; top: -12px; right: 20px; background: #0a0a0a; padding: 6px 16px; border-radius: 20px; font-size: 10px; border: 1px solid #222; }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .loader-root { background: #000; height: 100vh; display: flex; justifyContent: center; alignItems: center; color: #00d2ff; font-size: 14px; letter-spacing: 4px; }
                .pulse { animation: pulseHUD 2s infinite; }
                @keyframes pulseHUD { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 100; }
                .orbitron { font-family: 'Orbitron', sans-serif; }
                .mono { font-family: 'JetBrains Mono', monospace; }
                .italic { font-style: italic; }
            `}</style>
        </div>
    );
};

export default Analytics;