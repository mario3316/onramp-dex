"use client";
import { useState } from "react";
import { PoolList } from "@/components/PoolList";
import { AddLiquidity } from "@/components/AddLiquidity";

export default function LiquidityPage() {
    const [showAddLiquidity, setShowAddLiquidity] = useState(false);

    return (
        <div className="max-w-4xl mx-auto mt-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Liquidity Pools</h2>
                <button
                    onClick={() => setShowAddLiquidity(true)}
                    className="bg-green-500 text-white px-6 py-2 rounded font-bold hover:bg-green-600"
                >
                    Add Liquidity
                </button>
            </div>

            <PoolList />

            {/* Add Liquidity Modal */}
            {showAddLiquidity && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="!bg-black border-2 border-kaia rounded-2xl p-0 max-w-lg w-full mx-4 overflow-visible relative">
                        <div className="flex justify-between items-center px-6 pt-6 pb-2 border-b-2 border-kaia rounded-t-2xl">
                            <h3 className="text-lg font-extrabold text-kaia">Add Liquidity</h3>
                            <button
                                onClick={() => setShowAddLiquidity(false)}
                                className="text-kaia text-2xl font-bold hover:text-black hover:bg-kaia rounded-full w-8 h-8 flex items-center justify-center transition"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 pb-8 overflow-visible">
                            <AddLiquidity />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 