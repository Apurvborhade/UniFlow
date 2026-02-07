import axios from "axios";
import { useState } from "react";

const CHAINS = ["ETH_SEPOLIA", "ARC_TESTNET", "AVAX_FUJI", "BASE_SEPOLIA"];
const STATUSES = ["ACTIVE", "INACTIVE"];

export default function EmployeeFormModal({
  employee,
  onClose,
  onSuccess,
}: any) {
  const [form, setForm] = useState({
    name: employee?.name || "",
    walletAddress: employee?.walletAddress || "",
    salaryAmount: employee?.salaryAmount || "",
    preferredChain: employee?.preferredChain || "ETH_SEPOLIA",
    status: employee?.status || "ACTIVE",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      if (employee) {
        await axios.put(
          "https://uniflow-backend.apurvaborhade.dev/api/employees",
          { ...form, id: employee.id }
        );
      } else {
        
        await axios.post(
          "https://uniflow-backend.apurvaborhade.dev/api/employees/add",
          form
        );
      }
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            {employee ? "Edit Employee" : "Add Employee"}
          </h2>
          <p className="text-sm text-gray-500">
            Enter employee payroll details
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
            />
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <input
              value={form.walletAddress}
              onChange={(e) =>
                setForm({ ...form, walletAddress: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="0x..."
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Amount
            </label>
            <input
              type="number"
              value={form.salaryAmount}
              onChange={(e) =>
                setForm({ ...form, salaryAmount: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="1000"
            />
          </div>

          {/* Preferred Chain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Chain
            </label>
            <select
              value={form.preferredChain}
              onChange={(e) =>
                setForm({ ...form, preferredChain: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              {CHAINS.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
