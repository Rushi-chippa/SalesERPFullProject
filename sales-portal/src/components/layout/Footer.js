import React from 'react';
import './Layout.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <span className="footer-logo">🏢 SalesPortal</span>
                    <span className="footer-copyright">
                        © {currentYear} All Rights Reserved
                    </span>
                </div>

                <div className="footer-center">
                    <span className="footer-version">Version 1.0.0</span>
                </div>

                <div className="footer-right">
                    <a href="/privacy" className="footer-link">Privacy Policy</a>
                    <span className="footer-divider">|</span>
                    <a href="/terms" className="footer-link">Terms of Service</a>
                    <span className="footer-divider">|</span>
                    <a href="/contact" className="footer-link">Contact Us</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;