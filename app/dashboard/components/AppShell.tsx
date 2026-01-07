"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import StatusBadge, { type AccessStatus } from "./StatusBadge";

interface AppShellProps {
    children: React.ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    subscription?: {
        status: string;
        entitled: boolean;
        mode?: string;
        currentPeriodEnd?: string;
    };
}

export default function AppShell({ children, user, subscription }: AppShellProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Compute access status
    const getAccessStatus = (): AccessStatus => {
        if (!subscription || !subscription.entitled) {
            return {
                type: 'INACTIVE',
                label: 'Ingen tilgang'
            };
        }

        if (subscription.mode === 'TRIALING') {
            const daysRemaining = subscription.currentPeriodEnd
                ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : undefined;

            return {
                type: 'TRIALING',
                label: 'Prøveperiode',
                daysRemaining
            };
        }

        return {
            type: 'ACTIVE',
            label: 'Aktiv'
        };
    };

    const accessStatus = getAccessStatus();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', active: true },
        { name: 'Pasienter', href: '/dashboard/patients', comingSoon: true },
        { name: 'Konsultasjoner', href: '/dashboard/consultations', comingSoon: true },
        { name: 'Fakturering', href: '/dashboard/billing', comingSoon: true },
        { name: 'Eksporter', href: '/dashboard/exports', active: true },
        { name: 'Nedlastinger', href: '/dashboard/downloads', active: true },
        { name: 'Abonnement', href: '/dashboard/subscription', active: true },
    ];

    const handleSignOut = async () => {
        const { signOut } = await import("next-auth/react");
        signOut({ callbackUrl: "/" });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Logo */}
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Secure Clinic" width={36} height={36} className="rounded-lg" />
                            <span className="text-lg font-semibold text-gray-900">Secure Clinic</span>
                        </Link>

                        {/* Center: Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        {item.name}
                                        {item.comingSoon && (
                                            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded uppercase">
                                                Snart
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right: Status + User */}
                        <div className="flex items-center gap-4">
                            <StatusBadge
                                status={accessStatus}
                                onClick={() => router.push('/dashboard/subscription')}
                            />

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                {user?.image && (
                                    <img
                                        src={user.image}
                                        alt=""
                                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                                    />
                                )}
                                <div className="hidden md:block text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user?.name || user?.email}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                                    title="Logg ut"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                {children}
            </main>
        </div>
    );
}
