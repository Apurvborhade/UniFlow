"use client";
import CSVUpload from "@/components/CSVUpload";
import axios from "axios";
import { motion } from "framer-motion";
import { set } from "mongoose";
import { useEffect, useState } from "react";

export default function PayrollsPage() {
  const [uploadedData, setUploadedData] = useState<ParsedPayrollData[] | null>(
    null,
  );
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [batchdate, setBatchDate] = useState<Date | null>(null);
  type PayrollHistoryItem = {
    id: string;
    employeeId: string;
    amount: string;
    createdAt: string;
    transactionId: string;
  };

  const [payrollHistory, setPayrollHistory] = useState<PayrollHistoryItem[]>(
    [],
  );
  useEffect(() => {
    const fetchPayrollHistory = async () => {
      try {
        const res = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/payroll/history",
        );

        setPayrollHistory(res.data.payrolls);
        console.log("Payroll history:", res.data.payrolls);
      } catch (err) {
        console.error("Failed to fetch payroll history", err);
      }
    };

    fetchPayrollHistory();
  }, []);
  const employeeMap = employees.reduce(
    (acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    },
    {} as Record<string, any>,
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employee = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/employees/",
        );
        const empoyeeNumber = employee.data.data;
        setEmployees(empoyeeNumber);
        console.log("Employee data:", empoyeeNumber);
        const empoyeeNumberLength = empoyeeNumber.length;
        setEmployeeCount(empoyeeNumberLength);
        console.log("Number of employees:", empoyeeNumberLength);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, []);
  useEffect(() => {
    const fetchPayrollBatch = async () => {
      try {
        const response = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/scheduler/payroll/list",
        );
        const batchData = new Date(
          response.data.schedules[0]?.nextRunAt || null,
        );
        setBatchDate(batchData);

        console.log("Payroll batch data:", batchData.getDate());
      } catch (error) {
        console.error("Failed to fetch payroll batch:", error);
      }
    };
    fetchPayrollBatch();
  }, []);

  const payrollData = {
    totalProcessed: "$25,000",
    ytdVolume: "YTD volume",
    usdcBalance: "USDC Balance",
    balanceStatus: "Active",
    distributionRate: "100%",
    nextCycle: "in 5 days",
  };
  const recipients = [
    { status: "Approved", count: employeeCount },
    { status: "Pending", count: 0 },
  ];
  const payrollSummary = {
    avgPayment: "$5,000",
    processingFee: "$250",
    netAmount: "$24,750",
  };

  return (
    <main className="max-w-5xl mx-auto px-5 py-4 flex flex-col items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-0 sm:mt-0">
        {/* Top Section - Cards */}
        <div className="grid grid-start grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Processed Card */}
          <div className="bg-white border p-6  pt-6  border-black rounded-2xl sm:p-6 md:col-span-2">
            <h3 className=" text-black text-lg  font-semibold mb-4">
              Total Processed
            </h3>
            <div className="mb-4">
              <motion.span
                initial={{ opacity: 0, y: "30%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="block"
              >
                <p className="text-3xl sm:text-4xl font-bold text-black ">
                  {payrollData.totalProcessed}
                </p>
              </motion.span>
              <p className="text-gray-600 text-sm mt-0">
                {payrollData.ytdVolume}
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{payrollData.usdcBalance}</span>
                <span className="text-black font-semibold">
                  {payrollData.balanceStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Distribution Rate</span>
                <span className="text-[#40FF00] font-bold text-lg ">
                  {payrollData.distributionRate}
                </span>
              </div>
              <hr className="border-gray-400 my-2" />
              <div className="flex justify-between">
                <span>Next Cycle</span>
                <span className="text-gray-900 font-semibold">
                  {batchdate ? batchdate.toLocaleDateString() : "No data"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:col-span-3">
            {/* Top two cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border p-6  pt-4 pb-10 border-black rounded-2xl  sm:p-8">
                <h3 className="text-black text-lg  font-semibold mb-3 mt-0 pt-0">
                  Recipients
                </h3>
                <motion.span
                  initial={{ opacity: 0, y: "30%" }}
                  animate={{ opacity: 1, y: "0%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="block"
                >
                  <p className="text-3xl sm:text-4xl font-bold text-black mb-4">
                    {employeeCount !== null ? employeeCount : "Loading..."}
                  </p>
                </motion.span>
                <div className="space-y-3 text-sm">
                  {recipients.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-gray-600"
                    >
                      <span>{r.status} :</span>
                      <span className="text-black font-semibold">
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border p-6  pt-4 pb-10 border-black rounded-2xl sm:p-8">
                <h3 className=" text-black  font-semibold text-lg mb-3">
                  Status
                </h3>
                <p className="text-2xl sm:text-1xl font-bold text-[#FEB20D] mb-4">
                  Awaiting Review
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Queue Position :</span>
                    <span className="text-gray-900 font-semibold">#3</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Est. Time :</span>
                    <span className="text-gray-900 font-semibold">2 hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="bg-white border border-black rounded-2xl  sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Payroll Summary
              </h2>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Avg. payment
                  </p>
                  <motion.span
                    initial={{ opacity: 0, y: "30%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="block"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {payrollSummary.avgPayment}
                    </p>
                  </motion.span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Processing Fee
                  </p>
                  <motion.span
                    initial={{ opacity: 0, y: "30%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="block"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {payrollSummary.processingFee}
                    </p>
                  </motion.span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Net Amount
                  </p>
                  <motion.span
                    initial={{ opacity: 0, y: "30%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="block"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {payrollSummary.netAmount}
                    </p>
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Batch Section */}
      <div className="bg-white w-full border border-black rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-2">
            Payroll Batch History
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            recipient list after payroll distribution with transaction details 
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th>Recipient</th>
                <th>Wallet</th>
                <th>Amount</th>
                <th>Chain</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payrollHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className=" text-center text-sm text-gray-500"
                  >
                    No payroll history found
                  </td>
                </tr>
              ) : (
                payrollHistory.map((item) => {
                  const employee = employeeMap[item.employeeId];

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 text-center">
                        {employee?.name}
                      </td>
                      <td className="py-4 font-mono text-center">
                        {employee?.walletAddress?.slice(0, 6)}...
                        {employee?.walletAddress?.slice(-4)}
                      </td>
                      <td className="py-4 text-center">{item.amount} USDC</td>
                      <td className="py-4 text-center">
                        {employee?.preferredChain}
                      </td>
                      <td className="py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4 mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th>Recipient</th>
                <th>Wallet</th>
                <th>Amount</th>
                <th>Chain</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payrollHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className=" text-center text-sm text-gray-500"
                  >
                    No payroll history found
                  </td>
                </tr>
              ) : (
                payrollHistory.map((item) => {
                  const employee = employeeMap[item.employeeId];

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 text-center">
                        {employee?.name}
                      </td>
                      <td className="py-4 font-mono text-center">
                        {employee?.walletAddress?.slice(0, 6)}...
                        {employee?.walletAddress?.slice(-4)}
                      </td>
                      <td className="py-4 text-center">{item.amount} USDC</td>
                      <td className="py-4 text-center">
                        {employee?.preferredChain}
                      </td>
                      <td className="py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        
        
      </div>
      <div className="bg-white border w-full border-black rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Upload Payroll Batch
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Upload a CSV file with employee payment details
        </p>

        <CSVUpload
          onDataParsed={(data) => {
            setUploadedData(data);
            console.log("[v0] CSV data parsed:", data);
          }}
        />
      </div>
      {uploadedData && uploadedData.length > 0 && (
        <div className="bg-white border w-full border-gray-200 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Uploaded Payroll Data ({uploadedData.length} records)
          </h2>

          {/* Desktop Table */}
          <div className="hidden  sm:block overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                    Recipient
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                    Wallet
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                    Chain
                  </th>
                </tr>
              </thead>
              <tbody>
                {uploadedData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-4 text-sm text-gray-900">
                      {item.recipient}
                    </td>
                    <td className="py-4 text-sm text-gray-600 font-mono truncate">
                      {item.wallet}
                    </td>
                    <td className="py-4 text-sm text-gray-900 font-semibold">
                      {item.amount}
                    </td>
                    <td className="py-4 text-sm text-gray-600">{item.chain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4 mb-6">
            {uploadedData.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.recipient}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-mono truncate">
                      {item.wallet}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600">{item.chain}</p>
                  <p className="font-bold text-gray-900">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Proceed with Upload
            </button>
            <button
              onClick={() => setUploadedData(null)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear Data
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
