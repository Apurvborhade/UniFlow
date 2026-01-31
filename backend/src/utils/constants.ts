import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || '';
export const ENTITY_SECRET = process.env.ENTITY_SECRET || '';