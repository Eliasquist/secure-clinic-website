import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
    fullWidth?: boolean;
}

/**
 * Standardized Button component
 * Prevents styling leaks by providing consistent button styling across the app
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'btn';
    const variantClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    const widthClasses = fullWidth ? 'btn-full' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${widthClasses} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
};
