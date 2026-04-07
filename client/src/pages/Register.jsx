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
                setNotify({ message: 'Account created successfully! Welcome to SCIO.', type: 'success' });

                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setNotify({ message: data.message || 'Registration failed. Please try again.', type: 'error' });
                
            }
        } catch (err) {
            setNotify({ message: 'Connection error. Please check your internet.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-root">
            {/* TERMINAL MODULE */}
            <div className="terminal-card glass-panel">
                <header style={{ marginBottom: '30px' }}>
                    <h1 className="orbitron title">SCIO</h1>
                    <p className="orbitron subtitle">CREATE_ACCOUNT</p>
                </header>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="input-field">
                        <label className="orbitron">FULL_NAME</label>
                        <input
                            type="text"
                            placeholder="e.g. Kalashiva B P"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label className="orbitron">EMAIL_ADDRESS</label>
                        <input
                            type="email"
                            placeholder="agent@scio.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <label className="orbitron">PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>

                    {/* ROLE SELECTOR */}
                    <div className="input-field">
                        <label className="orbitron">SELECT_ROLE</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                                onClick={() => setRole('student')}
                            >
                                🧑‍🎓 Student
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                                onClick={() => setRole('teacher')}
                            >
                                👨‍🏫 Teacher
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`initiate-btn ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'Creating account...' : 'CREATE_ACCOUNT'}
                    </button>
                </form>

                <div className="footer-links">
                    <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
                </div>
            </div>

            {/* Tactical Notification HUD */}
            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            <style>{`
                .register-root {
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
                    maxWidth: 480px;
                    padding: 60px;
                    text-align: center;
                    z-index: 10;
                    background: linear-gradient(135deg, #16213e, #1a1a2e);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
                }

                .orbitron { fontFamily: 'Orbitron', sans-serif; letterSpacing: 1px; }
                .title { fontSize: 42px; color: #1a1a2e; textShadow: 0 0 20px rgba(91, 79, 255, 0.3); margin: 0; }
                .subtitle { fontSize: 10px; color: #6b7280; marginTop: 10px; letterSpacing: 3px; text-transform: uppercase; }

                .input-field { textAlign: left; }
                .input-field label { fontSize: 14px; color: #6b7280; marginLeft: 5px; marginBottom: 8px; display: block; text-transform: none; letter-spacing: 0.5px; font-weight: 500; }
                
                input {
                    width: 100%; padding: 16px 20px; background: #ffffff; border: 1px solid #e5e7eb;
                    border-radius: 10px; color: #1a1a2e; outline: none; font-family: 'Inter';
                    font-weight: 400; transition: 0.3s; min-height: 52px; font-size: 15px;
                }
                input:focus { border-color: #5B4FFF; box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1); }

                /* Role Selector UI */
                .role-selector { display: flex; gap: 10px; }
                .role-btn {
                    flex: 1; padding: 12px; background: #f5f5f5; border: 1px solid #e5e7eb;
                    color: #a0a0b0; border-radius: 10px; cursor: pointer; transition: 0.3s;
                    font-family: 'Inter'; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
                }
                .role-btn:hover { border-color: #5B4FFF; color: #5B4FFF; }
                .role-btn.active {
                    background: #5B4FFF; border-color: #5B4FFF; color: #ffffff;
                    box-shadow: 0 4px 12px rgba(91, 79, 255, 0.25);
                }

                .initiate-btn {
                    width: 100%; padding: 18px 24px; marginTop: 10px;
                    background: #1a1a2e; color: #ffffff; border: none; border-radius: 10px; font-weight: 600;
                    font-family: 'Inter'; cursor: pointer; transition: 0.3s;
                    text-transform: none; letter-spacing: 0.5px; min-height: 52px; font-size: 16px;
                }
                .initiate-btn:hover { background: #5B4FFF; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.25); }
                .initiate-btn.loading { background: #f5f5f5; cursor: not-allowed; box-shadow: none; color: #5B4FFF; border: 1px solid #5B4FFF; }

                .footer-links { marginTop: 30px; fontSize: 12px; color: #a0a0b0; }
                .login-link { color: #5B4FFF; textDecoration: none; font-weight: 600; transition: 0.3s; }
                .login-link:hover { color: #9d50bb; }
            `}</style>
        </div>
    );
};

export default Register;