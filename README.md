# Kaia DEX Frontend

Kaia 블록체인 기반 DEX의 프론트엔드 애플리케이션입니다.

## 설정

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Kaia DEX Contract Addresses
NEXT_PUBLIC_WKAIA_ADDRESS=0x... # 실제 배포된 WKaia 주소
NEXT_PUBLIC_USDT_ADDRESS=0x... # 실제 배포된 USDT 주소
NEXT_PUBLIC_POOL_ADDRESS=0x... # 실제 배포된 Pool 주소
NEXT_PUBLIC_SWAP_ROUTER_ADDRESS=0x... # 실제 배포된 SwapRouter 주소
NEXT_PUBLIC_FACTORY_ADDRESS=0x... # 실제 배포된 Factory 주소

# Kaia Network Configuration
NEXT_PUBLIC_KAIROS_RPC_URL=https://testnet-rpc.kaia.network
NEXT_PUBLIC_CHAIN_ID=1337 # 실제 Kaia 테스트넷 체인 ID
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## 기능

- **메타마스크 연결**: Kaia 테스트넷 연결
- **토큰 Approve**: Pool에 유동성 제공을 위한 토큰 승인
- **스왑**: WKaia ↔ USDT 토큰 스왑

## 주의사항

- 모든 컨트랙트 주소는 실제 배포된 주소로 설정해야 합니다
- Kaia 테스트넷에 충분한 KAIA 토큰이 있어야 합니다
- 메타마스크에 Kaia 테스트넷이 추가되어 있어야 합니다
