"use client";

/**
 * Módulo de Horários dos Professores — Mestre da Escola
 * ─────────────────────────────────────────────────────
 * Admin/Coordenador: CRUD completo de todos os professores,
 *                    detecção de conflitos, exportar PDF.
 * Professor:         Visualização do próprio horário com
 *                    destaque do dia atual e próxima aula
 *                    em tempo real.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Plus, Pencil, Trash2,
  AlertTriangle, Printer, X, Check,
  ChevronDown, User2, MapPin, Zap, BookOpen,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HORARIOS_AULAS, TURMAS_COLS } from "@/lib/schedule";
import { useSchoolStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

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

type FormData = Omit<HorarioSlot, "id">;

// ═══════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Apenas aulas reais (sem intervalos)
const AULAS_VALIDAS = HORARIOS_AULAS.filter(
  (h): h is { id: number; inicio: string; fim: string } => typeof h.id === "number"
);

// Paleta de cores por disciplina (hash do nome → índice)
const PALETA = [
  { border: "border-indigo-500",  bg: "bg-indigo-500/10",  text: "text-indigo-300",  badge: "bg-indigo-600/20 text-indigo-300"  },
  { border: "border-purple-500",  bg: "bg-purple-500/10",  text: "text-purple-300",  badge: "bg-purple-600/20 text-purple-300"  },
  { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-300", badge: "bg-emerald-600/20 text-emerald-300" },
  { border: "border-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-300",   badge: "bg-amber-600/20 text-amber-300"   },
  { border: "border-rose-500",    bg: "bg-rose-500/10",    text: "text-rose-300",    badge: "bg-rose-600/20 text-rose-300"    },
  { border: "border-cyan-500",    bg: "bg-cyan-500/10",    text: "text-cyan-300",    badge: "bg-cyan-600/20 text-cyan-300"    },
  { border: "border-orange-500",  bg: "bg-orange-500/10",  text: "text-orange-300",  badge: "bg-orange-600/20 text-orange-300"  },
  { border: "border-teal-500",    bg: "bg-teal-500/10",    text: "text-teal-300",    badge: "bg-teal-600/20 text-teal-300"    },
  { border: "border-pink-500",    bg: "bg-pink-500/10",    text: "text-pink-300",    badge: "bg-pink-600/20 text-pink-300"    },
  { border: "border-sky-500",     bg: "bg-sky-500/10",     text: "text-sky-300",     badge: "bg-sky-600/20 text-sky-300"     },
];

/** Retorna cor baseada no nome da disciplina */
function corDisciplina(disc: string) {
  let h = 0;
  for (let i = 0; i < disc.length; i++) h = (h * 31 + disc.charCodeAt(i)) % PALETA.length;
  return PALETA[Math.abs(h)];
}

/** Detecta conflitos: mesmo professor, mesmo dia, mesma aula */
function detectarConflitos(slots: HorarioSlot[]): Set<string> {
  const conflitantes = new Set<string>();
  const mapa: Record<string, string[]> = {};
  slots.forEach((s) => {
    const k = `${s.professor_nome}|${s.dia_semana}|${s.aula_numero}`;
    if (!mapa[k]) mapa[k] = [];
    mapa[k].push(s.id);
  });
  Object.values(mapa).forEach((ids) => {
    if (ids.length > 1) ids.forEach((id) => conflitantes.add(id));
  });
  return conflitantes;
}

const FORM_INICIAL: FormData = {
  professor_nome: "",
  dia_semana: "Segunda",
  aula_numero: 1,
  horario_inicio: AULAS_VALIDAS[0]?.inicio ?? "07:00",
  horario_fim:    AULAS_VALIDAS[0]?.fim   ?? "07:50",
  disciplina: "",
  turma: "",
  sala: "",
};

// ═══════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════

export default function HorariosPage() {
  const { userRole, userName } = useSchoolStore();
  const isAdmin = userRole === "admin";

  // ── Estado ────────────────────────────────────────────
  const [horarios, setHorarios] = useState<HorarioSlot[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtro por professor (admin pode selecionar; professor fica fixo no próprio nome)
  const [profFiltro, setProfFiltro] = useState("");

  // Dia ativo na grade
  const [diaAtivo, setDiaAtivo] = useState(() => {
    const d = new Date().getDay(); // 0=Dom, 1=Seg...
    return d >= 1 && d <= 6 ? d - 1 : 0;
  });

  // Modal CRUD
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<HorarioSlot | null>(null);
  const [form, setForm] = useState<FormData>({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);

  // Confirmar exclusão
  const [confirmarExcluir, setConfirmarExcluir] = useState<string | null>(null);

  // Toast
  const [msgSucesso, setMsgSucesso] = useState<string | null>(null);

  // Próxima aula em tempo real (professor)
  const [proximaAula, setProximaAula] = useState<HorarioSlot | null>(null);

  // ── Busca Supabase ────────────────────────────────────

  const buscarHorarios = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("horarios")
      .select("*")
      .order("aula_numero");
    setHorarios(data ?? []);
    setCarregando(false);
  };

  useEffect(() => { buscarHorarios(); }, []);

  // Filtra pelo nome do professor quando é professor
  useEffect(() => {
    if (!isAdmin && userName && userName !== "Usuário") {
      setProfFiltro(userName);
    }
  }, [isAdmin, userName]);

  // ── Próxima aula em tempo real ────────────────────────

  useEffect(() => {
    if (isAdmin) return;

    const atualizar = () => {
      const agora = new Date();
      const hhmm = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      const idxDia = agora.getDay() - 1; // 0=Seg
      if (idxDia < 0 || idxDia >= DIAS_SEMANA.length) { setProximaAula(null); return; }
      const nomeDia = DIAS_SEMANA[idxDia];

      const aulasHoje = horarios
        .filter((h) => h.professor_nome === userName && h.dia_semana === nomeDia)
        .sort((a, b) => a.horario_inicio.localeCompare(b.horario_inicio));

      // Primeira aula que ainda não terminou
      const proxima = aulasHoje.find((h) => h.horario_fim > hhmm) ?? null;
      setProximaAula(proxima);
    };

    atualizar();
    const t = setInterval(atualizar, 60_000);
    return () => clearInterval(t);
  }, [horarios, isAdmin, userName]);

  // ── Dados derivados ───────────────────────────────────

  const horariosFiltrados = horarios.filter((h) => {
    if (!profFiltro) return true;
    return h.professor_nome.toLowerCase().includes(profFiltro.toLowerCase());
  });

  const horariosHoje = horariosFiltrados.filter(
    (h) => h.dia_semana === DIAS_SEMANA[diaAtivo]
  );

  const conflitos = detectarConflitos(horariosFiltrados);

  const professoresUnicos = Array.from(
    new Set(horarios.map((h) => h.professor_nome))
  ).sort();

  // ── Ações CRUD ────────────────────────────────────────

  const abrirAdicionar = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, professor_nome: isAdmin ? "" : userName });
    setModalAberto(true);
  };

  const abrirEditar = (slot: HorarioSlot) => {
    setEditando(slot);
    setForm({
      professor_nome: slot.professor_nome,
      dia_semana:     slot.dia_semana,
      aula_numero:    slot.aula_numero,
      horario_inicio: slot.horario_inicio,
      horario_fim:    slot.horario_fim,
      disciplina:     slot.disciplina,
      turma:          slot.turma,
      sala:           slot.sala,
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.professor_nome || !form.disciplina || !form.turma) return;
    setSalvando(true);
    try {
      if (editando) {
        await supabase.from("horarios").update(form).eq("id", editando.id);
      } else {
        await supabase.from("horarios").insert(form);
      }
      await buscarHorarios();
      setModalAberto(false);
      toast(editando ? "Horário atualizado!" : "Horário adicionado!");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: string) => {
    await supabase.from("horarios").delete().eq("id", id);
    await buscarHorarios();
    setConfirmarExcluir(null);
    toast("Horário removido!");
  };

  /** Ao selecionar nº da aula, preenche início/fim automaticamente */
  const onChangeAula = (num: number) => {
    const aula = AULAS_VALIDAS.find((a) => a.id === num);
    setForm((f) => ({
      ...f,
      aula_numero:    num,
      horario_inicio: aula?.inicio ?? "",
      horario_fim:    aula?.fim    ?? "",
    }));
  };

  const toast = (msg: string) => {
    setMsgSucesso(msg);
    setTimeout(() => setMsgSucesso(null), 3000);
  };

  /** Conflito potencial no formulário (validação visual) */
  const conflitoPotencial = horarios.find(
    (h) =>
      h.professor_nome === form.professor_nome &&
      h.dia_semana     === form.dia_semana &&
      h.aula_numero    === form.aula_numero &&
      h.id             !== editando?.id
  );

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="flex flex-col print:bg-white print:text-black">
      <BackButton />

      {/* ── Toast de sucesso ─────────────────────────────── */}
      <AnimatePresence>
        {msgSucesso && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm print:hidden"
          >
            <Check className="w-4 h-4" />
            {msgSucesso}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cabeçalho ─────────────────────────────────────── */}
      <header className="mb-8 print:mb-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-2 tracking-tight print:text-2xl print:text-black"
        >
          {isAdmin ? "Grade Horária Geral" : "Meu Horário"}
        </motion.h1>
        <p className="text-slate-500 font-medium text-lg print:text-gray-600">
          {isAdmin
            ? "Gerencie os horários de todos os professores"
            : `Horário de ${userName}`}
        </p>
      </header>

      {/* ── Próxima aula (professor, tempo real) ─────────── */}
      {!isAdmin && proximaAula && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "mb-6 p-5 rounded-3xl border-l-4 flex items-center gap-4 print:hidden",
            corDisciplina(proximaAula.disciplina).border,
            corDisciplina(proximaAula.disciplina).bg
          )}
        >
          <Zap className={cn("w-8 h-8 flex-shrink-0", corDisciplina(proximaAula.disciplina).text)} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
              Próxima Aula
            </p>
            <p className="text-xl font-black">
              {proximaAula.disciplina} — {proximaAula.turma}
            </p>
            <p className={cn("text-sm font-bold", corDisciplina(proximaAula.disciplina).text)}>
              {proximaAula.horario_inicio} às {proximaAula.horario_fim}
              {proximaAula.sala && ` • Sala ${proximaAula.sala}`}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Barra de ações ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-8 print:hidden">

        {/* Filtro de professor (somente admin) */}
        {isAdmin && (
          <div className="relative">
            <select
              value={profFiltro}
              onChange={(e) => setProfFiltro(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3 pr-10 font-bold text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">Todos os Professores</option>
              {professoresUnicos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        )}

        {/* Alerta de conflitos */}
        {conflitos.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            {conflitos.size} conflito{conflitos.size > 1 ? "s" : ""} detectado{conflitos.size > 1 ? "s" : ""}
          </div>
        )}

        <div className="ml-auto flex gap-2">
          {/* Exportar PDF */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-bold"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </button>

          {/* Adicionar aula (admin) */}
          {isAdmin && (
            <button
              onClick={abrirAdicionar}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-sm font-black shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Adicionar Aula
            </button>
          )}
        </div>
      </div>

      {/* ── Seletor de dia ────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none print:hidden">
        {DIAS_SEMANA.map((dia, i) => {
          const isHoje = new Date().getDay() - 1 === i;
          return (
            <button
              key={dia}
              onClick={() => setDiaAtivo(i)}
              className={cn(
                "px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shrink-0 relative",
                diaAtivo === i
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : isHoje
                  ? "bg-slate-800 border border-indigo-500/50 text-indigo-400"
                  : "bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {dia}
              {/* Indicador do dia atual */}
              {isHoje && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-slate-950" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Grade do dia ─────────────────────────────────── */}
      {carregando ? (
        <div className="flex items-center justify-center py-20 text-slate-600">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Label do dia */}
          <motion.div key={DIAS_SEMANA[diaAtivo]} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest">
              {DIAS_SEMANA[diaAtivo]}
            </h2>
            <span className="text-slate-600 text-sm font-semibold">
              — {horariosHoje.length} aula{horariosHoje.length !== 1 ? "s" : ""}
            </span>
          </motion.div>

          {/* Cards de aulas organizados por horário */}
          <motion.div
            key={`grade-${diaAtivo}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mb-12"
          >
            {horariosHoje.length === 0 && (
              <div className="text-center py-16 text-slate-600">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">Sem aulas neste dia</p>
                {isAdmin && (
                  <p className="text-sm mt-1">
                    Use &quot;Adicionar Aula&quot; para criar um horário.
                  </p>
                )}
              </div>
            )}

            {/* Agrupa por número de aula */}
            {AULAS_VALIDAS.map((aulaInfo) => {
              const slotsDaAula = horariosHoje
                .filter((h) => h.aula_numero === aulaInfo.id)
                .sort((a, b) => a.turma.localeCompare(b.turma));

              if (slotsDaAula.length === 0) return null;

              return (
                <div key={aulaInfo.id}>
                  {/* Linha de horário */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest shrink-0">
                      {aulaInfo.id}ª AULA
                    </span>
                    <span className="text-xs text-slate-700 font-mono">
                      {aulaInfo.inicio} → {aulaInfo.fim}
                    </span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  {/* Cards da aula */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 ml-1">
                    {slotsDaAula.map((slot, idx) => {
                      const cor = corDisciplina(slot.disciplina);
                      const temConflito = conflitos.has(slot.id);

                      return (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={cn(
                            "relative group rounded-2xl border-l-4 p-4 transition-all",
                            temConflito
                              ? "border-red-500 bg-red-500/5"
                              : `${cor.border} ${cor.bg}`
                          )}
                        >
                          {/* Disciplina */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-2",
                                temConflito ? "bg-red-600/20 text-red-400" : cor.badge
                              )}>
                                {temConflito && <AlertTriangle className="w-3 h-3" />}
                                <BookOpen className="w-3 h-3" />
                                {slot.disciplina}
                              </span>
                              <p className="text-base font-black truncate">{slot.turma}</p>
                            </div>

                            {/* Ações (somente admin, aparecem no hover) */}
                            {isAdmin && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => abrirEditar(slot)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 transition-all"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmarExcluir(slot.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Detalhes */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              <User2 className="w-3 h-3" />
                              <span className="text-slate-300">{slot.professor_nome}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-slate-300">{aulaInfo.inicio} – {aulaInfo.fim}</span>
                            </span>
                            {slot.sala && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="text-slate-300">Sala {slot.sala}</span>
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* ── Versão para impressão (tabela semanal completa) ── */}
          <div className="hidden print:block">
            <h2 className="text-lg font-black mb-1">
              Grade Semanal — {profFiltro || "Todos os Professores"}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Gerado em {new Date().toLocaleDateString("pt-BR")}
            </p>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1.5 text-left font-black">Horário</th>
                  {DIAS_SEMANA.map((d) => (
                    <th key={d} className="border border-gray-300 p-1.5 font-black text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AULAS_VALIDAS.map((aula) => (
                  <tr key={aula.id} className="even:bg-gray-50">
                    <td className="border border-gray-300 p-1.5 font-bold whitespace-nowrap text-center">
                      <div className="font-black">{aula.id}ª</div>
                      <div className="text-gray-500 font-normal">{aula.inicio}–{aula.fim}</div>
                    </td>
                    {DIAS_SEMANA.map((dia) => {
                      const slots = horariosFiltrados.filter(
                        (h) => h.dia_semana === dia && h.aula_numero === aula.id
                      );
                      return (
                        <td key={dia} className="border border-gray-300 p-1 align-top">
                          {slots.map((s) => (
                            <div key={s.id} className="mb-1 leading-tight">
                              <span className="font-black">{s.disciplina}</span>
                              <br />
                              <span className="text-gray-700">{s.turma}</span>
                              {s.sala && <span className="text-gray-500"> · {s.sala}</span>}
                              {isAdmin && (
                                <>
                                  <br />
                                  <span className="text-gray-400 italic">{s.professor_nome}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Modal Adicionar / Editar ──────────────────────── */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalAberto(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-950 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">
                  {editando ? "Editar Aula" : "Nova Aula"}
                </h3>
                <button
                  onClick={() => setModalAberto(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">

                {/* Professor (somente admin) */}
                {isAdmin && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Professor *
                    </label>
                    <input
                      value={form.professor_nome}
                      onChange={(e) => setForm((f) => ({ ...f, professor_nome: e.target.value }))}
                      placeholder="Nome do professor"
                      list="profs-datalist"
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    {/* Sugestões de professores já cadastrados */}
                    <datalist id="profs-datalist">
                      {professoresUnicos.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                )}

                {/* Dia + Aula */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Dia *
                    </label>
                    <select
                      value={form.dia_semana}
                      onChange={(e) => setForm((f) => ({ ...f, dia_semana: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      {DIAS_SEMANA.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Nº Aula *
                    </label>
                    <select
                      value={form.aula_numero}
                      onChange={(e) => onChangeAula(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      {AULAS_VALIDAS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.id}ª ({a.inicio}–{a.fim})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Disciplina */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Disciplina *
                  </label>
                  <input
                    value={form.disciplina}
                    onChange={(e) => setForm((f) => ({ ...f, disciplina: e.target.value }))}
                    placeholder="Ex: Matemática, Português, Ed. Física..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Turma + Sala */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Turma *
                    </label>
                    <select
                      value={form.turma}
                      onChange={(e) => setForm((f) => ({ ...f, turma: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {TURMAS_COLS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Sala
                    </label>
                    <input
                      value={form.sala}
                      onChange={(e) => setForm((f) => ({ ...f, sala: e.target.value }))}
                      placeholder="Ex: 101, Lab, Quadra..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Alerta de conflito em tempo real */}
                {conflitoPotencial && form.professor_nome && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Conflito! <strong>{form.professor_nome}</strong> já tem{" "}
                      <strong>{conflitoPotencial.disciplina}</strong> na{" "}
                      {form.aula_numero}ª aula de {form.dia_semana}.
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalAberto(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={salvando || !form.professor_nome || !form.disciplina || !form.turma}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {salvando ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editando ? "Salvar" : "Adicionar"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmar exclusão ──────────────────────── */}
      <AnimatePresence>
        {confirmarExcluir && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-950 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black mb-2">Remover Aula?</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Esta aula será removida permanentemente da grade horária.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmarExcluir(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => excluir(confirmarExcluir)}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black text-sm hover:bg-red-500 transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20 print:hidden" />
    </div>
  );
}
