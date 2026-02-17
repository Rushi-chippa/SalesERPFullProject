import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Header = ({ user, company }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Mock Notifications
    const [notifications] = useState([
        { id: 1, title: 'Welcome to SalesPortal', message: 'Get started by setting up your profile.', time: 'Just now', icon: '👋' },
        { id: 2, title: 'New Leaderboard', message: 'Check your rank in the Sales Team.', time: '2 hours ago', icon: '🏆' },
        { id: 3, title: 'Monthly Target', message: 'Your sales target has been updated.', time: '1 day ago', icon: '🎯' },
    ]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/dashboard" className="header-logo">
                    <span className="logo-icon">🏢</span>
                    <span className="logo-text">SalesPortal</span>
                </Link>
            </div>

            <div className="header-center">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search products, sales, salespeople..."
                        className="search-input"
                    />
                    <span className="search-shortcut">⌘K</span>
                </div>
            </div>

            <div className="header-right">
                <div className="header-theme-toggle mr-2">
                    <ThemeToggle />
                </div>
                <div className="header-notifications" style={{ position: 'relative' }}>
                    <button
                        className="notification-btn"
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsDropdownOpen(false); // Close profile dropdown
                        }}
                    >
                        <span>🔔</span>
                        {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                    </button>

                    {isNotificationsOpen && (
                        <div className="profile-dropdown" style={{ right: '-60px', width: '300px' }}>
                            <div className="dropdown-header">
                                <span className="font-bold text-slate-800">Notifications</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            {notifications.length > 0 ? (
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="dropdown-item" style={{ alignItems: 'start', gap: '12px' }}>
                                            <span style={{ fontSize: '16px' }}>{notif.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{notif.title}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{notif.message}</div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{notif.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No new notifications
                                </div>
                            )}
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" style={{ justifyContent: 'center', color: '#4f46e5', fontWeight: 500 }}>
                                View All
                            </button>
                        </div>
                    )}
                </div>

                <div className="header-help">
                    <button className="help-btn">
                        <span>❓</span>
                    </button>
                </div>

                <div className="header-divider"></div>

                <div className="header-profile">
                    <button
                        className="profile-btn"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="profile-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" />
                            ) : (
                                <img
                                    src={user?.role === 'manager'
                                        ? '/assets/avatars/manager.svg'
                                        : '/assets/avatars/salesman.svg'}
                                    alt="Profile"
                                />
                            )}
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">
                                {user?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'User'}
                            </span>
                            <span className="profile-role" style={{ textTransform: 'capitalize' }}>
                                {user?.role || 'Admin'}
                            </span>
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="dropdown-header">
                                <div className="dropdown-company">
                                    <span className="company-icon">🏢</span>
                                    <span className="company-name">{company?.name || 'Your Company'}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span>👤</span>
                                My Profile
                            </Link>
                            <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span>⚙️</span>
                                Settings
                            </Link>
                            <Link to="/company-settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span>🏢</span>
                                Company Settings
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <span>🚪</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span>{isMobileMenuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-search">
                        <input type="text" placeholder="Search..." />
                    </div>
                    <nav className="mobile-nav">
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📊</span> Dashboard
                        </Link>
                        <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📦</span> Products
                        </Link>
                        <Link to="/sales" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>💰</span> Sales
                        </Link>
                        <Link to="/salesmen" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>👥</span> Salesmen
                        </Link>
                        <Link to="/reports" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📈</span> Reports
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;