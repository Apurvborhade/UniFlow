import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || '';
export const ENTITY_SECRET = process.env.ENTITY_SECRET || '';

export const USYC_WHITELISTED_WALLET = process.env.USYC_WHITELISTED_WALLET || '';
export const USYC_TELLER_ADDRESS = process.env.USYC_TELLER_ADDRESS || '';

export const ARC_USDC_TESTNET_ADDRESS = process.env.ARCTESTNET_USDC_CONTRACT_ADDRESS || '';
