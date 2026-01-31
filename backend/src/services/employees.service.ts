import { prisma } from "../lib/prisma.js";

async function getEmployees(req: any, res: any, next: any) {
    try {
        const employees = await prisma.employee.findMany();
        res.status(200).send({ data: employees });
    } catch (error) {
        next(error);
    }
}

export { getEmployees };