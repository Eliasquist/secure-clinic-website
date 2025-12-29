# Secure Clinic Website - Production Chatbot

AI-powered chatbot for Secure Clinic Journal product information on Vercel.

## 🚨 REQUIRED: Production Deployment Checklist

Complete ALL steps below before deploying to production:

---

### 1. Vercel KV Setup (Rate Limiting)

**Status:** ⚠️ REQUIRED

The Edge middleware uses Vercel KV for distributed rate limiting.

#### Steps:
1. In Vercel Dashboard: **Storage → KV → Create**
2. Connect KV to your project
3. Vercel automatically adds these env vars:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

#### Testing:
```bash
# Test middleware (should rate limit after 20 requests/min)
for i in {1..25}; do curl http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"test"}'; done
```

Expected: First 20 succeed, rest return 429

---

### 2. Cloudflare Turnstile Setup (Bot Protection)

**Status:** ⚠️ HIGHLY RECOMMENDED (anonymous chat)

Turnstile prevents bot spam on anonymous chat.

#### Steps:
1. Go to https://dash.cloudflare.com
2. **Turnstile → Add Site**
3. Set domain (or use "localhost" for testing)
4. Copy:
   - **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret Key** → `TURNSTILE_SECRET_KEY`

#### Add to Vercel:
```bash
# In Vercel Dashboard → Settings → Environment Variables:
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
TURNSTILE_ENABLED=true
```

#### Testing:
```bash
# Without token (should fail if TURNSTILE_ENABLED=true)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Should return 403: Bot verification required
```

---

### 3. Gemini API Quota & Budget

**Status:** ⚠️ CRITICAL (cost control)

Set hard limits on Gemini API usage to prevent cost runaway.

#### Steps:
1. Go to Google Cloud Console or AI Studio
2. Navigate to your API key settings
3. Set quotas:
   - **Requests per day:** 10,000 (adjust to your needs)
   - **Requests per minute:** 60
   - **Tokens per day:** 1,000,000 (if available)

4. Set up billing alerts:
   - Google Cloud Console → Billing → Budgets & Alerts
   - Create budget alerts at 50%, 75%, 90%, 100%

#### Add .env.local:
```bash
GEMINI_API_KEY=your_api_key_here
```

---

### 4. Environment Variables Summary

Required for production:

```bash
# Gemini (REQUIRED)
GEMINI_API_KEY=...

# Vercel KV (REQUIRED - auto-added by Vercel)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# Turnstile (RECOMMENDED for anonymous chat)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
TURNSTILE_ENABLED=true

# Development only
ALLOW_INSECURE_TLS=false  # NEVER set to true in production
```

---

## 🏗️ Architecture Overview

### Layer 1: Edge Middleware (Vercel Edge)
- **File:** `middleware.ts`
- **Purpose:** Volume control  before serverless function
- **Rate Limit:** 20 requests/min per IP
- **Storage:** Vercel KV (distributed, survives cold starts)
- **Response:** 429 if exceeded

### Layer 2: Turnstile Verification (Optional)
- **File:** `app/components/TurnstileWidget.tsx` + `/api/chat/route.ts`
- **Purpose:** Bot detection
- **Flow:** Frontend → Cloudflare → Backend verification
- **Response:** 403 if failed

### Layer 3: Circuit Breaker & Timeout
- **File:** `/api/chat/route.ts`
- **Purpose:** Fail fast during high load
- **Timeout:** 8 seconds per Gemini request
- **Circuit:** Opens for 30s after timeout/429/503
- **Response:** 503 when circuit open

### Layer 4: Compliance Filter
- **File:** `/api/chat/route.ts`
- **Purpose:** Legal/compliance safety
- **Filters:** 30+ forbidden patterns
- **Features:** Negation allowlist, topic gate, input caps

---

## 🧪 Testing

### Test Rate Limiting (Edge)
```bash
# Should hit 429 after 20 requests
for i in {1..25}; do 
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
done
```

### Test Timeout & Circuit Breaker
```bash
# Simulate slow response (if you can mock Gemini delay)
# Circuit should open after timeout
```

### Test Turnstile
```bash
# Without token (should fail if enabled)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### Test Topic Gate
```bash
# Medical advice (should be blocked)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Jeg har hodepine"}'
```

### Test Input Validation
```bash
# Message too long (>2000 chars)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$(python3 -c 'print(\"A\" * 3000)')\"}"
```

---

## 📊 Monitoring & Incidents

### Expected Responses

| Scenario | Status | Response |
|----------|--------|----------|
| Normal request | 200 | JSON with chatbot response |
| Rate limit (Edge) | 429 | "For mange forespørsler..." |
| Bot detection fail | 403 | "Bot verification failed" |
| Circuit open | 503 | "Tjenesten er midlertidig utilgjengelig..." |
| Medical advice | 200 | "Jeg kan ikke gi medisinske råd..." |
| Message too long | 400 | "Meldingen er for lang..." |
| Timeout/error | 500 | "En feil oppstod..." |

### Circuit Breaker Behavior
- **Trigger:** Gemini timeout (>8s), 429, or 503 errors
- **Cooldown:** 30 seconds
- **Effect:** Returns 503 without calling Gemini
- **Reset:** Automatic after cooldown

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repo to Vercel
2. Add environment variables (see section 4)
3. Deploy:
   ```bash
   git push origin main
   ```

### Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain (e.g., `secureclinicjournal.no`)
3. Follow DNS instructions (A record or CNAME)

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Set up env vars
cp .env.example .env.local
# Add your GEMINI_API_KEY

# Optional: Enable TLS bypass for local dev
export ALLOW_INSECURE_TLS=true

# Run dev server
npm run dev
```

**Note:** Vercel KV won't work locally without credentials. The middleware fails open, so rate limiting won't work in dev.

---

## 📝 Known Limitations

1. **Circuit breaker is in-memory per instance**
   - Not shared across serverless instances
   - Resets on cold starts
   - Still provides basic protection

2. **Topic gate uses simple keywords**
   - Not ML-based detection
   - May have false positives/negatives
   - Relies on system instructions as primary guard

3. **Turnstile fails open**
   - If Turnstile service is down, requests are allowed
   - This prevents complete outage but reduces bot protection

---

## 🆘 Troubleshooting

### "KV is not configured" error in production
- Verify Vercel KV is created and connected to project
- Check env vars are set in Vercel Dashboard

### Rate limiting not working
- Ensure middleware.ts is in project root
- Check matcher config in middleware
- Verify KV is connected

### "Bot verification required" error
- Check `TURNSTILE_ENABLED` is set correctly
- Verify site key is public (`NEXT_PUBLIC_*`)
- Check frontend is sending `turnstileToken`

### Circuit breaker stuck open
- Wait 30 seconds for automatic reset
- Check server logs for root cause (timeout/Gemini errors)
- Consider increasing timeout if legitimate requests are timing out

---

## 📚 Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Google Gemini API Quotas](https://ai.google.dev/pricing)
