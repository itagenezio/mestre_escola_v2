"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, MapPin, Monitor, 
  Calendar, AlertCircle, LayoutGrid, ChevronRight,
  Maximize2, Minimize2, Table
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HORARIOS_AULAS, SCHEDULE_DATA, TURMAS_COLS } from "@/lib/schedule";

const AULAS_VALIDAS = HORARIOS_AULAS.filter(h => typeof h.id === 'number');

export default function MonitorTV() {
  const [now, setNow] = useState(new Date());
  const [viewMode, setViewMode] = useState<"auto" | "preview" | "full">("auto");
  const [previewAula, setPreviewAula] = useState("1");
  const [currentDia, setCurrentDia] = useState("Segunda");

  useEffect(() => {
    const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dayNum = now.getDay();
    if (dayNum === 0 || dayNum === 6) {
      setCurrentDia("Quarta");
    } else {
      setCurrentDia(daysMap[dayNum]);
    }
  }, [now]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // Encontra a aula atual
  const getCurrentAula = () => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const aula of AULAS_VALIDAS) {
      const inicioMin = parseInt(aula.inicio.split(':')[0]) * 60 + parseInt(aula.inicio.split(':')[1]);
      const fimMin = parseInt(aula.fim.split(':')[0]) * 60 + parseInt(aula.fim.split(':')[1]);
      if (currentMinutes >= inicioMin && currentMinutes < fimMin) {
        return aula;
      }
    }
    return null;
  };
  
  const currentAula = getCurrentAula();

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-8 flex flex-col font-sans overflow-hidden">
      
      {/* Header Compacto */}
      <header className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mb-1">
            <Monitor className="w-4 h-4" />
            Display de Monitoramento Sala dos Professores
          </div>
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl font-black tracking-tighter">{currentDia}</h1>
            <span className="text-4xl font-black text-indigo-500">{timeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            <NavBtn active={viewMode === "auto"} onClick={() => setViewMode("auto")} icon={<Clock className="w-3 h-3" />} label="Agora" />
            <NavBtn active={viewMode === "full"} onClick={() => setViewMode("full")} icon={<Table className="w-3 h-3" />} label="Grade do Dia" />
        </div>
      </header>

      {/* Área Principal */}
      <main className="flex-1 overflow-auto scrollbar-none">
        <AnimatePresence mode="wait">
          {viewMode === "full" ? (
            <motion.div 
               key="full-table"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               className="h-full border border-white/5 rounded-[2.5rem] bg-slate-950/40 p-1 overflow-hidden flex flex-col"
            >
               {/* Grade Geral de Professores */}
               <div className="grid grid-cols-[100px_repeat(9,1fr)] bg-slate-900/80 p-4 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div>Hora</div>
                    {TURMAS_COLS.map(t => <div key={t} className="text-center">{t}</div>)}
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-1 p-2">
                    {AULAS_VALIDAS.map((aula, i) => (
                        <div key={aula.id} className="grid grid-cols-[80px_repeat(9,1fr)] gap-1 group">
                             <div className="bg-slate-900/30 p-3 rounded-xl flex flex-col justify-center items-center border border-transparent group-hover:border-indigo-500/30 transition-colors">
                                <span className="text-indigo-400 font-bold text-xs">{aula.inicio}</span>
                                <span className="text-[8px] text-slate-600 font-black uppercase">Aula {aula.id}</span>
                             </div>
                              {TURMAS_COLS.map((_, idx) => {
                                  const item = SCHEDULE_DATA[currentDia]?.[aula.id]?.[idx] || "—";
                                  const isFree = item.includes("CARENCIA") || item.includes("REFORÇO");
                                  const isInterval = item === "INTERVALO" || item === "—";
                                  
                                  // Separa professor e matéria
                                  const parts = item.split(' - ');
                                  const prof = parts[0] || item;
                                  const mat = parts.slice(1).join(' - ') || "";
                                  
                                  return (
                                      <div 
                                         key={idx} 
                                         className={cn(
                                             "p-2 rounded-xl border flex flex-col justify-center transition-all",
                                             isInterval ? "bg-slate-900/50 border-slate-800" : isFree ? "bg-amber-500/5 border-amber-500/10" : "bg-white/5 border-white/10 group-hover:bg-white-[8%]"
                                         )}
                                      >
                                         <p className={cn("text-[10px] font-black leading-tight", isInterval ? "text-slate-700" : isFree ? "text-amber-500/50" : "text-white")}>{prof}</p>
                                         <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5 truncate">{mat}</p>
                                      </div>
                                  );
                              })}
                        </div>
                    ))}
               </div>
            </motion.div>
          ) : viewMode === "auto" ? (
            <motion.div 
              key="auto-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              {/* Header com Hora Atual */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-6 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 font-black uppercase text-xs tracking-widest mb-1">{currentDia}</p>
                  <h2 className="text-4xl font-black text-white">Dia de Aula</h2>
                </div>
                <div className="text-right">
                  <p className="text-6xl font-black text-white/90">{timeStr}</p>
                </div>
              </div>

              {/* Todas as Aulas do Dia */}
              <div className="space-y-4">
                {AULAS_VALIDAS.map((aula) => {
                  const isCurrent = currentAula?.id === aula.id;
                  return (
                    <div key={aula.id} className={cn(
                      "rounded-2xl border overflow-hidden",
                      isCurrent ? "bg-indigo-600/20 border-indigo-500/50" : "bg-slate-900/50 border-slate-800"
                    )}>
                      {/* Header da Aula */}
                      <div className={cn(
                        "px-6 py-3 flex items-center justify-between",
                        isCurrent ? "bg-indigo-600/30" : "bg-slate-800/50"
                      )}>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-3 py-1 rounded-lg font-black text-sm",
                            isCurrent ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
                          )}>
                            Aula {aula.id}
                          </span>
                          <span className="font-bold text-lg text-white">
                            {aula.inicio} às {aula.fim}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase animate-pulse">
                            AGORA
                          </span>
                        )}
                      </div>
                      
                      {/* Grade de Professores */}
                      <div className="grid grid-cols-[80px_repeat(9,1fr)] gap-1 p-3">
                        {TURMAS_COLS.map((turma, idx) => {
                          const item = SCHEDULE_DATA[currentDia]?.[aula.id.toString()]?.[idx] || "—";
                          const isFree = item.includes("CARENCIA") || item.includes("REFORÇO");
                          const parts = item.split(' - ');
                          const prof = parts[0] || item;
                          const mat = parts.slice(1).join(' - ') || "";
                          
                          return (
                            <div key={idx} className={cn(
                              "p-2 rounded-xl border flex flex-col justify-center",
                              isFree ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"
                            )}>
                              <p className={cn("text-[10px] font-black leading-tight", isFree ? "text-amber-500/60" : "text-white")}>{prof}</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase truncate">{mat}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
              <Clock className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-bold">Nenhuma aula neste horário</p>
              <p className="text-sm">Horário atual: {timeStr}</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-4 flex items-center justify-between text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] px-4">
          <div>Display v4.0 — Sala dos Professores</div>
          <div className="flex gap-10">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Sistema Sincronizado</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> PDF Processado 100%</span>
          </div>
      </footer>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
