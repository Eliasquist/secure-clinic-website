import type { Metadata } from "next";

export interface AccessStatus {
    type: 'INACTIVE' | 'TRIALING' | 'ACTIVE';
    label: string;
    daysRemaining?: number;
}

interface StatusBadgeProps {
    status: AccessStatus;
    onClick?: () => void;
}

export default function StatusBadge({ status, onClick }: StatusBadgeProps) {
    const getStyles = () => {
        switch (status.type) {
            case 'INACTIVE':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    border: 'border-gray-300',
                    dot: 'bg-gray-500'
                };
            case 'TRIALING':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    dot: 'bg-blue-500'
                };
            case 'ACTIVE':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    dot: 'bg-green-500'
                };
        }
    };

    const styles = getStyles();
    const displayLabel = status.daysRemaining
        ? `${status.label} (${status.daysRemaining} dager igjen)`
        : status.label;

    return (
        <button
            onClick={onClick}
            className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        border transition-all
        ${styles.bg} ${styles.text} ${styles.border}
        ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
      `}
        >
            <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
            {displayLabel}
        </button>
    );
}
