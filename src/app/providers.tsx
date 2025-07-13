"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { config as appConfig } from "@/utils/config";
import { useEffect, useState } from "react";

// Kaia 테스트넷 설정
const kaiaTestnet = {
    id: appConfig.CHAIN_ID,
    name: "Kaia Testnet",
    network: "kaia-testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Kaia",
        symbol: "KAIA",
    },
    rpcUrls: {
        public: { http: [appConfig.KAIROS_RPC_URL] },
        default: { http: [appConfig.KAIROS_RPC_URL] },
    },
} as const;

const wagmiConfig = createConfig({
    chains: [kaiaTestnet],
    connectors: [
        injected(),
        metaMask(),
    ],
    transports: {
        [kaiaTestnet.id]: http(),
    },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}