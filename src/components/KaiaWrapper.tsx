"use client";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { config } from "@/utils/config";
import WKaiaAbi from "@/abi/WKaia.json";
import { ExternalProvider } from "@ethersproject/providers";

export function KaiaWrapper() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [kaiaBalance, setKaiaBalance] = useState<string>("0");
    const [wkaiaBalance, setWkaiaBalance] = useState<string>("0");

    // 잔액 조회
    const fetchBalances = async () => {
        if (!address || !isConnected) {
            console.log("Not connected or no address");
            return;
        }
        if (typeof window === "undefined" || !window.ethereum) return;

        try {
            console.log("Fetching balances for address:", address);
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);

            // 네트워크 상태 확인
            const network = await provider.getNetwork();
            console.log("Connected network:", network);

            // 연결 상태 확인
            const isConnected = await provider.getNetwork();
            console.log("Provider connected:", !!isConnected);

            // Kaia 잔액 (네이티브 토큰)
            console.log("Fetching Kaia balance...");
            const kaiaBalanceWei = await provider.getBalance(address);
            console.log("Kaia balance (wei):", kaiaBalanceWei.toString());
            setKaiaBalance(ethers.utils.formatEther(kaiaBalanceWei));

            // WKaia 잔액
            console.log("Fetching WKaia balance...");
            console.log("WKaia contract address:", config.WKAIA_ADDRESS);
            const wkaia = new ethers.Contract(config.WKAIA_ADDRESS, WKaiaAbi.abi, provider);
            const wkaiaBalanceWei = await wkaia.balanceOf(address);
            console.log("WKaia balance (wei):", wkaiaBalanceWei.toString());
            setWkaiaBalance(ethers.utils.formatEther(wkaiaBalanceWei));

            console.log("Balance fetch completed successfully");
        } catch (e) {
            console.error("Balance fetch failed:", e);
            // 에러 상세 정보 출력
            if (e && typeof e === 'object') {
                const error = e as Record<string, unknown>;
                console.error("Error details:", {
                    message: error.message,
                    code: error.code,
                    data: error.data,
                    stack: error.stack
                });

                // JSON-RPC 에러인 경우 사용자에게 안내
                if (error.code === -32603) {
                    console.error("JSON-RPC error detected. Please try:");
                    console.error("1. Switch network and reconnect");
                    console.error("2. Refresh browser");
                    console.error("3. Reconnect wallet");
                }
            }
        }
    };

    // Kaia → WKaia 변환 (deposit)
    const handleDeposit = async () => {
        if (!walletClient || !isConnected || !amount) return;

        setIsProcessing(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);
            const signer = provider.getSigner();
            const wkaia = new ethers.Contract(config.WKAIA_ADDRESS, WKaiaAbi.abi, signer);

            const amountWei = ethers.utils.parseEther(amount);

            // Kaia 잔액 확인
            if (!address) return;
            const currentBalance = await provider.getBalance(address);
            if (currentBalance.lt(amountWei)) {
                alert("Insufficient Kaia balance!");
                return;
            }

            // deposit 실행 (value로 Kaia 전송)
            const tx = await wkaia.deposit({
                value: amountWei
            });

            setTxHash(tx.hash);
            await tx.wait();

            // 잔액 새로고침
            await fetchBalances();
            setAmount("");
            alert("Deposit successful!");

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            alert("Deposit failed: " + errorMessage);
            console.error("Deposit error:", errorMessage);
        }
        setIsProcessing(false);
    };

    // WKaia → Kaia 변환 (withdraw)
    const handleWithdraw = async () => {
        if (!walletClient || !isConnected || !amount) return;

        setIsProcessing(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);
            const signer = provider.getSigner();
            const wkaia = new ethers.Contract(config.WKAIA_ADDRESS, WKaiaAbi.abi, signer);

            const amountWei = ethers.utils.parseEther(amount);

            // WKaia 잔액 확인
            const currentBalance = await wkaia.balanceOf(address);
            if (currentBalance.lt(amountWei)) {
                alert("Insufficient WKaia balance!");
                return;
            }

            // withdraw 실행
            const tx = await wkaia.withdraw(amountWei);

            setTxHash(tx.hash);
            await tx.wait();

            // 잔액 새로고침
            await fetchBalances();
            setAmount("");
            alert("Withdraw successful!");

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            alert("Withdraw failed: " + errorMessage);
            console.error("Withdraw error:", errorMessage);
        }
        setIsProcessing(false);
    };

    // 잔액 새로고침 버튼
    const handleRefresh = () => {
        fetchBalances();
    };

    // 컴포넌트 마운트 시 잔액 조회
    useEffect(() => {
        fetchBalances();
    }, [address, isConnected]);

    return (
        <div className="bg-black border-4 border-kaia rounded-2xl p-8 shadow-xl max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold mb-6 text-kaia">Kaia ↔ WKaia</h2>

            {/* 잔액 표시 */}
            <div className="mb-6 p-4 bg-black border border-kaia rounded-xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-kaia">Balances:</span>
                    <button
                        onClick={handleRefresh}
                        className="text-kaia hover:text-kaia-light text-sm font-bold"
                    >
                        🔄 Refresh
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-kaia/80">Kaia:</span>
                        <span className="ml-2 font-mono text-white">{parseFloat(kaiaBalance).toFixed(4)}</span>
                    </div>
                    <div>
                        <span className="text-kaia/80">WKaia:</span>
                        <span className="ml-2 font-mono text-white">{parseFloat(wkaiaBalance).toFixed(4)}</span>
                    </div>
                </div>
            </div>

            {/* 입력 필드 */}
            <div className="mb-4">
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="border-2 border-kaia bg-black text-kaia px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-kaia/60 transition font-bold"
                    step="0.0001"
                    min="0"
                />
            </div>

            {/* 버튼들 */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    className="bg-transparent border-2 border-kaia text-kaia font-extrabold py-3 rounded-lg shadow transition disabled:opacity-50"
                    disabled={!isConnected || !amount || isProcessing}
                    onClick={handleDeposit}
                >
                    {isProcessing ? <span className="text-kaia">Processing...</span> : <span className="text-kaia">Kaia → WKaia</span>}
                </button>

                <button
                    className="bg-transparent border-2 border-kaia text-kaia font-extrabold py-3 rounded-lg shadow transition disabled:opacity-50"
                    disabled={!isConnected || !amount || isProcessing}
                    onClick={handleWithdraw}
                >
                    {isProcessing ? <span className="text-kaia">Processing...</span> : <span className="text-kaia">WKaia → Kaia</span>}
                </button>
            </div>

            {/* 트랜잭션 해시 */}
            {txHash && (
                <div className="text-xs text-kaia mt-4 break-all">
                    Tx: {txHash}
                </div>
            )}

            {/* 설명 */}
            <div className="mt-6 text-sm text-kaia/80">
                <p className="mb-2">
                    <strong>Kaia → WKaia:</strong> 네이티브 Kaia를 WKaia 토큰으로 변환
                </p>
                <p>
                    <strong>WKaia → Kaia:</strong> WKaia 토큰을 네이티브 Kaia로 변환
                </p>
            </div>
        </div>
    );
} 