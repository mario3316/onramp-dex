"use client";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { config } from "@/utils/config";
import { TokenSelector } from "./TokenSelector";
import MockERC20Abi from "@/abi/MockERC20.json";
import WKaiaAbi from "@/abi/WKaia.json";
import SwapRouterAbi from "@/abi/SwapRouter.json";
import PoolAbi from "@/abi/UniswapV3Pool.json";
import FactoryAbi from "@/abi/UniswapV3Factory.json";
import { ExternalProvider } from "@ethersproject/providers";

// (tsconfig.json에 "resolveJsonModule": true 필요)

const TOKENS = [
    { symbol: "WKAIA", address: config.WKAIA_ADDRESS, name: "Wrapped Kaia" },
    { symbol: "mUSDT", address: config.USDT_ADDRESS, name: "Mock USDT" },
    { symbol: "DANNY", address: config.DANNY_ADDRESS, name: "Danny Token" }
];

export function SwapForm() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [fromToken, setFromToken] = useState(TOKENS[0]);
    const [toToken, setToToken] = useState(TOKENS[1]);

    // 토큰 선택 핸들러
    const handleFromTokenChange = (token: typeof TOKENS[0]) => {
        setFromToken(token);
        fetchTokenBalances();
    };

    const handleToTokenChange = (token: typeof TOKENS[0]) => {
        setToToken(token);
        fetchTokenBalances();
    };
    const [amount, setAmount] = useState("");
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isSwapping, setIsSwapping] = useState(false);
    const [fromTokenBalance, setFromTokenBalance] = useState<string>("0");
    const [toTokenBalance, setToTokenBalance] = useState<string>("0");

    // 토큰 잔액 조회
    const fetchTokenBalances = async () => {
        if (!address || !isConnected) return;
        if (typeof window === "undefined" || !window.ethereum) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);

            // From 토큰 잔액 조회
            const fromTokenAbi = fromToken.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;
            const fromTokenContract = new ethers.Contract(fromToken.address, fromTokenAbi, provider);
            const fromBalanceWei = await fromTokenContract.balanceOf(address);
            setFromTokenBalance(ethers.utils.formatEther(fromBalanceWei));

            // To 토큰 잔액 조회
            const toTokenAbi = toToken.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;
            const toTokenContract = new ethers.Contract(toToken.address, toTokenAbi, provider);
            const toBalanceWei = await toTokenContract.balanceOf(address);
            setToTokenBalance(ethers.utils.formatEther(toBalanceWei));

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Token balance fetch failed:", errorMessage);
        }
    };

    // Pool 존재 여부 확인
    const checkPoolExists = async () => {
        if (typeof window === "undefined" || !window.ethereum) return false;
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);
            const factory = new ethers.Contract(config.FACTORY_ADDRESS, FactoryAbi.abi, provider);

            const poolAddress = await factory.getPool(fromToken.address, toToken.address, 3000);
            console.log("Pool address:", poolAddress);

            if (poolAddress === "0x0000000000000000000000000000000000000000") {
                alert("Pool does not exist for this token pair!");
                return false;
            }

            // Pool의 유동성 확인
            const pool = new ethers.Contract(poolAddress, PoolAbi.abi, provider);

            const liquidity = await pool.liquidity();
            console.log("Pool liquidity:", liquidity.toString());

            if (liquidity.eq(0)) {
                alert("Pool has no liquidity!");
                return false;
            }

            return true;
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Pool check failed:", errorMessage);
            return false;
        }
    };

    const handleSwap = async () => {
        if (!walletClient || !isConnected) return;
        setIsSwapping(true);
        try {
            // Pool 존재 및 유동성 확인
            const poolExists = await checkPoolExists();
            if (!poolExists) {
                setIsSwapping(false);
                return;
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);
            const signer = provider.getSigner();

            // 1. Approve 필요하면 자동 처리
            const erc20Abi = fromToken.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;
            const erc20 = new ethers.Contract(fromToken.address, erc20Abi, signer);
            const allowance = await erc20.allowance(address, config.SWAP_ROUTER_ADDRESS);
            const amountWei = ethers.utils.parseEther(amount);
            if (allowance.lt(amountWei)) {
                const approveTx = await erc20.approve(config.SWAP_ROUTER_ADDRESS, amountWei);
                await approveTx.wait();
            }

            // 2. Swap 실행
            const swapRouter = new ethers.Contract(config.SWAP_ROUTER_ADDRESS, SwapRouterAbi.abi, signer);

            // 디버깅: 파라미터 확인
            console.log("Swap params:", {
                tokenIn: fromToken.address,
                tokenOut: toToken.address,
                fee: 3000,
                recipient: address,
                deadline: Math.floor(Date.now() / 1000) + 60 * 10,
                amountIn: amountWei.toString(),
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

            const params = {
                tokenIn: fromToken.address,
                tokenOut: toToken.address,
                fee: 3000,
                recipient: address,
                deadline: Math.floor(Date.now() / 1000) + 60 * 10,
                amountIn: amountWei,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            };
            const tx = await swapRouter.exactInputSingle(params, {
                value: fromToken.symbol === "WKAIA" ? amountWei : 0
            });
            setTxHash(tx.hash);
            await tx.wait();

            // Swap 완료 후 잔액 새로고침
            await fetchTokenBalances();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            alert("Swap failed: " + errorMessage);
            console.log(errorMessage);
        }
        setIsSwapping(false);
    };

    // 컴포넌트 마운트 시와 지갑 연결 시 잔액 조회
    useEffect(() => {
        fetchTokenBalances();
    }, [address, isConnected]);

    return (
        <div className="bg-black border-4 border-kaia rounded-2xl p-8 shadow-xl max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold mb-6 text-kaia">Swap</h2>
            <div className="mb-4">
                <TokenSelector tokens={TOKENS} selected={fromToken} onChange={handleFromTokenChange} label="From" />
                {isConnected && (
                    <div className="text-xs text-kaia mt-1">
                        Balance: <span className="text-kaia">{parseFloat(fromTokenBalance).toFixed(4)} {fromToken.symbol}</span>
                    </div>
                )}
            </div>
            <div className="mb-4">
                <TokenSelector tokens={TOKENS} selected={toToken} onChange={handleToTokenChange} label="To" />
                {isConnected && (
                    <div className="text-xs text-kaia mt-1">
                        Balance: <span className="text-kaia">{parseFloat(toTokenBalance).toFixed(4)} {toToken.symbol}</span>
                    </div>
                )}
            </div>
            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="border-2 border-kaia bg-black text-kaia placeholder-kaia px-3 py-2 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-kaia/60 transition font-bold"
            />
            <button
                className="w-full bg-kaia text-black font-extrabold py-3 rounded-lg shadow hover:bg-kaia-light transition disabled:opacity-50"
                disabled={!isConnected || !amount || isSwapping || fromToken.address === toToken.address}
                onClick={handleSwap}
            >
                {isSwapping ? <span className="text-black">Swapping...</span> : <span className="text-black">Swap</span>}
            </button>
            {txHash && (
                <div className="text-xs text-kaia mt-2 break-all">
                    Tx: {txHash}
                </div>
            )}
        </div>
    );
} 