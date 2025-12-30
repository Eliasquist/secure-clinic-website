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
                    <h1 className="heading-1">
                        Enkelt å bytte. <br />
                        <span className="gradient-text">Enkelt å koble til.</span>
                    </h1>
                    <p className="lead">
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
                                Flyttehjelp
                            </div>
                            <h2 className="heading-2">Bytte fra gammelt system?</h2>
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
                                        <strong className="block text-gray-900">Sikker overføring & validering</strong>
                                        <span className="text-sm text-gray-500">Send via kryptert kanal. Vi validerer og lager testimport i preview før produksjonsimport.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">3</span>
                                    <div>
                                        <strong className="block text-gray-900">Vi importerer – du godkjenner</strong>
                                        <span className="text-sm text-gray-500">Du får import-rapport og godkjenner. Vi sletter midlertidige filer innen 7 dager.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">Vi støtter import fra:</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">PatientSky</div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">Helseboka</div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">EasyPractice</div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-100 text-center font-medium text-gray-600">Excel / CSV</div>
                            </div>

                            {/* Trust Blocks */}
                            <div className="mt-8 space-y-6">
                                {/* Hva får du med deg */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <h3 className="heading-3 mb-3">Hva får du med deg?</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Dette importeres:</p>
                                            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                                                <li>Pasientregister (navn, kontaktinfo, fødselsdato)</li>
                                                <li>Timehistorikk (dato, type, status, notater)</li>
                                                <li>Journalnotater og behandlingsplan</li>
                                                <li>Allergier, medisiner, og pasienthistorikk</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Dette avhenger av system:</p>
                                            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                                                <li>Bilder/vedlegg (støttes hvis format er tilgjengelig)</li>
                                                <li>Samtykker (importeres som PDF hvis tilgjengelig)</li>
                                                <li>Faktura/oppgjør (ofte ikke mulig å importere komplett)</li>
                                            </ul>
                                        </div>
                                        <div className="pt-2 text-sm text-gray-600">
                                            <span className="font-semibold text-gray-900">Import-rapport:</span> Du får alltid en rapport med antall pasienter, avtaler og notater – samt liste over eventuelle avvik for manuell oppfølging.
                                        </div>
                                    </div>
                                </div>

                                {/* Sikkerhet & etterlevelse */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <h3 className="heading-3 mb-3">Sikkerhet & etterlevelse</h3>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li><span className="font-semibold text-gray-900">Databehandleravtale (DPA):</span> signeres før import</li>
                                        <li><span className="font-semibold text-gray-900">Tilgang:</span> begrenset til autorisert import-team</li>
                                        <li><span className="font-semibold text-gray-900">Logging:</span> all aktivitet loggføres for etterprøvbarhet</li>
                                        <li><span className="font-semibold text-gray-900">Sletting:</span> opplastede filer slettes automatisk innen 7 dager</li>
                                    </ul>
                                </div>

                                {/* Deduplisering & parallellkjøring */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <h3 className="heading-3 mb-3">Deduplisering & byttedato</h3>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <p>
                                            <span className="font-semibold text-gray-900">Deduplisering:</span> Systemet foreslår treff basert på telefonnummer og navn. Du godkjenner alle sammenslåinger – ingen auto-merge uten kontroll.
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-900">Parallellkjøring:</span> Vi setter en byttedato sammen med deg. Gamle system kan brukes parallelt i en kort overgangsperiode om ønskelig.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Website Integration */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                {/* Direkte lenke */}
                                <div className="mb-8">
                                    <h3 className="text-slate-900 font-semibold mb-2 text-sm uppercase tracking-wider">Alternativ 1: Direkte Lenke</h3>
                                    <div className="relative">
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-sm text-slate-700 break-all">
                                            https://secure-clinic.com/book/din-klinikk
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-2">Perfekt for Instagram bio eller 'Bestill time'-knapp.</p>
                                </div>

                                {/* iFrame */}
                                <div className="mb-8">
                                    <h3 className="text-slate-900 font-semibold mb-2 text-sm uppercase tracking-wider">Alternativ 2: iFrame Widget</h3>
                                    <div className="relative">
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-sm text-slate-700 break-all overflow-x-auto">
                                            &lt;iframe src="https://secure-clinic.com/book/..." <br /> width="100%" height="600" /&gt;
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-2">Lim inn rett på nettsiden din (WordPress, Squarespace, Wix). Fungerer med HTTPS.</p>
                                </div>

                                {/* Bestillingsknapp */}
                                <div>
                                    <h3 className="text-slate-900 font-semibold mb-2 text-sm uppercase tracking-wider">Alternativ 3: Bestillingsknapp</h3>
                                    <div className="relative">
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-sm text-slate-700 break-all">
                                            &lt;a href="https://secure-clinic.com/book/din-klinikk" target="_blank"&gt;Bestill time&lt;/a&gt;
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-2">Enkel knapp som åpner booking i ny fane. Kan styles fritt.</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2">
                            <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold mb-4">
                                Integrasjon
                            </div>
                            <h2 className="heading-2">Koble til nettsiden din</h2>
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
                                    <Link href="/demo" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                        Se hvordan det ser ut <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Section 3: Technical Specs (DIY) */}
                <section className="mt-24 pt-16 border-t border-gray-100">
                    <div className="container max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-gray-900">For Utviklere & Tekniske</h2>
                            <p className="text-gray-500">Vil du gjøre migreringen selv? Vi bruker et standardisert JSON-format for import.</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 text-sm font-semibold text-gray-900">
                                migration_schema.json
                            </div>
                            <div className="p-6 bg-gray-50 overflow-x-auto">
                                <pre className="font-mono text-sm text-slate-700 leading-relaxed">
                                    {`{
  "source_system": "custom_export",
  "version": "1.0",
  "patients": [
    {
      "external_id": "1001",
      "first_name": "Ola",
      "last_name": "Nordmann",
      "phone": "+4790000000",
      "email": "ola@eksempel.no",
      "birth_date": "1990-01-01", 
      "address": {
        "street": "Storgata 1",
        "zip": "0150",
        "city": "Oslo"
      },
      "history": {
        "allergies": "None",
        "medications": "None"
      },
      "appointments": [
        {
          "date": "2023-12-01T10:00:00Z",
          "type": "CONSULTATION",
          "status": "COMPLETED",
          "notes": "Vurdering av sinnarynke."
        }
      ]
    }
  ]
}`}
                                </pre>
                            </div>
                            <div className="px-6 py-4 bg-white border-t border-gray-100">
                                <p className="text-xs text-gray-600">
                                    <strong className="text-gray-900">Merk:</strong> Sensitive data (som fødselsnummer) bør ikke inkluderes i klartekst uten avtale.
                                    Bruk vår Sikre Opplasting (i admin-panelet) for å sende denne filen, så håndterer vår importmotor kryptering og deduplisering.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-2">Optional fields</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    Schema støtter også: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">attachments[]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">consents[]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">practitioner_id</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">location_id</code>
                                </p>
                                <p className="text-xs text-gray-500">
                                    <strong>Merk:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">national_id</code> ikke tillatt uten signert DPA.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-2">Sikkerhet & integritet</h4>
                                <p className="text-sm text-gray-600">
                                    Alle importerte notater blir automatisk tidsstemplet og merket <strong>"Historisk Data"</strong>. De kan leses, men ikke endres, for å bevare integriteten.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="container">
                    <div className="footer-bottom text-center text-gray-400 text-sm">
                        <p>© 2025 Secure Clinic Journal. Laget i Norge.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
