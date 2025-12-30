'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function StarterKitPage() {
    const includedItems = [
        { title: "Risikovurdering (ROS) Mal", desc: "Komplett mal for å vurdere risiko i klinikken, med eksempler på vanlige farer." },
        { title: "Databehandleravtale (DPA)", desc: "Juridisk kvalitetssikret avtale du trenger når du bruker eksterne systemer." },
        { title: "Personvernerklæring", desc: "Ferdig tekst til nettsiden din som forklarer hvordan du behandler pasientdata." },
        { title: "Avvikshåndterings-skjema", desc: "Enkelt system for å logge og følge opp feil og avvik i klinikken." },
        { title: "Kriseplan (Incident Response)", desc: "Hva gjør du hvis datamaskinen blir stjålet eller klinikken hacket? Her er oppskriften." },
        { title: "Opplæringslogg for ansatte", desc: "Dokumenter at alle ansatte har fått opplæring i personvern og sikkerhet." },
    ];

    return (
        <div className="starter-kit-page bg-gray-50 min-h-screen">
            {/* Navbar - Duplicated from Home for standalone page */}
            <nav className="navbar bg-white border-b border-gray-100">
                <div className="container">
                    <Link href="/" className="navbar-logo">
                        <Image src="/logo.png" alt="Secure Clinic" width={44} height={44} />
                        <span>Secure Clinic</span>
                    </Link>
                    <ul className="navbar-links">
                        <li><Link href="/#funksjoner">Funksjoner</Link></li>
                        <li><Link href="/demo">Se demo</Link></li>
                        <li><Link href="/startpakke" className="active">Startpakke</Link></li>
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
                    <div className="inline-block px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold mb-6">
                        Inkludert i alle abonnement 🎁
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Dokumentasjon er kjedelig. <br />
                        <span className="gradient-text">Vi har gjort jobben for deg.</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Når du starter med Secure Clinic, får du ikke bare et journalsystem.
                        Du får en komplett <strong>"Compliance-startpakke"</strong> som sparer deg for titusener av kroner i advokatutgifter.
                    </p>
                </div>
            </header>

            {/* Content List */}
            <section className="py-20">
                <div className="container max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {includedItems.map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                                        ✅
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed pl-14">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 bg-brand-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-10"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6">Klar til å få orden på systemet?</h2>
                            <p className="text-brand-100 mb-8 text-lg">
                                Alt dette ligger klart i din Secure Clinic-konto fra dag én.
                                Ingen ekstra kostnader.
                            </p>
                            <Link href="/#kontakt" className="inline-block px-8 py-4 bg-white text-brand-900 font-bold rounded-lg hover:bg-brand-50 transition-colors">
                                Få tilgang nå
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

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
