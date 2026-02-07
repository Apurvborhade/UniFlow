import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import csv from 'csv-parser';
import { Readable } from "stream";

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
        if(preferredChain !== "ETH_SEPOLIA" && preferredChain !== "BASE_SEPOLIA" && preferredChain !== "AVAX_FUJI" && preferredChain !== "ARC_TESTNET"){
            throw new AppError('Invalid preferredChain. Must be one of: ETH_SEPOLIA, BASE_SEPOLIA, AVAX_FUJI, ARC_TESTNET', 400);
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

async function bulkUploadEmployees(req: any, res: any, next: any) {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const employees: Employee[] = [];
        const fileBuffer = req.file.buffer;

        await new Promise((resolve, reject) => {
            Readable.from([fileBuffer])
                .pipe(csv({
                    headers: [
                        "name",
                        "walletAddress",
                        "salaryAmount",
                        "preferredChain",
                        "status",
                        "lastPaidAt",
                        "totalPaid"
                    ],
                    skipLines: 2
                }))
                .on('data', (row: any) => {
                    console.log(row)
                    employees.push({
                        name: row.name,
                        walletAddress: row.walletAddress,
                        salaryAmount: parseFloat(row.salaryAmount),
                        preferredChain: row.preferredChain,
                        status: row.status,
                        lastPaidAt: row.lastPaidAt ? new Date(row.lastPaidAt) : new Date(),
                        totalPaid: parseFloat(row.totalPaid) || 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (employees.length === 0) {
            throw new AppError('CSV file is empty', 400);
        }


        const createdEmployees = await prisma.employee.createMany({
            data: employees as any[],
        });

        res.status(201).send({
            message: `${createdEmployees.count} employees created successfully`,
            data: createdEmployees
        });
    } catch (error) {
        next(error);
    }
}

async function updateEmployee(req: any, res: any, next: any) {
    const { id, name, walletAddress, salaryAmount, preferredChain, status, lastPaidAt, totalPaid } = req.body;
    try {
        if (!id) {
            throw new AppError('Missing required field: id', 400);
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: {
                name,
                walletAddress,
                salaryAmount,
                preferredChain,
                status,
                lastPaidAt,
                totalPaid,
                updatedAt: new Date(),
            },
        });

        res.status(200).send({ message: 'Employee updated successfully', data: updatedEmployee });
    } catch (error) {
        next(error);
    }
}

async function deleteEmployee(req: any, res: any, next: any) {
    const { id } = req.params;
    try {
        if (!id) {
            throw new AppError('Missing required field: id', 400);
        }

        const deletedEmployee = await prisma.employee.delete({
            where: { id },
        });

        res.status(200).send({ message: 'Employee deleted successfully', data: deletedEmployee });
    } catch (error) {
        next(error);
    }
}

export { createEmployee, getEmployees, bulkUploadEmployees,updateEmployee,deleteEmployee };