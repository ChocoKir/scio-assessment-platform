import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); 
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
                localStorage.setItem('EduX_user', JSON.stringify(data));
                setNotify({ message: 'Account created successfully! Welcome to EduX.', type: 'success' });
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
        <div className="EduX-root">
            <div className="register-container">
                <div className="section-tag">SECTION: USER_REGISTRATION</div>
                
                <div className="hero-text">
                    <h1>Create<span>Account.</span></h1>
                    <p>Join the EduX network to monitor performance and manage real-time session data.</p>
                </div>

                <form onSubmit={handleRegister} className="register-form">
                    <div className="input-group">
                        <label>FULL_NAME</label>
                        <input
                            type="text"
                            placeholder="e.g. Kalashiva B P"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>EMAIL_ADDRESS</label>
                            <input
                                type="email"
                                placeholder="agent@EduX.io"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>PASSWORD</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>SELECT_ROLE</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                                onClick={() => setRole('student')}
                            >
                                STUDENT
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                                onClick={() => setRole('teacher')}
                            >
                                TEACHER
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? 'ESTABLISHING_LINK...' : 'CREATE_ACCOUNT'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>

            <Notification
                message={notify.message}
                type={notify.type}
                onClose={() => setNotify({ message: '', type: '' })}
            />

            <style>{`
                .EduX-root {
                    min-height: 100vh;
                    background-color: #fafafa;
                    background-image: 
                        linear-gradient(#f0f0f0 1px, transparent 1px),
                        linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
                    background-size: 40px 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Inter', -apple-system, sans-serif;
                    padding: 40px;
                }

                .register-container {
                    width: 100%;
                    max-width: 580px;
                    background: white;
                    padding: 60px;
                    border: 1px solid #e5e7eb;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                }

                .section-tag {
                    font-size: 11px;
                    font-weight: 800;
                    color: #5B4FFF;
                    letter-spacing: 1.5px;
                    margin-bottom: 24px;
                    border-left: 3px solid #5B4FFF;
                    padding-left: 15px;
                    text-transform: uppercase;
                }

                .hero-text h1 {
                    font-size: 56px;
                    font-weight: 800;
                    color: #1a1a2e;
                    margin: 0;
                    letter-spacing: -2px;
                    line-height: 1;
                }

                .hero-text h1 span {
                    color: #5B4FFF;
                }

                .hero-text p {
                    font-size: 15px;
                    color: #6b7280;
                    line-height: 1.6;
                    margin: 20px 0 40px 0;
                }

                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .input-group label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #9ca3af;
                    letter-spacing: 1px;
                }

                .input-group input {
                    padding: 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .input-group input:focus {
                    outline: none;
                    border-color: #5B4FFF;
                    box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.05);
                }

                .role-selector {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .role-btn {
                    padding: 12px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    font-size: 11px;
                    font-weight: 700;
                    color: #6b7280;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .role-btn.active {
                    background: #5B4FFF;
                    border-color: #5B4FFF;
                    color: white;
                }

                .submit-btn {
                    margin-top: 15px;
                    padding: 18px;
                    background: #1a1a2e;
                    color: white;
                    border: none;
                    font-weight: 700;
                    font-size: 13px;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: 0.3s;
                }

                .submit-btn:hover {
                    background: #5B4FFF;
                }

                .submit-btn.loading {
                    background: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                .auth-footer {
                    margin-top: 30px;
                    font-size: 13px;
                    color: #6b7280;
                    text-align: center;
                }

                .auth-footer a {
                    color: #5B4FFF;
                    text-decoration: none;
                    font-weight: 600;
                }

                .auth-footer a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 600px) {
                    .input-row { grid-template-columns: 1fr; }
                    .register-container { padding: 30px; }
                }
            `}</style>
        </div>
    );
};

export default Register;