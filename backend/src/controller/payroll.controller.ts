import { getEmployees } from "../services/employees.service.js";
import { getBalance } from "../services/treasury.service.js";


async function runPayroll(req: any, res: any, next: any) {
    try {
        const employees = await getEmployees();

        const totalSalary = employees?.reduce((acc: any, employee) => acc + employee.salaryAmount.toNumber(), 0.0);

        const balance = await getBalance();


        const tokenBalances = balance.data?.tokenBalances?.reduce((acc: any, token: any) => {
            acc[token.token.blockchain] = token.amount;
            return acc;
        }, {});

        
        res.send({ message: 'Payroll run successfully', totalSalary: totalSalary, employeeCount: employees?.length, tokenBalances: tokenBalances });
    } catch (error) {
        next(error)
    }
}

export { runPayroll };