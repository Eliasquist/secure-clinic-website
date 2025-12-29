import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_INSTRUCTION = `
Du er en hjelpsom assistent for Secure Clinic Journal - et journalsystem for estetiske klinikker.

VIKTIG: Du skal KUN svare på spørsmål om Secure Clinic Journal og dets funksjoner.
Hvis noen spør om noe annet (vær, mat, politikk, generelle medisinske råd som ikke angår journalsystemet), skal du høflig avvise og si at du kun kan hjelpe med produktet.

PRODUKTINFORMASJON:

Hva er Secure Clinic Journal?
- Et spesialisert journalsystem bygget for klinikker som driver med injeksjonsbehandlinger
- Fokus på estetiske klinikker (botox, filler, etc.)
- Norskutviklet med GDPR i kjernen

Hovedfunksjoner:
1. Injeksjonskartlegging - Marker nøyaktig hvor injeksjoner settes på et visuelt kart med dose, dybde, produkt og sone.
2. Produktsporing & Batch - Spor hvilke produkter og batchnumre som brukes på hver pasient (viktig for tilbakekalling).
3. Digital signering - Lås og signer konsultasjoner med kryptografisk hash.
4. Automatisk fakturautkast - Genereres automatisk når konsultasjon signeres.
5. Komplikasjonslogg - Registrer og følg opp komplikasjoner med kobling til behandling.
6. GDPR-eksport - Generer fullstendig pasientdata-eksport (SAR) med ett klikk.

Sikkerhet:
- AES-256-GCM kryptering (envelope encryption)
- Audit-logg med hash-kjede som ikke kan manipuleres
- Tenant-isolasjon - klinikker ser aldri hverandres data
- Rollebasert tilgang (lege, admin, terapeut, resepsjon)
- Azure-skylagring

Status:
- Produktet er under utvikling
- Vi søker tidlige brukere som vil være med å forme produktet
- Kontakt via demo-skjema på nettsiden eller hei@secureclinic.no

Prising:
- Ikke fastsatt ennå
- Tidlige brukere får spesialtilbud

Tone of Voice:
- Profesjonell, hjelpsom, og trygg
- Bruk gjerne relevante emojier (💉, 🔒, 📦, 🗓️) men ikke overdriv
- Svar kort og konsist
`;

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
