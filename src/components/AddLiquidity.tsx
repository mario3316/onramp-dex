"use client";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { config } from "@/utils/config";
import { TokenSelector } from "./TokenSelector";
import MockERC20Abi from "@/abi/MockERC20.json";
import WKaiaAbi from "@/abi/WKaia.json";
import NonfungiblePositionManagerAbi from "@/abi/NonfungiblePositionManager.json";
import PoolAbi from "@/abi/UniswapV3Pool.json";
import FactoryAbi from "@/abi/UniswapV3Factory.json";

const TOKENS = [
    { symbol: "WKAIA", address: config.WKAIA_ADDRESS, name: "Wrapped Kaia" },
    { symbol: "mUSDT", address: config.USDT_ADDRESS, name: "Mock USDT" },
    { symbol: "DANNY", address: config.DANNY_ADDRESS, name: "Danny Token" }
];

const FEE_TIERS = [
    { value: 500, label: "0.05%" },
    { value: 3000, label: "0.3%" },
    { value: 10000, label: "1%" }
];

export function AddLiquidity() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [tokenA, setTokenA] = useState(TOKENS[0]);
    const [tokenB, setTokenB] = useState(TOKENS[1]);
    const [feeTier, setFeeTier] = useState(FEE_TIERS[1]); // 0.3% 기본값
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [tokenABalance, setTokenABalance] = useState<string>("0");
    const [tokenBBalance, setTokenBBalance] = useState<string>("0");

    // 토큰 잔액 조회
    const fetchTokenBalances = async () => {
        if (!address || !isConnected) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // Token A 잔액 조회
            const tokenAAbi = tokenA.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;
            const tokenAContract = new ethers.Contract(tokenA.address, tokenAAbi, provider);
            const balanceAWei = await tokenAContract.balanceOf(address);
            setTokenABalance(ethers.utils.formatEther(balanceAWei));

            // Token B 잔액 조회
            const tokenBAbi = tokenB.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;
            const tokenBContract = new ethers.Contract(tokenB.address, tokenBAbi, provider);
            const balanceBWei = await tokenBContract.balanceOf(address);
            setTokenBBalance(ethers.utils.formatEther(balanceBWei));

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Token balance fetch failed:", errorMessage);
        }
    };

    // 토큰 선택 핸들러
    const handleTokenAChange = (token: typeof TOKENS[0]) => {
        setTokenA(token);
        fetchTokenBalances();
    };

    const handleTokenBChange = (token: typeof TOKENS[0]) => {
        setTokenB(token);
        fetchTokenBalances();
    };

    // Pool 존재 여부 확인
    const checkPoolExists = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const factory = new ethers.Contract(config.FACTORY_ADDRESS, FactoryAbi.abi, provider);

            const poolAddress = await factory.getPool(tokenA.address, tokenB.address, feeTier.value);
            console.log("Pool address:", poolAddress);

            if (poolAddress === "0x0000000000000000000000000000000000000000") {
                alert("Pool does not exist for this token pair and fee tier!");
                return false;
            }

            return true;
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Pool check failed:", errorMessage);
            return false;
        }
    };

    // 유동성 제공
    const handleAddLiquidity = async () => {
        if (!walletClient || !isConnected || !amountA || !amountB) return;

        setIsProcessing(true);
        try {
            // Pool 존재 여부 확인
            const poolExists = await checkPoolExists();
            if (!poolExists) {
                setIsProcessing(false);
                return;
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Factory 컨트랙트
            const factory = new ethers.Contract(config.FACTORY_ADDRESS, FactoryAbi.abi, provider);

            // NonfungiblePositionManager 컨트랙트
            const positionManager = new ethers.Contract(
                config.NONFUNGIBLE_POSITION_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000",
                NonfungiblePositionManagerAbi.abi,
                signer
            );

            const amountAWei = ethers.utils.parseEther(amountA);
            const amountBWei = ethers.utils.parseEther(amountB);

            // 잔액 확인
            const tokenAAbi = tokenA.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;
            const tokenBAbi = tokenB.symbol === "WKAIA" ? WKaiaAbi.abi : MockERC20Abi.abi;

            const tokenAContract = new ethers.Contract(tokenA.address, tokenAAbi, signer);
            const tokenBContract = new ethers.Contract(tokenB.address, tokenBAbi, signer);

            const balanceA = await tokenAContract.balanceOf(address);
            const balanceB = await tokenBContract.balanceOf(address);

            if (balanceA.lt(amountAWei)) {
                alert(`Insufficient ${tokenA.symbol} balance!`);
                return;
            }

            if (balanceB.lt(amountBWei)) {
                alert(`Insufficient ${tokenB.symbol} balance!`);
                return;
            }

            // Approve 처리
            const allowanceA = await tokenAContract.allowance(address, positionManager.address);
            if (allowanceA.lt(amountAWei)) {
                const approveATx = await tokenAContract.approve(positionManager.address, amountAWei);
                await approveATx.wait();
            }

            const allowanceB = await tokenBContract.allowance(address, positionManager.address);
            if (allowanceB.lt(amountBWei)) {
                const approveBTx = await tokenBContract.approve(positionManager.address, amountBWei);
                await approveBTx.wait();
            }

            // Pool에서 현재 가격 조회
            const poolAddress = await factory.getPool(tokenA.address, tokenB.address, feeTier.value);
            const pool = new ethers.Contract(poolAddress, PoolAbi.abi, provider);

            const slot0 = await pool.slot0();
            console.log("Current sqrtPriceX96:", slot0.sqrtPriceX96.toString());
            console.log("Current tick:", slot0.tick);

            // 현재 가격에 맞는 토큰 비율 계산
            const [token0, token1] = tokenA.address < tokenB.address ? [tokenA, tokenB] : [tokenB, tokenA];
            const [amount0Desired, amount1Desired] = tokenA.address < tokenB.address
                ? [amountAWei, amountBWei]
                : [amountBWei, amountAWei];

            // Mint parameters
            const params = {
                token0: token0.address,
                token1: token1.address,
                fee: feeTier.value,
                tickLower: -887220, // 전체 범위
                tickUpper: 887220,  // 전체 범위
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address,
                deadline: Math.floor(Date.now() / 1000) + 60 * 20 // 20분
            };

            console.log("Mint params:", params);

            // Mint 실행
            const valueA = tokenA.symbol === "WKAIA" ? amountAWei : ethers.BigNumber.from(0);
            const valueB = tokenB.symbol === "WKAIA" ? amountBWei : ethers.BigNumber.from(0);
            const totalValue = valueA.add(valueB);

            const tx = await positionManager.mint(params, {
                value: totalValue,
                gasLimit: 1000000 // 수동 가스비 설정
            });

            setTxHash(tx.hash);
            await tx.wait();

            // 잔액 새로고침
            await fetchTokenBalances();
            setAmountA("");
            setAmountB("");
            alert("Liquidity added successfully!");

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            alert("Add liquidity failed: " + errorMessage);
            console.error("Add liquidity error:", errorMessage);
        }
        setIsProcessing(false);
    };

    // 컴포넌트 마운트 시 잔액 조회
    useEffect(() => {
        fetchTokenBalances();
    }, [address, isConnected]);

    return (
        <div className="bg-black border-4 border-kaia rounded-2xl p-8 shadow-xl max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold mb-6 text-kaia">Add Liquidity</h2>

            {/* 토큰 선택 */}
            <div className="mb-4">
                <TokenSelector tokens={TOKENS} selected={tokenA} onChange={handleTokenAChange} label="Token A" />
                {isConnected && (
                    <div className="text-xs text-kaia mt-1">
                        Balance: <span className="text-kaia">{parseFloat(tokenABalance).toFixed(4)} {tokenA.symbol}</span>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <TokenSelector tokens={TOKENS} selected={tokenB} onChange={handleTokenBChange} label="Token B" />
                {isConnected && (
                    <div className="text-xs text-kaia mt-1">
                        Balance: <span className="text-kaia">{parseFloat(tokenBBalance).toFixed(4)} {tokenB.symbol}</span>
                    </div>
                )}
            </div>

            {/* Fee Tier 선택 */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-kaia">Fee Tier</label>
                <select
                    value={feeTier.value}
                    onChange={(e) => setFeeTier(FEE_TIERS.find(f => f.value === parseInt(e.target.value)) || FEE_TIERS[1])}
                    className="border-2 border-kaia bg-black text-kaia px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-kaia/60 transition font-bold"
                >
                    {FEE_TIERS.map(fee => (
                        <option key={fee.value} value={fee.value} className="bg-black text-kaia">
                            {fee.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 금액 입력 */}
            <div className="mb-4">
                <input
                    type="number"
                    placeholder={`Amount ${tokenA.symbol}`}
                    value={amountA}
                    onChange={e => setAmountA(e.target.value)}
                    className="border-2 border-kaia bg-black text-kaia placeholder-kaia px-3 py-2 rounded-lg w-full mb-2 focus:outline-none focus:ring-2 focus:ring-kaia/60 transition font-bold"
                    step="0.0001"
                    min="0"
                />
                <input
                    type="number"
                    placeholder={`Amount ${tokenB.symbol}`}
                    value={amountB}
                    onChange={e => setAmountB(e.target.value)}
                    className="border-2 border-kaia bg-black text-kaia placeholder-kaia px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-kaia/60 transition font-bold"
                    step="0.0001"
                    min="0"
                />
                <div className="text-xs text-kaia mt-2">
                    <strong>Note:</strong> Token amounts should match the current pool price ratio for optimal liquidity provision.
                </div>
            </div>

            {/* Add Liquidity 버튼 */}
            <button
                className="w-full bg-kaia text-black font-extrabold py-3 rounded-lg shadow hover:bg-kaia-light transition disabled:opacity-50"
                disabled={!isConnected || !amountA || !amountB || isProcessing || tokenA.address === tokenB.address}
                onClick={handleAddLiquidity}
            >
                {isProcessing ? <span className="text-black">Adding Liquidity...</span> : <span className="text-black">Add Liquidity</span>}
            </button>

            {/* 트랜잭션 해시 */}
            {txHash && (
                <div className="text-xs text-kaia mt-4 break-all">
                    Tx: {txHash}
                </div>
            )}
        </div>
    );
} 