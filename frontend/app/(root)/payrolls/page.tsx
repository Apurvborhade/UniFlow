
export default function PayrollsPage() {
  return (
    
   <main className="max-w-5xl mx-auto px-5 py-4 flex flex-col items-center">
  <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-0 sm:mt-0">

    {/* Top Section - Cards */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">

      {/* Total Processed Card */}
      <div className="bg-white border border-black rounded-2xl p-6 sm:p-8 md:col-span-2">
        {/* content */}
      </div>

      {/* Right Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:col-span-3">

        {/* Top two cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-black rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Recipients</h2>
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
