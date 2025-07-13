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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Add Liquidity</h3>
                            <button
                                onClick={() => setShowAddLiquidity(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <AddLiquidity />
                    </div>
                </div>
            )}
        </div>
    );
} 