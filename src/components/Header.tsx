import Image from "next/image";
import Link from "next/link";
import { MainTabs } from "./MainTabs";
import { WalletStatus } from "./WalletStatus";

export function Header() {
    return (
        <header className="w-full bg-kaia-dark flex items-center justify-between px-6 py-4 shadow-lg border-b-4 border-kaia">
            <div className="flex items-center gap-3 min-w-[180px]">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Onramp Dex Logo" width={48} height={48} className="rounded-full border-2 border-kaia bg-black" />
                    <span className="text-kaia text-2xl font-extrabold tracking-tight">Onramp Dex</span>
                </Link>
            </div>
            <div className="flex-1 flex justify-center">
                <MainTabs />
            </div>
            <div className="flex items-center min-w-[180px] justify-end">
                <WalletStatus />
            </div>
        </header>
    );
} 