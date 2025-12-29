"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

// Product knowledge base - the chatbot only knows about this
const PRODUCT_KNOWLEDGE = `
Du er en hjelpsom assistent for Secure Clinic Journal - et journalsystem for estetiske klinikker.

VIKTIG: Du skal KUN svare på spørsmål om Secure Clinic Journal og dets funksjoner. 
Hvis noen spør om noe annet, si høflig at du kun kan hjelpe med spørsmål om produktet.

PRODUKTINFORMASJON:

Hva er Secure Clinic Journal?
- Et spesialisert journalsystem bygget for klinikker som driver med injeksjonsbehandlinger
- Fokus på estetiske klinikker (botox, filler, etc.)
- Norskutviklet med GDPR i kjernen

Hovedfunksjoner:
1. Injeksjonskartlegging - Marker nøyaktig hvor injeksjoner settes på et visuelt kart med dose, dybde, produkt og sone
2. Produktsporing & Batch - Spor hvilke produkter og batchnumre som brukes på hver pasient (viktig for tilbakekalling)
3. Digital signering - Lås og signer konsultasjoner med kryptografisk hash
4. Automatisk fakturautkast - Genereres automatisk når konsultasjon signeres
5. Komplikasjonslogg - Registrer og følg opp komplikasjoner med kobling til behandling
6. GDPR-eksport - Generer fullstendig pasientdata-eksport (SAR) med ett klikk

Sikkerhet:
- AES-256-GCM kryptering (envelope encryption)
- Audit-logg med hash-kjede som ikke kan manipuleres
- Tenant-isolasjon - klinikker ser aldri hverandres data
- Rollebasert tilgang (lege, admin, terapeut, resepsjon)
- Azure-skylagring

Status:
- Produktet er under utvikling
- Vi søker tidlige brukere som vil være med å forme produktet
- Kontakt via demo-skjema på nettsiden

Prising:
- Ikke fastsatt ennå
- Tidlige brukere får spesialtilbud

Kontakt:
- E-post: hei@secureclinic.no
- Book en demo via skjemaet på nettsiden
`;

// Simple response generator based on keywords
function generateResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    // Off-topic detection
    const offTopicKeywords = [
        "vær", "mat", "sport", "politikk", "nyheter", "film", "musikk",
        "oppskrift", "reise", "fly", "hotell", "bil", "investering",
        "aksjer", "krypto", "bitcoin", "dating", "forhold", "medisin",
        "diagnose", "behandling av", "symptomer", "sykdom"
    ];

    if (offTopicKeywords.some(keyword => msg.includes(keyword))) {
        return "Jeg er spesialisert på Secure Clinic Journal og kan dessverre ikke hjelpe med det spørsmålet. Er det noe du lurer på om journalsystemet vårt? 😊";
    }

    // Product-specific responses
    if (msg.includes("pris") || msg.includes("kost") || msg.includes("betale")) {
        return "Prisingen er ikke fastsatt ennå siden vi fortsatt er i utviklingsfasen. Tidlige brukere vil få spesialtilbud! Book en demo så kan vi diskutere hva som passer for din klinikk. 💰";
    }

    if (msg.includes("injeksjon") || msg.includes("kart") || msg.includes("botox") || msg.includes("filler")) {
        return "Injeksjonskartlegging er en av kjernefunksjonene våre! 💉 Du kan markere nøyaktig hvor du setter injeksjoner på et visuelt ansiktskart, med dose, dybde, produkt og sone. Alt dokumenteres automatisk i journalen.";
    }

    if (msg.includes("sikker") || msg.includes("krypter") || msg.includes("gdpr") || msg.includes("personvern")) {
        return "Sikkerhet er bygget inn fra bunnen! 🔒 Vi bruker AES-256-GCM envelope encryption, audit-logger med hash-kjede som ikke kan manipuleres, og full tenant-isolasjon mellom klinikker. GDPR-verktøy som SAR-eksport og anonymisering er innebygd.";
    }

    if (msg.includes("batch") || msg.includes("produkt") || msg.includes("spor")) {
        return "Produktsporing er viktig for estetiske klinikker! 📦 Du kan registrere batchnummer for hvert produkt som brukes, noe som er kritisk ved eventuelle tilbakekallinger eller komplikasjonsoppfølging.";
    }

    if (msg.includes("faktura") || msg.includes("betaling") || msg.includes("økonomi")) {
        return "Når en konsultasjon signeres, genereres et fakturautkast automatisk basert på behandlingen som er utført. 💰 Du slipper å føre alt manuelt!";
    }

    if (msg.includes("demo") || msg.includes("prøve") || msg.includes("test")) {
        return "Vil du se produktet i aksjon? 🎯 Klikk på 'Book en demo' knappen øverst på siden, så tar vi kontakt for å avtale en uforpliktende gjennomgang!";
    }

    if (msg.includes("kontakt") || msg.includes("epost") || msg.includes("telefon")) {
        return "Du kan nå oss på hei@secureclinic.no 📧 eller bruke demo-skjemaet på nettsiden. Vi svarer vanligvis innen én virkedag!";
    }

    if (msg.includes("komplikasjon")) {
        return "Komplikasjonslogging lar deg registrere og følge opp uønskede hendelser ⚠️ med direkte kobling til den opprinnelige behandlingen og relevante bilder. Viktig for både pasientoppfølging og kvalitetssikring.";
    }

    if (msg.includes("hei") || msg.includes("hallo") || msg.includes("heisann")) {
        return "Hei! 👋 Jeg er her for å svare på spørsmål om Secure Clinic Journal. Hva lurer du på?";
    }

    if (msg.includes("hvem") || msg.includes("hva er")) {
        return "Secure Clinic Journal er et spesialisert journalsystem bygget for estetiske klinikker som driver med injeksjonsbehandlinger. 💉 Vi fokuserer på injeksjonskartlegging, produktsporing, GDPR-compliance og automatisk fakturering. Hva vil du vite mer om?";
    }

    if (msg.includes("takk")) {
        return "Bare hyggelig! 😊 Er det noe mer du lurer på om Secure Clinic Journal?";
    }

    // Default response
    return "Bra spørsmål! Secure Clinic Journal er bygget spesielt for estetiske klinikker med injeksjonsbehandlinger. Vi har injeksjonskartlegging, produktsporing, digital signering, og innebygd GDPR. Er det noe spesifikt du vil vite mer om? 🎯";
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hei! 👋 Jeg er her for å svare på spørsmål om Secure Clinic Journal. Hva kan jeg hjelpe deg med?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        // Simulate typing
        setIsTyping(true);

        // Simulate response delay
        setTimeout(() => {
            const response = generateResponse(userMessage);
            setMessages((prev) => [...prev, { role: "assistant", content: response }]);
            setIsTyping(false);
        }, 800 + Math.random() * 700);
    };

    return (
        <>
            {/* Chat Button */}
            <button
                className="chat-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Lukk chat" : "Åpne chat"}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">🤖</div>
                            <div>
                                <div className="chat-title">Produktassistent</div>
                                <div className="chat-status">Online</div>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-message assistant typing">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Spør om produktet..."
                            className="chat-input"
                        />
                        <button type="submit" className="chat-send" disabled={!input.trim()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
