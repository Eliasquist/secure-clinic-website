"use client";

import Link from "next/link";

export default function ComingSoonPage({
    moduleName,
    description
}: {
    moduleName: string;
    description: string;
}) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
                        Kommer snart
                    </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {moduleName}
                </h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    {description}
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">På vei:</h3>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">→</span>
                            <span>Komplett pasientregister med søk og filtrering</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">→</span>
                            <span>Journalføring med injeksjonskart</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">→</span>
                            <span>Automatisk fakturering og oppgjør</span>
                        </li>
                    </ul>
                </div>

                <div className="flex gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Tilbake til dashboard
                    </Link>
                    <a
                        href="mailto:hei@secureclinic.no?subject=Interesse for ny modul"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Meld interesse
                    </a>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    Vil du være med å forme produktet? Kontakt oss!
                </p>
            </div>
        </div>
    );
}
