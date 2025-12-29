"use client";

import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        turnstile?: any;
    }
}

interface TurnstileWidgetProps {
    siteKey: string;
    onToken: (token: string) => void;
}

export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    // Load Turnstile script
    useEffect(() => {
        if (document.getElementById("turnstile-script")) {
            setReady(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => setReady(true);
        document.body.appendChild(script);

        return () => {
            // Cleanup on unmount
            const existingScript = document.getElementById("turnstile-script");
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, []);

    // Render Turnstile widget
    useEffect(() => {
        if (!ready || !ref.current || !window.turnstile) return;

        const widgetId = window.turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: (token: string) => onToken(token),
            "error-callback": () => {
                console.error("Turnstile error");
            },
        });

        return () => {
            try {
                window.turnstile.remove(widgetId);
            } catch (error) {
                // Widget might already be removed
                console.debug("Turnstile cleanup error:", error);
            }
        };
    }, [ready, siteKey, onToken]);

    return <div ref={ref} />;
}
