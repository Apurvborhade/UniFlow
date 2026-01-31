import { prisma } from "../lib/prisma.js";

async function getEmployees() {
    try {
        return await prisma.employee.findMany();
    } catch (error) {
       console.log(error)
    }
}

export { getEmployees };