import { CIRCLE_API_KEY, ENTITY_SECRET } from "../constants.js";
import { WalletChain } from "./transferChainConfig.js";

const GATEWAY_WALLET_ADDRESS = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9";
const GATEWAY_MINTER_ADDRESS = "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B";
const MAX_UINT256_DEC = ((1n << 256n) - 1n).toString();


if (!CIRCLE_API_KEY || !ENTITY_SECRET) {
  console.error("Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env");
  process.exit(1);
}

const DEPOSITOR_ADDRESS = "0xc1ee313c7434cd9f8aa9c1e331626495dd32fb77";
const DESTINATION_CHAIN: WalletChain = "ETH-SEPOLIA"; // "ETH-SEPOLIA" | "BASE-SEPOLIA" | "AVAX-FUJI" | "ARC-TESTNET"
const TRANSFER_AMOUNT_USDC = 0.5;

/* Burn intent and EIP-712 definitions */
type BurnIntentSpec = {
  version: number;
  sourceDomain: number;
  destinationDomain: number;
  sourceContract: string;
  destinationContract: string;
  sourceToken: string;
  destinationToken: string;
  sourceDepositor: string;
  destinationRecipient: string;
  sourceSigner: string;
  destinationCaller: string;
  value: bigint;
  salt: string;
  hookData: string;
};

type BurnIntentType = {
  maxBlockHeight: string;
  maxFee: bigint;
  spec: BurnIntentSpec;
};

type EIP712DomainType = {
  name: string;
  version: string;
};

type TypedDataMessage = {
  maxBlockHeight: string;
  maxFee: bigint;
  spec: {
    version: number;
    sourceDomain: number;
    destinationDomain: number;
    sourceContract: string;
    destinationContract: string;
    sourceToken: string;
    destinationToken: string;
    sourceDepositor: string;
    destinationRecipient: string;
    sourceSigner: string;
    destinationCaller: string;
    value: bigint;
    salt: string;
    hookData: string;
  };
};

type SignedBurnIntentRequest = {
  burnIntent: TypedDataMessage;
  signature: string | undefined;
};

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
];

const TransferSpec = [
  { name: "version", type: "uint32" },
  { name: "sourceDomain", type: "uint32" },
  { name: "destinationDomain", type: "uint32" },
  { name: "sourceContract", type: "bytes32" },
  { name: "destinationContract", type: "bytes32" },
  { name: "sourceToken", type: "bytes32" },
  { name: "destinationToken", type: "bytes32" },
  { name: "sourceDepositor", type: "bytes32" },
  { name: "destinationRecipient", type: "bytes32" },
  { name: "sourceSigner", type: "bytes32" },
  { name: "destinationCaller", type: "bytes32" },
  { name: "value", type: "uint256" },
  { name: "salt", type: "bytes32" },
  { name: "hookData", type: "bytes" },
];

const BurnIntent = [
  { name: "maxBlockHeight", type: "uint256" },
  { name: "maxFee", type: "uint256" },
  { name: "spec", type: "TransferSpec" },
];

export { GATEWAY_WALLET_ADDRESS, GATEWAY_MINTER_ADDRESS, MAX_UINT256_DEC, CIRCLE_API_KEY, ENTITY_SECRET, DEPOSITOR_ADDRESS, DESTINATION_CHAIN, TRANSFER_AMOUNT_USDC, BurnIntentType, EIP712DomainType, TypedDataMessage, SignedBurnIntentRequest, EIP712Domain, TransferSpec, BurnIntent };