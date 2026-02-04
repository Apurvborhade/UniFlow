"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-none z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="text-6xl font-bold text-gray-900">
          Uniflow
        </Link>

        <div className="flex items-center gap-8 border-none">
          <Link
            href="/payments"
            className={`text-sm font-regular transition-colors ${
              isActive("/payments")
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Payments
          </Link>
          <Link
            href="/treasury"
            className={`text-sm font-medium transition-colors ${
              isActive("/treasury")
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Treasury
          </Link>
          <Link
            href="/payrolls"
            className={`text-sm font-medium transition-colors ${
              isActive("/payrolls")
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Payrolls
          </Link>
        </div>

        <button className="group relative overflow-hidden rounded-full font-semibold border-2 hover:cursor-pointer bg-black px-6 py-3 text-white transition-colors duration-500 hover:text-black">
          <span className="relative z-10">Connect Wallet</span>

          <span
            className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-700 ease-out group-hover:scale-[4]"
          />
        </button>
      </div>
    </nav>
  );
}
