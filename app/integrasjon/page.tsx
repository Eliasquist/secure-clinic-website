'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function IntegrationPage() {
    return (
        <div className="integration-page bg-gray-50 min-h-screen">
            {/* Navbar */}
            <nav className="navbar bg-white border-b border-gray-100">
                <div className="container">
                    <Link href="/" className="navbar-logo">
                        <Image src="/logo.png" alt="Secure Clinic" width={44} height={44} />
                        <span>Secure Clinic</span>
                    </Link>
                    <ul className="navbar-links">
                        <li><Link href="/#funksjoner">Funksjoner</Link></li>
                        <li><Link href="/demo">Se demo</Link></li>
                        <li><Link href="/startpakke">Startpakke</Link></li>
                        <li><Link href="/integrasjon" className="active">Integrasjon</Link></li>
                        <li><Link href="/#kontakt">Kontakt</Link></li>
                    </ul>
                    <div className="navbar-cta">
                        <Link href="/demo" className="btn btn-secondary">Book en demo</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="pt-24 pb-16 bg-white border-b border-gray-100">
                <div className="container max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Enkelt å bytte. <br />
                        <span className="gradient-text">Enkelt å koble til.</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Vi vet at det tekniske kan virke skummelt. Derfor har vi gjort det lekende lett å flytte over til Secure Clinic, og å få bookingen ut til dine pasienter.
                    </p>
                </div>
            </header>

            <main className="py-20">
                <div className="container max-w-5xl space-y-24">

                    {/* Section 1: Migration */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
                                🔄 Flyttehjelp
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Bytte fra gammelt system?</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Frykter du å miste gamle journaler? Slapp av. Vi tilbyr gratis og sikker importering av din eksisterende pasientdatabase.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">1</span>
                                    <div>
                                        <strong className="block text-gray-900">Eksporter data</strong>
                                        <span className="text-sm text-gray-500">Last ned dine data fra ditt nåværende system (eller spør oss om hjelp).</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">2</span>
                                    <div>
                                        <strong className="block text-gray-900">Sikker overføring</strong>
                                        <span className="text-sm text-gray-500">Send filene via vår krypterte opplastingskanal.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">3</span>
                                    <div>
                                        <strong className="block text-gray-900">Vi fikser resten</strong>
                                        <span className="text-sm text-gray-500">Vi vasker, strukturerer og importerer alt til din nye Secure Clinic konto.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            </div>
                            <h3 className="text-lg font-bold mb-4">Vi støtter import fra:</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">PatientSky</div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">Helseboka</div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">EasyPractice</div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">Excel / CVS</div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Website Integration */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="bg-brand-900 p-8 rounded-2xl shadow-xl text-white">
                                <div className="mb-8">
                                    <h3 className="text-brand-100 font-semibold mb-2 text-sm uppercase tracking-wider">Alternativ 1: Direkte Lenke</h3>
                                    <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-brand-50 break-all border border-brand-700">
                                        https://secure-clinic.com/book/din-klinikk
                                    </div>
                                    <p className="text-brand-200 text-sm mt-2">Perfekt for Instagram bio eller 'Bestill time'-knapp.</p>
                                </div>

                                <div>
                                    <h3 className="text-brand-100 font-semibold mb-2 text-sm uppercase tracking-wider">Alternativ 2: Iframe Widget</h3>
                                    <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-brand-50 break-all border border-brand-700">
                                        &lt;iframe src="https://secure-clinic.com/book/..." <br /> width="100%" height="600" /&gt;
                                    </div>
                                    <p className="text-brand-200 text-sm mt-2">Lim inn rett på nettsiden din (Wordpress, Squarespace, etc).</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2">
                            <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold mb-4">
                                🔌 Integrasjon
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Koble til nettsiden din</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Du trenger ikke være utvikler for å få bookingsystemet på plass. Vi har gjort det så enkelt som mulig.
                            </p>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Ingen installasjon nødvendig</h3>
                                    <p className="text-gray-600 text-sm">Booking-siden lever "i skyen" hos oss. Du trenger bare å lenke til den.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Tilpasser seg ditt design</h3>
                                    <p className="text-gray-600 text-sm">Widgeten er nøytral og moderne, slik at den ser bra ut på nettsiden din uansett design.</p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/demo" className="text-brand-600 font-bold hover:underline flex items-center gap-1">
                                        Se hvordan det ser ut <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            {/* Footer */}
            <footer className="footer bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="container">
                    <div className="footer-bottom text-center text-gray-400 text-sm">
                        <p>© 2025 Secure Clinic Journal. Laget med 💚 i Norge.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
