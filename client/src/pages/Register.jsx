// client/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification'; // ➲ Tactical HUD Integration

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [isLoading, setIsLoading] = useState(false);
    const [notify, setNotify] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setNotify({ message: '', type: '' });
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                // ➲ CRITICAL: Save the exact same key the Dashboard looks for
                localStorage.setItem('scio_user', JSON.stringify(data));
                setNotify({ message: 'IDENTITY_FORGED: Welcome to SCIO, Agent.', type: 'success' });

                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setNotify({ message: data.message || 'FORGE_FAILED: Identity rejected.', type: 'error' });
            }
        } catch (err) {
            setNotify({ message: 'LINK_FAILURE: Neural core unreachable.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-root">
            <div className="scanline"></div>

            {/* 🌑 TERMINAL MODULE */}
            <div className="terminal-card glass-panel">
                <header style={{ marginBottom: '30px' }}>
                    <h1 className="orbitron title">SCIO</h1>
                    <p className="orbitron subtitle">NEW_ENTITY_REGISTRATION</p>
                </header>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="input-field">
                        <label className="orbitron">ENTITY_DESIGNATION (NAME)</label>
                        <input
                            type="text"
                            placeholder="e.g. Kalashiva B P"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label className="orbitron">IDENTIFIER_EMAIL</label>
                        <input
                            type="email"
                            placeholder="agent@scio.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label className="orbitron">SECURITY_ENCRYPTION (PASSWORD)</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>

                    {/* ➲ ROLE SELECTOR */}
                    <div className="input-field">
                        <label className="orbitron">ASSIGN_CLEARANCE_LEVEL</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                                onClick={() => setRole('student')}
                            >
                                🧑‍🎓 AGENT (STUDENT)
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                                onClick={() => setRole('teacher')}
                            >
                                👨‍🏫 COMMANDER (TEACHER)
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`initiate-btn ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'FORGING...' : 'FORGE_IDENTITY'}
                    </button>
                </form>

                <div className="footer-links">
                    <p>Existing Entity? <Link to="/login" className="login-link">Initiate Session</Link></p>
                </div>
            </div>

            {/* ➲ Tactical Notification HUD */}
            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            <style>{`
                .register-root {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #020202;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    overflow-x: hidden;
                    background-image: radial-gradient(circle at center, rgba(157, 80, 187, 0.05), transparent 70%);
                    padding: 40px 20px;
                }

                .terminal-card {
                    width: 100%;
                    maxWidth: 480px;
                    padding: 50px;
                    text-align: center;
                    z-index: 10;
                    background: rgba(10, 10, 10, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    backdrop-filter: blur(20px);
                }

                .orbitron { fontFamily: 'Orbitron', sans-serif; letterSpacing: 1px; }
                .title { fontSize: 42px; color: #9d50bb; textShadow: 0 0 20px rgba(157, 80, 187, 0.4); margin: 0; }
                .subtitle { fontSize: 10px; color: #555; marginTop: 10px; letterSpacing: 3px; }

                .input-field { textAlign: left; }
                .input-field label { fontSize: 9px; color: #666; marginLeft: 5px; marginBottom: 8px; display: block; }
                
                input {
                    width: 100%; padding: 15px; background: #000; border: 1px solid #222;
                    border-radius: 12px; color: #9d50bb; outline: none; font-family: 'monospace';
                    transition: 0.3s;
                }
                input:focus { border-color: #9d50bb; box-shadow: 0 0 15px rgba(157, 80, 187, 0.2); }

                /* Role Selector UI */
                .role-selector { display: flex; gap: 10px; }
                .role-btn {
                    flex: 1; padding: 12px; background: #050505; border: 1px solid #222;
                    color: #666; border-radius: 10px; cursor: pointer; transition: 0.3s;
                    font-family: 'Orbitron'; font-size: 10px; font-weight: bold;
                }
                .role-btn:hover { border-color: #555; color: #fff; }
                .role-btn.active {
                    background: rgba(157, 80, 187, 0.1); border-color: #9d50bb; color: #9d50bb;
                    box-shadow: inset 0 0 10px rgba(157, 80, 187, 0.2);
                }

                .initiate-btn {
                    width: 100%; padding: 18px; marginTop: 10px;
                    background: linear-gradient(45deg, #9d50bb, #00d2ff);
                    color: #fff; border: none; border-radius: 12px; font-weight: 900;
                    font-family: 'Orbitron'; cursor: pointer; transition: 0.4s;
                    box-shadow: 0 10px 30px rgba(157, 80, 187, 0.3); letter-spacing: 2px;
                }
                .initiate-btn:hover { transform: translateY(-2px); filter: brightness(1.2); box-shadow: 0 15px 40px rgba(157, 80, 187, 0.4); }
                .initiate-btn.loading { background: #111; cursor: not-allowed; box-shadow: none; }

                .footer-links { marginTop: 30px; fontSize: 12px; color: #555; }
                .login-link { color: #9d50bb; textDecoration: none; fontWeight: bold; transition: 0.3s; }
                .login-link:hover { textShadow: 0 0 10px #9d50bb; }

                .scanline {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
                                linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
                    background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 100;
                }
            `}</style>
        </div>
    );
};

export default Register;