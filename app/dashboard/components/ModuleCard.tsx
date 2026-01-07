"use client";

import Link from "next/link";

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    status: 'active' | 'coming-soon';
    gradient?: string;
}

export default function ModuleCard({
    title,
    description,
    icon,
    href,
    status,
    gradient = 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)'
}: ModuleCardProps) {
    return (
        <Link
            href={href}
            className="group block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
        >
            {/* Icon */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-teal-600"
                style={{ background: gradient }}
            >
                {icon}
            </div>

            {/* Content */}
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                {status === 'coming-soon' && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded uppercase">
                        Snart
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

            {/* Arrow indicator */}
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                <span>{status === 'active' ? 'Åpne' : 'Les mer'}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </Link>
    );
}
