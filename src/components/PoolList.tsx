"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import UniswapV3PoolAbi from "@/abi/UniswapV3Pool.json";
import { config } from "@/utils/config";

export function PoolList() {
    const [pools, setPools] = useState<any[]>([]);
    useEffect(() => {
        async function fetchPool() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                // 예시: 단일 풀만 조회 (여러 풀 지원 시 배열로 반복)
                const pool = new ethers.Contract(config.POOL_ADDRESS, UniswapV3PoolAbi.abi, provider);
                // 예시: slot0, liquidity 등 조회 (Uniswap V3 기준)
                const [slot0, liquidity] = await Promise.all([
                    pool.slot0(),
                    pool.liquidity()
                ]);
                setPools([
                    {
                        id: 1,
                        pair: "WKAIA / mUSDT", // 실제 토큰명은 컨트랙트에서 조회 필요
                        tvl: liquidity.toString(),
                        price: slot0.sqrtPriceX96.toString(),
                        feeTier: "0.3%"
                    }
                ]);
            } catch (e) {
                setPools([]);
            }
        }
        fetchPool();
    }, []);

    return (
        <div className="bg-black border-4 border-kaia rounded-2xl p-6 shadow-xl">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-kaia">
                        <th className="text-left py-2 text-kaia">Pair</th>
                        <th className="text-left py-2 text-kaia">TVL</th>
                        <th className="text-left py-2 text-kaia">Price (sqrtX96)</th>
                        <th className="text-left py-2 text-kaia">Fee Tier</th>
                    </tr>
                </thead>
                <tbody>
                    {pools.map(pool => (
                        <tr key={pool.id} className="border-b border-kaia">
                            <td className="py-2 text-kaia">{pool.pair}</td>
                            <td className="py-2 text-kaia">{pool.tvl}</td>
                            <td className="py-2 text-kaia">{pool.price}</td>
                            <td className="py-2 text-kaia">{pool.feeTier}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 