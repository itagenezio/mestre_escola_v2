"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Book, ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HORARIOS_AULAS, SCHEDULE_DATA, TURMAS_COLS } from "@/lib/schedule";
import { useSchoolStore } from "@/lib/store";

const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

export default function SchedulePage() {
  const { userName } = useSchoolStore();
  const profName = userName !== "Usuário" ? userName : "";
  const today = new Date().getDay();
  const todayIndex = today >= 1 && today <= 5 ? today - 1 : 0;
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const currentDay = weekDays[selectedDay];
  const aulasValidas = HORARIOS_AULAS.filter(h => typeof h.id === 'number');

  // Filtrar apenas as aulas deste professor
  const minhaAgenda: { aula: string; turma: string; horario: string; materia: string }[] = [];
  
  if (profName) {
    const profUpper = profName.toUpperCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    Object.entries(SCHEDULE_DATA[currentDay] || {}).forEach(([aulaNum, turmas]) => {
      turmas.forEach((aula, idx) => {
        const aulaNorm = aula.toUpperCase().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (aulaNorm.includes(profUpper) || aulaNorm.includes(profUpper + ' -') || aulaNorm.includes(profUpper + '-')) {
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
    
    minhaAgenda.sort((a, b) => a.horario.localeCompare(b.horario));
  }

  return (
    <div className="flex flex-col">
      <BackButton />

      <header className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-2 tracking-tight"
        >
          Meu Horário Escolar
        </motion.h1>
        <p className="text-slate-500 font-medium text-lg">
          {profName ? `Horário de ${profName}` : "Horário do dia"}
        </p>
      </header>

      {/* Day selector */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedDay((d) => Math.max(0, d - 1))}
          disabled={selectedDay === 0}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white disabled:opacity-30 transition-all shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {weekDays.map((dia, i) => (
          <button
            key={dia}
            onClick={() => setSelectedDay(i)}
            className={cn(
              "px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shrink-0 cursor-pointer",
              selectedDay === i
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            {dia}
          </button>
        ))}

        <button
          onClick={() => setSelectedDay((d) => Math.min(weekDays.length - 1, d + 1))}
          disabled={selectedDay === weekDays.length - 1}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white disabled:opacity-30 transition-all shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day label */}
      <motion.div
        key={currentDay}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <Calendar className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest">{currentDay}</h2>
        <span className="text-slate-600 text-sm font-semibold">— {minhaAgenda.length} aula{minhaAgenda.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {/* Aulas list */}
      <motion.div
        key={`aulas-${currentDay}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {minhaAgenda.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-600">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">Sem aulas neste dia</p>
            <p className="text-sm mt-1">Aproveite para revisar os conteúdos!</p>
          </div>
        )}
        {minhaAgenda.map((aula, j) => (
          <GlassCard key={j} delay={0.05 * j} className="p-6 border-l-4 border-indigo-500 bg-indigo-500/5 transition-all hover:scale-[1.01]">
            <div className="flex justify-between items-start mb-5">
              <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-widest uppercase">
                {aula.aula}ª aula
              </span>
              <Book className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{aula.turma}</h3>
            <p className="text-lg text-indigo-400 font-bold mb-5">{aula.materia}</p>
            <div className="flex flex-col gap-2 text-slate-500 font-semibold text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">{aula.horario}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      <div className="h-20" />
    </div>
  );
}
