"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Bell, User, Clock, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useSchoolStore } from "@/lib/store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";

export default function MuralPage() {
  const { recados, userClass } = useSchoolStore();
  const [isLido, setIsLido] = useState<Record<number, boolean>>({});

  const recadosTurma = recados[userClass] || [];

  const handleMarcarLido = (index: number) => {
    setIsLido(prev => ({ ...prev, [index]: true }));
    playNotification("success");
  };

  return (
    <div className="flex flex-col pb-20">
      <header className="mb-12">
        <BackButton />
        <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
          <MessageSquare className="w-3 h-3" /> Mural de Comunicação
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tight">Recados da Escola</h1>
        <p className="text-slate-500 font-medium text-lg tracking-tight">Fique por dentro dos avisos importantes dos seus professores.</p>
      </header>

      <div className="max-w-3xl w-full">
        <div className="space-y-6">
          {recadosTurma.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
               <MessageSquare className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
               <p className="text-slate-600 font-bold text-xl italic uppercase tracking-widest">Nenhum recado no momento.</p>
               <p className="text-[10px] text-slate-800 font-black mt-2 uppercase tracking-[0.3em]">Tudo tranquilo por aqui!</p>
            </div>
          ) : (
            recadosTurma.map((recado, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className={cn(
                  "p-10 border-purple-500/20 bg-purple-500/[4%] relative overflow-hidden group transition-all",
                  isLido[i] && "opacity-40 grayscale-[0.8]"
                )}>
                  <div className="absolute top-0 left-0 w-2 h-full bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.5)]" />
                  
                  <div className="flex justify-between items-start mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-purple-400 group-hover:scale-110 transition-transform">
                           <User className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="font-black text-white text-lg tracking-tight">Prof. Titular</p>
                           <p className="text-[10px] text-purple-400/80 font-black uppercase tracking-widest">Direto da Coordenação</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-slate-600 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Hoje</span>
                     </div>
                  </div>

                  <p className={cn(
                    "text-slate-200 text-2xl font-bold leading-snug tracking-tight mb-10 transition-all",
                    isLido[i] && "line-through"
                  )}>
                    {recado}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-8">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Ativo</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                           <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Urgente</span>
                        </div>
                     </div>

                     {!isLido[i] ? (
                       <button 
                         onClick={() => handleMarcarLido(i)}
                         className="flex items-center gap-3 px-8 py-3 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-purple-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group-hover:bg-purple-500"
                       >
                          Lido e Entendido
                          <CheckCircle2 className="w-4 h-4" />
                       </button>
                     ) : (
                       <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Visualizado
                       </span>
                     )}
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
