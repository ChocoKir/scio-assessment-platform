import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import html2pdf from 'html2pdf.js';

const Analytics = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notify, setNotify] = useState({ message: '', type: '' });
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('EduX_user');
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

    const toggleDetails = (subId) => {
        setExpandedId(expandedId === subId ? null : subId);
    };

    const handlePurgeAll = async () => {
        if (!window.confirm("Delete all student results for this assessment?")) return;
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

    const exportPDF = (subId, studentName) => {
        setNotify({ message: 'Generating report...', type: 'info' });
        const element = document.getElementById(`report-${subId}`);
        const buttons = element.querySelectorAll('button');
        buttons.forEach(btn => btn.style.display = 'none');

        const opt = {
            margin: 0.5,
            filename: `EduX_Report_${studentName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            buttons.forEach(btn => btn.style.display = 'block');
            setNotify({ message: 'Report saved successfully.', type: 'success' });
        });
    };

    if (loading) return <div className="loader-root"><h1>LOADING_ANALYTICS...</h1></div>;

    const averageScore = submissions.length > 0
        ? (submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length).toFixed(1)
        : 0;

    return (
        <div className="EduX-root">
            <div className="analytics-container">
                
                {/* TOP HEADER */}
                <header className="intel-header">
                    <div className="header-left">
                        <button onClick={() => navigate('/dashboard')} className="back-link ">← RETURN_TO_DASHBOARD</button>
                        <div className="section-tag">SECTION: PERFORMANCE_ANALYTICS</div>
                        <h1 className="main-title">Assessment<span>Intel.</span></h1>
                        <p className="id-tag">ID: {quizId?.toUpperCase()}</p>
                    </div>

                    <div className="header-right">
                        <div className="avg-card">
                            <label>CLASS_AVERAGE</label>
                            <div className="avg-value" style={{ color: averageScore >= 70 ? '#10b981' : '#ef4444' }}>
                                {averageScore}%
                            </div>
                        </div>
                        <button className="danger-action" onClick={handlePurgeAll}>PURGE_ALL_DATA</button>
                    </div>
                </header>

                {/* KPI STRIP */}
                <div className="kpi-strip">
                    <div className="kpi-item">
                        <label>TOTAL_CANDIDATES</label>
                        <div className="val">{submissions.length}</div>
                    </div>
                    <div className="kpi-item">
                        <label>AI_ENGINE</label>
                        <div className="val">YOLO_V8_PRO</div>
                    </div>
                    <div className="kpi-item">
                        <label>SECURITY_LEVEL</label>
                        <div className="val">AES_256_ACTIVE</div>
                    </div>
                </div>

                <h2 className="grid-label">STUDENT_SUBMISSIONS</h2>

                {/* CANDIDATE LIST */}
                <div className="candidate-list">
                    {submissions.length === 0 ? (
                        <div className="empty-state">NO_SUBMISSIONS_DETECTED</div>
                    ) : (
                        submissions.map((sub) => {
                            const hasIssues = Boolean(
                                sub.integrity_status === 'BREACH_DETECTED' ||
                                sub.security_violations > 0 ||
                                sub.tabSwitches > 0 ||
                                sub.phoneDetected ||
                                sub.multipleFacesDetected ||
                                sub.faceMissingDetected
                            );

                            return (
                                <div key={sub._id} id={`report-${sub._id}`} className={`candidate-card ${hasIssues ? 'has-breach' : ''}`}>
                                    
                                    <div className="card-top">
                                        <div className="student-info">
                                            <h3>{sub.studentName}</h3>
                                            <span className="timestamp">SYNCED: {new Date(sub.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="score-badge">
                                            <div className="percent" style={{ color: sub.percentage >= 70 ? '#10b981' : '#ef4444' }}>{sub.percentage}%</div>
                                            <div className="pts">{sub.final_score} / {sub.total_possible} PTS</div>
                                        </div>
                                    </div>

                                    <div className="security-ribbon">
                                        <div className="status-indicator">
                                            {hasIssues ? (
                                                <span className="text-red">● BREACH_DETECTED</span>
                                            ) : (
                                                <span className="text-green">● INTEGRITY_VERIFIED</span>
                                            )}
                                        </div>
                                        <div className="breach-badges">
                                            {sub.phoneDetected && <span className="b-tag red">PHONE</span>}
                                            {sub.multipleFacesDetected && <span className="b-tag orange">MULTI_FACE</span>}
                                            {sub.tabSwitches > 0 && <span className="b-tag gray">TABS: {sub.tabSwitches}</span>}
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <button onClick={() => toggleDetails(sub._id)} className="secondary-btn">
                                            {expandedId === sub._id ? 'HIDE_ANALYSIS' : 'VIEW_ANALYSIS'}
                                        </button>
                                        {expandedId === sub._id && (
                                            <button onClick={() => exportPDF(sub._id, sub.studentName)} className="primary-btn">
                                                GENERATE_PDF_REPORT
                                            </button>
                                        )}
                                    </div>

                                    {expandedId === sub._id && (
                                        <div className="analysis-pane">
                                            <label className="pane-label">AI_FEEDBACK_LOG</label>
                                            {sub.detailed_results?.map((res, i) => (
                                                <div key={i} className="feedback-row">
                                                    <div className="q-header">
                                                        <strong>Q{i+1}: {res.question}</strong>
                                                        <span className="marks">{res.awarded_marks}/{res.possible_marks}</span>
                                                    </div>
                                                    <p className="student-ans">"{res.student_answer || "NO_RESPONSE"}"</p>
                                                    <div className="ai-box">
                                                        <span className="ai-tag">AI_INSIGHT:</span> {res.ai_feedback}
                                                    </div>
                                                </div>
                                            ))}
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
                .EduX-root {
                    min-height: 100vh;
                    background-color: #fafafa;
                    background-image: 
                        linear-gradient(#f0f0f0 1px, transparent 1px),
                        linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
                    background-size: 40px 40px;
                    padding: 60px 20px;
                    font-family: 'Inter', sans-serif;
                }

                .analytics-container { max-width: 1100px; margin: 0 auto; }

                /* HEADER SECTION */
                .intel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
                .back-link { background: none; border: none; color: #5B4FFF; font-weight: 700; font-size: 11px; cursor: pointer; margin-bottom: 20px; padding: 0; }
                .section-tag { font-size: 11px; font-weight: 800; color: #5B4FFF; border-left: 3px solid #5B4FFF; padding-left: 12px; margin-bottom: 10px; }
                .main-title { font-size: 48px; font-weight: 800; color: #1a1a2e; margin: 0; letter-spacing: -1.5px; }
                .main-title span { color: #5B4FFF; }
                .id-tag { font-size: 12px; color: #9ca3af; font-family: monospace; margin-top: 5px; }

                .header-right { text-align: right; display: flex; flex-direction: column; gap: 15px; }
                .avg-card { background: white; padding: 20px 30px; border: 1px solid #e5e7eb; border-radius: 4px; }
                .avg-card label { font-size: 10px; font-weight: 800; color: #9ca3af; display: block; margin-bottom: 5px; }
                .avg-value { font-size: 42px; font-weight: 800; line-height: 1; }
                .danger-action { background: none; border: 1px solid #ef4444; color: #ef4444; padding: 8px 16px; font-size: 10px; font-weight: 700; cursor: pointer; border-radius: 4px; }
                .danger-action:hover { background: #ef4444; color: white; }

                /* KPI STRIP */
                .kpi-strip { display: flex; gap: 40px; background: #1a1a2e; color: white; padding: 30px; border-radius: 4px; margin-bottom: 50px; }
                .kpi-item label { font-size: 10px; font-weight: 700; color: #6b7280; display: block; margin-bottom: 5px; }
                .kpi-item .val { font-size: 18px; font-weight: 700; letter-spacing: 1px; }

                /* CANDIDATE CARDS */
                .grid-label { font-size: 13px; font-weight: 800; color: #1a1a2e; margin-bottom: 20px; border-bottom: 2px solid #1a1a2e; padding-bottom: 10px; }
                .candidate-list { display: flex; flex-direction: column; gap: 20px; }
                .candidate-card { background: white; border: 1px solid #e5e7eb; padding: 35px; border-radius: 4px; transition: 0.2s; }
                .candidate-card.has-breach { border-left: 6px solid #ef4444; }
                
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
                .student-info h3 { font-size: 24px; margin: 0; font-weight: 800; color: #1a1a2e; }
                .timestamp { font-size: 12px; color: #9ca3af; }
                .score-badge { text-align: right; }
                .score-badge .percent { font-size: 32px; font-weight: 800; line-height: 1; }
                .score-badge .pts { font-size: 12px; font-weight: 700; color: #6b7280; margin-top: 5px; }

                .security-ribbon { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 12px 20px; border-radius: 4px; margin-bottom: 25px; }
                .status-indicator { font-size: 11px; font-weight: 800; }
                .text-red { color: #ef4444; } .text-green { color: #10b981; }
                .breach-badges { display: flex; gap: 8px; }
                .b-tag { font-size: 9px; font-weight: 800; padding: 4px 8px; border-radius: 3px; }
                .b-tag.red { background: #fee2e2; color: #ef4444; }
                .b-tag.orange { background: #ffedd5; color: #f59e0b; }
                .b-tag.gray { background: #f3f4f6; color: #6b7280; }

                .card-footer { display: flex; gap: 15px; }
                .primary-btn { background: #5B4FFF; color: white; border: none; padding: 12px 24px; font-size: 11px; font-weight: 700; cursor: pointer; border-radius: 4px; }
                .secondary-btn { background: white; border: 1px solid #e5e7eb; color: #1a1a2e; padding: 12px 24px; font-size: 11px; font-weight: 700; cursor: pointer; border-radius: 4px; }
                .secondary-btn:hover { border-color: #5B4FFF; }

                /* ANALYSIS PANE */
                .analysis-pane { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 30px; }
                .pane-label { font-size: 10px; font-weight: 800; color: #5B4FFF; margin-bottom: 20px; display: block; }
                .feedback-row { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px dashed #f0f0f0; }
                .q-header { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: #1a1a2e; }
                .student-ans { font-style: italic; color: #6b7280; font-size: 14px; margin-bottom: 15px; background: #fdfdfd; padding: 10px; border-left: 2px solid #e5e7eb; }
                .ai-box { font-size: 14px; color: #374151; line-height: 1.6; }
                .ai-tag { font-weight: 800; color: #5B4FFF; font-size: 11px; margin-right: 5px; }
                .marks { font-weight: 800; color: #10b981; }

                .empty-state { text-align: center; padding: 100px; color: #9ca3af; font-weight: 800; font-size: 20px; }
                .loader-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafafa; }
            `}</style>
        </div>
    );
};

export default Analytics;