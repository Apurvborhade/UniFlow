import express from 'express';
import { prisma } from '../lib/prisma.js';


const app = express();


enum Frequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    BIWEEKLY = 'BIWEEKLY',
    MONTHLY = 'MONTHLY'
}
export interface PayrollSchedule {
    id: string;
    frequency: Frequency;
    runAt: Date;
    isActive: boolean;
    lastRunAt?: Date;
    nextRunAt?: Date;
}


app.post("/create", async (req, res, next) => {

    const { frequency, runAt, isActive, lastRunAt, nextRunAt } = req.body as PayrollSchedule;

    try {
        if (!frequency || !runAt || isActive === undefined) {
            return res.status(400).send({ message: "Missing required fields: frequency, runAt, isActive" });
        }
        const schedule = await prisma.payrollSchedule.create({
            data: {
                frequency,
                runAt: new Date(runAt),
                isActive,
                lastRunAt: lastRunAt ? new Date(lastRunAt) : undefined,
                nextRunAt: nextRunAt ? new Date(nextRunAt) : undefined
            }
        });
        res.send({ message: "Payroll Schedule created successfully", schedule });
    } catch (error) {
        next(error)
    }
});

app.put("/update/:id", async (req, res, next) => {
    const { id } = req.params;
    const { frequency, runAt, isActive, lastRunAt, nextRunAt } = req.body as PayrollSchedule;

    try {
        const schedule = await prisma.payrollSchedule.update({
            where: { id },
            data: {
                frequency,
                runAt: runAt ? new Date(runAt) : undefined,
                isActive,
                lastRunAt: lastRunAt ? new Date(lastRunAt) : undefined,
                nextRunAt: nextRunAt ? new Date(nextRunAt) : undefined
            }
        });
        res.send({ message: "Payroll Schedule updated successfully", schedule });
    } catch (error) {
        next(error)
    }
});

app.delete("/delete/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        await prisma.payrollSchedule.delete({
            where: { id }
        });
        res.send({ message: "Payroll Schedule deleted successfully" });
    } catch (error) {
        next(error)
    }
});

app.get("/list", async (req, res, next) => {
    try {
        const schedules = await prisma.payrollSchedule.findMany();
        res.send({ schedules });
    } catch (error) {
        next(error)
    }
});

export default app;