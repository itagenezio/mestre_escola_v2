"use client";

import { motion } from "framer-motion";
import { 
  Calendar, Clock, FileText, 
  CheckCircle2, GraduationCap
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
  const { recados, fetchFromSupabase } = store;
  const userName = store.userName || "Aluno";

  useEffect(() => {
    fetchFromSupabase();
  }, []);
  
  const [minhaTurma, setMinhaTurma] = useState("9º B"); 
  const [horarioHoje, setHorarioHoje] = useState<{aula: string; horario: string; materia: string}[]>([]);
  const [diaSemana, setDiaSemana] = useState("Segunda");
  const [confirmou, setConfirmou] = useState(false);

  // Dia da semana - inicializa corretamente
  useEffect(() => {
    const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dayNum = new Date().getDay();
    if (dayNum === 0 || dayNum === 6) {
      setDiaSemana("Segunda");
    } else {
      setDiaSemana(daysMap[dayNum]);
    }
  }, []);

  // Carrega horário da turma
  useEffect(() => {
    if (!diaSemana || !minhaTurma) return;
    
    const idxTurma = TURMAS_COLS.indexOf(minhaTurma);
    if (idxTurma === -1) return;
    
    const aulasValidas = HORARIOS_AULAS.filter(h => typeof h.id === 'number');
    
    const novoHorario = aulasValidas.map((aula) => {
      const dadosTurma = SCHEDULE_DATA[diaSemana];
      if (!dadosTurma) {
        return { aula: aula.id.toString(), horario: `${aula.inicio} - ${aula.fim}`, materia: "Livre" };
      }
      const aulaData = dadosTurma[aula.id.toString()];
      if (!aulaData) {
        return { aula: aula.id.toString(), horario: `${aula.inicio} - ${aula.fim}`, materia: "Livre" };
      }
      const item = aulaData[idxTurma] || "Livre";
      return {
        aula: aula.id.toString(),
        horario: `${aula.inicio} - ${aula.fim}`,
        materia: item
      };
    });
    
    setHorarioHoje(novoHorario);
    setConfirmou(false);
  }, [minhaTurma, diaSemana]);

  const minhaAtividade = store.atividades[minhaTurma] || null;
  const meusRecados = store.recados[minhaTurma] || [];

  const handleConfirmar = () => {
    setConfirmou(true);
    if (store.marcarConcluido) {
      store.marcarConcluido(minhaTurma, userName);
      playNotification("success");
    }
  };

  return (
    <div className="flex flex-col pb-20">
      <BackButton />

      <header className="mb-8">
        <motion.div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
          <GraduationCap className="w-3 h-3" /> Olá, {userName}
        </motion.div>
        <h1 className="text-4xl font-black mb-4 tracking-tight">Meu Horário</h1>
        
        {/* Seletor de Turma */}
        <div className="flex gap-4 items-center">
          <label className="text-slate-500 font-bold">Minha Turma:</label>
          <select 
            value={minhaTurma} 
            onChange={(e) => setMinhaTurma(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold"
          >
            {TURMAS_COLS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </header>

      {/* Seletor de Dia */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map((dia) => (
          <button
            key={dia}
            onClick={() => setDiaSemana(dia)}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm",
              diaSemana === dia 
                ? "bg-indigo-600 text-white" 
                : "bg-slate-800 text-slate-400"
            )}
          >
            {dia}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horário do Dia */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            {diaSemana} - {minhaTurma}
          </h2>
          
          <div className="space-y-2">
            {horarioHoje.map((aula, i) => (
              <GlassCard key={i} className={cn(
                "p-4 flex items-center justify-between",
                i < 5 ? "border-l-4 border-amber-500" : "border-l-4 border-purple-500"
              )}>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 px-3 py-2 rounded-lg text-center min-w-[60px]">
                    <p className="text-[10px] text-slate-500 font-bold">AULA</p>
                    <p className="text-lg font-black text-indigo-400">{aula.aula}</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">{aula.horario}</p>
                    <p className="text-sm text-slate-400">{aula.materia}</p>
                  </div>
                </div>
                <Clock className="w-5 h-5 text-slate-600" />
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Atividades e Recados */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-400" />
              Atividade de Hoje
            </h2>
            
            {minhaAtividade ? (
              <GlassCard className="border-l-4 border-emerald-500">
                <p className="text-white font-bold mb-4">{minhaAtividade}</p>
                
                {!confirmou ? (
                  <button 
                    onClick={handleConfirmar}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                  >
                    ✓ Confirmar que fiz a atividade
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    Atividade confirmada!
                  </div>
                )}
              </GlassCard>
            ) : (
              <GlassCard className="border-l-4 border-slate-700">
                <p className="text-slate-500 italic">
                  Nenhuma atividade lançada para hoje.
                </p>
              </GlassCard>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              Recados
            </h2>
            
            {meusRecados.length > 0 ? (
              <div className="space-y-2">
                {meusRecados.map((recado, i) => (
                  <GlassCard key={i} className="border-l-4 border-amber-500 p-4">
                    <p className="text-white text-sm">{recado}</p>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="border-l-4 border-slate-700">
                <p className="text-slate-500 italic">
                  Nenhum recado hoje.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
