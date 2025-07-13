"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainTabs() {
    const pathname = usePathname();
    return (
        <nav className="flex gap-8">
            <Link
                href="/"
                className={`px-2 pb-1 text-lg font-extrabold text-kaia border-b-2 ${pathname === "/" ? "border-kaia" : "border-transparent"}`}
            >
                Swap
            </Link>
            <Link
                href="/liquidity"
                className={`px-2 pb-1 text-lg font-extrabold text-kaia border-b-2 ${pathname.startsWith("/liquidity") ? "border-kaia" : "border-transparent"}`}
            >
                Liquidity
            </Link>
            <Link
                href="/wrapper"
                className={`px-2 pb-1 text-lg font-extrabold text-kaia border-b-2 ${pathname === "/wrapper" ? "border-kaia" : "border-transparent"}`}
            >
                Kaia &lt;-&gt; WKaia
            </Link>
        </nav>
    );
} 