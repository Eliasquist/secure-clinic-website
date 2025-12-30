import React from 'react';
import Link from 'next/link';

interface AppLinkProps {
    href: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'text';
    className?: string;
    external?: boolean;
}

/**
 * Standardized Link component
 * Prevents default anchor styling and ensures consistent link appearance
 */
export const AppLink: React.FC<AppLinkProps> = ({
    href,
    children,
    variant = 'text',
    className = '',
    external = false,
}) => {
    const baseClasses = variant === 'text'
        ? 'inline-flex items-center gap-2 text-gray-700 hover:text-teal-700 transition-colors font-medium'
        : 'btn';

    const variantClasses = variant === 'primary'
        ? 'btn-primary'
        : variant === 'secondary'
            ? 'btn-secondary'
            : '';

    const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

    if (external) {
        return (
            <a
                href={href}
                className={combinedClasses}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        );
    }

    return (
        <Link href={href} className={combinedClasses}>
            {children}
        </Link>
    );
};
