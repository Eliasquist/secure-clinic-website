import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// CRITICAL: Hard-stop TLS bypass in production (throws error if misconfigured)
if (process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_TLS === "true") {
    throw new Error("FATAL: ALLOW_INSECURE_TLS must NEVER be enabled in production.");
}

// Safe local development TLS bypass (explicit opt-in required)
if (process.env.NODE_ENV !== "production" && process.env.ALLOW_INSECURE_TLS === "true") {
    console.warn("⚠️ TLS verification disabled for local development only");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Output compliance filter - programmatic enforcement of legal guardrails
const FORBIDDEN_PATTERNS = [
    // Absolute guarantees
    /\b(100%|hundre prosent)\s*(oppetid|uptime|tilgjengelighet|sikker|trygg)\b/i,
    /\b(null|ingen|0|zero)\s*(risiko|sjanse|fare)\b/i,
    /\bgaranter(er|t|ere|i)\b/i,
    /\bvi kan garantere\b/i,

    // Vague "best in class" claims
    /\bbank-?nivå\b/i,
    /\bstrengest(e)?\s*mulig(e)?\b/i,
    /\bbeste\s*i\s*bransjen\b/i,
    /\benterprise-grade\b/i,
    /\bmilitary-grade\b/i,
    /\bfinanssektor-standard\b/i,

    // Near-absolute claims (easy workarounds)
    /\bnesten\s*umulig\b/i,
    /\bså\s*godt\s*som\s*(null|ingen|umulig)\b/i,
    /\bpraktisk\s*talt\s*(garantert|umulig|null)\b/i,
    /\baldri\s*(bli\s*)?(hacket|kompromittert)\b/i,

    // Uptime SLAs without disclaimer
    /\b99\.9+%\s*(oppetid|uptime)\b/i,

    // Operational promises we can't keep
    /\bumiddelbar(t)?\s*(failover|gjenoppretting|respons)\b/i,
    /\b24\/7\s*(support|incident response|overvåkning)\b/i,

    // Financial promises
    /\bkompensere\s*(tap|skade)\b/i,
    /\berstat(te|ning)\s*(tap|skade)\b/i,
];

// Safe answer template - provides useful guidance while staying compliant
function safeComplianceAnswer(userMessage: string): string {
    return [
        "Jeg kan ikke love null risiko, 100% oppetid, eller gi garantier.",
        "Jeg kan derimot beskrive sikkerhetstiltakene vi har implementert, og hva som følger av avtaleverk.",
        "",
        "**Hvis spørsmålet gjelder:**",
        "- **Oppetid/Tilgjengelighet:** Dette reguleres i SLA/Tjenesteavtale.",
        "- **Support:** Supportnivå avhenger av valgt plan.",
        "- **Ansvar ved avvik:** Roller og ansvar følger DPA (GDPR art. 28).",
        "- **Migrering:** Krever foranalyse og skriftlig avtalt scope.",
        "",
        "Hva gjelder spørsmålet ditt konkret? (sikkerhetstiltak, oppetid, support, eller migrering?)",
    ].join("\n");
}

// Negation allowlist - don't trigger on correct disclaimers
const NEGATED_GUARANTEE = /\b(kan\s+ikke|ingen\s+leverandør\s+kan)\s+garantere\b/i;

function enforceCompliance(text: string, userMessage: string): string {
    // Don't trigger on correct disclaimers ("kan ikke garantere")
    if (!NEGATED_GUARANTEE.test(text)) {
        // Check if response contains forbidden patterns
        const violation = FORBIDDEN_PATTERNS.find((pattern) => pattern.test(text));

        if (violation) {
            console.warn("⚠️ Compliance filter triggered:", violation.toString());
            return safeComplianceAnswer(userMessage);
        }
    }

    // Length cap - prevent excessively long responses
    const MAX_RESPONSE_LENGTH = 2000;
    if (text.length > MAX_RESPONSE_LENGTH) {
        const truncated = text.slice(0, MAX_RESPONSE_LENGTH - 100);
        return truncated + "\n\n...\n\n*For mer detaljert informasjon, se avtaleverk og dokumentasjon.*";
    }

    return text;
}

// History sanitization - prevent prompt injection and abuse
// Supports both assistant/model roles and both parts/content formats
function sanitizeHistory(history: any[]): any[] {
    if (!Array.isArray(history)) return [];

    return history
        // Only allow user/model/assistant roles (block system injection)
        .filter((m: any) =>
            m &&
            typeof m === "object" &&
            (m.role === "user" || m.role === "model" || m.role === "assistant")
        )
        // Limit to last 10 messages (prevent context abuse)
        .slice(-10)
        // Normalize to Gemini format and cap message length
        .map((m: any) => {
            // Map assistant -> model for Gemini API compatibility
            const role = m.role === "assistant" ? "model" : m.role;

            // Support both parts format and content format
            const text =
                typeof m.parts?.[0]?.text === "string" ? m.parts[0].text :
                    typeof m.content === "string" ? m.content :
                        "";

            return {
                role,
                parts: [{ text: text.slice(0, 4000) }]
            };
        });
}

// Basic rate limiting state (in-memory)
// ⚠️ CRITICAL WARNING: This is NOT production-ready for serverless/multi-instance deployments
// Each instance has its own Map, cold starts reset counters, and "unknown" IP groups all users
// 
// BEFORE PRODUCTION DEPLOYMENT:
// - Migrate to Redis/Upstash for distributed rate limiting, OR
// - Use Vercel Edge Middleware rate limiting
// 
// This implementation is suitable ONLY for development and single-instance testing
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetAt) {
        rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

// Topic gate - block off-topic requests (especially medical advice)
// This is critical since we're in healthcare domain
const OFFTOPIC_MEDICAL_KEYWORDS = [
    /\b(symptom|diagnose|behandling|medisin|sykdom|smerte|allergi|bivirkn)\w*/i,
    /\bhva\s+(er|betyr|gjør|kan)\s+(jeg|man)\s+(hvis|når|med)\b/i,
    /\b(hodepine|kvalme|feber|utslett|infeksjon)\b/i,
];

function isOffTopicMedical(message: string): boolean {
    // Check for medical advice requests
    return OFFTOPIC_MEDICAL_KEYWORDS.some((pattern) => pattern.test(message));
}

function validateInput(message: string): { valid: boolean; error?: string } {
    // Hard cap on message size (prevent prompt injection and cost abuse)
    const MAX_MESSAGE_LENGTH = 2000;

    if (message.length > MAX_MESSAGE_LENGTH) {
        return {
            valid: false,
            error: `Meldingen er for lang (maks ${MAX_MESSAGE_LENGTH} tegn)`
        };
    }

    return { valid: true };
}

// Timeout wrapper - prevents hanging requests
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

// Soft circuit breaker - fail fast during high error rate
// Note: This is in-memory per instance, but provides basic protection
let circuitOpenUntil = 0;

function isCircuitOpen(): boolean {
    return Date.now() < circuitOpenUntil;
}

function openCircuitFor(ms: number): void {
    circuitOpenUntil = Date.now() + ms;
    console.warn(`⚠️ Circuit breaker opened for ${ms}ms`);
}

// Turnstile verification - bot protection
async function verifyTurnstile(token: string, ip?: string): Promise<{ ok: boolean; error?: string }> {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
        // If Turnstile is not configured, allow through
        // This prevents breaking the app if Turnstile is optional
        return { ok: true };
    }

    try {
        const formData = new FormData();
        formData.append("secret", secret);
        formData.append("response", token);
        if (ip) formData.append("remoteip", ip);

        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (!data.success) {
            console.warn("Turnstile verification failed:", data);
            return { ok: false, error: "Bot verification failed" };
        }

        return { ok: true };
    } catch (error) {
        console.error("Turnstile verification error:", error);
        // Fail open if Turnstile service is down
        return { ok: true };
    }
}

const SYSTEM_INSTRUCTION = `
Du er en hjelpsom, profesjonell produktekspert for **Secure Clinic Journal** - et journalsystem spesielt utviklet for estetiske klinikker i Norge.
Din oppgave er å svare på spørsmål om produktet, sikkerheten, og funksjonaliteten med presisjon og ærlighet.

**VIKTIG:**
- Du skal KUN svare på spørsmål om Secure Clinic Journal.
- Hvis spørsmålet er off-topic (vær, sport, generelle medisinske råd), avvis høflig.
- Vær ærlig, profesjonell og defensiv i tonen.

**COMPLIANCE GUARDRAILS (KRITISK - ALDRI BRYT DISSE):**
- ALDRI lov "0 risiko", "100% oppetid", "garantert sikkerhet"
- ALDRI bruk "bank-nivå", "strengeste mulig", "beste i bransjen" uten å kvalifisere
- ALDRI lov konkret migrering uten "etter avtale og foranalyse"
- ALDRI lov 24/7 support, umiddelbar failover, eller incident response uten å si "avhenger av plan/SLA"
- ALLTID presiser rolle: Vi leverer produkt. Kunden drifter sin organisasjon.
- ALLTID si "se avtaleverk" når du blir spurt om ansvar, SLA, eller garanti

---

### **PRODUKTOVERSIKT**
**Secure Clinic Journal** er et moderen journalsystem for klinikker som driver med injeksjonsbehandlinger (Botox, fillers, etc.). Det skiller seg fra generiske systemer ved å ha spesialiserte verktøy for nettopp denne bransjen, bygget med "Privacy by Design".

### **NØKKELFUNKSJONER (USP)**
1.  **Injeksjonskartlegging (Killer Feature):**
    - Visuell markering på ansiktskart (ikke bare tekst).
    - Dokumenterer nøyaktig dose, dybde, produkt og sone.
    - Automatisk sporing av total mengde virkestoff.

2.  **Produkt- & Batch-sporing:**
    - Dedikert felt for batchnummer (kritisk for pasientsikkerhet).
    - Gjør det enkelt å kontakte pasienter ved evt. tilbakekalling av produkter.

3.  **Digital Signering & Låsing:**
    - Konsultasjoner "låses" med en kryptografisk hash etter signering.
    - Ingen kan endre journalen i ettertid uten at "hash-kjeden" brytes (bevisbar integritet).

4.  **GDPR & Innsyn (SAR):**
    - Ett-klikks eksport av all data om en pasient (Right of Access).
    - Støtter "Right to be Forgotten" (anonymisering) og behandlingsrestriksjon.

5.  **Automatisk Fakturautkast:**
    - Fakturagrunnlag genereres automatisk basert på behandlingene i journalen.
    - Integreres mot regnskap (fremtidig funksjon).

---

### **BRUKERGUIDE (Slik fungerer appen)**

**1. Starte en ny konsultasjon:**
- Klikk på "Ny Konsultasjon" fra pasientkortet.
- Velg type: **Konsultasjon**, **Behandling**, eller **Kontroll**.
- Bekreft at samtykke er innhentet (påkrevd for behandling).
- Dette oppretter et "Utkast" som du kan jobbe videre med.

**2. Bruke Injeksjonskartet (FaceMap):**
- I editoren ser du et ansiktskart til venstre.
- **Klikk hvor som helst** på ansiktet for å markere et injeksjonspunkt.
- Et vindu åpnes der du velger: **Produkt** (f.eks. Botox, Juvederm), **Dose** (mengde), og **Dybde**.
- Punktet lagres og vises i listen til høyre.
- Du kan filtrere visningen mellom "Alle", "Muskler" (Botox) og "Volum" (Fillers) ved å bruke knappene over kartet.

**3. Journalføring:**
- Til høyre fyller du inn fritekst i feltene:
  - **Anamnese & Vurdering:** Pasientens helse, ønsker og din vurdering.
  - **Behandlingsdetaljer:** Hva som ble gjort, hudreaksjon, etc.
  - **Ettervernråd:** Råd gitt til pasient (f.eks. "unngå trening i 24t").
  - **Plan:** Neste kontroll eller behandling.

**4. Signering & Låsing (Viktig!):**
- Når du er ferdig, klikk på den grønne knappen **"Signer & Lås Journal"**.
- Dette "fryser" journalen kryptografisk.
- Etter signering kan journalen ikke endres. Hvis du må endre noe, må du låse den opp (dette loggføres som et avvik i audit-loggen).
- En signerings-hash (SHA-256) genereres og sikrer integriteten.

**5. Bilder:**
- Du kan laste opp før/etter bilder direkte i journalen ved å klikke på kamera-ikonet.

---

### **DATA IMPORT & MIGRERING**
Vi forstår at bytte av journalsystem er krevende. Derfor tilbyr vi:

*   **Assistert migrering (etter avtale):** Vi kan bistå med import fra eksisterende systemer, men løsning og pris avhenger av hva som kan eksporteres lovlig fra dagens leverandør.
*   **Prosess:**
    1. **Foranalyse:** Vi vurderer eksportformat og datakvalitet fra ditt nåværende system.
    2. **Avtale scope:** Vi bekrefter hva som er mulig å migrere, mapping-behov og tidsestimat.
    3. **Testimport:** Vi kjører en kontrollert test før produksjonssetting.
    4. **Produksjonssetting:** Import etter avtalt tidspunkt.
*   **Viktig:** Kunden er ansvarlig for lovlig eksport fra gammelt system og godkjenning av importert data.
*   **Pris:** Timebasis eller fastpris etter omfang. Kontakt salg for tilbud.

---

### **SIKKERHET & PERSONVERN**

**VIKTIG DISCLAIMER:**
Ingen leverandør kan garantere null risiko eller 100% oppetid. Vi har implementert dokumenterte sikkerhetstiltak, men oppetid, support og eventuelle kompensasjonsregler følger tjenesteavtalen.

**Implementerte sikkerhetstiltak:**

1.  **Kryptering:**
    - **In Transit:** TLS 1.2+ for all kommunikasjon.
    - **At Rest:** Database og lagring kryptert med AES-256.
    - **Column Level:** Sensitive felt (f.eks. fødselsnummer) krypteres individuelt med unike nøkler i Azure Key Vault.

2.  **Integritet:**
    - **Hash-kjede:** Hver signert journal får en kryptografisk hash. Endringer bryter kjeden og logges.
    - **Audit logging:** All tilgang og endringer logges for sporbarhet.

3.  **Tilgang & Isolering:**
    - **Tenant Isolation:** Logisk separasjon mellom klinikker på database- og applikasjonsnivå.
    - **RBAC:** Rollebasert tilgangskontroll (Lege, Terapeut, Resepsjon, Admin).
    - **MFA:** Støttes og anbefales. Kan håndheves via kundens identitetspolicy.

4.  **Compliance:**
    - Tiltak er basert på Normen (informasjonssikkerhet i helsesektoren) og OWASP beste praksis.
    - Primær lagring og behandling er konfigurert til Norge/EØS (Azure Norway East).
    - Underleverandører og eventuelle overføringsgrunnlag fremgår av databehandleravtalen (DPA).

5.  **Compliance-pakke (inkludert):**
    - Kunder får tilgang til dokumentmaler:
        - Risikovurdering (ROS) mal
        - Databehandleravtale (DPA)
        - Personvernerklæring
        - Avviksskjema
    - Disse må tilpasses kundens organisasjon.

**Roller og ansvar:**
- **Leverandør (databehandler):** Leverer produkt, dokumentasjon, sikkerhetstiltak i produktet, overvåkning og varslingsprosedyre ved hendelser i leverandørens system.
- **Kunde (behandlingsansvarlig):** Ansvarlig for tilgang, opplæring, internkontroll, varsling til Datatilsynet/pasienter, og egen organisatorisk sikkerhet.

---

### **VANLIGE SPØRSMÅL (FAQ)**

*   **"Kan dere garantere null risiko eller null nedetid?"**
    *   Nei, ingen leverandør kan det. Vi har implementert sikkerhetstiltak og overvåkning, men oppetid og support følger tjenesteavtalen. Vi anbefaler at kunden etablerer egne organisatoriske tiltak (MFA-policy, opplæring, beredskapsplan).

*   **"Er data alltid i Norge?"**
    *   Primær lagring og behandling er konfigurert til Norge/EØS. Eventuelle underleverandører (f.eks. for e-post, SMS, telemetri) og overføringsgrunnlag fremgår av databehandleravtalen.

*   **"Hvem varsler Datatilsynet hvis noe skjer?"**
    *   Klinikken (behandlingsansvarlig) varsler. Vi (databehandler) varsler kunden uten ugrunnet opphold ved hendelser i vårt system og bistår med teknisk informasjon.

*   **"Krever dere MFA?"**
    *   MFA støttes and anbefales sterkt. Det kan håndheves via kundens identitetspolicy. For administrative roller anbefaler vi alltid MFA.

*   **"Hva skjer hvis internett faller ut?"**
    *   Desktop-klienten (Tauri) har robust feilhåndtering for midlertidig nettutfall, men data må synkroniseres når tilkoblingen er tilbake.

*   **"Hvordan eksporterer jeg pasientdata (GDPR/SAR)?"**
    *   Gå til pasientkortet → Klikk "Eksporter (GDPR/SAR)". Du får en PDF eller ZIP med all data.

---

**Tone of Voice:**
- Ærlig, profesjonell og defensiv (ikke overselgende).
- Bruk "vi har implementert" i stedet for "vi garanterer".
- Bruk "følger avtaleverk" når du blir spurt om ansvar/SLA.
- Bruk punktlister for lesbarhet.
- Unngå emojier i profesjonell B2B-kommunikasjon.
`;

export async function POST(req: Request) {
    try {
        // Rate limiting (basic IP-based, 20 req/min)
        // Parse x-forwarded-for correctly (take first IP in comma-separated list)
        const xff = req.headers.get("x-forwarded-for");
        const ip = (xff ? xff.split(",")[0].trim() : null)
            || req.headers.get("x-real-ip")
            || "unknown";

        if (!checkRateLimit(ip, 20, 60000)) {
            return NextResponse.json(
                { error: "For mange forespørsler. Vennligst vent litt før du prøver igjen." },
                { status: 429 }
            );
        }

        const { message, history } = await req.json();

        // Validate input size (hard cap at 2000 chars)
        const validation = validateInput(message);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Basic input validation
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json(
                { error: "Ugyldig melding" },
                { status: 400 }
            );
        }

        // Topic gate: block medical advice requests
        if (isOffTopicMedical(message)) {
            return NextResponse.json({
                response: "Jeg kan ikke gi medisinske råd eller svare på helsespørsmål. " +
                    "Jeg kan kun svare på spørsmål om Secure Clinic Journal som produkt. " +
                    "For medisinske spørsmål, vennligst kontakt en lege eller helsepersonell."
            });
        }

        // Circuit breaker: fail fast if system is under stress
        if (isCircuitOpen()) {
            return NextResponse.json(
                { error: "Tjenesten er midlertidig utilgjengelig. Prøv igjen om litt." },
                { status: 503 }
            );
        }

        // Turnstile verification (if enabled)
        const { turnstileToken } = await req.json();
        if (process.env.TURNSTILE_ENABLED === "true") {
            if (!turnstileToken) {
                return NextResponse.json(
                    { error: "Bot verification required" },
                    { status: 403 }
                );
            }

            const verification = await verifyTurnstile(turnstileToken, ip);
            if (!verification.ok) {
                return NextResponse.json(
                    { error: verification.error || "Bot verification failed" },
                    { status: 403 }
                );
            }
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY not configured");
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // Sanitize history to prevent prompt injection
        const sanitizedHistory = sanitizeHistory(history || []);

        const chat = model.startChat({
            history: sanitizedHistory,
        });

        // Wrap Gemini call with timeout (8 seconds)
        const GEMINI_TIMEOUT_MS = 8000;
        const result = await withTimeout(
            chat.sendMessage(message),
            GEMINI_TIMEOUT_MS
        );
        const responseRaw = result.response.text();

        // Apply compliance filter before returning
        const response = enforceCompliance(responseRaw, message);

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat API Error:", error);

        // Open circuit breaker for 30 seconds on timeout or Gemini errors
        if (error instanceof Error && (
            error.message === "TIMEOUT" ||
            error.message.includes("429") ||
            error.message.includes("503")
        )) {
            openCircuitFor(30000); // 30 seconds cooldown
        }

        // Don't expose internal errors to client
        return NextResponse.json(
            { error: "En feil oppstod. Vennligst prøv igjen senere." },
            { status: 500 }
        );
    }
}
