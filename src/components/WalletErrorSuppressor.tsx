"use client";

import { useEffect } from "react";

export function WalletErrorSuppressor() {
    useEffect(() => {
        const handler = (event: PromiseRejectionEvent) => {
            // Check if the error reason matches the known wallet adapter issue
            const message = String(event.reason?.message || event.reason || "");
            if (message.includes("Google wallet is already connected") || message.includes("User has rejected the request")) {
                // Prevent the default browser/Next.js error overlay
                event.preventDefault();
                console.warn("Aether handled wallet error:", message);
            }
        };

        window.addEventListener("unhandledrejection", handler);
        return () => window.removeEventListener("unhandledrejection", handler);
    }, []);

    return null;
}
