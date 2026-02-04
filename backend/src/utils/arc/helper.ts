import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { Chain, CHAIN_CONFIG } from "./chainConfig.js";


// Get required wallet ID from env
export function getRequiredWalletId(envKey: string) {
  const value = process.env[envKey];
  if (!value) {
    console.error(`Missing ${envKey} in .env`);
    process.exit(1);
  }
  return value;
}

// Parse chains from function arguments
export function parseSelectedChains(chains?: string[]) {
    if (!chains || chains.length === 0) return Object.keys(CHAIN_CONFIG) as Chain[];

    const selected: Chain[] = [];
    for (const chain of chains) {
        const normalized = chain.toLowerCase();
        if (!(normalized in CHAIN_CONFIG)) {
            throw new Error(
                `Unsupported chain: ${chain}\n` +
                    `Supported chains: ${Object.keys(CHAIN_CONFIG).join(", ")}`,
            );
        }
        selected.push(normalized as Chain);
    }
    return dedupe(selected);
}

// Dedupe chains from array
export function dedupe<T>(array: T[]) {
    const chains = new Set<T>();
    return array.filter((chain) =>
        chains.has(chain) ? false : (chains.add(chain), true),
    );
}

// Poll until transaction reaches terminal state
export async function waitForTxCompletion(
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
        const errorDetails = data.transaction?.errorDetails || data.transaction?.errorReason || "Unknown error";
        throw new Error(
          `${label} did not complete successfully (state=${state}, error=${errorDetails})`,
        );
      }
      return data.transaction;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  
}

// Parse decimal to base units: "10.5" → 10500000n
export function parseBalance(usdcStr: string) {
  const [whole, decimal = ""] = String(usdcStr).split(".");
  const decimal6 = (decimal + "000000").slice(0, 6);
  return BigInt(whole + decimal6);
}