"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, CheckCircle, Clock, 
  BarChart3, PlusCircle, MessageSquare, 
  Search, ChevronRight, UserMinus, UserCheck,
  Award, TrendingUp, X, Check, Bell, Loader2,
  FileText, Send, Trash2, Calendar, MapPin
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";
import { useSchoolStore } from "@/lib/store";
import { HORARIOS_AULAS, SCHEDULE_DATA, TURMAS_COLS } from "@/lib/schedule";

export default function TeacherDashboard() {
  const { atividades, recados, setAtividade, addRecado, vistos, concluidos, userName } = useSchoolStore();
  const profName = userName !== "Usuário" ? userName : "Professor(a)";
  const [selectedTurma, setSelectedTurma] = useState("9º B");
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);
  
  const [agendaHoje, setAgendaHoje] = useState<{ aula: string; turma: string; horario: string; materia: string }[]>([]);
  const [novaAtiv, setNovaAtiv] = useState("");
  const [novoRecado, setNovoRecado] = useState("");

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Acha as aulas deste professor no Quadro de Horários
    const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const today = daysMap[new Date().getDay()];
    const diaEfetivo = SCHEDULE_DATA[today] ? today : "Segunda";

    const minhaAgenda: { aula: string; turma: string; horario: string; materia: string }[] = [];
    
    // Extrai apenas o nome do professor (remove acentos e espaços extras)
    const profSearch = profName.toUpperCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    Object.entries(SCHEDULE_DATA[diaEfetivo]).forEach(([aulaNum, turmas]) => {
      turmas.forEach((aula, idx) => {
        // Normaliza a string da aula para busca
        const aulaNorm = aula.toUpperCase().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Procura pelo nome do professor seguido de separador (- ou espaço)
        if (aulaNorm.includes(profSearch) || aulaNorm.includes(profSearch + ' -') || aulaNorm.includes(profSearch + '-')) {
          const h = HORARIOS_AULAS.find(a => a.id.toString() === aulaNum);
          minhaAgenda.push({ 
            aula: aulaNum, 
            turma: TURMAS_COLS[idx], 
            horario: `${h?.inicio || ""} às ${h?.fim || ""}`,
            materia: aula
          });
        }
      });
    });

    // Ordena por horário
    minhaAgenda.sort((a, b) => a.horario.localeCompare(b.horario));

    setAgendaHoje(minhaAgenda);
  }, [profName]);

  const handleLancarAtividade = () => {
    if (!novaAtiv) return showToast("⚠️ Informe a atividade.", "info");
    setAtividade(selectedTurma, novaAtiv); 
    setNovaAtiv("");
    playNotification("success");
    showToast(`✅ Atividade lançada para ${selectedTurma}!`);
  };

  const handlePostarRecado = () => {
    if (!novaAtiv) return showToast("⚠️ Escreva o recado primeiro.", "info");
    addRecado(selectedTurma, novaAtiv);
    setNovaAtiv("");
    playNotification("notification");
    showToast(`🔔 Recado postado no mural de ${selectedTurma}.`);
  };

  return (
    <div className="flex flex-col pb-20">
      
      {/* Alarme de Próxima Aula */}
      <div className="fixed bottom-10 right-10 z-[50]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-indigo-600 p-6 rounded-[2rem] shadow-2xl border border-white/20 flex items-center gap-4"
          >
              <div className="bg-white/10 p-3 rounded-xl animate-bounce">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase text-indigo-200">Próxima Aula Alarme</p>
                  <p className="font-bold text-white leading-tight">Aula 2 em 10 min: 9º B</p>
              </div>
          </motion.div>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <BackButton />
           <motion.div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
             Painel do Mestre v3.6
           </motion.div>
           <h1 className="text-4xl font-black mb-4 tracking-tight">Agenda de {profName}</h1>
           <p className="text-slate-500 font-medium text-lg">Confira seus horários e lance atividades do dia.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Minha Agenda do Dia */}
          <section className="xl:col-span-5 space-y-6">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">🗓️ Minha Agenda Hoje <span className="text-xs text-slate-500 font-normal">(clique para selecionar turma)</span></h2>
              <div className="space-y-4">
                  {agendaHoje.map((a, i) => (
                      <GlassCard 
                        key={i} 
                        onClick={() => setSelectedTurma(a.turma)}
                        className={cn(
                          "p-6 border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between group cursor-pointer",
                          selectedTurma === a.turma && "border-indigo-500 bg-indigo-500/10"
                        )}
                      >
                          <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center font-black">
                                 <span className="text-[10px] text-slate-600">Aula</span>
                                 <span className="text-xl text-indigo-400">{a.aula}</span>
                              </div>
                               <div>
                                  <h3 className="text-xl font-black text-white">{a.turma}</h3>
                                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{a.horario}</p>
                                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{a.materia}</p>
                               </div>
                          </div>
                          <MapPin className={cn("w-6 h-6 transition-colors", selectedTurma === a.turma ? "text-indigo-500" : "text-slate-800 group-hover:text-indigo-600")} />
                      </GlassCard>
                  ))}
                  {agendaHoje.length === 0 && <p className="text-slate-700 italic">Nenhuma aula encontrada para hoje.</p>}
              </div>
          </section>

          {/* Área de Comandos */}
          <div className="xl:col-span-7 space-y-10">
              <section className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-black">🚀 Lançamentos</h2>
                     <select 
                        value={selectedTurma} 
                        onChange={(e) => setSelectedTurma(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-black"
                     >
                        {TURMAS_COLS.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <textarea 
                            value={novaAtiv} onChange={(e) => setNovaAtiv(e.target.value)}
                            placeholder="Atividade de hoje: Ex: Exercícios pág 12..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-slate-200 placeholder-slate-700 focus:border-indigo-500 focus:outline-none transition-all resize-none shadow-inner"
                    />
                    <div className="flex gap-4">
                       <button onClick={handleLancarAtividade} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-indigo-500 transition-all active:scale-95">Lançar Atividade</button>
                       <button onClick={handlePostarRecado} className="px-8 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"><MessageSquare className="w-5 h-5" /></button>
                    </div>
                  </div>
              </section>

              {/* Status da Turma */}
              <section>
                 <h2 className="text-2xl font-black mb-6">👁️ Rastro de Atividade : {selectedTurma}</h2>
                 <div className="grid grid-cols-2 gap-6">
                    <StatusCard 
                        label="Leram Recados" 
                        value={vistos[selectedTurma]?.length || 0} 
                        color="text-purple-400" 
                        sub="Alunos visualizaram" 
                    />
                    <StatusCard 
                        label="Ativ. Prontas" 
                        value={concluidos[selectedTurma]?.length || 0} 
                        color="text-emerald-400" 
                        sub="Alunos concluíram" 
                    />
                 </div>
              </section>
          </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, color, sub }: { label: string, value: number, color: string, sub: string }) {
    return (
        <GlassCard className="p-8 border-white/5 space-y-2">
             <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest leading-none">{label}</p>
             <h3 className={cn("text-5xl font-black tracking-tighter", color)}>{value}</h3>
             <p className="text-[10px] text-slate-700 font-bold uppercase">{sub}</p>
        </GlassCard>
    );
}
