const Dashboard = () => {
  return (
    <section className="max-w-7xl  mx-auto px-5 py-4 flex items-center justify-between">
      <div className="bg-white w-full border border-black rounded-xl p-6 mb-8 pt-6 pb-10">
        <h2 className="text-black font-medium text-lg mb-4">Total Treasury</h2>
        <div className="mb-6">
          <p className="text-4xl font-bold text-gray-900">$657,500</p>
          <p className="text-gray-600 text-[17px] mt-1">USDC Balance</p>
        </div>
        <hr className="my-6 border-b-gray-400" />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 text-[17px] mb-2">
              Available for Deployment
            </p>
            <p className="text-2xl font-bold text-gray-900">$125,500</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-[17px] mb-2">Reserved for Payroll</p>
            <p className="text-2xl font-bold text-blue-600">$60,000</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
