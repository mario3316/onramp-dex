"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletStatus() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    if (!isConnected) {
        return (
            <button
                className="px-4 py-2 bg-black text-kaia font-extrabold rounded-lg border-2 border-kaia shadow transition"
                onClick={() => connect({ connector: connectors[0] })}
            >
                Connect Wallet
            </button>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-kaia bg-black px-3 py-1 rounded-lg border border-kaia/40 shadow">
                {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
                className="px-2 py-1 text-xs bg-black text-kaia border border-kaia rounded-lg font-extrabold transition"
                onClick={() => disconnect()}
            >
                Disconnect
            </button>
        </div>
    );
} 