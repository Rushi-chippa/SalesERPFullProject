import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            const result = onLogin(formData.email, formData.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid email or password');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Panel */}
                <div className="auth-left-panel">
                    <div className="auth-branding">
                        <h1 className="auth-logo">🏢 SalesPortal</h1>
                        <p className="auth-tagline">
                            Welcome back! Sign in to manage your sales team and track performance.
                        </p>
                    </div>

                    <div className="auth-features-list">
                        <div className="auth-feature">
                            <span className="auth-feature-icon">📊</span>
                            <div>
                                <h4>Real-time Dashboard</h4>
                                <p>Monitor sales metrics at a glance</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon">👥</span>
                            <div>
                                <h4>Team Management</h4>
                                <p>Track individual salesman performance</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon">📈</span>
                            <div>
                                <h4>Analytics & Reports</h4>
                                <p>Visual insights for better decisions</p>
                            </div>
                        </div>
                    </div>

                    <div className="auth-demo-box">
                        <h4>🔑 Demo Credentials</h4>
                        <div className="demo-cred">
                            <span>Email:</span>
                            <code>admin@techvision.com</code>
                        </div>
                        <div className="demo-cred">
                            <span>Password:</span>
                            <code>admin123</code>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-right-panel">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h2>Sign In</h2>
                            <p>Enter your credentials to access your portal</p>
                        </div>

                        {error && (
                            <div className="auth-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="auth-field">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📧</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-options">
                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#forgot" className="forgot-link">Forgot password?</a>
                            </div>

                            <button
                                type="submit"
                                className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    <>🚀 Sign In</>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <div className="auth-social">
                            <button className="social-btn google">
                                <span>G</span> Continue with Google
                            </button>
                            <button className="social-btn github">
                                <span>⚡</span> Continue with GitHub
                            </button>
                        </div>

                        <p className="auth-switch-text">
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-switch-link">
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;