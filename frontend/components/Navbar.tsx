"use client";
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link";



const items = ["Treasury","Payments","payrolls"];

export default function Navbar() {
  const [hovered, setHovered] = useState<number | null>(null)
 




  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-none z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="text-6xl font-bold text-gray-900">
          Uniflow
        </Link>

        <nav className="flex gap-2 rounded-full bg-white p-1 relative" 
      
        onMouseLeave={()=>{
          setHovered(null)
        
          }}>
          {items.map((item, i) => (
            <button
              key={item}
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
            

            </button>
          ))}
        </nav>
        <button className="group relative overflow-hidden rounded-full font-semibold border-2 hover:cursor-pointer bg-black px-6 py-3 text-white transition-colors duration-500 hover:text-black">
          <span className="relative z-10">Connect Wallet</span>

          <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-700 ease-out group-hover:scale-[4]" />
        </button>
      </div>
    </div>
  );
}
