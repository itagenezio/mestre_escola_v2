"use client";

import { motion } from "framer-motion";
import { Users, Shield, FileText, MessageSquare, CheckCircle, Send } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useSchoolStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { TURMAS_COLS } from "@/lib/schedule";

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    turma: string;
    codigo: string;
    tipo: 'aluno' | 'professor';
}

export default function AdminDashboard() {
  const addRecado = useSchoolStore((state) => state.addRecado);
  const recados = useSchoolStore((state) => state.recados);
  const fetchFromSupabase = useSchoolStore((state) => state.fetchFromSupabase);
  const [selectedTurma, setSelectedTurma] = useState("9º A");
  const [novoRecado, setNovoRecado] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  const handleEnviarRecado = async () => {
    if (!novoRecado.trim()) return;
    await addRecado(selectedTurma, novoRecado);
    setEnviado(true);
    setNovoRecado("");
    setTimeout(() => setEnviado(false), 2000);
  };

  const usuarios: UserProfile[] = [
    { id: "1", nome: "Ana Beatriz", email: "ana@escola.com", turma: "9º B", codigo: "ALUN-X8B9", tipo: 'aluno' },
    { id: "2", nome: "Prof. Alexandre", email: "alexandre@escola.com", turma: "Multiturma", codigo: "PROF-YZ01", tipo: 'professor' },
  ];

  const atividadesDemo = [
    { turma: "9º A", professor: "Natalia", atividade: "Exercícios de Português pág. 45", concluidos: 15, total: 28 },
    { turma: "9º B", professor: "Ester", atividade: "Redação tema livre", concluidos: 8, total: 25 },
    { turma: "8º A", professor: "Livison", atividade: "Prova de Ed. Física", concluidos: 20, total: 22 },
    { turma: "9º C", professor: "Rocha", atividade: "Simulado Matemática", concluidos: 12, total: 26 },
  ];

  return (
    <div className="pb-20">
      <header className="mb-8">
        <BackButton />
        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 mt-4">
          <Shield className="w-4 h-4" /> Admin - Mestre Escola
        </div>
        <h1 className="text-3xl font-black">Painel Inicial</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
              <p className="text-xl font-black">{usuarios.length}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Professores</p>
              <p className="text-xl font-black">{usuarios.filter(u => u.tipo === 'professor').length}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Atividades</p>
              <p className="text-xl font-black">{atividadesDemo.length}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Recados</p>
              <p className="text-xl font-black">{Object.values(recados).flat().length}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Atividades */}
      <GlassCard className="p-4 mb-6">
        <h3 className="font-black mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Atividades Enviadas
        </h3>
        <div className="space-y-3">
          {atividadesDemo.map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
              <div>
                <p className="font-bold text-sm">{a.turma}</p>
                <p className="text-xs text-slate-400">{a.atividade}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-400">{a.concluidos}/{a.total}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Enviar Recado */}
      <GlassCard className="p-4 mb-6">
        <h3 className="font-black mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-amber-400" />
          Enviar Recado
        </h3>
        <div className="flex gap-2">
          <select 
            value={selectedTurma} 
            onChange={(e) => setSelectedTurma(e.target.value)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm border border-slate-700"
          >
            <option value="PROFESSORES">👨‍🏫 Todos os Professores</option>
            {TURMAS_COLS.map(t => <option key={t} value={t}>📚 {t}</option>)}
          </select>
          <input 
            type="text"
            value={novoRecado}
            onChange={(e) => setNovoRecado(e.target.value)}
            placeholder="Escreva o recado..."
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm border border-slate-700"
          />
          <button 
            onClick={handleEnviarRecado}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors ${
              enviado ? "bg-emerald-500" : "bg-amber-500 hover:bg-amber-600"
            } text-white`}
          >
            {enviado ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </GlassCard>

      {/* Recados */}
      <GlassCard className="p-4">
        <h3 className="font-black mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Recados Recentes
        </h3>
        <div className="space-y-3">
          {Object.entries(recados).length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum recado ainda.</p>
          ) : (
            Object.entries(recados).flatMap(([turma, textos]: [string, string[]]) =>
              textos.map((texto, i) => (
                <div key={`${turma}-${i}`} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-amber-400">{turma}</p>
                    <p className="text-xs text-slate-400">{texto}</p>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </GlassCard>
    </div>
  );
}
