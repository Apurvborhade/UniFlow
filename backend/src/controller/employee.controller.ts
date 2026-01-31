import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

interface Employee {
    id?: string;
    name: string;
    walletAddress?: string;
    salaryAmount: number;
    preferredChain: string;
    status: string;
    lastPaidAt: Date;
    totalPaid: number;
    createdAt: Date;
    updatedAt: Date;
}


async function createEmployee(req: any, res: any, next: any) {
    const { name, walletAddress, salaryAmount, preferredChain, status, lastPaidAt, totalPaid } = req.body;
    try {
        if (!name || !salaryAmount || !preferredChain || !status) {
            throw new AppError('Missing required fields: name, salaryAmount, preferredChain, status', 400);
        }
        const newEmployee = await prisma.employee.create({
            data: {
                name,
                walletAddress,
                salaryAmount,
                preferredChain,
                status,
                lastPaidAt,
                totalPaid,
            },
        });

        res.status(201).send({ message: 'Employee created successfully', data: newEmployee });
    } catch (error) {
        next(error);
    }

}

async function getEmployees(req: any, res: any, next: any) {
    try {
        const employees = await prisma.employee.findMany();
        res.status(200).send({ data: employees });
    } catch (error) {
        next(error);
    }
}



export { createEmployee, getEmployees };