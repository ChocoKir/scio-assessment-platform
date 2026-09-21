import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notification from '../components/Notification';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notify, setNotify] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('EduX_user');
        if (storedUser) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setNotify({ message: '', type: '' });
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('EduX_user', JSON.stringify(data));
                setNotify({ message: 'Sign in successful.', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setNotify({ message: data.message || 'Invalid credentials.', type: 'error' });
            }
        } catch (err) {
            setNotify({ message: 'Connection error. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="EduX-root">
            <div className="login-container">
                <div className="section-tag">SECTION: AUTHENTICATION</div>
                
                <div className="hero-text">
                    <h1>Sign<span>In.</span></h1>
                    <p>Enter your credentials to access the EduX system dashboard and real-time data.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>EMAIL_ADDRESS</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
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
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? 'Processing...' : 'LOGIN'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create Account</Link>
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
                    padding: 20px;
                }

                .login-container {
                    width: 100%;
                    max-width: 480px;
                    background: white;
                    padding: 60px;
                    border: 1px solid #e5e7eb;
                    position: relative;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.02);
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
                    font-size: 64px;
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
                    max-width: 320px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
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
                    font-size: 15px;
                    transition: all 0.2s;
                }

                .input-group input:focus {
                    outline: none;
                    border-color: #5B4FFF;
                    box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.05);
                }

                .submit-btn {
                    margin-top: 10px;
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
            `}</style>
        </div>
    );
};

export default Login;