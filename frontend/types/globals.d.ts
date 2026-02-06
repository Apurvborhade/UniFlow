declare global {
    interface ParsedPayrollData {
      recipient: string;
      wallet: string;
      amount: string;
      chain: string;
    }
    interface ParsedPayrollData {
      recipient: string;
      wallet: string;
      amount: string;
      chain: string;
    }
    
    interface CSVUploadProps {
      onDataParsed?: (data: ParsedPayrollData[]) => void;
    }
    type Frequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
    
    interface PayrollSchedule {
      id: string;
      frequency: Frequency;
      runAt: string;
      isActive: boolean;
      lastRunAt: string | null;
      nextRunAt: string | null;
    }
    

}
export {};