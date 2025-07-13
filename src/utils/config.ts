export const config = {
    // Contract Addresses
    WKAIA_ADDRESS: process.env.NEXT_PUBLIC_WKAIA_ADDRESS || "0x087370EF15A63985DBba9636900Ea02E67905884",
    USDT_ADDRESS: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x09d71c95634609f73A5ef94a6B1F8427EE001d6F",
    DANNY_ADDRESS: process.env.NEXT_PUBLIC_DANNY_ADDRESS || "0x59b0DED9fe1607860355e3023099A5ea2dD489E2",
    POOL_ADDRESS: process.env.NEXT_PUBLIC_POOL_ADDRESS || "0x762F6364d437a4EF99F61e81C55C19ad4584AEC4",
    SWAP_ROUTER_ADDRESS: process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS || "0xd694acAFdDC06E452d8de377902801B7D22c1870",
    FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x445D2024f8f97B42F4ED22645E65026Bb2741793",
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_NONFUNGIBLE_POSITION_MANAGER_ADDRESS || "0x7b45E31581b44A0dF0962009ba37D4E4d4fdF892",

    // Network Configuration
    KAIROS_RPC_URL: process.env.NEXT_PUBLIC_KAIROS_RPC_URL || "https://public-en-kairos.node.kaia.io",
    CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1001"),
} as const;

// 환경변수 검증
export function validateConfig() {
    const requiredEnvVars = [
        'WKAIA_ADDRESS',
        'USDT_ADDRESS',
        'DANNY_ADDRESS',
        'POOL_ADDRESS',
        'SWAP_ROUTER_ADDRESS',
        'FACTORY_ADDRESS',
        'NONFUNGIBLE_POSITION_MANAGER_ADDRESS',
        'KAIROS_RPC_URL',
        'CHAIN_ID'
    ];

    // 디버깅을 위한 환경변수 출력 (브라우저 콘솔)
    if (typeof window !== 'undefined') {
        console.log('=== NEXT_PUBLIC ENV DEBUG ===');
        requiredEnvVars.forEach(varName => {
            // config 객체의 값도 함께 출력
            console.log(`${varName}:`, config[varName as keyof typeof config] || 'undefined');
        });
        console.log('=============================');
    }

    const missingVars = requiredEnvVars.filter(
        varName => !config[varName as keyof typeof config] || config[varName as keyof typeof config] === '0x...'
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing or invalid config values: ${missingVars.join(', ')}\n` +
            'Please check your .env.local file or config.ts and ensure all contract addresses are set correctly.'
        );
    }
} 