"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import UniswapV3PoolAbi from "@/abi/UniswapV3Pool.json";
import { config } from "@/utils/config";

interface Position {
    id: number;
    token0: string;
    token1: string;
    liquidity: string;
    fee: string;
}

export function MyPositionList() {
    const { address } = useAccount();
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        async function fetchPosition() {
            if (!address) return;
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const pool = new ethers.Contract(config.POOL_ADDRESS, UniswapV3PoolAbi.abi, provider);
                // 예시: Uniswap V3는 NFT 기반이므로 실제로는 positionManager에서 조회해야 함
                // 여기서는 단순히 유동성(balance)만 조회
                // 실제 구현 시 positionManager ABI/주소 필요
                const liquidity = await pool.balanceOf(address).catch(() => null);
                setPositions([
                    {
                        id: 1,
                        pair: "WKAIA / mUSDT",
                        amount: liquidity ? liquidity.toString() : "0",
                        tvl: "-"
                    }
                ]);
            } catch {
                setPositions([]);
            }
        }
        fetchPosition();
    }, [address]);

    return (
        <div className="bg-white border rounded-lg p-6 shadow">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Pair</th>
                        <th className="text-left py-2">My LP</th>
                        <th className="text-left py-2">TVL</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map(pos => (
                        <tr key={pos.id} className="border-b">
                            <td className="py-2">{pos.pair}</td>
                            <td className="py-2">{pos.amount}</td>
                            <td className="py-2">{pos.tvl}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 