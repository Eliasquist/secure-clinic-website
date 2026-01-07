"use client";

import { useRouter } from "next/navigation";

interface OverviewCardProps {
    title: string;
    icon: React.ReactNode;
    status?: string;
    statusType?: 'inactive' | 'trial' | 'active' | 'info';
    description?: string;
    ctaLabel: string;
    ctaHref?: string;
    ctaDisabled?: boolean;
    metadata?: { label: string; value: string }[];
}

export default function OverviewCard({
    title,
    icon,
    status,
    statusType = 'info',
    description,
    ctaLabel,
    ctaHref,
    ctaDisabled,
    metadata
}: OverviewCardProps) {
    const router = useRouter();

    const getStatusStyles = () => {
        switch (statusType) {
            case 'inactive':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'trial':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'active':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const handleClick = () => {
        if (ctaHref && !ctaDisabled) {
            router.push(ctaHref);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        {status && (
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
                                {status}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-600 mb-4">{description}</p>
            )}

            {/* Metadata */}
            {metadata && metadata.length > 0 && (
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    {metadata.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-500">{item.label}</span>
                            <span className="font-medium text-gray-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            <button
                onClick={handleClick}
                disabled={ctaDisabled}
                className={`
          w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
          ${ctaDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
        `}
            >
                {ctaLabel}
            </button>
        </div>
    );
}
