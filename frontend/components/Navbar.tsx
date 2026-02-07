"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { ChainSwitcher } from "./ChainSwitcher";

const items = ["Treasury", "Payrolls", "Schedule","Employees"];

export default function Navbar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine active tab index based on current pathname
  const activeIndex = items.findIndex((item) => {
    const route = item === "Treasury" ? "/" : `/${item.toLowerCase()}`;
    return pathname === route;
  });

  return (
    <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between relative">
      <Link href="/" className="text-6xl font-bold text-gray-900">
        Uniflow
      </Link>

      <nav
        className="hidden md:flex gap-2 rounded-full bg-white p-1 relative"
        onMouseLeave={() => setHovered(null)}
      >
        {items.map((item, i) => {
          const isActive = activeIndex === i;
          const isHover = hovered === i;

          return (
            <Link
              key={item}
              href={item === "Treasury" ? "/" : `/${item.toLowerCase()}`}
              onMouseEnter={() => setHovered(i)}
              className="relative px-6 py-2 text-gray-900 cursor-pointer rounded-full hover:text-gray-900"
            >
              {(isHover || isActive) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-full bg-gray-200"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item}</span>
            </Link>
          );
        })}
      </nav>

      {/* Connect Wallet Button */}
      <ConnectKitButton />

      <button
        className="md:hidden flex items-center justify-center"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-full right-0 w-48 md:hidden bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-5 py-4 flex flex-col gap-2">
            {items.map((item) => (
              <Link
                key={item}
                href={item === "Treasury" ? "/" : `/${item.toLowerCase()}`}
                className="px-4 py-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
