import React from 'react';


const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    icon,
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
        >
            {loading ? (
                <span className="btn-spinner"></span>
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;