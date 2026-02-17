import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        companyLogo: '🏢',
        adminName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        state: '',
        country: '',
        agreeTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const industries = [
        'Technology', 'Healthcare', 'Finance & Banking', 'Retail & E-commerce',
        'Food & Beverage', 'Manufacturing', 'Real Estate', 'Education',
        'Automotive', 'Telecommunications', 'Energy', 'Media & Entertainment',
        'Agriculture', 'Construction', 'Logistics & Transportation', 'Other'
    ];

    const companySizes = [
        '1-10 employees', '11-50 employees', '51-200 employees',
        '201-500 employees', '501-1000 employees', '1000+ employees'
    ];

    const companyLogos = [
        '🏢', '🏭', '🏪', '🏬', '🏗️', '🏦', '🏥', '🏫',
        '🎯', '🚀', '💼', '🔧', '⚡', '🌿', '🎨', '💎',
        '🛒', '📱', '🖥️', '🔬', '✈️', '🚗', '🍕', '📚'
    ];

    const countries = [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
        'Germany', 'France', 'Japan', 'Brazil', 'Mexico', 'South Korea',
        'Singapore', 'UAE', 'South Africa', 'Other'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (formData.companyName.trim().length < 2) newErrors.companyName = 'Company name must be at least 2 characters';
        if (!formData.industry) newErrors.industry = 'Please select an industry';
        if (!formData.companySize) newErrors.companySize = 'Please select company size';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\d\s\-+()]{7,15}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and a number';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.country) newErrors.country = 'Please select a country';
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get existing companies from localStorage
            const existingCompanies = JSON.parse(localStorage.getItem('companies') || '[]');

            // Check if email already exists
            const emailExists = existingCompanies.find(c => c.email === formData.email);
            if (emailExists) {
                setErrors({ email: 'This email is already registered' });
                setStep(2);
                setIsLoading(false);
                return;
            }

            // Create new company object
            const newCompany = {
                id: `comp-${Date.now()}`,
                companyName: formData.companyName,
                industry: formData.industry,
                companySize: formData.companySize,
                companyLogo: formData.companyLogo,
                adminName: formData.adminName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                createdAt: new Date().toISOString(),
                status: 'active',
                plan: 'free',
            };

            // Save to localStorage
            existingCompanies.push(newCompany);
            localStorage.setItem('companies', JSON.stringify(existingCompanies));

            // Set current user
            localStorage.setItem('currentUser', JSON.stringify(newCompany));

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            setErrors({ submit: 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const pwd = formData.password;
        if (!pwd) return { strength: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

        if (score <= 1) return { strength: 20, label: 'Very Weak', color: '#ef4444' };
        if (score === 2) return { strength: 40, label: 'Weak', color: '#f97316' };
        if (score === 3) return { strength: 60, label: 'Fair', color: '#f59e0b' };
        if (score === 4) return { strength: 80, label: 'Strong', color: '#10b981' };
        return { strength: 100, label: 'Very Strong', color: '#059669' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-shape shape-1"></div>
                <div className="auth-shape shape-2"></div>
                <div className="auth-shape shape-3"></div>
            </div>

            <div className="auth-container register-layout">
                {/* Left Panel */}
                <div className="auth-left-panel">
                    <div className="auth-left-content">
                        <Link to="/" className="auth-logo">
                            <span className="auth-logo-icon">🏢</span>
                            <span className="auth-logo-text">SalesPortal</span>
                        </Link>

                        <div className="auth-left-info">
                            <h2>Start Your Journey</h2>
                            <p>Register your company and empower your sales team with powerful tools and analytics.</p>

                            <div className="auth-benefits">
                                <div className="auth-benefit">
                                    <span className="benefit-icon">✅</span>
                                    <div>
                                        <h4>Free to Start</h4>
                                        <p>No credit card required. Start managing sales immediately.</p>
                                    </div>
                                </div>
                                <div className="auth-benefit">
                                    <span className="benefit-icon">📊</span>
                                    <div>
                                        <h4>Real-time Analytics</h4>
                                        <p>Beautiful dashboards to visualize your sales data.</p>
                                    </div>
                                </div>
                                <div className="auth-benefit">
                                    <span className="benefit-icon">🔒</span>
                                    <div>
                                        <h4>Secure & Private</h4>
                                        <p>Your data is completely isolated and secure.</p>
                                    </div>
                                </div>
                                <div className="auth-benefit">
                                    <span className="benefit-icon">🚀</span>
                                    <div>
                                        <h4>Scale Easily</h4>
                                        <p>Add unlimited salesmen and products as you grow.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="auth-left-footer">
                            <p>Trusted by <strong>500+</strong> companies worldwide</p>
                            <div className="auth-company-logos">
                                <span>🏭</span><span>🏪</span><span>🏬</span><span>🏗️</span><span>🏦</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-right-panel">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h2>Create Your Account</h2>
                            <p>Fill in the details to register your company</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="register-progress">
                            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {step > 1 ? '✓' : '1'}
                                </div>
                                <span className="step-label">Company</span>
                            </div>
                            <div className={`progress-line ${step > 1 ? 'active' : ''}`}></div>
                            <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {step > 2 ? '✓' : '2'}
                                </div>
                                <span className="step-label">Account</span>
                            </div>
                            <div className={`progress-line ${step > 2 ? 'active' : ''}`}></div>
                            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                                <div className="step-circle">3</div>
                                <span className="step-label">Finish</span>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="auth-error-banner">
                                <span>⚠️</span> {errors.submit}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form" noValidate>

                            {/* STEP 1: Company Details */}
                            {step === 1 && (
                                <div className="form-step fade-in">
                                    <h3 className="step-title">📋 Company Information</h3>

                                    <div className="form-group">
                                        <label className="form-label">Company Logo</label>
                                        <div className="logo-picker">
                                            {companyLogos.map(logo => (
                                                <button
                                                    type="button"
                                                    key={logo}
                                                    className={`logo-option ${formData.companyLogo === logo ? 'selected' : ''}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, companyLogo: logo }))}
                                                >
                                                    {logo}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="companyName">
                                            Company Name <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.companyName ? 'error' : ''}`}>
                                            <span className="input-icon">🏢</span>
                                            <input
                                                id="companyName"
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                placeholder="Enter your company name"
                                                className="form-input"
                                            />
                                        </div>
                                        {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="industry">
                                            Industry <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.industry ? 'error' : ''}`}>
                                            <span className="input-icon">🏭</span>
                                            <select
                                                id="industry"
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                className="form-input form-select"
                                            >
                                                <option value="">Select your industry</option>
                                                {industries.map(ind => (
                                                    <option key={ind} value={ind}>{ind}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.industry && <span className="error-text">{errors.industry}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="companySize">
                                            Company Size <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.companySize ? 'error' : ''}`}>
                                            <span className="input-icon">👥</span>
                                            <select
                                                id="companySize"
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleChange}
                                                className="form-input form-select"
                                            >
                                                <option value="">Select company size</option>
                                                {companySizes.map(size => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.companySize && <span className="error-text">{errors.companySize}</span>}
                                    </div>

                                    <button type="button" className="auth-btn auth-btn-primary" onClick={nextStep}>
                                        Continue →
                                    </button>
                                </div>
                            )}

                            {/* STEP 2: Account Details */}
                            {step === 2 && (
                                <div className="form-step fade-in">
                                    <h3 className="step-title">👤 Account Details</h3>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="adminName">
                                            Full Name <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.adminName ? 'error' : ''}`}>
                                            <span className="input-icon">👤</span>
                                            <input
                                                id="adminName"
                                                type="text"
                                                name="adminName"
                                                value={formData.adminName}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                className="form-input"
                                            />
                                        </div>
                                        {errors.adminName && <span className="error-text">{errors.adminName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="email">
                                            Email Address <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                                            <span className="input-icon">📧</span>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="admin@company.com"
                                                className="form-input"
                                            />
                                        </div>
                                        {errors.email && <span className="error-text">{errors.email}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="phone">
                                            Phone Number <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.phone ? 'error' : ''}`}>
                                            <span className="input-icon">📞</span>
                                            <input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 123-4567"
                                                className="form-input"
                                            />
                                        </div>
                                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="password">
                                            Password <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                                            <span className="input-icon">🔒</span>
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a strong password"
                                                className="form-input"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {formData.password && (
                                            <div className="password-strength">
                                                <div className="strength-bar">
                                                    <div
                                                        className="strength-fill"
                                                        style={{
                                                            width: `${passwordStrength.strength}%`,
                                                            backgroundColor: passwordStrength.color
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="strength-label" style={{ color: passwordStrength.color }}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                        )}
                                        {errors.password && <span className="error-text">{errors.password}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="confirmPassword">
                                            Confirm Password <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                                            <span className="input-icon">🔒</span>
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm your password"
                                                className="form-input"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                            <span className="success-text">✅ Passwords match</span>
                                        )}
                                    </div>

                                    <div className="form-btn-row">
                                        <button type="button" className="auth-btn auth-btn-secondary" onClick={prevStep}>
                                            ← Back
                                        </button>
                                        <button type="button" className="auth-btn auth-btn-primary" onClick={nextStep}>
                                            Continue →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Location & Finish */}
                            {step === 3 && (
                                <div className="form-step fade-in">
                                    <h3 className="step-title">📍 Location & Confirmation</h3>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="address">
                                            Street Address
                                        </label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🏠</span>
                                            <input
                                                id="address"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="123 Business Street"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="city">City</label>
                                            <div className="input-wrapper">
                                                <input
                                                    id="city"
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="City"
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="state">State / Province</label>
                                            <div className="input-wrapper">
                                                <input
                                                    id="state"
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    placeholder="State"
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="country">
                                            Country <span className="required">*</span>
                                        </label>
                                        <div className={`input-wrapper ${errors.country ? 'error' : ''}`}>
                                            <span className="input-icon">🌍</span>
                                            <select
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="form-input form-select"
                                            >
                                                <option value="">Select your country</option>
                                                {countries.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.country && <span className="error-text">{errors.country}</span>}
                                    </div>

                                    {/* Review Summary */}
                                    <div className="review-summary">
                                        <h4>📋 Registration Summary</h4>
                                        <div className="summary-grid">
                                            <div className="summary-item">
                                                <span className="summary-label">Company</span>
                                                <span className="summary-value">{formData.companyLogo} {formData.companyName}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Industry</span>
                                                <span className="summary-value">{formData.industry}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Admin</span>
                                                <span className="summary-value">{formData.adminName}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="summary-label">Email</span>
                                                <span className="summary-value">{formData.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className={`checkbox-wrapper ${errors.agreeTerms ? 'error' : ''}`}>
                                            <input
                                                type="checkbox"
                                                name="agreeTerms"
                                                checked={formData.agreeTerms}
                                                onChange={handleChange}
                                                className="form-checkbox"
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="checkbox-label">
                                                I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                                            </span>
                                        </label>
                                        {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
                                    </div>

                                    <div className="form-btn-row">
                                        <button type="button" className="auth-btn auth-btn-secondary" onClick={prevStep}>
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            className={`auth-btn auth-btn-primary auth-btn-submit ${isLoading ? 'loading' : ''}`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner"></span>
                                                    Creating Account...
                                                </>
                                            ) : (
                                                '🚀 Create Account'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="auth-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="auth-link">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;