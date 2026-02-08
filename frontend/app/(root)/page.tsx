"use client";
import BalanceTrendsChart from "@/components/BalanceTrendsChart";
import { Button } from "@/components/ui/button";
import { useDeposit } from "@/hooks/useDeposit";
import { getClientsByChainId } from "@/utils/getClients";

import axios from "axios";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import PayrollModal from "@/components/payrollcard";

import { erc20Abi, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { TREASURY_ADDRESS } from "../../utils/constants";
import DepositModal from "@/components/DepositModal";
const Dashboard = () => {
  const { address } = useAccount();

  const inflow = useMotionValue(0);
  const [countDone, setCountDone] = useState(false);
  const [totalTreasury, setTotalTreasury] = useState(0);
  const [selectedChains] = useState<string[]>(["Base Sepolia"]);
  const { deposit, loading, success, error } = useDeposit();
  const [trigger, setTrigger] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const { isConnected, chainId } = useAccount();
  const [payrollReserve, setPayrollReserve] = useState(0);
  const [availableFunds, setAvailableFunds] = useState<number>(0);
  const [YeildVault, setYeildVault] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [yeildFarmingLoading, setYieldFarmingLoading] = useState(false);


  async function onClose() {
    setOpenModal(false);
  }

  async function deployToYieldVault() {
    try {
      if (!isConnected) {
        toast.error("Connect wallet first");
        return;
      }
      if (availableFunds === 0) {
        toast.error("No funds available for deployment");
        return;
      }
      setYieldFarmingLoading(true);
      await axios.post(
        "https://uniflow-backend.apurvaborhade.dev/api/treasury/yield-farming/deposit",
        {
          depositAmount: availableFunds,
        },
      );
      setTrigger((prev) => !prev);
      toast.success("Funds deployed to yield vault successfully");
    } catch (error) {
      toast.error("Error deploying to yield vault");
      console.log(error);
    } finally {
      setYieldFarmingLoading(false);
    }
  }
  async function onDepositClick() {
    try {
      if (!isConnected) {
        toast.error("Connect wallet first");
        return;
      }

      if (selectedChains.length === 0) {
        toast.error("Select at least one chain");
        return;
      }

      setOpenModal(true);
      setDepositLoading(true);



    } catch (error) {
      console.log(error);
    } finally {
      setDepositLoading(false);
    }
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

  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        const response = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/payroll/balance",
        );
        const balances = Number(response.data.balances["Arc Testnet"])


        setPayrollReserve(balances);
      } catch (error) {
        console.error("Error fetching payroll reserve:", error);
      }
    };

    fetchTreasury();
  }, []);

  useEffect(() => {
    const fetchAvailableFunds = async () => {
      try {
        const response = await axios.get(
          "https://uniflow-backend.apurvaborhade.dev/api/treasury/balance",
        );

        const amountStr = response.data.trasuryBalance?.amount;
        const payrollVaultAmountStr = response.data.usdyBalance;

        const payrollVaultAmount = Number(payrollVaultAmountStr);
        setYeildVault(payrollVaultAmount);

        const AvailableFunds = Number(amountStr);

        setAvailableFunds(AvailableFunds);
      } catch (error) {
        console.error("Error fetching available funds:", error);
      }
    };

    fetchAvailableFunds();
  }, []);
  useEffect(() => {
    setTotalTreasury(YeildVault + payrollReserve + availableFunds);
  }, [YeildVault, payrollReserve, availableFunds]);

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
                {totalTreasury.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}
              </motion.p>

              <p className="text-gray-600 text-[17px] mt-1">USDC Balance</p>
            </div>

            <div className="flex gap-3">
              <PayrollModal />
              <DepositModal openModal={openModal} onClose={onClose} />
              <Button
                onClick={onDepositClick}
                disabled={depositLoading}
                className="bg-black cursor-pointer hover:scale-105 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                {depositLoading ? "Depositing..." : "+ Deposit Funds"}
              </Button>
            </div>
          </div>
          <hr className="my-6 border-b-gray-400" />
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-[17px] mb-2">
                Available for Yeild
              </p>
              <motion.span
                initial={{ opacity: 0, y: "30%" }}
                animate={{ opacity: 1, y: "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="block"
              >
                <p className="text-2xl font-bold text-black">
                  {availableFunds.toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })}
                </p>
                <span className="text-gray-500 text-sm">USDC</span>
              </motion.span>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-[17px] mb-2">Payroll Reserve</p>
              <p className="text-2xl font-bold text-blue-600">
                {payrollReserve.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-3 gap-5 mb-8">
          {/* Balance Trends Chart */}

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
              onClick={deployToYieldVault}
                disabled={yeildFarmingLoading}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="group  mt-7 cursor-pointer relative w-full overflow-hidden rounded-lg bg-black py-3 font-semibold text-white"
            >
              <span className="relative z-10">{yeildFarmingLoading ? "Deploying..." : "Deploy capital"}</span>
            </motion.button>
          </div>

          <div className="bg-white border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-black">Yield Vault</h3>

            <motion.span
              initial={{ opacity: 0, y: "30%" }}
              animate={{ opacity: 1, y: "0%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="block text-3xl font-bold text-black"
            >
              <p className="text-3xl font-bold text-black">
                {YeildVault.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}{" "}
              </p>
              <div className="text-[17px] font-semibold text-gray-600">
                usdy
              </div>
            </motion.span>

            <p className="text-gray-600 text-sm mt-1">
              Capital Deployed for Yield
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Base APY (USYC)</span>
                <span className="font-semibold text-black">3.45%</span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Bonus APY (Lock-up)</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">1 Month</span>
                    <span className="font-medium text-black">7.50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">3 Months</span>
                    <span className="font-medium text-black">13.50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">12 Months</span>
                    <span className="font-medium text-green-600">16.90%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
