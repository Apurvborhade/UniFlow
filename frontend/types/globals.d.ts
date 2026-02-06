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

}
export {};