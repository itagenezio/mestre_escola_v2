"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Clock, AlertCircle, CheckCircle2,
  Search, ChevronRight, Check
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";

const initialTasks = [
  { id: 1, text: "Trabalho: Robótica Maker", disciplina: "Robótica", prazo: "Hoje 23:59", status: "pendente", icon: AlertCircle },
  { id: 2, text: "Lista: Funções Químicas", disciplina: "Química", prazo: "Amanhã 18:00", status: "atrasado", icon: Clock },
  { id: 3, text: "Resumo: Segunda Guerra", disciplina: "História", prazo: "Sex 12:00", status: "concluido", icon: CheckCircle2 },
  { id: 4, text: "Ensaio: Arte Moderna", disciplina: "Artes", prazo: "Seg 08:00", status: "pendente", icon: FileText },
];

export default function TasksPage() {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleConcluido = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = t.status === "concluido" ? "pendente" : "concluido";
        playNotification(next === "concluido" ? "success" : "notification");
        showToast(next === "concluido" ? "✅ Tarefa concluída!" : "↩️ Tarefa reaberta.");
        return { ...t, status: next, icon: next === "concluido" ? CheckCircle2 : t.icon };
      })
    );
  };

  const filteredTasks = tasks.filter((t) => {
    const matchFilter = filter === "todos" || t.status === filter;
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase()) ||
      t.disciplina.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <BackButton />

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black mb-2 tracking-tight"
          >
            Minhas Atividades
          </motion.h1>
          <p className="text-slate-500 font-medium text-lg">Organize suas entregas e prazos</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          <FilterBtn active={filter === "todos"} onClick={() => setFilter("todos")}>Todas</FilterBtn>
          <FilterBtn active={filter === "pendente"} onClick={() => setFilter("pendente")}>Pendentes</FilterBtn>
          <FilterBtn active={filter === "atrasado"} onClick={() => setFilter("atrasado")}>Atrasadas</FilterBtn>
          <FilterBtn active={filter === "concluido"} onClick={() => setFilter("concluido")}>Concluídas</FilterBtn>
        </div>
      </header>

      {/* Search — funcional */}
      <div className="relative mb-8 max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar atividade ou disciplina..."
          className="w-full pl-12 pr-6 py-4 bg-slate-900/40 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-slate-600"
            >
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">Nenhuma atividade encontrada</p>
              <p className="text-sm mt-1">Tente outro filtro ou termo de busca.</p>
            </motion.div>
          )}
          {filteredTasks.map((tarefa, i) => (
            <motion.div
              key={tarefa.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "p-4 rounded-2xl shadow-inner transition-colors",
                      tarefa.status === "atrasado" ? "bg-red-500/10 text-red-400" :
                      tarefa.status === "concluido" ? "bg-green-500/10 text-green-400" :
                      "bg-indigo-500/10 text-indigo-400"
                    )}>
                      <tarefa.icon className="w-7 h-7" />
                    </div>

                    <div>
                      <h3 className={cn(
                        "text-xl font-bold tracking-tight mb-1 transition-colors",
                        tarefa.status === "concluido" ? "line-through text-slate-500" : "text-white"
                      )}>
                        {tarefa.text}
                      </h3>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-indigo-400 uppercase tracking-widest text-[10px]">{tarefa.disciplina}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">Prazo: {tarefa.prazo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "hidden md:block text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border",
                      tarefa.status === "atrasado" ? "border-red-500/20 text-red-500 bg-red-500/5" :
                      tarefa.status === "concluido" ? "border-green-500/20 text-green-500 bg-green-500/5" :
                      "border-slate-700 text-slate-500"
                    )}>
                      {tarefa.status}
                    </span>

                    {/* Botão de marcar como concluído */}
                    <button
                      onClick={() => handleToggleConcluido(tarefa.id)}
                      className={cn(
                        "p-2.5 rounded-xl transition-all active:scale-90 shadow-md",
                        tarefa.status === "concluido"
                          ? "bg-green-500 text-white"
                          : "bg-white/5 text-slate-600 hover:bg-green-500/20 hover:text-green-400"
                      )}
                      title={tarefa.status === "concluido" ? "Reabrir tarefa" : "Marcar como concluída"}
                    >
                      <Check className="w-5 h-5" />
                    </button>

                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-600">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-20" />
    </div>
  );
}

function FilterBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
        active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-200"
      )}
    >
      {children}
    </button>
  );
}
