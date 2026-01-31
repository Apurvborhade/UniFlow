import { prisma } from "../lib/prisma.js";

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
    try {
        const { name, walletAddress, salaryAmount, preferredChain, status, lastPaidAt, totalPaid } = req.body;

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

export { createEmployee };