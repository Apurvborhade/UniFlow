import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { prisma } from "../lib/prisma.js";
import { CHAIN_CONFIG } from "../utils/arc/chainConfig.js";
import { parseBalance, parseSelectedChains, waitForTxCompletion } from "../utils/arc/helper.js";
import { getDeveloperControlledWalletsClient } from '../utils/circle-utils.js'
import { CIRCLE_API_KEY, ENTITY_SECRET } from "../utils/constants.js";

const circleDeveloperSdkClientPromise = getDeveloperControlledWalletsClient();

const GATEWAY_WALLET_ADDRESS = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9";

const GATEWAY_API = "https://gateway-api-testnet.circle.com/v1";


if (!CIRCLE_API_KEY || !ENTITY_SECRET) {
    console.error("Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env");
    process.exit(1);
}

const DEPOSIT_AMOUNT_USDC = "1";


async function getUSDCBalance(client: any, walletId: string) {
    const balance = await client.getWalletTokenBalance({ id: walletId });

    const usdc = balance.data?.tokenBalances?.find(
        (token: any) => token.token.symbol === "USDC" || token.token.symbol === "USDC-TESTNET"
    );


    return Number(usdc?.amount || 0);
}

async function depositToGateway(chains: string[] | undefined, totalSalary?: number) {
    if (!totalSalary || totalSalary <= 0) {
        throw new Error("totalSalary must be provided");
    }
    // Allows for chain selection via CLI arguments
    const selectedChains = parseSelectedChains(chains);
    console.log(
        `Depositing to: ${selectedChains.map((chain) => CHAIN_CONFIG[chain].chainName).join(", ")}`,
    );

    // Initiate wallets client
    const client = initiateDeveloperControlledWalletsClient({
        apiKey: CIRCLE_API_KEY!,
        entitySecret: ENTITY_SECRET!,
    });


    const chainBalances: Record<string, number> = {};
    let totalBalance = 0;

    console.log("\nFetching USDC balances...\n");


    for (const chain of selectedChains) {
        const config = CHAIN_CONFIG[chain];

        const balance = await getUSDCBalance(
            client,
            config.walletId
        );

        chainBalances[chain] = balance;
        totalBalance += balance;

        console.log(
            `${config.chainName}: ${balance} USDC`
        );
    }
    console.log(`\nTotal treasury balance: ${totalBalance} USDC`);
    console.log(`Total salary required: ${totalSalary} USDC`);

    if (totalBalance < totalSalary) {
        throw new Error(
            `Insufficient treasury balance.\nAvailable: ${totalBalance} USDC\nRequired: ${totalSalary} USDC`
        );
    }

    const distribution: Record<string, number> = {};

    console.log("\nDistribution:");

    for (const chain of selectedChains) {
        const balance = chainBalances[chain];

        const amount = Number(
            ((balance / totalBalance) * totalSalary).toFixed(6)
        );

        distribution[chain] = amount;

        console.log(
            `${CHAIN_CONFIG[chain].chainName}: ${amount} USDC`
        );
    }

    // Process each selected chain
    for (const chain of selectedChains) {
        const config = CHAIN_CONFIG[chain];
        const USDC_ADDRESS = config.usdc;
        const WALLET_ID = config.walletId;
        const depositAmount = distribution[chain];

        if (!depositAmount || depositAmount <= 0) {
            console.log(
                `Skipping ${config.chainName} (deposit amount is zero)`
            );
            continue;
        }
        console.log(`\n--- ${config.chainName} ---`);

        console.log(
            `Approving ${depositAmount} USDC for spender ${GATEWAY_WALLET_ADDRESS}`,
        );




        const approveTx = await client.createContractExecutionTransaction({
            walletId: WALLET_ID!,
            contractAddress: USDC_ADDRESS,
            abiFunctionSignature: "approve(address,uint256)",
            abiParameters: [
                GATEWAY_WALLET_ADDRESS,
                parseBalance(depositAmount.toString()).toString(),
            ],
            fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });

        const approveTxId = approveTx.data?.id;
        if (!approveTxId) throw new Error("Failed to create approve transaction");

        await waitForTxCompletion(client, approveTxId, "USDC approve");

        // Call deposit method on the Gateway Wallet contract
        console.log(`Depositing ${depositAmount} USDC to Gateway Wallet`);

        const depositTx = await client.createContractExecutionTransaction({
            walletId: WALLET_ID!,
            contractAddress: GATEWAY_WALLET_ADDRESS,
            abiFunctionSignature: "deposit(address,uint256)",
            abiParameters: [
                USDC_ADDRESS,
                parseBalance(depositAmount.toString()).toString(),
            ],
            fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });

        const depositTxId = depositTx.data?.id;
        if (!depositTxId) throw new Error("Failed to create deposit transaction");

        await showUnifiedAvailableBalance(client, WALLET_ID!);
        await waitForTxCompletion(client, depositTxId, "Gateway deposit");
        const txInfo = await client.getTransaction({ id: depositTxId });
        console.log("Deposit Tx Info: ", txInfo.data)
    }

    console.log(
        "Transaction complete. Once finality is reached, Gateway credits your unified USDC balance.",
    );
}

const CHAINS = {
    ethereum: { domain: 0, name: "Ethereum Sepolia" },
    avalanche: { domain: 1, name: "Avalanche Fuji" },
    base: { domain: 6, name: "Base Sepolia" },
    arc: { domain: 26, name: "Arc Testnet" },
};
const chainList = Object.values(CHAINS);
const domainNames = Object.fromEntries(
    chainList.map((chain) => [chain.domain, chain.name]),
);

const toBigInt = (value: string | number | null | undefined): bigint => {
    const balanceString = String(value ?? "0");
    if (balanceString.includes(".")) {
        const [whole, decimal = ""] = balanceString.split(".");
        const decimal6 = (decimal + "000000").slice(0, 6);
        return BigInt((whole || "0") + decimal6);
    }
    return BigInt(balanceString || "0");
};

async function showUnifiedAvailableBalance(client: any, walletId: string) {
    const { data } = await client.getWallet({ id: walletId });
    const depositor = data?.wallet?.address;
    if (!depositor) throw new Error("Could not resolve wallet address");
    console.log(`Depositor address: ${depositor}`);

    // Query Gateway for the available balance recorded by the system
    const response = await fetch(`${GATEWAY_API}/balances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: "USDC",
            sources: chainList.map(({ domain }) => ({ domain, depositor })),
        }),
    });
    const { balances = [] } = await response.json();

    let totalBalances = 0n;
    for (const balance of balances) {
        const amount = toBigInt(balance?.balance);
        const chain =
            domainNames[balance!.domain as number] ??
            `Domain ${balance!.domain as number}`;
        console.log(
            `  - ${chain}: ${amount / 1_000_000n}.${(amount % 1_000_000n)
                .toString()
                .padStart(6, "0")} USDC`,
        );
        totalBalances += amount;
    }
    const whole = totalBalances / 1_000_000n;
    const decimal = totalBalances % 1_000_000n;
    const totalUsdc = `${whole}.${decimal.toString().padStart(6, "0")}`;
    console.log(`Unified USDC available: ${totalUsdc} USDC`);
}

async function getUnifiedAvailableBalanceOfWallet(client: any, walletId: string) {
    const { data } = await client.getWallet({ id: walletId });
    const depositor = data?.wallet?.address;
    if (!depositor) throw new Error("Could not resolve wallet address");
    console.log(`Depositor address: ${depositor}`);

    // Query Gateway for the available balance recorded by the system
    const response = await fetch(`${GATEWAY_API}/balances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: "USDC",
            sources: chainList.map(({ domain }) => ({ domain, depositor })),
        }),
    });
    const { balances = [] } = await response.json();

    const balancesByChain: Record<string, string> = {};
    for (const balance of balances) {
        const amount = toBigInt(balance?.balance);
        const chain =
            domainNames[balance!.domain as number] ??
            `Domain ${balance!.domain as number}`;
        const formattedAmount = `${amount / 1_000_000n}.${(amount % 1_000_000n)
            .toString()
            .padStart(6, "0")}`;
        balancesByChain[chain] = formattedAmount;
    }

    return balancesByChain;

}
async function getBalance() {
    const wallets = await prisma.wallet.findMany();
    const walletId = wallets[0].id;

    const circleDeveloperSdkClient = await circleDeveloperSdkClientPromise;

    return await circleDeveloperSdkClient.getWalletTokenBalance({
        id: walletId,
    });

}

export { getBalance, depositToGateway, showUnifiedAvailableBalance, getUnifiedAvailableBalanceOfWallet };