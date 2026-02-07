import { randomBytes } from "node:crypto";
import { Chain, CHAIN_CONFIG, WalletChain } from "./transferChainConfig.js";
import { BurnIntent, BurnIntentType, DEPOSITOR_ADDRESS, DESTINATION_CHAIN, EIP712Domain, EIP712DomainType, GATEWAY_MINTER_ADDRESS, GATEWAY_WALLET_ADDRESS, MAX_UINT256_DEC, TRANSFER_AMOUNT_USDC, TransferSpec } from "./transferConstants.js"
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

// Construct burn intent for a given source chain
function makeBurnIntent(sourceChain: Chain, destinationChain: WalletChain,recipientAddress:string, amount: number) {
    const src = CHAIN_CONFIG[sourceChain];
    const dst = getConfigByWalletChain(destinationChain as WalletChain);
    const value = parseBalance(String(amount));

    return {
        maxBlockHeight: MAX_UINT256_DEC,
        maxFee: 2_010000n,
        spec: {
            version: 1,
            sourceDomain: src.domain,
            destinationDomain: dst.domain,
            sourceContract: GATEWAY_WALLET_ADDRESS,
            destinationContract: GATEWAY_MINTER_ADDRESS,
            sourceToken: src.usdc,
            destinationToken: dst.usdc,
            sourceDepositor: DEPOSITOR_ADDRESS,
            destinationRecipient: recipientAddress,
            sourceSigner: DEPOSITOR_ADDRESS,
            destinationCaller: addressToBytes32(
                "0x0000000000000000000000000000000000000000",
            ),
            value: value,
            salt: "0x" + randomBytes(32).toString("hex"),
            hookData: "0x",
        },
    };
}

// Format burn intent as EIP-712 typed data for signing
function burnIntentTypedData(
    burnIntent: BurnIntentType,
    domain: EIP712DomainType,
) {
    return {
        types: { EIP712Domain, TransferSpec, BurnIntent },
        domain,
        primaryType: "BurnIntent",
        message: {
            ...burnIntent,
            spec: {
                ...burnIntent.spec,
                sourceContract: addressToBytes32(burnIntent.spec.sourceContract),
                destinationContract: addressToBytes32(
                    burnIntent.spec.destinationContract,
                ),
                sourceToken: addressToBytes32(burnIntent.spec.sourceToken),
                destinationToken: addressToBytes32(burnIntent.spec.destinationToken),
                sourceDepositor: addressToBytes32(burnIntent.spec.sourceDepositor),
                destinationRecipient: addressToBytes32(
                    burnIntent.spec.destinationRecipient,
                ),
                sourceSigner: addressToBytes32(burnIntent.spec.sourceSigner),
                destinationCaller: addressToBytes32(
                    burnIntent.spec.destinationCaller ??
                    addressToBytes32("0x0000000000000000000000000000000000000000"),
                ),
            },
        },
    };
}

// Get required wallet ID from env
function getRequiredWalletId(envKey: string) {
    const value = process.env[envKey];
    if (!value) {
        console.error(`Missing ${envKey} in .env`);
        process.exit(1);
    }
    return value;
}

// Look up chain configuration by wallet chain
function getConfigByWalletChain(walletChain: WalletChain) {
    const entry = Object.values(CHAIN_CONFIG).find(
        (item) => item.walletChain === walletChain,
    );
    if (!entry) {
        throw new Error(`No config found for destination chain ${walletChain}`);
    }
    return entry;
}

// Parse chains from CLI arguments
function parseSelectedChains() {
    const args = process.argv.slice(2).map((chain) => chain.toLowerCase());
    if (args.length === 0) return Object.keys(CHAIN_CONFIG) as Chain[];

    const selected: Chain[] = [];
    for (const arg of args) {
        if (!(arg in CHAIN_CONFIG)) {
            console.error(
                `Unsupported chain: ${arg}\n` +
                `Usage: npm run transfer -- [${Object.keys(CHAIN_CONFIG).join("] [")}]\n` +
                `Example: npm run transfer -- base avalanche`,
            );
            process.exit(1);
        }
        selected.push(arg as Chain);
    }
    return dedupe(selected);
}

// Dedupe chains from CLI arguments
function dedupe<T>(array: T[]) {
    const chains = new Set<T>();
    return array.filter((chain) =>
        chains.has(chain) ? false : (chains.add(chain), true),
    );
}

// Poll until transaction reaches terminal state
async function waitForTxCompletion(
    client: ReturnType<typeof initiateDeveloperControlledWalletsClient>,
    txId: string,
    label: string,
) {
    const terminalStates = new Set([
        "COMPLETE",
        "CONFIRMED",
        "FAILED",
        "DENIED",
        "CANCELLED",
    ]);

    process.stdout.write(`Waiting for ${label} (txId=${txId})\n`);

    while (true) {
        const { data } = await client.getTransaction({ id: txId });
        const state = data?.transaction?.state;

        process.stdout.write(".");

        if (state && terminalStates.has(state)) {
            process.stdout.write("\n");
            console.log(`${label} final state: ${state}`);

            if (state !== "COMPLETE" && state !== "CONFIRMED") {
                throw new Error(
                    `${label} did not complete successfully (state=${state})`,
                );
            }
            return data.transaction;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
}

// Pad address to 32 bytes
function addressToBytes32(address: string) {
    return ("0x" +
        address
            .toLowerCase()
            .replace(/^0x/, "")
            .padStart(64, "0")) as `0x${string}`;
}

// Parse decimal to base units: "10.5" → 10500000n
function parseBalance(usdcStr: string) {
    const [whole, decimal = ""] = String(usdcStr).split(".");
    const decimal6 = (decimal + "000000").slice(0, 6);
    return BigInt(whole + decimal6);
}

// Format base units to decimal: 10500000n → "10.5"
function formatUnits(value: bigint, decimals: number) {
    let display = value.toString();

    const negative = display.startsWith("-");
    if (negative) display = display.slice(1);

    display = display.padStart(decimals, "0");

    const integer = display.slice(0, display.length - decimals);
    let fraction = display.slice(display.length - decimals);

    fraction = fraction.replace(/(0+)$/, "");
    return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}

// Serialize typed data (convert bigints to strings)
function stringifyTypedData<T>(obj: T) {
    return JSON.stringify(obj, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
    );
}

export { makeBurnIntent, burnIntentTypedData, getRequiredWalletId, getConfigByWalletChain, parseSelectedChains, waitForTxCompletion, addressToBytes32, parseBalance, formatUnits, stringifyTypedData, };