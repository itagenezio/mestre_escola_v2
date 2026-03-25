"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.05, x: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800/50 rounded-xl text-slate-400 hover:text-white transition-all mb-8 font-semibold w-fit shadow-sm"
    >
      <ArrowLeft className="w-5 h-5" />
      Voltar
    </motion.button>
  );
}
