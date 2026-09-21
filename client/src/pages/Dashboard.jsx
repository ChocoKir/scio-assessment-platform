import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const Dashboard = () => {
    // --- CORE STATE ARCHITECTURE (Unchanged) ---
    const [user, setUser] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [expandedExam, setExpandedExam] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [notify, setNotify] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    // --- AUTHENTICATION & DATA FETCHING (Unchanged) ---
    useEffect(() => {
        const storedUser = localStorage.getItem('EduX_user');

        if (!storedUser) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const fetchDataStream = async () => {
            try {
                let endpoint = '';
                if (parsedUser.role === 'teacher') {
                    endpoint = `http://localhost:5000/api/quizzes/teacher/${parsedUser._id}`;
                } else {
                    endpoint = `http://localhost:5000/api/submissions/student/${parsedUser.name}`;
                }

                const response = await fetch(endpoint);
                const data = await response.json();

                if (response.ok) {
                    if (parsedUser.role === 'teacher') {
                        setQuizzes(data);
                    } else {
                        setMySubmissions(data);
                    }
                } else {
                    setNotify({ message: 'Could not load data. Please try again.', type: 'error' });
                }
            } catch (error) {
                console.error("Authentication Error:", error);
                setNotify({ message: 'Connection error. Please try again.', type: 'error' });
            }
        };

        fetchDataStream();
    }, [navigate]);

    // --- SYSTEM HANDLERS (Unchanged) ---
    const handleLogout = () => {
        localStorage.removeItem('EduX_user');
        setNotify({ message: 'Logged out successfully. Goodbye!', type: 'info' });
        setTimeout(() => {
            navigate('/login');
        }, 1500);
    };

    const copyUplink = (quizId) => {
        const link = `${window.location.origin}/take-quiz/${quizId}`;
        navigator.clipboard.writeText(link);
        setNotify({ message: 'Share link copied to clipboard.', type: 'success' });
    };

    const toggleExpansion = (id) => {
        setExpandedExam(expandedExam === id ? null : id);
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment? This will remove all associated student data.")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setQuizzes(quizzes.filter(quiz => quiz._id !== id));
                setNotify({ message: 'Assessment deleted successfully.', type: 'success' });
            } else {
                setNotify({ message: 'Failed to delete assessment.', type: 'error' });
            }
        } catch (error) {
            setNotify({ message: 'Connection error. Please try again.', type: 'error' });
        }
    };

    // --- UPDATED STYLING MACRO FOR LIGHT THEME ---
    const sidebarItemStyle = (tabName) => {
        const isActive = activeTab === tabName;
        return {
            padding: '14px 20px',
            cursor: 'pointer',
            backgroundColor: isActive ? '#f1f5f9' : 'transparent',
            color: isActive ? '#5B4FFF' : '#64748b',
            borderRadius: '8px',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: isActive ? '600' : '500',
            fontFamily: "'Inter', sans-serif"
        };
    };

    if (!user) {
        return (
            <div className="EduX-loading">
                <div className="spinner"></div>
                <span className="mono">LOADING_WORKSPACE...</span>
            </div>
        );
    }

    return (
        <div className="EduX-dashboard-root">
            {/* CLEAN SAAS SIDEBAR */}
            <aside className="EduX-sidebar">
                <div className="sidebar-brand">
                    <h1 className="brand-title">
                        <span className="text-dark">EduX</span>
                        {/* <span className="text-blue italic">AI</span> */}
                    </h1>
                    <div className="badge mono">OS_V3_ULTRA</div>
                </div>

                <nav className="sidebar-nav">
                    <div onClick={() => setActiveTab('home')} style={sidebarItemStyle('home')}>
                        <span className="nav-icon">⌂</span> OVERVIEW
                    </div>

                    {user.role === 'teacher' ? (
                        <>
                            <div onClick={() => navigate('/create-quiz')} style={{ ...sidebarItemStyle('create'), color: '#10b981' }}>
                                <span className="nav-icon">+</span> NEW ASSESSMENT
                            </div>
                            <div onClick={() => setActiveTab('reports')} style={sidebarItemStyle('reports')}>
                                 RESULTS DATA
                            </div>
                        </>
                    ) : (
                        <div onClick={() => setActiveTab('reports')} style={sidebarItemStyle('reports')}>
                            MY RECORDS
                        </div>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">{user.name.charAt(0)}</div>
                        <div className="user-info">
                            <div className="user-name">{user.name.split(' ')[0]}</div>
                            <div className="user-role mono">{user.role.toUpperCase()}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout mono">
                        TERMINATE_SESSION
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="EduX-main-content">
                <header className="main-header">
                    <div>
                        <h2 className="greeting-title">
                            Welcome back, <span className="text-blue">{user.name}</span>
                        </h2>
                        <p className="greeting-sub">Manage your assessments and view analytics.</p>
                    </div>
                    <div className="status-indicators mono">
                        <div className="status-pill"><span className="dot"></span> SYSTEM: NOMINAL</div>
                        <div className="status-pill active-ai">AI_CORE: ONLINE</div>
                    </div>
                </header>

                <div className="content-scroll-area">
                    {/* --- TAB: HOME (Teacher View) --- */}
                    {user.role === 'teacher' && activeTab === 'home' && (
                        <div className="grid-layout">
                            {quizzes.length === 0 ? (
                                <div className="empty-state">No assessments active. Create one to begin.</div>
                            ) : (
                                quizzes.map((quiz) => (
                                    <div key={quiz._id} className="saas-card">
                                        <div className="card-header">
                                            <span className="badge mono">ID: {quiz._id.slice(-6).toUpperCase()}</span>
                                            <button className="btn-icon-danger" onClick={() => handleDeleteQuiz(quiz._id)} title="Delete">
                                                ✕
                                            </button>
                                        </div>
                                        <h3 className="card-title">{quiz.title}</h3>
                                        <p className="card-meta">{quiz.topic} • {quiz.questions.length} Questions</p>
                                        
                                        <div className="card-actions">
                                            <button className="btn-primary" onClick={() => navigate(`/analytics/${quiz._id}`)}>
                                                VIEW RESULTS
                                            </button>
                                            <button className="btn-secondary" onClick={() => copyUplink(quiz._id)} title="Copy Link">
                                                🔗
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* --- TAB: HOME (Student View) --- */}
                    {user.role === 'student' && activeTab === 'home' && (
                        <div className="portal-container">
                            <div className="saas-card portal-card">
                               
                                <h2 className="portal-title">Join Assessment</h2>
                                <p className="portal-desc">Enter your instructor's session code to begin.</p>
                                
                                <input
                                    type="text"
                                    placeholder="e.g. 64a7f9b2"
                                    className="clean-input mono"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                                
                                <button className="btn-primary w-full" onClick={() => {
                                    if (!joinCode) {
                                        setNotify({ message: 'Session code is required.', type: 'error' });
                                        return;
                                    }
                                    navigate(`/take-quiz/${joinCode.split('/').pop()}`);
                                }}>
                                    CONNECT TO SESSION
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: REPORTS / RECORDS --- */}
                    {activeTab === 'reports' && (
                        <div className="reports-container">
                            <h3 className="section-title">Assessment Analytics</h3>
                            
                            {mySubmissions.length === 0 && quizzes.length === 0 ? (
                                <div className="empty-state">No records found in database.</div>
                            ) : (
                                mySubmissions.map((sub) => (
                                    <div key={sub._id} className={`report-accordion ${expandedExam === sub._id ? 'expanded' : ''}`}>
                                        <div className="report-header" onClick={() => toggleExpansion(sub._id)}>
                                            <div className="report-info">
                                                <div className={`score-circle mono ${sub.percentage >= 70 ? 'score-pass' : 'score-fail'}`}>
                                                    {sub.percentage}%
                                                </div>
                                                <div>
                                                    <h4 className="report-title">{sub.quizId?.title || "Assessment Result"}</h4>
                                                    <div className="report-date mono">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="report-status">
                                                <div className={`status-badge mono ${sub.tabSwitches > 0 ? 'badge-warn' : 'badge-good'}`}>
                                                    {sub.tabSwitches > 0 ? `FLAGS: ${sub.tabSwitches}` : 'CLEAN SESSION'}
                                                </div>
                                                <span className="expand-icon">{expandedExam === sub._id ? '▲' : '▼'}</span>
                                            </div>
                                        </div>

                                        {expandedExam === sub._id && (
                                            <div className="report-body">
                                                <h5 className="mono text-blue mb-4">AI_HEURISTIC_ANALYSIS</h5>
                                                {sub.detailed_results?.map((res, i) => (
                                                    <div key={i} className="feedback-item">
                                                        <p className="fb-question"><strong>Q{i+1}:</strong> {res.question}</p>
                                                        <p className="fb-analysis"><strong>Analysis:</strong> {res.ai_feedback}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            <style>{`
                /* --- EduX DASHBOARD LIGHT SAAS CSS --- */
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,900;1,800;1,900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

                .EduX-dashboard-root {
                    display: flex; width: 100vw; height: 100vh;
                    background-color: #f8fafc; color: #0f172a;
                    font-family: 'Inter', sans-serif; overflow: hidden;
                }

                .mono { font-family: 'JetBrains Mono', monospace; }
                .text-blue { color: #5B4FFF; }
                .text-dark { color: #0f172a; font-weight: 900; }
                .italic { font-style: italic; font-weight: 900; }

                /* LOADING STATE */
                .EduX-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; background: #f8fafc; color: #5B4FFF; }
                .spinner { width: 40px; height: 40px; border: 3px solid rgba(91, 79, 255, 0.2); border-top-color: #5B4FFF; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* SIDEBAR */
                .EduX-sidebar {
                    width: 280px; background: #ffffff; border-right: 1px solid #e2e8f0;
                    display: flex; flex-direction: column; padding: 30px 20px; z-index: 10;
                }
                .sidebar-brand { margin-bottom: 40px; padding: 0 10px; }
                .brand-title { font-family: 'Montserrat', sans-serif; font-size: 28px; letter-spacing: -1px; margin: 0 0 5px 0; }
                .badge { display: inline-block; background: #f1f5f9; color: #64748b; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; }
                
                .sidebar-nav { flex: 1; }
                .nav-icon { width: 24px; display: inline-block; text-align: center; }

                .sidebar-footer { border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 0 10px; }
                .avatar { width: 40px; height: 40px; background: #e0e7ff; color: #5B4FFF; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-weight: 700; font-size: 16px; }
                .user-name { font-weight: 600; font-size: 14px; color: #0f172a; }
                .user-role { font-size: 10px; color: #64748b; font-weight: 700; }
                
                .btn-logout {
                    width: 100%; background: transparent; border: 1px solid #fee2e2; color: #ef4444;
                    padding: 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;
                }
                .btn-logout:hover { background: #fee2e2; }

                /* MAIN CONTENT */
                .EduX-main-content { flex: 1; display: flex; flex-direction: column; background-image: radial-gradient(#e2e8f0 1px, transparent 1px); background-size: 32px 32px; }
                
                .main-header { display: flex; justify-content: space-between; align-items: flex-end; padding: 40px 60px; background: linear-gradient(to bottom, #f8fafc, transparent); }
                .greeting-title { font-family: 'Montserrat', sans-serif; font-size: 32px; margin: 0 0 8px 0; letter-spacing: -1px; }
                .greeting-sub { color: #64748b; margin: 0; font-size: 15px; }
                
                .status-indicators { display: flex; gap: 12px; }
                .status-pill { background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }
                .active-ai { border-color: #c7d2fe; color: #5B4FFF; background: #e0e7ff; }

                .content-scroll-area { flex: 1; overflow-y: auto; padding: 0 60px 60px 60px; }

                /* CARDS & GRIDS */
                .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
                .saas-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: 0.3s ease; }
                .saas-card:hover { border-color: #5B4FFF; box-shadow: 0 10px 15px -3px rgba(91, 79, 255, 0.1); transform: translateY(-3px); }
                
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .btn-icon-danger { background: none; border: none; color: #cbd5e1; font-size: 16px; cursor: pointer; transition: 0.2s; }
                .btn-icon-danger:hover { color: #ef4444; }
                
                .card-title { font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: #0f172a; }
                .card-meta { color: #64748b; font-size: 14px; margin-bottom: 30px; }
                
                .card-actions { display: flex; gap: 12px; }
                .btn-primary { flex: 1; background: #5B4FFF; color: #ffffff; border: none; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { background: #4a3ee0; }
                .btn-secondary { background: #ffffff; border: 1px solid #cbd5e1; color: #475569; padding: 0 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 16px; }
                .btn-secondary:hover { border-color: #5B4FFF; color: #5B4FFF; }
                .w-full { width: 100%; }

                /* STUDENT PORTAL */
                .portal-container { display: flex; justify-content: center; align-items: center; height: 60vh; }
                .portal-card { max-width: 450px; width: 100%; text-align: center; padding: 50px 40px; }
                .portal-icon { font-size: 40px; margin-bottom: 20px; }
                .portal-title { font-size: 24px; font-weight: 700; margin: 0 0 10px 0; }
                .portal-desc { color: #64748b; margin-bottom: 30px; font-size: 14px; }
                .clean-input { width: 100%; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 18px; text-align: center; margin-bottom: 24px; color: #0f172a; outline: none; transition: 0.2s; }
                .clean-input:focus { border-color: #5B4FFF; background: #ffffff; box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1); }

                /* REPORTS / ACCORDION */
                .reports-container { max-width: 900px; margin: 0 auto; }
                .section-title { font-family: 'Montserrat', sans-serif; font-size: 24px; margin-bottom: 30px; }
                
                .report-accordion { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; transition: 0.2s; }
                .report-accordion:hover { border-color: #cbd5e1; }
                .report-accordion.expanded { border-color: #5B4FFF; box-shadow: 0 10px 20px -5px rgba(91, 79, 255, 0.1); }
                
                .report-header { padding: 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .report-info { display: flex; align-items: center; gap: 20px; }
                
                .score-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 700; font-size: 14px; }
                .score-pass { background: #d1fae5; color: #047857; }
                .score-fail { background: #fee2e2; color: #b91c1c; }
                
                .report-title { font-size: 16px; font-weight: 600; margin: 0 0 4px 0; color: #0f172a; }
                .report-date { font-size: 11px; color: #94a3b8; font-weight: 700; }
                
                .report-status { display: flex; align-items: center; gap: 20px; }
                .status-badge { padding: 6px 12px; border-radius: 4px; font-size: 10px; font-weight: 700; }
                .badge-good { background: #f1f5f9; color: #64748b; }
                .badge-warn { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
                .expand-icon { color: #94a3b8; font-size: 12px; }

                .report-body { padding: 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
                .mb-4 { margin-bottom: 20px; display: block; font-size: 12px; font-weight: 700; }
                .feedback-item { background: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #5B4FFF; }
                .fb-question { font-size: 14px; color: #0f172a; margin: 0 0 8px 0; }
                .fb-analysis { font-size: 13px; color: #475569; margin: 0; line-height: 1.5; }

                .empty-state { text-align: center; padding: 60px; color: #64748b; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px; }
            `}</style>
        </div>
    );
};

export default Dashboard;