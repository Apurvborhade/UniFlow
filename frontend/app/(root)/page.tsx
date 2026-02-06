"use client";
import BalanceTrendsChart from "@/components/BalanceTrendsChart";
import { Button } from "@/components/ui/button";
import { useDeposit } from "@/hooks/useDeposit";
import { useWallet } from "@/contexts/walletContext";

import axios from "axios";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PayrollModal from "@/components/payrollcard";

const Dashboard = () => {
  const { address } = useWallet();

  const inflow = useMotionValue(0);
  const [countDone, setCountDone] = useState(false);
  const [totalTreasury, setTotalTreasury] = useState(0);
  const [selectedChains] = useState<string[]>(["Base Sepolia"]);
  const { deposit, loading, success, error } = useDeposit();
  const [trigger, setTrigger] = useState(false);

  const { isConnected } = useWallet();

  async function onDepositClick() {
    if (!isConnected) {
      toast.error("Connect wallet first");
      return;
    }

    if (selectedChains.length === 0) {
      toast.error("Select at least one chain");
      return;
    }

    await deposit(["ethereum", "base", "avalanche", "arc"]);
  }
  useEffect(() => {
    if (success) {
      toast.success("Funds deposited successfully");
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const APY = 0.085;
  const projectedMonthly = Math.round((totalTreasury * APY) / 12);
  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        const response = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/payroll/balance",
        );
        const balances = response.data.balances;
        const totalFunds = Object.values(balances)
          .map((val: unknown) => Number(val as string) || 0) // convert each value to number safely
          .reduce((acc, curr) => acc + curr, 0);

        setTotalTreasury(totalFunds);
      } catch (error) {
        console.error("Error fetching treasury balance:", error);
      }
    };

    fetchTreasury();
  }, []);

  const formattedInflow = useTransform(
    inflow,
    (value) => `${Math.round(value).toLocaleString()}`,
  );

  useEffect(() => {
    const controls = animate(inflow, totalTreasury, {
      duration: 0.6,
      ease: "easeOut",
      onComplete: () => setCountDone(true),
    });

    return controls.stop;
  }, [totalTreasury]);

  return (
    <div>
      <section className="max-w-5xl  mx-auto px-5 py-4 flex flex-col items-center justify-between">
        <div className="bg-white w-full border border-black rounded-xl p-6 mb-8 pt-6 pb-10">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-black font-medium text-lg mb-4">
                Total Treasury
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl font-extrabold text-black"
              >
                {formattedInflow}
              </motion.p>

              <p className="text-gray-600 text-[17px] mt-1">USDC Balance</p>
            </div>

            <div className="flex gap-3">
              <PayrollModal />
              <Button onClick={onDepositClick} disabled={loading}>
                {loading ? "Depositing..." : "+ Deposit Funds"}
              </Button>
            </div>
          </div>
          <hr className="my-6 border-b-gray-400" />
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-[17px] mb-2">
                Available for Deployment
              </p>
              <motion.span
                initial={{ opacity: 0, y: "30%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="block"
              >
                <p className="text-2xl font-bold text-black">$125,500</p>
              </motion.span>
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
              <motion.span
                initial={{ opacity: 0, y: "30%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="block"
              >
                <p className="text-3xl font-extrabold text-black">$44,000</p>
              </motion.span>
              {countDone && (
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
              )}
            </div>

            <div className="bg-white border  flex-1   h-full  border-gray-700 rounded-xl p-6">
              <h3 className="text-black font-bold mb-4">Current APY</h3>
              <motion.span
                initial={{ opacity: 0, y: "30%" }}
                whileInView={{ opacity: 1, y: "0%" }}
                viewport={{ once: true, amount: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="block"
              >
                <p className="text-3xl font-bold text-black">{APY * 100}%</p>
              </motion.span>
            </div>
          </div>
        </div>
        {/* Deploy to Yield Section */}
        <div className="grid w-full grid-cols-3 gap-6">
          <div className="bg-white col-span-2 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-black mb-2">
              Deploy to Yeild
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Earn returns on idle funds with optimized strategies
            </p>
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => alert("Deploying capital...")}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="group  mt-7 cursor-pointer relative w-full overflow-hidden rounded-lg bg-black py-3 font-semibold text-white"
            >
              <span className="relative z-10">Deploy capital</span>
            </motion.button>
          </div>

          <div className="bg-white border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-black">
              Projected Yield
            </h3>

            <motion.span
              initial={{ opacity: 0, y: "30%" }}
              animate={{ opacity: 1, y: "0%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="block text-3xl font-bold text-blacktext-3xl text-black"
            >
              <p className="text-3xl font-bold text-black">
                ${projectedMonthly.toLocaleString()}
              </p>
            </motion.span>

            <p className="text-gray-600 text-sm mt-1">
              Estimated monthly earnings
            </p>

            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-gray-500">Current APY</span>
              <span className="font-semibold text-black">8.5%</span>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Projection based on current treasury balance
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
