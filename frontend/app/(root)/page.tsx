"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, useMotionValue, animate } from "framer-motion";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import PayrollModal from "@/components/payrollcard";
import DepositModal from "@/components/DepositModal";

const Dashboard = () => {
  const { isConnected } = useAccount();

  const inflow = useMotionValue(0);

  const [totalTreasury, setTotalTreasury] = useState(0);
  const [payrollReserve, setPayrollReserve] = useState(0);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [yieldVault, setYieldVault] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [yieldFarmingLoading, setYieldFarmingLoading] = useState(false);


  const [trigger, setTrigger] = useState(false);


  const refetchBalances = async () => {
    try {
      const [payrollRes, treasuryRes] = await Promise.all([
        axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/payroll/balance"
        ),
        axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/treasury/balance"
        ),
      ]);

      const payroll = Number(payrollRes.data.balances["Arc Testnet"]);
      const treasuryAmount = Number(
        treasuryRes.data.trasuryBalance?.amount
      );
      const usdyAmount = Number(treasuryRes.data.usdyBalance);

      setPayrollReserve(payroll);
      setAvailableFunds(treasuryAmount);
      setYieldVault(usdyAmount);
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };


  useEffect(() => {
    refetchBalances();
  }, [trigger]);

  
  useEffect(() => {
    setTotalTreasury(
      payrollReserve + availableFunds + yieldVault
    );
  }, [payrollReserve, availableFunds, yieldVault]);


  useEffect(() => {
    const controls = animate(inflow, totalTreasury, {
      duration: 0.6,
      ease: "easeOut",
    });

    return controls.stop;
  }, [totalTreasury]);

  const onDepositClick = async () => {
    if (!isConnected) {
      toast.error("Connect wallet first");
      return;
    }

    setDepositLoading(true);
    setOpenModal(true);
    setDepositLoading(false);
  };


  const deployToYieldVault = async () => {
    try {
      if (!isConnected) {
        toast.error("Connect wallet first");
        return;
      }

      if (availableFunds === 0) {
        toast.error("No funds available");
        return;
      }

      setYieldFarmingLoading(true);

      await axios.post(
        "https://uniflow-backend.apurvaborhade.dev/api/treasury/yield-farming/deposit",
        { depositAmount: availableFunds.toString() }
      );

      toast.success("Funds deployed successfully");


      setTrigger((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Error deploying to yield vault");
    } finally {
      setYieldFarmingLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-5 py-4">

      <div className="bg-white border border-black rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium mb-3">
              Total Treasury
            </h2>
            <motion.p className="text-5xl font-extrabold">
              {totalTreasury.toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            </motion.p>
            <p className="text-gray-600 mt-1">USDC Balance</p>
          </div>

          <div className="flex gap-3">
            <PayrollModal />
            <DepositModal
              openModal={openModal}
              onClose={() => setOpenModal(false)}
              setTrigger={setTrigger}
            />
            <Button
              onClick={onDepositClick}
              disabled={depositLoading}
            >
              + Deposit Funds
            </Button>
          </div>
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 mb-1">
              Available for Yield
            </p>
            <p className="text-2xl font-bold">
              {availableFunds.toLocaleString()}
            </p>
            <span className="text-gray-500 text-sm">USDC</span>
          </div>

          <div className="text-right">
            <p className="text-gray-600 mb-1">
              Payroll Reserve
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {payrollReserve.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* YIELD SECTION */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-2">
            Deploy to Yield
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Earn returns on idle funds
          </p>

          <motion.button
            onClick={deployToYieldVault}
            disabled={yieldFarmingLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold"
          >
            {yieldFarmingLoading
              ? "Deploying..."
              : "Deploy capital"}
          </motion.button>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">
            Yield Vault
          </h3>

          <p className="text-3xl font-bold">
            {yieldVault.toLocaleString()}
          </p>
          <span className="text-gray-600 text-sm">usdy</span>

          <p className="text-sm text-gray-500 mt-4">
            Capital Deployed for Yield
          </p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
