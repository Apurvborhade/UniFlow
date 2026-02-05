import cron from 'node-cron'
import { prisma } from '../lib/prisma.js';
import { runPayroll } from '../controller/payroll.controller.js';
import fetch from 'node-fetch'


async function runScheduledPayrolls() {
    const schedules = await prisma.payrollSchedule.findMany({
        where: { isActive: true },
    });

    for (const schedule of schedules) {
        if (!shouldRun(schedule) && !schedule.isActive) continue;

        await fetch(`http://localhost:${process.env.PORT}/payroll/run`, {})

        await prisma.payrollSchedule.update({
            where: { id: schedule.id },
            data: {
                lastRunAt: new Date(),
                nextRunAt: computeNext(schedule),
            },
        });

        
    }
}

cron.schedule('* * * * *', runScheduledPayrolls);

function shouldRun(schedule: any): boolean {
    const now = new Date();
    return schedule.nextRunAt && now >= schedule.nextRunAt;
}

function computeNext(schedule: any): Date | null {
    const now = new Date();
    let next: Date | null = null;

    switch (schedule.frequency) {
        case 'DAILY':
            next = new Date(now.setDate(now.getDate() + 1));
            break;
        case 'WEEKLY':
            next = new Date(now.setDate(now.getDate() + 7));
            break;
        case 'BIWEEKLY':
            next = new Date(now.setDate(now.getDate() + 14));
            break;
        case 'MONTHLY':
            next = new Date(now.setMonth(now.getMonth() + 1));
            break;
        default:
            next = null;
    }

    return next;
}

