"use client";
import { motion } from "framer-motion";
export default function PayrollsPage() {
  const payrollData = {
    totalProcessed: "$25,000",
    ytdVolume: "YTD volume",
    usdcBalance: "USDC Balance",
    balanceStatus: "Active",
    distributionRate: "100%",
    nextCycle: "in 5 days",
  };
  const recipients = [
    { status: "Approved", count: 4 },
    { status: "Pending", count: 1 },
  ];
  return (
    <main className="max-w-5xl mx-auto px-5 py-4 flex flex-col items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-0 sm:mt-0">
        {/* Top Section - Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Processed Card */}
          <div className="bg-white border p-6  pt-6 pb-10 border-black rounded-2xl sm:p-6 md:col-span-2">
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
                  {payrollData.nextCycle}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:col-span-3">
            {/* Top two cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border p-6 mb-8 pt-4 pb-10 border-black rounded-2xl  sm:p-8">
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
                    {recipients.reduce((sum, r) => sum + r.count, 0)}
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

              <div className="bg-white border border-black rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Status</h2>
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="bg-white border border-black rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Payroll Summary
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Batch Section */}
      <div className="bg-white w-full border border-black rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Payroll Batch
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Review and approve recipient list before distribution
          </p>
        </div>
      </div>
    </main>
  );
}
