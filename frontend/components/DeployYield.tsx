import { useDeposit } from "@/hooks/useDeposit";
import { TREASURY_ADDRESS } from "@/utils/constants";
import { getClientsByChainId } from "@/utils/getClients";
import axios from "axios";
import { useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import { useAccount } from "wagmi";

function DeployYield({ openModal, onClose, setTrigger, deployToYield }: { openModal: boolean, onClose: () => void, setTrigger: React.Dispatch<React.SetStateAction<boolean>>, deployToYield: (amount: number) => Promise<void> }) {
    if (!openModal) return null;
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { chainId, address } = useAccount();
    const { deposit } = useDeposit();



    async function handleDeposit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        try {
            const depositAmount = parseFloat(amount);
            if (isNaN(depositAmount) || depositAmount <= 0) {
                throw new Error("Invalid deposit amount");
            }
            await deployToYield(depositAmount);
            setTrigger((prev) => !prev);
            onClose();
        } catch (error) {
            console.error("Deposit failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10">
            <div className="bg-white rounded-lg shadow-lg p-8 w-96">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Deploy Funds</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>
                <form className="space-y-4" onSubmit={handleDeposit}>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (USD)
                        </label>
                        <input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Deploying...
                            </>
                        ) : (
                            "Deploy"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default DeployYield