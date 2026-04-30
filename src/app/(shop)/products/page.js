"use client";

import ProductSection from "@/components/ProductSection";
import { useState, useCallback } from "react";

export default function ProductsPage() {
  const [pochonSelected, setPochonSelected] = useState(false);

  const handleSelectionChange = useCallback((selected) => {
    setPochonSelected(selected);
  }, []);

  return (
    <div className="relative flex flex-col flex-1 items-center font-sans h-screen overflow-hidden">
      <img
        src="/table_bois.png"
        alt=""
        className={`absolute -bottom-10 left-1/2 -translate-x-1/2 min-w-[120vw] pointer-events-none z-12 transition-all duration-1000 ease-in-out ${
          pochonSelected
            ? "opacity-0 translate-y-20 scale-105"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      />
      {/* <img
        src="/table_weed4.png"
        alt=""
        className={`absolute bottom-28 left-0 w-full pointer-events-none z-13 transition-all duration-1000 ease-in-out ${
          pochonSelected
            ? "opacity-0 translate-y-20 scale-105"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      /> */}
      <ProductSection onSelectionChange={handleSelectionChange} />
      {/* <img
        src="/table_weed5.png"
        alt=""
        className={`absolute bottom-8 left-0 w-full pointer-events-none z-20 transition-all duration-1000 ease-in-out ${
          pochonSelected
            ? "opacity-0 translate-y-20 scale-105"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      /> */}
    </div>
  );
}
