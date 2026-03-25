import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification'; // ➲ Tactical HUD Integration

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

    // --- NEURAL LINK: AUTH & DATA FETCHING ---
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
                    setNotify({ message: 'DATA_ERROR: Could not synchronize logs.', type: 'error' });
                }
            } catch (error) {
                console.error("Neural Link Error:", error);
                setNotify({ message: 'LINK_FAILURE: Connection to core lost.', type: 'error' });
            }
        };

        fetchDataStream();
    }, [navigate]);

    // --- SYSTEM HANDLERS ---
    const handleLogout = () => {
        localStorage.removeItem('scio_user');
        setNotify({ message: 'TERMINATING_SESSION: Goodbye, Agent.', type: 'info' });
        setTimeout(() => {
            navigate('/login');
        }, 1500);
    };

    const copyUplink = (quizId) => {
        const link = `${window.location.origin}/take-quiz/${quizId}`;
        navigator.clipboard.writeText(link);
        setNotify({ message: 'UPLINK_ENCRYPTED: Share link copied to clipboard.', type: 'success' });
    };

    const toggleExpansion = (id) => {
        setExpandedExam(expandedExam === id ? null : id);
    };

    // ➲ NEW: PURGE PROTOCOL
    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("➲ WARNING: Purging this mission will erase all associated student data from the mainframe. Proceed?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Update local state to reflect the removal instantly
                setQuizzes(quizzes.filter(quiz => quiz._id !== id));
                setNotify({ message: 'MISSION_PURGED: Data removed from mainframe.', type: 'success' });
            } else {
                setNotify({ message: 'PURGE_FAILURE: Core rejected the request.', type: 'error' });
            }
        } catch (error) {
            setNotify({ message: 'LINK_FAILURE: Could not reach the core server.', type: 'error' });
        }
    };

    // --- STYLING MACROS ---
    const sidebarItemStyle = (tabName) => {
        const isActive = activeTab === tabName;
        return {
            padding: '18px 25px',
            cursor: 'pointer',
            backgroundColor: isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
            color: isActive ? '#00d2ff' : '#666',
            borderRadius: '15px',
            marginBottom: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: '14px',
            fontFamily: 'Orbitron',
            letterSpacing: '1px',
            borderLeft: isActive ? '4px solid #00d2ff' : '4px solid transparent',
            boxShadow: isActive ? 'inset 0 0 15px rgba(0, 210, 255, 0.05)' : 'none'
        };
    };

    if (!user) {
        return (
            <div className="loading-screen">
                <div className="pulse">INITIATING_NEURAL_LINK...</div>
            </div>
        );
    }

    return (
        <div className="scio-root-container">
            <div className="scanline"></div>

            {/* 🌑 TACTICAL SIDEBAR */}
            <aside className="sidebar-console">
                <div className="brand-header">
                    <h1 className="orbitron main-logo">SCIO<span className="accent">AI</span></h1>
                    <div className="version-tag orbitron">OS_V3_ULTRA</div>
                </div>

                <nav className="nav-stack">
                    <div onClick={() => setActiveTab('home')} style={sidebarItemStyle('home')}>
                        🏠 HUB_BASE
                    </div>

                    {user.role === 'teacher' ? (
                        <>
                            <div onClick={() => navigate('/create-quiz')} style={{ ...sidebarItemStyle('create'), color: '#00ffa3' }}>
                                ⚡ FORGE_EXAM
                            </div>
                            <div onClick={() => setActiveTab('reports')} style={sidebarItemStyle('reports')}>
                                📈 INTEL_LOGS
                            </div>
                        </>
                    ) : (
                        <div onClick={() => setActiveTab('reports')} style={sidebarItemStyle('reports')}>
                            🏅 MY_RECORDS
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
                    🚀 DISCONNECT
                </button>
            </aside>

            {/* 🚀 MAIN VIEWPORT */}
            <main className="viewport-main">
                <header className="viewport-top-bar">
                    <div className="greeting-block">
                        <h2 className="welcome-text">
                            Welcome, <span className="user-glow">Agent {user.name}</span>
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
                                <div key={quiz._id} className="mission-card glass-panel">
                                    <div className="card-top">
                                        <span className="orbitron node-id">ID: {quiz._id.slice(-6).toUpperCase()}</span>
                                        {/* ➲ PURGE TRIGGER */}
                                        <button className="purge-btn" onClick={() => handleDeleteQuiz(quiz._id)} title="PURGE_MISSION">
                                            ✖
                                        </button>
                                    </div>
                                    <h3 className="orbitron quiz-title">{quiz.title}</h3>
                                    <p className="quiz-meta">{quiz.topic} • {quiz.questions.length} Mission Units</p>

                                    <div className="card-footer">
                                        <button className="primary-action-btn orbitron" onClick={() => navigate(`/analytics/${quiz._id}`)}>
                                            ACCESS_DATA
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
                                <h2 className="orbitron portal-title">ACCESS_PORTAL</h2>
                                <p className="portal-desc">Enter the encrypted mission key to synchronize with the exam core.</p>
                                <input
                                    type="text"
                                    placeholder="PASTE_MISSION_KEY"
                                    className="tactical-text-input"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                                <button className="portal-launch-btn orbitron" onClick={() => {
                                    if (!joinCode) {
                                        setNotify({ message: 'INPUT_REQUIRED: Mission key is missing.', type: 'error' });
                                        return;
                                    }
                                    navigate(`/take-quiz/${joinCode.split('/').pop()}`);
                                }}>
                                    INITIATE_NEURAL_SYNC
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: REPORTS / RECORDS --- */}
                    {activeTab === 'reports' && (
                        <div className="intelligence-logs-view">
                            <h3 className="orbitron section-label">➲ ARCHIVED_LOGS</h3>
                            {mySubmissions.length === 0 && quizzes.length === 0 ? (
                                <div className="empty-mainframe-msg orbitron">NO_DATA_STREAMS_DETECTED</div>
                            ) : (
                                mySubmissions.map((sub) => (
                                    <div key={sub._id} className={`intel-entry ${expandedExam === sub._id ? 'expanded' : ''}`}>
                                        <div className="intel-header" onClick={() => toggleExpansion(sub._id)}>
                                            <div className="intel-left">
                                                <div className="rank-orb orbitron" style={{
                                                    color: sub.percentage >= 70 ? '#00ffa3' : '#ff4d4d',
                                                    borderColor: sub.percentage >= 70 ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255, 77, 77, 0.2)'
                                                }}>
                                                    {sub.percentage}%
                                                </div>
                                                <div className="intel-info">
                                                    <h4 className="intel-title">{sub.quizId?.title || "SYSTEM_DATA_LOG"}</h4>
                                                    <small className="orbitron intel-date">{new Date(sub.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                            <div className="intel-right">
                                                <div className="status-label orbitron">INTEGRITY_STATUS</div>
                                                <div className="status-val orbitron" style={{ color: sub.tabSwitches > 0 ? '#ff4d4d' : '#00ffa3' }}>
                                                    {sub.tabSwitches > 0 ? `BREACH_DET_(${sub.tabSwitches})` : 'SECURE'}
                                                </div>
                                            </div>
                                        </div>

                                        {expandedExam === sub._id && (
                                            <div className="intel-body-expansion">
                                                <div className="ai-feedback-header orbitron">➲ AI_NEURAL_DEBRIEF:</div>
                                                {sub.detailed_results?.map((res, i) => (
                                                    <div key={i} className="feedback-module">
                                                        <p className="q-text"><strong>UNIT_{i+1}:</strong> {res.question}</p>
                                                        <p className="ai-text"><strong>ANALYSIS:</strong> {res.ai_feedback}</p>
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
                    background: #020202; color: #fff; font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }

                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }

                /* 🌑 Sidebar Console */
                .sidebar-console {
                    width: 320px; background: rgba(10, 10, 10, 0.9);
                    backdrop-filter: blur(25px); padding: 40px 25px;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex; flex-direction: column; z-index: 50;
                }

                .main-logo { font-size: 32px; letter-spacing: 8px; margin: 0; }
                .main-logo .accent { color: #00d2ff; }
                .version-tag { font-size: 9px; color: #444; letter-spacing: 4px; margin-top: 5px; text-align: center; }

                .nav-stack { flex: 1; margin-top: 60px; }

                .user-profile-module {
                    background: rgba(255, 255, 255, 0.02); padding: 15px;
                    border-radius: 18px; display: flex; align-items: center;
                    gap: 15px; margin-bottom: 20px; border: 1px solid #111;
                }

                .avatar-orb {
                    width: 45px; height: 45px; background: #00d2ff; color: #000;
                    border-radius: 12px; display: flex; justify-content: center;
                    align-items: center; font-weight: 900; font-size: 20px;
                }

                .profile-name { font-weight: 700; font-size: 15px; }
                .profile-status { font-size: 9px; color: #00ffa3; }

                .disconnect-trigger {
                    background: transparent; border: 1px solid #ff4d4d; color: #ff4d4d;
                    padding: 15px; border-radius: 12px; cursor: pointer; font-weight: 900;
                    transition: 0.3s; font-size: 12px;
                }
                .disconnect-trigger:hover { background: #ff4d4d; color: #000; }

                /* 🚀 Main Viewport */
                .viewport-main { flex: 1; display: flex; flex-direction: column; padding: 50px 80px; overflow-y: auto; position: relative; }
                .viewport-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                .welcome-text { font-size: 42px; font-weight: 900; margin: 0; }
                .user-glow { color: #00d2ff; text-shadow: 0 0 20px rgba(0, 210, 255, 0.3); }
                .system-subtitle { color: #444; margin-top: 10px; letter-spacing: 1px; }
                .status-green { color: #00ffa3; }

                .hud-indicators { display: flex; gap: 15px; }
                .hud-pill {
                    padding: 10px 20px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(255, 255, 255, 0.02); font-size: 10px; color: #555;
                }
                .ai-pill { border-color: rgba(0, 255, 163, 0.2); color: #00ffa3; }

                /* 📁 Grid Cards */
                .quiz-data-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 30px; }
                .mission-card { background: rgba(255, 255, 255, 0.02); padding: 40px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.08); transition: 0.4s; position: relative; }
                .mission-card:hover { transform: translateY(-10px); border-color: #00d2ff; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6); }

                .card-top { display: flex; justify-content: space-between; align-items: center; }
                .purge-btn {
                    background: transparent; border: none; color: #333;
                    font-size: 16px; cursor: pointer; transition: 0.3s;
                }
                .purge-btn:hover { color: #ff4d4d; transform: scale(1.2); text-shadow: 0 0 10px #ff4d4d; }

                .node-id { font-size: 10px; color: #333; }
                .quiz-title { font-size: 24px; color: #00d2ff; margin: 15px 0 5px 0; }
                .quiz-meta { color: #555; font-size: 14px; margin-bottom: 35px; }

                .card-footer { display: flex; gap: 15px; }
                .primary-action-btn { flex: 1; padding: 15px; background: #00d2ff; color: #000; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; }
                .secondary-icon-btn { padding: 15px; background: transparent; border: 1px solid #222; color: #fff; border-radius: 12px; cursor: pointer; transition: 0.3s; }
                .secondary-icon-btn:hover { border-color: #00d2ff; color: #00d2ff; }

                /* 🛰️ Portal UI */
                .portal-entry-zone { height: 60vh; display: flex; justify-content: center; align-items: center; }
                .portal-module { width: 100%; max-width: 650px; padding: 80px; text-align: center; position: relative; overflow: hidden; }
                .laser-scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #00d2ff; box-shadow: 0 0 20px #00d2ff; animation: scanHUD 4s infinite linear; }
                .portal-title { font-size: 28px; letter-spacing: 10px; margin-bottom: 20px; }
                .portal-desc { color: #555; margin-bottom: 50px; line-height: 1.6; }
                .tactical-text-input { width: 100%; padding: 22px; background: #000; border: 1px solid #222; border-radius: 18px; color: #00d2ff; font-family: 'Orbitron'; text-align: center; font-size: 22px; margin-bottom: 40px; outline: none; }
                .portal-launch-btn { width: 100%; padding: 22px; background: linear-gradient(45deg, #00d2ff, #9d50bb); border: none; border-radius: 18px; color: #fff; font-weight: 900; font-size: 20px; cursor: pointer; box-shadow: 0 10px 40px rgba(0, 210, 255, 0.3); }

                /* 🏅 Intelligence Logs */
                .intel-entry { background: rgba(255, 255, 255, 0.02); border: 1px solid #111; border-radius: 24px; margin-bottom: 20px; overflow: hidden; transition: 0.3s; }
                .intel-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .intel-left { display: flex; align-items: center; gap: 30px; }
                .rank-orb { width: 70px; height: 70px; border: 3px solid; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 18px; }
                .intel-title { font-size: 20px; margin: 0 0 5px 0; }
                .intel-date { font-size: 9px; color: #444; }
                .intel-right { text-align: right; }
                .status-label { font-size: 9px; color: #333; margin-bottom: 5px; }
                .status-val { font-size: 13px; font-weight: 700; }
                .intel-body-expansion { padding: 40px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid #111; }
                .ai-feedback-header { color: #00d2ff; font-size: 11px; margin-bottom: 25px; }
                .feedback-module { padding: 20px; background: rgba(255, 255, 255, 0.02); border-radius: 15px; margin-bottom: 15px; border-left: 4px solid #00d2ff; }
                .q-text { font-size: 14px; margin: 0 0 8px 0; }
                .ai-text { font-size: 13px; color: #888; font-style: italic; margin: 0; }

                @keyframes scanHUD { 0% { top: 0; } 100% { top: 100%; } }
                .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; background: #000; color: #00d2ff; font-family: 'Orbitron'; }
                .pulse { animation: pulseHUD 2s infinite; }
                @keyframes pulseHUD { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 100; }
            `}</style>
        </div>
    );
};

export default Dashboard;