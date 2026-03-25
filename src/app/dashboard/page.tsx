"use client";

import { motion } from "framer-motion";
import { 
  Calendar, CheckCircle, Clock, 
  Bell, FileText, ChevronRight, User
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Link from "next/link";

export default function Dashboard() {
  const aulas = [
    { disciplina: "Matemática", horario: "08:00 - 09:40", sala: "Sala 04", cor: "border-indigo-500" },
    { disciplina: "Física", horario: "10:00 - 11:40", sala: "Sala 02", cor: "border-purple-500" },
    { disciplina: "Robótica", horario: "13:30 - 15:00", sala: "Lab Maker", cor: "border-pink-500" },
  ];

  const tarefas = [
    { titulo: "Lista: Equações 2º Grau", prazo: "Amanhã 18:00", disciplina: "Matemática" },
    { titulo: "Projeto: Sensor Arduino", prazo: "Quinta 23:59", disciplina: "Robótica" },
  ];

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold"
          >
            Olá, João Victor!
          </motion.h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Bom ver você de volta v3.0</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-colors">
            <Bell className="w-6 h-6 text-slate-400" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-slate-900" />
          </button>
          <Link href="/dashboard/settings" className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform block">
            <div className="w-full h-full rounded-[14px] bg-slate-950 overflow-hidden">
              <User className="w-full h-full p-2.5 text-slate-400 hover:text-white transition-colors" />
            </div>
          </Link>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <GlassCard delay={0.1}>
          <div className="flex justify-between items-start">
            <CheckCircle className="text-green-400 w-8 h-8" />
            <span className="text-xs font-bold bg-green-400/10 text-green-400 px-3 py-1 rounded-full uppercase tracking-wider">Excelente</span>
          </div>
          <h3 className="text-4xl font-black mt-6 tracking-tight">92%</h3>
          <p className="text-slate-500 font-semibold mt-1">Presença Geral</p>
        </GlassCard>

        <Link href="/dashboard/tasks" className="block group">
          <GlassCard delay={0.2} className="cursor-pointer group-hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between items-start">
              <Clock className="text-orange-400 w-8 h-8" />
              <span className="text-xs font-bold bg-orange-400/10 text-orange-400 px-3 py-1 rounded-full uppercase tracking-wider">Pendentes</span>
            </div>
            <h3 className="text-4xl font-black mt-6 tracking-tight group-hover:text-orange-400 transition-colors">4</h3>
            <p className="text-slate-500 font-semibold mt-1 group-hover:text-orange-400/70 transition-colors">Tarefas Ativas</p>
          </GlassCard>
        </Link>

        <Link href="/dashboard/schedule" className="block group">
          <GlassCard delay={0.3} className="bg-indigo-600/5 border-indigo-500/20 shadow-indigo-500/5 cursor-pointer group-hover:bg-indigo-600/10 transition-colors">
            <div className="flex justify-between items-start">
              <Calendar className="text-indigo-400 w-8 h-8" />
              <span className="text-xs font-bold bg-indigo-400/10 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">Regular</span>
            </div>
            <h3 className="text-3xl font-black mt-6 tracking-tight group-hover:text-indigo-400 transition-colors">9º Ano B</h3>
            <p className="text-slate-500 font-semibold mt-1 group-hover:text-indigo-400/70 transition-colors">Sua Turma Atual</p>
          </GlassCard>
        </Link>
      </div>

      {/* Routine Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-500 rounded-full" />
          Aulas de Hoje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aulas.map((aula, i) => (
            <Link href="/dashboard/schedule" key={i} className="block group">
              <GlassCard delay={0.4 + i * 0.1} className={`h-full border-l-4 ${aula.cor} hover:bg-slate-800/50 transition-colors cursor-pointer group-hover:scale-[1.02] group-hover:border-indigo-400`}>
                <h3 className="text-2xl font-bold tracking-tight">{aula.disciplina}</h3>
                <div className="flex flex-col gap-3 mt-6 text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span className="text-slate-200">{aula.horario}</span>
                  </div>
                  <div className="inline-flex items-center bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-xl w-fit text-sm">
                    {aula.sala}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Tarefas Section */}
      <section>
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-purple-500 rounded-full" />
          Próximas Tarefas
        </h2>
        <div className="space-y-4">
          {tarefas.map((tarefa, i) => (
            <Link key={i} href="/dashboard/tasks" className="block group">
              <GlassCard delay={0.6 + i * 0.1} className="p-5 md:p-7 interactive cursor-pointer group-hover:border-purple-500/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 shadow-inner group-hover:bg-purple-500/20 transition-colors">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl tracking-tight text-white group-hover:text-purple-400 transition-colors">{tarefa.titulo}</h3>
                      <p className="text-slate-500 font-medium mt-1">
                        <span className="text-purple-400">{tarefa.disciplina}</span> • Prazo: {tarefa.prazo}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-700 rounded-xl group-hover:bg-purple-600 transition-all shadow-lg">
                    <ChevronRight className="text-slate-300 group-hover:text-white" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-20" /> {/* Spacer */}
    </div>
  );
}
