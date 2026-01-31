import { NODE_ENV } from "../utils/constants";



export async function errorHandler(err: any, req: any, res: any, next: any) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    if (NODE_ENV === 'development') {
        console.error(err);
    }
    res.status(statusCode).json({ error: message });
}