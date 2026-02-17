import React from 'react';

const StatsCard = ({ title, value, icon, trend, trendUp, color }) => {
    const colorClasses = {
        primary: 'stat-card primary',
        success: 'stat-card success',
        warning: 'stat-card warning',
        info: 'stat-card info',
    };

    return (
        <div className={colorClasses[color]}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <h3 className="stat-title">{title}</h3>
                <p className="stat-value">{value}</p>
                <div className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
                    <span>{trend}</span>
                    <span>{trendUp ? '↑' : '↓'}</span>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;