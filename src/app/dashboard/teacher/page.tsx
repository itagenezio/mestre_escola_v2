"use client";

/**
 * Painel do Professor — Mestre da Escola
 * ──────────────────────────────────────
 * - Horário carregado do banco (mestre_horarios), filtrado pelo nome do professor
 * - Destaque do dia de hoje e mini-visão semanal
 * - Atividades, recados e rastreio da turma
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, MapPin, Calendar, Clock,
  BookOpen, ChevronRight, Send,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";
import { useSchoolStore } from "@/lib/store";
import { TURMAS_COLS } from "@/lib/schedule";
import { useClassNotifications } from "@/hooks/useClassNotifications";
import { apiJson } from "@/lib/api";

// ── Tipos ────────────────────────────────────────────────────────────
interface HorarioSlot {
  id: string;
  professor_nome: string;
  dia_semana: string;
  aula_numero: number;
  horario_inicio: string;
  horario_fim: string;
  disciplina: string;
  turma: string;
  sala: string;
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS_JS     = [1, 2, 3, 4, 5, 6]; // Date.getDay() → índice em DIAS_SEMANA

// ── Paleta por disciplina (mesma do módulo de horários) ───────────────
const PALETA = [
  { border: "border-indigo-500", bg: "bg-indigo-500/10", text: "text-indigo-300", badge: "bg-indigo-600/20 text-indigo-300" },
  { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-300", badge: "bg-purple-600/20 text-purple-300" },
  { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-300", badge: "bg-emerald-600/20 text-emerald-300" },
  { border: "border-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-300",   badge: "bg-amber-600/20 text-amber-300" },
  { border: "border-rose-500",    bg: "bg-rose-500/10",    text: "text-rose-300",    badge: "bg-rose-600/20 text-rose-300" },
  { border: "border-cyan-500",    bg: "bg-cyan-500/10",    text: "text-cyan-300",    badge: "bg-cyan-600/20 text-cyan-300" },
  { border: "border-orange-500",  bg: "bg-orange-500/10",  text: "text-orange-300",  badge: "bg-orange-600/20 text-orange-300" },
  { border: "border-teal-500",    bg: "bg-teal-500/10",    text: "text-teal-300",    badge: "bg-teal-600/20 text-teal-300" },
];

function corDisciplina(disc: string) {
  let h = 0;
  for (let i = 0; i < disc.length; i++) h = (h * 31 + disc.charCodeAt(i)) % PALETA.length;
  return PALETA[Math.abs(h)];
}

// ── Componente principal ──────────────────────────────────────────────
export default function TeacherDashboard() {
  useClassNotifications();

  const { userName, atividades, recados, vistos, concluidos, setAtividade, addRecado, fetchFromSupabase } = useSchoolStore();
  const profName = userName !== "Usuário" ? userName : "Professor(a)";

  useEffect(() => { fetchFromSupabase(); }, [fetchFromSupabase]);

  // ── Horários do banco ─────────────────────────────────────────────
  const [todosHorarios, setTodosHorarios] = useState<HorarioSlot[]>([]);
  const [carregando, setCarregando]       = useState(true);

  const carregarHorarios = useCallback(async () => {
    try {
      const data = await apiJson<HorarioSlot[]>("/api/mestre/horarios");
      // Filtra apenas os horários deste professor
      const meus = data.filter(
        h => h.professor_nome.toLowerCase() === profName.toLowerCase()
      );
      setTodosHorarios(meus);
    } catch { /* silencioso */ }
    setCarregando(false);
  }, [profName]);

  useEffect(() => { carregarHorarios(); }, [carregarHorarios]);

  // ── Dia ativo (hoje por padrão) ───────────────────────────────────
  const hojeIdx = (() => {
    const d = new Date().getDay();
    const i = DIAS_JS.indexOf(d);
    return i >= 0 ? i : 0;
  })();
  const [diaAtivo, setDiaAtivo] = useState(hojeIdx);

  const aulasNoDia = todosHorarios
    .filter(h => h.dia_semana === DIAS_SEMANA[diaAtivo])
    .sort((a, b) => a.aula_numero - b.aula_numero);

  // ── Próxima aula em tempo real ────────────────────────────────────
  const [proximaAula, setProximaAula] = useState<HorarioSlot | null>(null);

  useEffect(() => {
    const calcular = () => {
      const agora = new Date();
      const hhmm  = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
      const dIdx  = DIAS_JS.indexOf(agora.getDay());
      if (dIdx < 0) { setProximaAula(null); return; }
      const nomeDia = DIAS_SEMANA[dIdx];
      const proxima = todosHorarios
        .filter(h => h.dia_semana === nomeDia && h.horario_fim > hhmm)
        .sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio))[0] ?? null;
      setProximaAula(proxima);
    };
    calcular();
    const t = setInterval(calcular, 60_000);
    return () => clearInterval(t);
  }, [todosHorarios]);

  // ── Totais por dia ────────────────────────────────────────────────
  const totalPorDia = DIAS_SEMANA.map(dia =>
    todosHorarios.filter(h => h.dia_semana === dia).length
  );

  // ── Turma selecionada / atividades ────────────────────────────────
  const [selectedTurma, setSelectedTurma] = useState("9º B");
  const [novaAtiv,      setNovaAtiv]      = useState("");
  const [novoRecado,    setNovoRecado]    = useState("");
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLancarAtividade = () => {
    if (!novaAtiv.trim()) return showToast("⚠️ Informe a atividade.", "info");
    setAtividade(selectedTurma, novaAtiv);
    setNovaAtiv("");
    playNotification("success");
    showToast(`✅ Atividade lançada para ${selectedTurma}!`);
  };

  const handlePostarRecado = () => {
    if (!novoRecado.trim()) return showToast("⚠️ Escreva o recado primeiro.", "info");
    addRecado(selectedTurma, novoRecado);
    setNovoRecado("");
    playNotification("notification");
    showToast(`🔔 Recado postado no mural de ${selectedTurma}.`);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col pb-24">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-white/10 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta próxima aula */}
      {proximaAula && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-10 right-6 z-50"
        >
          <div className={cn(
            "p-5 rounded-[2rem] shadow-2xl border flex items-center gap-4",
            corDisciplina(proximaAula.disciplina).bg,
            corDisciplina(proximaAula.disciplina).border,
          )}>
            <div className="p-3 rounded-xl animate-bounce bg-white/10">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Próxima Aula</p>
              <p className="font-black text-white leading-tight">{proximaAula.disciplina} — {proximaAula.turma}</p>
              <p className="text-xs text-slate-300">{proximaAula.horario_inicio} às {proximaAula.horario_fim}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cabeçalho */}
      <header className="mb-10">
        <BackButton />
        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Painel do Mestre
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-1">Olá, {profName} 👋</h1>
        <p className="text-slate-500 font-medium">Seu horário e suas turmas de hoje</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* ══ COLUNA ESQUERDA — Horário ══════════════════════════════ */}
        <section className="xl:col-span-7 space-y-6">

          {/* Seletor de dia */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DIAS_SEMANA.map((dia, i) => {
              const isHoje = i === hojeIdx;
              const qtd   = totalPorDia[i];
              return (
                <button
                  key={dia}
                  onClick={() => setDiaAtivo(i)}
                  className={cn(
                    "flex flex-col items-center px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shrink-0 relative min-w-[72px]",
                    diaAtivo === i
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : isHoje
                      ? "bg-slate-800 border border-indigo-500/50 text-indigo-400"
                      : "bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  {dia.slice(0, 3)}
                  <span className={cn(
                    "text-[10px] font-bold mt-0.5",
                    diaAtivo === i ? "text-indigo-200" : "text-slate-600"
                  )}>
                    {qtd > 0 ? `${qtd} aula${qtd > 1 ? 's' : ''}` : '—'}
                  </span>
                  {isHoje && diaAtivo !== i && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-slate-950" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Rótulo do dia */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest">
              {DIAS_SEMANA[diaAtivo]}
              {diaAtivo === hojeIdx && (
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                  HOJE
                </span>
              )}
            </h2>
          </div>

          {/* Cards de aulas */}
          {carregando ? (
            <div className="flex items-center gap-3 py-10 text-slate-600">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"
              />
              Carregando horário...
            </div>
          ) : aulasNoDia.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">Sem aulas neste dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aulasNoDia.map((slot, idx) => {
                const cor = corDisciplina(slot.disciplina);
                const agora = new Date();
                const hhmm  = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
                const emAndamento = diaAtivo === hojeIdx && slot.horario_inicio <= hhmm && hhmm < slot.horario_fim;
                const jaPAssou    = diaAtivo === hojeIdx && slot.horario_fim <= hhmm;

                return (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedTurma(slot.turma)}
                    className={cn(
                      "relative group rounded-2xl border-l-4 p-4 transition-all cursor-pointer",
                      emAndamento ? "ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-400/10" : "",
                      jaPAssou    ? "opacity-40" : "",
                      selectedTurma === slot.turma ? "ring-1 ring-indigo-500/40" : "",
                      cor.border, cor.bg
                    )}
                  >
                    {emAndamento && (
                      <span className="absolute -top-2 right-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-0.5 rounded-full">
                        EM ANDAMENTO
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      {/* Número da aula */}
                      <div className="w-12 h-12 bg-slate-950/60 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] text-slate-600 font-black uppercase">Aula</span>
                        <span className={cn("text-lg font-black", cor.text)}>{slot.aula_numero}</span>
                      </div>

                      {/* Disciplina + turma */}
                      <div className="flex-1 min-w-0">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider mb-1", cor.badge)}>
                          <BookOpen className="w-3 h-3" />
                          {slot.disciplina}
                        </span>
                        <p className="text-base font-black truncate">{slot.turma}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.horario_inicio} – {slot.horario_fim}
                          </span>
                          {slot.sala && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Sala {slot.sala}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        selectedTurma === slot.turma ? "text-indigo-400" : "text-slate-700"
                      )} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══ COLUNA DIREITA — Ações + Turma ════════════════════════ */}
        <div className="xl:col-span-5 space-y-8">

          {/* Seletor de turma */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Turma Selecionada</h2>
            <select
              value={selectedTurma}
              onChange={e => setSelectedTurma(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-black text-white focus:border-indigo-500 focus:outline-none"
            >
              {TURMAS_COLS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Lançar atividade */}
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">📚 Atividade para {selectedTurma}</h3>
            <textarea
              value={novaAtiv}
              onChange={e => setNovaAtiv(e.target.value)}
              placeholder="Ex: Exercícios pág 12, questões 1 a 5..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-700 focus:border-indigo-500 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleLancarAtividade}
              className="w-full py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Lançar Atividade
            </button>
          </div>

          {/* Postar recado */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-[2rem] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500/70">🔔 Recado para {selectedTurma}</h3>
            <textarea
              value={novoRecado}
              onChange={e => setNovoRecado(e.target.value)}
              placeholder="Escreva um recado para a turma..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-700 focus:border-amber-500 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handlePostarRecado}
              className="w-full py-3 bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Postar Recado
            </button>
          </div>

          {/* Status da turma */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-6 border-white/5 space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Leram</p>
              <p className="text-4xl font-black text-purple-400">{vistos[selectedTurma]?.length || 0}</p>
              <p className="text-[10px] text-slate-700 font-bold uppercase">recados</p>
            </GlassCard>
            <GlassCard className="p-6 border-white/5 space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Concluíram</p>
              <p className="text-4xl font-black text-emerald-400">{concluidos[selectedTurma]?.length || 0}</p>
              <p className="text-[10px] text-slate-700 font-bold uppercase">atividades</p>
            </GlassCard>
          </div>

          {/* Recados da coordenação */}
          {(recados['PROFESSORES']?.length > 0) && (
            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-500/70 mb-4">📢 Coord. / Direção</h3>
              <div className="space-y-3">
                {recados['PROFESSORES'].map((r, i) => (
                  <GlassCard key={i} className="border-l-4 border-amber-500 p-4">
                    <p className="text-white text-sm">{r}</p>
                  </GlassCard>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
