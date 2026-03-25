"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, FileText, 
  MessageSquare, LayoutGrid, Award, 
  ChevronRight, ArrowUpRight, GraduationCap,
  CheckCircle2, BellRing, AlertCircle
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useSchoolStore } from "@/lib/store";
import { HORARIOS_AULAS, SCHEDULE_DATA, TURMAS_COLS } from "@/lib/schedule";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";

export default function StudentDashboard() {
  const store = useSchoolStore();
  
  const [minhaTurma, setMinhaTurma] = useState("9º B"); 
  const [horarioHoje, setHorarioHoje] = useState<string[]>([]);
  const [diaSemana, setDiaSemana] = useState("Segunda");
  const [isLido, setIsLido] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const today = daysMap[new Date().getDay()];
    setDiaSemana(SCHEDULE_DATA[today] ? today : "Segunda");

    const idxTurma = TURMAS_COLS.indexOf(minhaTurma);
    const aulas = Object.entries(SCHEDULE_DATA[diaSemana] || {}).map(([num, turmas]) => {
        return turmas[idxTurma] || "Livre";
    });
    setHorarioHoje(aulas);
  }, [minhaTurma, diaSemana]);

  const minhaAtividade = store.atividades[minhaTurma] || "Nenhuma atividade lançada ainda.";
  const meusRecados = store.recados[minhaTurma] || [];

  const handleMarcarLido = () => {
      setIsLido(true);
      if (store.marcarLido) {
        store.marcarLido("recado_geral", "João Victor");
        playNotification("success");
      }
  };

  const handleConcluir = () => {
      setIsDone(true);
      if (store.marcarConcluido) {
        store.marcarConcluido(minhaTurma, "João Victor");
        playNotification("success");
      }
  };

  return (
    <div className="flex flex-col pb-20 relative">
      <div className="fixed bottom-10 right-10 z-[50]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-purple-600 p-6 rounded-[2rem] shadow-2xl border border-white/20 flex items-center gap-4"
          >
              <div className="bg-white/10 p-3 rounded-xl animate-pulse">
                <BellRing className="w-6 h-6 text-white" />
              </div>
              <div className="max-w-[150px]">
                  <p className="text-[10px] font-black uppercase text-purple-200 tracking-widest">Alerta de Aula Hoje</p>
                  <p className="font-bold text-white leading-tight">Aula 4: Português em 10 min!</p>
              </div>
          </motion.div>
      </div>

      <header className="mb-12">
        <BackButton />
        <motion.div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
          <GraduationCap className="w-3 h-3" /> Digital Aluno : João Victor
        </motion.div>
        <h1 className="text-4xl font-black mb-4 tracking-tight">O que temos hoje?</h1>
        <p className="text-slate-500 font-medium text-lg tracking-tight">Fique por dentro das aulas e atividades da turma {minhaTurma}.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">🎯 Atividade do Dia</h2>
            <GlassCard className={cn(
                "p-8 border-indigo-500/20 bg-indigo-500/[4%] relative overflow-hidden group transition-all",
                isDone && "bg-emerald-500/[4%] border-emerald-500/20 shadow-xl shadow-emerald-500/10"
            )}>
               <div className="flex items-start gap-6">
                  <div className={cn(
                      "p-4 rounded-2xl shadow-xl transition-all group-hover:rotate-12",
                      isDone ? "bg-emerald-600 shadow-emerald-600/30" : "bg-indigo-600 shadow-indigo-600/30"
                  )}>
                     {isDone ? <CheckCircle2 className="w-8 h-8 text-white" /> : <FileText className="w-8 h-8 text-white" />}
                  </div>
                  <div className="flex-1">
                     <h3 className="text-2xl font-black mb-2">{isDone ? "Concluído com Sucesso!" : "Tarefa de Hoje:"}</h3>
                     <p className={cn("text-slate-300 font-bold text-xl italic", isDone && "line-through opacity-50")}>{minhaAtividade}</p>
                     {!isDone && (
                        <button 
                            onClick={handleConcluir}
                            className="mt-6 px-8 py-3 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95 cursor-pointer"
                        >
                            Concluir Tarefa
                        </button>
                     )}
                  </div>
               </div>
            </GlassCard>
          </section>

          <section>
             <h2 className="text-2xl font-black mb-6 flex items-center gap-3">🗓️ Meu Quadro : {diaSemana}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {horarioHoje.map((item, i) => {
                    const h = HORARIOS_AULAS.filter(a => typeof a.id === 'number')[i];
                    if (!h) return null;
                    const [prof, mat] = item.split('(');
                    
                    return (
                        <GlassCard key={i} delay={i * 0.05} className="p-4 border-white/5 flex flex-col justify-between group h-32 hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-start">
                               <div className="text-[10px] font-black text-slate-700 uppercase">{h.inicio} - {h.fim}</div>
                               <Clock className="w-4 h-4 text-slate-800 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <div>
                               <p className="font-black text-slate-200 text-lg leading-tight">{prof}</p>
                               <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{mat?.replace(')', '') || "—"}</p>
                            </div>
                        </GlassCard>
                    );
                })}
             </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <section>
             <h2 className="text-2xl font-black mb-6 flex items-center gap-3">💬 Mural de Recados</h2>
             <div className="flex flex-col gap-4">
                {meusRecados.length === 0 && <p className="text-slate-600 text-sm italic">O mural está vazio hoje.</p>}
                {meusRecados.map((recado, i) => (
                    <div key={i} className={cn(
                        "p-6 bg-purple-600/5 border border-purple-500/20 rounded-3xl relative overflow-hidden group transition-all",
                        isLido && "opacity-40 grayscale-[0.5]"
                    )}>
                        <div className="w-1.5 h-full bg-purple-600 absolute left-0 top-0" />
                        <p className={cn("text-slate-300 font-bold text-sm leading-relaxed mb-6", isLido && "line-through")}>{recado}</p>
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] font-black uppercase text-slate-700 tracking-widest leading-none">Prof. Titular</span>
                            {!isLido && (
                                <button 
                                    onClick={handleMarcarLido}
                                    className="px-4 py-2 bg-purple-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    Marcar como Lido
                                </button>
                            )}
                        </div>
                    </div>
                ))}
             </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
