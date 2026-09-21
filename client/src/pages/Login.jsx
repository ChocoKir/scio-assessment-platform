import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification'; // ➲ HUD Integration

const Login = () => {
    // --- STATE CORE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notify, setNotify] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    // ➲ UPGRADE: Auto-redirect if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');
        if (storedUser) {
            navigate('/dashboard');
        }
    }, [navigate]);

    // --- UPLINK HANDLER ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setNotify({ message: '', type: '' });
        setIsLoading(true);

        try {
            // Your exact backend route and payload
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 🟢 ACCESS GRANTED
                localStorage.setItem('scio_user', JSON.stringify(data));
                setNotify({ message: 'Sign in successful.', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                // 🔴 ACCESS DENIED
                setNotify({ message: data.message || 'Invalid credentials.', type: 'error' });
            }
        } catch (err) {
            setNotify({ message: 'Connection error. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-root">
            {/* TERMINAL MODULE */}
            <div className="terminal-card glass-panel">
                <header style={{ marginBottom: '40px' }}>
                    <h1 className="orbitron title pulse">SCIO<span className="accent">AI</span></h1>
                    <p className="orbitron subtitle">SIGN_IN</p>
                </header>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* EMAIL ADDRESS INPUT */}
                    <div className="input-field">
                        <label className="orbitron">EMAIL_ADDRESS</label>
                        <input
                            type="email"
                            className="terminal-input mono"
                            placeholder="student@scio.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* PASSWORD INPUT */}
                    <div className="input-field">
                        <label className="orbitron">PASSWORD</label>
                        <input
                            type="password"
                            className="terminal-input mono"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* LAUNCH TRIGGER */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`initiate-btn orbitron ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'Signing in...' : 'SIGN_IN'}
                    </button>
                </form>

                <div className="footer-links orbitron">
                    <p>Don't have an account? <Link to="/register" className="forge-link">Create Account</Link></p>
                </div>
            </div>

            {/* Notification */}
            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            {/* --- CYBERPUNK STYLING --- */}
            <style>{`
                .login-root {
                    min-height: 100vh;
                    background: #fafafa;
                    color: #1a1a2e;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 40px;
                }

                .terminal-card {
                    width: 100%;
                    max-width: 450px;
                    padding: 60px;
                    text-align: center;
                    position: relative;
                    z-index: 20;
                }

                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 2px; }
                .mono { font-family: 'JetBrains Mono', monospace; }

                .title { font-size: 48px; margin: 0; letter-spacing: 10px; color: #1a1a2e; }
                .accent { color: #5B4FFF; text-shadow: 0 0 20px rgba(91, 79, 255, 0.3); }
                .subtitle { font-size: 10px; color: #6b7280; margin-top: 10px; letter-spacing: 4px; text-transform: uppercase; }

                .input-field { text-align: left; }
                .input-field label { font-size: 14px; color: #6b7280; margin-left: 5px; margin-bottom: 8px; display: block; text-transform: none; letter-spacing: 0.5px; font-weight: 500; }

                .terminal-input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 16px 20px;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    color: #1a1a2e;
                    outline: none;
                    font-family: 'Inter';
                    font-weight: 400;
                    transition: 0.3s;
                    min-height: 52px;
                    font-size: 15px;
                }

                .terminal-input:focus {
                    border-color: #5B4FFF;
                    box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1);
                }
                .terminal-input:disabled { opacity: 0.5; cursor: not-allowed; }

                .initiate-btn {
                    width: 100%;
                    padding: 22px 24px;
                    margin-top: 15px;
                    background: #1a1a2e;
                    color: #ffffff;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: 0.3s;
                    text-transform: none;
                    letter-spacing: 0.5px;
                    min-height: 52px;
                }

                .initiate-btn:hover {
                    background: #5B4FFF;
                    transform: translateY(-2px);
                }

                .initiate-btn.loading {
                    background: #f5f5f5;
                    color: #5B4FFF;
                    cursor: wait;
                    box-shadow: none;
                    transform: none;
                    border: 1px solid #5B4FFF;
                }

                .footer-links { margin-top: 40px; font-size: 11px; color: #a0a0b0; }
                .forge-link { color: #5B4FFF; text-decoration: none; margin-left: 5px; transition: 0.3s; font-weight: 500; }
                .forge-link:hover { color: #9d50bb; }

                .pulse { animation: pulseLogo 2.5s infinite; }
                @keyframes pulseLogo { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; text-shadow: 0 0 30px rgba(91, 79, 255, 0.3); } }
            `}</style>
        </div>
    );
};

export default Login;