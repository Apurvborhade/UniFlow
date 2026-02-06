"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const items = ["Treasury", "payrolls", "Schedule"];

export default function Navbar() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return (
    <div className="max-w-7xl  mx-auto px-5 py-4 flex items-center justify-between relative ">
      <Link href="/" className="text-6xl font-bold text-gray-900">
        Uniflow
      </Link>

      <nav
        className="hidden md:flex gap-2 rounded-full bg-white p-1 relative"
        onMouseLeave={() => {
          setHovered(null);
        }}
      >
        {items.map((item, i) => (
          <Link
            key={item}
            href={`/${item === "Treasury" ? "/" : item.toLowerCase()}`}
            onMouseEnter={() => setHovered(i)}
            className="relative px-6 py-2 text-gray-900 cursor-pointer rounded-full hover:text-gray-900 "
          >
            {hovered === i && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute inset-0 rounded-full bg-gray-200"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item}</span>
          </Link>
        ))}
      </nav>
      <button className="hidden md:block group relative overflow-hidden rounded-full font-semibold border-2 hover:cursor-pointer bg-black px-6 py-3 text-white transition-colors duration-500 hover:text-black">
        <span className="relative z-10">Connect Wallet</span>

        <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-700 ease-out group-hover:scale-[4]" />
      </button>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center justify-center"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? (
          <X size={24} className="text-gray-900" />
        ) : (
          <Menu size={24} className="text-gray-900" />
        )}
      </button>
      {mobileMenuOpen && (
        <div className="absolute top-full right-0 w-48 md:hidden bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-5 py-4 flex flex-col gap-2">
            {items.map((item) => (
              <Link
                key={item}
                href={`/${item === "Treasury" ? "/" : item.toLowerCase()}`}
                className="px-4 py-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <button className="group relative overflow-hidden rounded-full font-semibold border-2 hover:cursor-pointer bg-black px-6 py-3 text-white transition-colors duration-500 hover:text-black w-full">
              <span className="relative z-10">Connect Wallet</span>
              <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-700 ease-out group-hover:scale-[4]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
