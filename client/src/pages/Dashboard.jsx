import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification'; // Notification Integration

const Dashboard = () => {
    // --- CORE STATE ARCHITECTURE ---
    const [user, setUser] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [expandedExam, setExpandedExam] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [notify, setNotify] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    // --- AUTHENTICATION & DATA FETCHING ---
    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');

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

    // --- SYSTEM HANDLERS ---
    const handleLogout = () => {
        localStorage.removeItem('scio_user');
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

    // NEW: DELETE ASSESSMENT
    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment? This will remove all associated student data.")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Update local state to reflect the removal instantly
                setQuizzes(quizzes.filter(quiz => quiz._id !== id));
                setNotify({ message: 'Assessment deleted successfully.', type: 'success' });
            } else {
                setNotify({ message: 'Failed to delete assessment.', type: 'error' });
            }
        } catch (error) {
            setNotify({ message: 'Connection error. Please try again.', type: 'error' });
        }
    };

    // --- STYLING MACROS ---
    const sidebarItemStyle = (tabName) => {
        const isActive = activeTab === tabName;
        return {
            padding: '18px 25px',
            cursor: 'pointer',
            backgroundColor: isActive ? 'rgba(91, 79, 255, 0.1)' : 'transparent',
            color: isActive ? '#5B4FFF' : '#a0a0b0',
            borderRadius: '15px',
            marginBottom: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '14px',
            fontFamily: 'Orbitron',
            letterSpacing: '1px',
            borderLeft: isActive ? '4px solid #5B4FFF' : '4px solid transparent',
            boxShadow: isActive ? 'inset 0 0 15px rgba(91, 79, 255, 0.05)' : 'none'
        };
    };

    if (!user) {
        return (
            <div className="loading-screen">
                <div className="pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="scio-root-container">
            {/* SIDEBAR */}
            <aside className="sidebar-console">
                <div className="brand-header">
                    <h1 className="orbitron main-logo">SCIO<span className="accent">AI</span></h1>
                    <div className="version-tag orbitron">OS_V3_ULTRA</div>
                </div>

                <nav className="nav-stack">
                    <div onClick={() => setActiveTab('home')} style={sidebarItemStyle('home')}>
                        HUB_BASE
                    </div>

                    {user.role === 'teacher' ? (
                        <>
                            <div onClick={() => navigate('/create-quiz')} style={{ ...sidebarItemStyle('create'), color: '#10b981' }}>
                        CREATE_ASSESSMENT
                            </div>
                            <div onClick={() => setActiveTab('reports')} style={sidebarItemStyle('reports')}>
                                RESULTS
                            </div>
                        </>
                    ) : (
                        <div onClick={() => setActiveTab('reports')} style={sidebarItemStyle('reports')}>
                            📅 MY_RESULTS
                        </div>
                    )}
                </nav>

                <div className="user-profile-module">
                    <div className="avatar-orb">{user.name.charAt(0)}</div>
                    <div className="profile-details">
                        <div className="profile-name">{user.name.split(' ')[0]}</div>
                        <div className="profile-status orbitron">ONLINE</div>
                    </div>
                </div>

                <button onClick={handleLogout} className="disconnect-trigger orbitron">
                    🚀 LOGOUT
                </button>
            </aside>

            {/* 🚀 MAIN VIEWPORT */}
            <main className="viewport-main">
                <header className="viewport-top-bar">
                    <div className="greeting-block">
                        <h2 className="welcome-text">
                            Welcome, <span className="user-glow">{user.name}</span>
                        </h2>
                        <p className="system-subtitle">System status: <span className="status-green">NOMINAL</span> • All nodes operational.</p>
                    </div>
                    <div className="hud-indicators">
                        <div className="hud-pill orbitron">📡 LATENCY: 14ms</div>
                        <div className="hud-pill orbitron ai-pill">🤖 AI_CORE: ACTIVE</div>
                    </div>
                </header>

                <div className="content-scroll-pane">

                    {/* --- TAB: HOME (Teacher View) --- */}
                    {user.role === 'teacher' && activeTab === 'home' && (
                        <div className="quiz-data-grid">
                            {quizzes.map((quiz) => (
                                <div key={quiz._id} className="assessment-card glass-panel">
                                    <div className="card-top">
                                        <span className="orbitron node-id">ID: {quiz._id.slice(-6).toUpperCase()}</span>
                                        {/* ➲ PURGE TRIGGER */}
                                        <button className="purge-btn" onClick={() => handleDeleteQuiz(quiz._id)} title="Delete Assessment">
                                            ✖
                                        </button>
                                    </div>
                                    <h3 className="orbitron quiz-title">{quiz.title}</h3>
                                    <p className="quiz-meta">{quiz.topic} • {quiz.questions.length} Questions</p>

                                    <div className="card-footer">
                                        <button className="primary-action-btn orbitron" onClick={() => navigate(`/analytics/${quiz._id}`)}>
                                            VIEW_RESULTS
                                        </button>
                                        <button className="secondary-icon-btn" onClick={() => copyUplink(quiz._id)}>
                                            🔗
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- TAB: HOME (Student View) --- */}
                    {user.role === 'student' && activeTab === 'home' && (
                        <div className="portal-entry-zone">
                            <div className="portal-module glass-panel">
                                <div className="laser-scanner-line"></div>
                                <h2 className="orbitron portal-title">JOIN_ASSESSMENT</h2>
                                <p className="portal-desc">Enter the session code to join the assessment.</p>
                                <input
                                    type="text"
                                    placeholder="ENTER_SESSION_CODE"
                                    className="session-input"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                                <button className="portal-launch-btn orbitron" onClick={() => {
                                    if (!joinCode) {
                                        setNotify({ message: 'Session code is required.', type: 'error' });
                                        return;
                                    }
                                    navigate(`/take-quiz/${joinCode.split('/').pop()}`);
                                }}>
                                    JOIN_ASSESSMENT
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: REPORTS / RECORDS --- */}
                    {activeTab === 'reports' && (
                        <div className="intelligence-logs-view">
                            <h3 className="orbitron section-label">Results</h3>
                            {mySubmissions.length === 0 && quizzes.length === 0 ? (
                                <div className="empty-mainframe-msg orbitron">No results found</div>
                            ) : (
                                mySubmissions.map((sub) => (
                                    <div key={sub._id} className={`intel-entry ${expandedExam === sub._id ? 'expanded' : ''}`}>
                                        <div className="intel-header" onClick={() => toggleExpansion(sub._id)}>
                                            <div className="intel-left">
                                                <div className="rank-orb orbitron" style={{
                                                    color: sub.percentage >= 70 ? '#10b981' : '#ef4444',
                                                    borderColor: sub.percentage >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                                }}>
                                                    {sub.percentage}%
                                                </div>
                                                <div className="intel-info">
                                                    <h4 className="intel-title">{sub.quizId?.title || "Assessment Result"}</h4>
                                                    <small className="orbitron intel-date">{new Date(sub.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                            <div className="intel-right">
                                                <div className="status-label orbitron">Session Status</div>
                                                <div className="status-val orbitron" style={{ color: sub.tabSwitches > 0 ? '#ef4444' : '#10b981' }}>
                                                    {sub.tabSwitches > 0 ? `Tab Switches (${sub.tabSwitches})` : 'No Issues'}
                                                </div>
                                            </div>
                                        </div>

                                        {expandedExam === sub._id && (
                                            <div className="intel-body-expansion">
                                                <div className="ai-feedback-header orbitron">AI Analysis:</div>
                                                {sub.detailed_results?.map((res, i) => (
                                                    <div key={i} className="feedback-module">
                                                        <p className="q-text"><strong>Question {i+1}:</strong> {res.question}</p>
                                                        <p className="ai-text"><strong>Analysis:</strong> {res.ai_feedback}</p>
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
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;700&display=swap');

                .scio-root-container {
                    display: flex; width: 100vw; height: 100vh;
                    background: #fafafa; color: #1a1a2e; font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }

                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }

                /* 🌑 Sidebar Console */
                .sidebar-console {
                    width: 320px; background: linear-gradient(135deg, #16213e, #1a1a2e);
                    backdrop-filter: blur(25px); padding: 40px 25px;
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex; flex-direction: column; z-index: 50;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
                }

                .main-logo { font-size: 32px; letter-spacing: 8px; margin: 0; color: #ffffff; }
                .main-logo .accent { color: #5B4FFF; }
                .version-tag { font-size: 9px; color: #a0a0b0; letter-spacing: 4px; margin-top: 5px; text-align: center; text-transform: uppercase; }

                .nav-stack { flex: 1; margin-top: 60px; }

                .user-profile-module {
                    background: rgba(255, 255, 255, 0.05); padding: 15px;
                    border-radius: 18px; display: flex; align-items: center;
                    gap: 15px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .avatar-orb {
                    width: 45px; height: 45px; background: #5B4FFF; color: #ffffff;
                    border-radius: 12px; display: flex; justify-content: center;
                    align-items: center; font-weight: 900; font-size: 20px;
                }

                .profile-name { font-weight: 700; font-size: 15px; color: #ffffff; }
                .profile-status { font-size: 9px; color: #10b981; }

                .disconnect-trigger {
                    background: transparent; border: 2px solid #ef4444; color: #ef4444;
                    padding: 15px; border-radius: 12px; cursor: pointer; font-weight: 600;
                    transition: 0.3s; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
                }
                .disconnect-trigger:hover { background: #ef4444; color: #ffffff; }

                /* 🚀 Main Viewport */
                .viewport-main { flex: 1; display: flex; flex-direction: column; padding: 50px 80px; overflow-y: auto; position: relative; }
                .viewport-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                .welcome-text { font-size: 42px; font-weight: 900; margin: 0; color: #1a1a2e; }
                .user-glow { color: #5B4FFF; text-shadow: 0 0 20px rgba(91, 79, 255, 0.3); }
                .system-subtitle { color: #a0a0b0; margin-top: 10px; letter-spacing: 1px; }
                .status-green { color: #10b981; }

                .hud-indicators { display: flex; gap: 15px; }
                .hud-pill {
                    padding: 10px 20px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.08);
                    background: #ffffff; font-size: 10px; color: #6b7280;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .ai-pill { border-color: rgba(16, 185, 129, 0.2); color: #10b981; }

                /* 📁 Grid Cards */
                .quiz-data-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 30px; }
                .mission-card { background: #ffffff; padding: 48px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); transition: 0.4s; position: relative; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .mission-card:hover { transform: translateY(-10px); border-color: #5B4FFF; box-shadow: 0 8px 32px rgba(91, 79, 255, 0.25); }

                .card-top { display: flex; justify-content: space-between; align-items: center; }
                .purge-btn {
                    background: transparent; border: none; color: #a0a0b0;
                    font-size: 16px; cursor: pointer; transition: 0.3s;
                }
                .purge-btn:hover { color: #ef4444; transform: scale(1.2); text-shadow: 0 0 10px #ef4444; }

                .node-id { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
                .quiz-title { font-size: 24px; color: #1a1a2e; margin: 15px 0 5px 0; font-weight: 800; }
                .quiz-meta { color: #a0a0b0; font-size: 14px; margin-bottom: 35px; }

                .card-footer { display: flex; gap: 15px; }
                .primary-action-btn { flex: 1; padding: 15px; background: #1a1a2e; color: #ffffff; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }
                .primary-action-btn:hover { background: #5B4FFF; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.25); }
                .secondary-icon-btn { padding: 15px; background: transparent; border: 2px solid #5B4FFF; color: #5B4FFF; border-radius: 12px; cursor: pointer; transition: 0.3s; }
                .secondary-icon-btn:hover { background: #5B4FFF; color: #ffffff; }

                /* 🛰️ Portal UI */
                .portal-entry-zone { height: 60vh; display: flex; justify-content: center; align-items: center; }
                .portal-module { width: 100%; max-width: 650px; padding: 80px; text-align: center; position: relative; overflow: hidden; background: #ffffff; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); }
                .laser-scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #5B4FFF; box-shadow: 0 0 20px #5B4FFF; animation: scanHUD 4s infinite linear; }
                .portal-title { font-size: 28px; letter-spacing: 10px; margin-bottom: 20px; color: #1a1a2e; text-transform: uppercase; font-weight: 800; }
                .portal-desc { color: #a0a0b0; margin-bottom: 50px; line-height: 1.6; }
                .session-input { width: 100%; padding: 22px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 18px; color: #1a1a2e; font-family: 'Inter'; text-align: center; font-size: 22px; margin-bottom: 40px; outline: none; font-weight: 600; }
                .session-input:focus { border-color: #5B4FFF; box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1); }
                .portal-launch-btn { width: 100%; padding: 22px; background: #1a1a2e; border: none; border-radius: 18px; color: #ffffff; font-weight: 600; font-size: 20px; cursor: pointer; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s ease; }
                .portal-launch-btn:hover { background: #5B4FFF; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.25); }

                /* 🏅 Intelligence Logs */
                .intel-entry { background: #ffffff; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; margin-bottom: 20px; overflow: hidden; transition: 0.3s; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                .intel-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .intel-left { display: flex; align-items: center; gap: 30px; }
                .rank-orb { width: 70px; height: 70px; border: 3px solid; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 18px; }
                .intel-title { font-size: 20px; margin: 0 0 5px 0; color: #1a1a2e; font-weight: 700; }
                .intel-date { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
                .intel-right { text-align: right; }
                .status-label { font-size: 9px; color: #6b7280; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
                .status-val { font-size: 13px; font-weight: 700; }
                .intel-body-expansion { padding: 40px; background: #f5f5f5; border-top: 1px solid rgba(255, 255, 255, 0.08); }
                .ai-feedback-header { color: #5B4FFF; font-size: 11px; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 3px; }
                .feedback-module { padding: 20px; background: #ffffff; border-radius: 15px; margin-bottom: 15px; border-left: 4px solid #5B4FFF; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                .q-text { font-size: 14px; margin: 0 0 8px 0; color: #1a1a2e; }
                .ai-text { font-size: 13px; color: #a0a0b0; font-style: italic; margin: 0; }

                @keyframes scanHUD { 0% { top: 0; } 100% { top: 100%; } }
                .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; background: #fafafa; color: #5B4FFF; font-family: 'Inter', sans-serif; }
                .pulse { animation: pulseHUD 2s infinite; }
                @keyframes pulseHUD { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default Dashboard;