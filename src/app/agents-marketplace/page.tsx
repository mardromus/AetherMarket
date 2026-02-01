"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentsMarketplacePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to /agents (consolidated marketplace)
        router.replace("/agents");
    }, [router]);

    return null;
}
