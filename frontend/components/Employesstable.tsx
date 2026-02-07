export default function EmployeeTable({
  employees,
  loading,
  onEdit,
  onDelete,
}: any) {
  if (loading) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-white">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Name
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Wallet
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Salary
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Chain
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee:any) => (
              <tr
                key={employee.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-4 text-sm font-medium text-gray-900">
                  {employee.name}
                </td>

                <td className="py-4 text-sm text-gray-600">
                  {employee.walletAddress ? (
                    <span className="truncate block max-w-45">
                      {employee.walletAddress}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="py-4 text-sm text-gray-900">
                  ${employee.salaryAmount}
                </td>

                <td className="py-4 text-sm">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                    {employee.preferredChain}
                  </span>
                </td>

                <td className="py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      employee.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>

                <td className="py-4">
                  <div className="flex gap-2">
                    <button
                      
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      
                      className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
