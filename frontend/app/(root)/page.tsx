"use client";
import BalanceTrendsChart from "@/components/BalanceTrendsChart";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <div>
      <section className="max-w-5xl  mx-auto px-5 py-4 flex flex-col items-center justify-between">
        <div className="bg-white w-full border border-black rounded-xl p-6 mb-8 pt-6 pb-10">
          <h2 className="text-black font-medium text-lg mb-4">
            Total Treasury
          </h2>
          <div className="mb-6">
            <p className="text-5xl font-extrabold text-black">$657,500</p>
            <p className="text-gray-600 text-[17px] mt-1">USDC Balance</p>
          </div>
          <hr className="my-6 border-b-gray-400" />
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-[17px] mb-2">
                Available for Deployment
              </p>
              <p className="text-2xl font-bold text-black">$125,500</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-[17px] mb-2">
                Reserved for Payroll
              </p>
              <p className="text-2xl font-bold text-blue-600">$60,000</p>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-3 gap-5 mb-8">
          {/* Balance Trends Chart */}
          <div className="col-span-2 bg-white border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              Balance trends
            </h3>
            <BalanceTrendsChart />
          </div>

          {/* Right Column Stats */}
          <div className="flex flex-col justify-between gap-6">
            <div className="bg-white border overflow-hidden flex-2 h-full border-gray-700 rounded-xl p-6">
              <h3 className="text-black text-lg font-semibold mb-4">
                Monthly inflow
              </h3>
              <p className="text-3xl font-bold text-black">$44,000</p>
              <motion.span
                initial={{ opacity: 0, y: "30%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="block"
              >
                <p className="text-[#26FF00] pt-3 text-[20px]  font-bold mt-2">
                  ↑ 12% from last month
                </p>
              </motion.span>
            </div>

            <div className="bg-white border  flex-1   h-full  border-gray-700 rounded-xl p-6">
              <h3 className="text-black font-semibold mb-4">Current APY</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
