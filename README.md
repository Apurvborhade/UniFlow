# UniFlow

UniFlow is a cross-chain payroll and treasury management platform that allows organizations to deposit USDC once, optionally earn yield on idle treasury funds, and distribute salaries to employees across multiple blockchains. It leverages Circle’s onchain infrastructure and Arc to handle custody, yield, cross-chain settlement, and automated payroll execution — without deploying custom smart contracts.

---

## Overview

### Problem
- Payroll across multiple chains is complex
- Manual bridging is error-prone
- Treasury liquidity gets fragmented
- Idle capital earns no yield
- Payroll automation is difficult in Web3

### Solution
UniFlow abstracts these challenges behind a backend-driven orchestration layer using:
- Circle Developer-Controlled Wallets
- Circle Gateway (CCTP)
- Arc-native treasury and yield (USYC)
- Automated schedulers (cron-based)
- Unified treasury balance tracking

**Deposit once. Earn optionally. Pay anywhere.**

---

## High-Level Flow
```
[1] DEPOSIT            [2] TREASURY            [3] SETTLEMENT           [4] DISTRIBUTION

Employer deposits  -->  Unified treasury  -->  Gateway burn +    -->  Employees receive
USDC + payroll         (USDC + optional)       attestation            USDC on preferred
data via backend       (USYC)                   + mint                  blockchain
```

---


## Architecture Overview
```
+---------------------------------------------------+
|                   UniFlow Backend                 |
|  - Payroll Engine                                 |
|  - Treasury Manager                               |
|  - Scheduler (Cron-based)                         |
|  - Policy & Validation Layer                      |
+-------------------------+-------------------------+
                          |
          +---------------+----------------+
          |                                |
+---------v---------+            +---------v----------+
| Circle Dev Wallet |            | PostgreSQL DB      |
| (EOA, Custodied)  |            | Employees, Payroll |
+---------+---------+            | History, Schedules |
          |                      +--------------------+
          |
+---------v------------------------------------------+
|               Circle Gateway (CCTP)                |
|  - Unified Balance                                 |
|  - Burn on source chain                            |
|  - Attestation                                     |
|  - Mint on destination chain                      |
+---------+---------------------------+--------------+
          |                           |
+---------v----------+        +-------v-----------+
| Source Chains      |        | Destination Chains|
| (ETH, Base, Arc)   |        | Employee Wallets  |
+--------------------+        +-------------------+

```
### Architecture Diagram
<img width="2478" height="2125" alt="image" src="https://github.com/user-attachments/assets/2be15b96-8bf4-49f7-adff-214e3835a194" />

---

## Cross-Chain Payroll Execution

### Step 1: Employer Deposit
- Employer funds a Circle developer-controlled wallet
- USDC can exist across multiple supported chains
- Backend tracks balances via Circle APIs

---

### Step 2: Treasury Management
- Backend aggregates balances into a unified treasury view
- Employer can opt into **yield mode**
- Treasury holds:
  - Liquid USDC
  - Yield-bearing USYC on Arc (optional)

---

### Step 3: Gateway Burn (CCTP)
For each payroll execution:

1. Backend determines required payroll amount
2. If USDC is insufficient:
   - Redeem required USYC → USDC on Arc
3. Create a burn intent
4. Sign intent using Circle wallet (EIP-712)
5. Submit intent to Circle Gateway `/transfer`
6. Gateway burns USDC on source chain
7. Gateway returns attestation

---

### Step 4: Mint & Distribution
- Backend submits `gatewayMint(attestation, signature)`
- USDC is minted on the destination chain
- Funds are transferred directly to employee wallets on their preferred chain


---
## Treasury Yield (USYC on Arc)

UniFlow includes an **optional yield layer** for idle treasury funds.

```
USDC (idle)
|
v
Convert to USYC (Arc)
|
v
Hold yield-bearing treasury
|
v
Redeem to USDC before payroll (if required)
```

### Yield Rules
- Yield is **opt-in**
- Payroll liquidity always has priority
- USYC is redeemed automatically if payroll requires funds
- No custom vault contracts are deployed

### Why Arc + USYC
- Arc supports treasury-grade, RWA-backed assets
- USYC provides yield without DeFi complexity
- Clean integration with Circle infrastructure
- Safer than LP-based yield for payroll use cases

---



## Automated Payroll

UniFlow supports cron-based payroll automation.

Example cron schedule:
 
  0 0 * * *

Supported frequencies:
- Daily
- Weekly
- Monthly
- Custom cron expressions
---

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma            # Database schema
│
├── src/
│   ├── controller/              # API controllers
│   │   ├── employee.controller.ts
│   │   ├── payroll.controller.ts
│   │   └── treasury.controller.ts
│   │
│   ├── services/                # Business logic
│   │   ├── employees.service.ts
│   │   ├── payroll.service.ts
│   │   └── treasury.service.ts
│   │
│   ├── routes/                  # API routes
│   │   ├── employees.routes.ts
│   │   ├── payroll.routes.ts
│   │   ├── payrollSchedule.routes.ts
│   │   └── treasury.routes.ts
│   │
│   ├── utils/
│   │   ├── arc/                 # Gateway & cross-chain helpers
│   │   ├── circle-utils.ts
│   │   ├── constants.ts
│   │   └── safeJsonFetch.ts
│   │
│   ├── middleware/
│   │   └── errorHandler.middleware.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── walletClient.ts
│   │
│   └── index.ts                 # App entry point
│
└── README.md
```


---

---

## Key Integrations

### Circle Developer-Controlled Wallets
- Secure, custodial EOAs
- EIP-712 signing
- Contract execution without private key exposure

### Circle Gateway (CCTP)
- Native USDC burn/mint
- Cross-chain liquidity unification
- Gas-efficient settlement

### Arc + USYC
- Treasury yield for idle capital
- RWA-backed, yield-bearing asset
- Automatically redeemed for payroll

---

## Why This Is a Web3 Project

UniFlow is Web3-native at the infrastructure level:
- Onchain USDC custody
- Cross-chain mint/burn settlement
- Cryptographic signing (EIP-712)
- Immutable transaction execution
- RWA-based treasury yield on Arc

Rather than deploying new smart contracts, UniFlow composes **audited onchain primitives** to deliver real-world financial workflows.

---

## Current Status

- ✅ Manual payroll execution
- ✅ Cross-chain USDC payouts
- ✅ Automated payroll scheduling
- ✅ Treasury balance tracking
- ✅ USYC-based treasury yield on Arc


---

## Tech Stack

- Node.js, TypeScript, Express
- PostgreSQL, Prisma
- Circle Wallets & Gateway
- Arc, USDC, USYC
- Docker
- Cron

---

## License

MIT
