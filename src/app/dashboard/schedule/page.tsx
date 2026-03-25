"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Book, ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

const schedule: Record<string, { hora: string; materia: string; sala: string; prof: string; cor: string }[]> = {
  "Segunda": [
    { hora: "08:00", materia: "Matemática",   sala: "Sala 04",  prof: "Dr. Santos",    cor: "border-indigo-500 bg-indigo-500/5" },
    { hora: "09:40", materia: "Física",       sala: "Lab 02",   prof: "Profa. Carla",  cor: "border-cyan-500 bg-cyan-500/5" },
    { hora: "11:00", materia: "História",     sala: "Sala 12",  prof: "Prof. Marcos",  cor: "border-amber-500 bg-amber-500/5" },
  ],
  "Terça": [
    { hora: "08:00", materia: "Química",      sala: "Lab 01",   prof: "Dr. Lima",      cor: "border-emerald-500 bg-emerald-500/5" },
    { hora: "09:40", materia: "Artes",        sala: "Ateliê",   prof: "Profa. Eliana", cor: "border-pink-500 bg-pink-500/5" },
    { hora: "13:30", materia: "Ed. Física",   sala: "Quadra",   prof: "Prof. Reinaldo",cor: "border-orange-500 bg-orange-500/5" },
  ],
  "Quarta": [
    { hora: "08:00", materia: "Português",    sala: "Sala 08",  prof: "Profa. Clara",  cor: "border-purple-500 bg-purple-500/5" },
    { hora: "09:40", materia: "Robótica",     sala: "Lab Maker",prof: "Prof. Neto",    cor: "border-indigo-500 bg-indigo-500/5" },
    { hora: "11:00", materia: "Matemática",   sala: "Sala 04",  prof: "Dr. Santos",    cor: "border-indigo-500 bg-indigo-500/5" },
  ],
  "Quinta": [
    { hora: "08:00", materia: "Geografia",    sala: "Sala 10",  prof: "Profa. Fátima", cor: "border-teal-500 bg-teal-500/5" },
    { hora: "09:40", materia: "Biologia",     sala: "Lab Bio",  prof: "Dr. Costa",     cor: "border-green-500 bg-green-500/5" },
  ],
  "Sexta": [
    { hora: "08:00", materia: "Inglês",       sala: "Sala 15",  prof: "Prof. Jack",    cor: "border-blue-500 bg-blue-500/5" },
    { hora: "09:40", materia: "Filosofia",    sala: "Sala 09",  prof: "Profa. Irene",  cor: "border-slate-400 bg-slate-400/5" },
    { hora: "13:30", materia: "Projeto Maker",sala: "Lab Maker",prof: "Prof. Neto",    cor: "border-rose-500 bg-rose-500/5" },
  ],
};

export default function SchedulePage() {
  const today = new Date().getDay(); // 0=Dom, 1=Seg...
  const todayIndex = today >= 1 && today <= 5 ? today - 1 : 0;
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const currentDay = weekDays[selectedDay];
  const aulas = schedule[currentDay] ?? [];

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
        <p className="text-slate-500 font-medium text-lg">Confira suas aulas da semana — 9º Ano B</p>
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
        <span className="text-slate-600 text-sm font-semibold">— {aulas.length} aula{aulas.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {/* Aulas list */}
      <motion.div
        key={`aulas-${currentDay}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {aulas.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-600">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">Sem aulas neste dia</p>
            <p className="text-sm mt-1">Aproveite para revisar os conteúdos!</p>
          </div>
        )}
        {aulas.map((aula, j) => (
          <GlassCard key={j} delay={0.05 * j} className={cn("p-6 border-l-4 transition-all hover:scale-[1.01]", aula.cor)}>
            <div className="flex justify-between items-start mb-5">
              <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-widest uppercase">
                {aula.hora}
              </span>
              <Book className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold mb-5">{aula.materia}</h3>
            <div className="flex flex-col gap-2 text-slate-500 font-semibold text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">{aula.sala}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-400">{aula.prof}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      <div className="h-20" />
    </div>
  );
}
