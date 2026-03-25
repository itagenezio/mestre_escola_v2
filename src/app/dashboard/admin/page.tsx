"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, FileSpreadsheet, 
  Search, Shield, Database, 
  Trash2, Edit3, CheckCircle, 
  X, Loader2, Download, Filter, 
  MoreHorizontal, ChevronRight, Key, Plus,
  FileText, MessageSquare, Eye, EyeOff
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useRef, useEffect } from "react";
import { playNotification } from "@/lib/notify";
import { useRouter, useSearchParams } from "next/navigation";
import { exportToCSV, TURMAS_COLS } from "@/lib/schedule"; 
import { cn } from "@/lib/utils";

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    turma: string;
    codigo: string;
    tipo: 'aluno' | 'professor';
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("inicio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", turma: "9º A", tipo: "aluno" as "aluno" | "professor" });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [usuarios, setUsuarios] = useState<UserProfile[]>([
    { id: "1", nome: "Ana Beatriz", email: "ana@escola.com", turma: "9º B", codigo: "ALUN-X8B9", tipo: 'aluno' },
    { id: "2", nome: "Prof. Alexandre", email: "alexandre@escola.com", turma: "Multiturma", codigo: "PROF-YZ01", tipo: 'professor' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const generateCode = (role: string) => {
    const prefix = role.toUpperCase().substring(0, 4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (text) {
          await new Promise(r => setTimeout(r, 1200));
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const newUsers: UserProfile[] = lines.map(line => {
             const [nome, email, turma] = line.split(',').map(s => s?.trim());
             return { 
                 id: Math.random().toString(36).substr(2, 9),
                 nome: nome || 'Desconhecido', 
                 email: email || 'Sem E-mail', 
                 turma: turma || 'Sem Turma',
                 codigo: generateCode("ALUN"),
                 tipo: 'aluno'
             };
          });
          setUsuarios([...usuarios, ...newUsers]);
          setIsImporting(false);
          playNotification("success");
          showToast(`🚀 ${newUsers.length} usuários importados com sucesso!`);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const deleteUser = (id: string) => {
      setUsuarios(usuarios.filter(u => u.id !== id));
      playNotification("notification");
      showToast("🗑️ Usuário removido.");
  };

  const filteredUsers = usuarios.filter(u => 
      u.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
      u.codigo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Atividades simuladas para demo
  const atividadesDemo = [
    { turma: "9º A", professor: "Natalia", atividade: "Exercícios de Português pág. 45", concluidos: 15, total: 28 },
    { turma: "9º B", professor: "Ester", atividade: "Redação tema livre", concluidos: 8, total: 25 },
    { turma: "8º A", professor: "Livison", atividade: "Prova de Ed. Física", concluidos: 20, total: 22 },
    { turma: "9º C", professor: "Rocha", atividade: "Simulado Matemática", concluidos: 12, total: 26 },
  ];

  const recadosDemo = [
    { turma: "9º A", professor: "Natalia", recado: "Prova adiada para próxima semana", data: "25/03" },
    { turma: "9º B", professor: "Enilda", recado: "Entregar autorização do viagem", data: "24/03" },
    { turma: "8º C", professor: "Antonio", recado: "Reunião de pais dia 30/03", data: "23/03" },
  ];

  return (
    <div className="flex flex-col relative pb-32">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 right-8 z-[100] bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl flex items-center gap-4 text-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8">
        <BackButton />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
          <Shield className="w-4 h-4" /> Admin - Mestre Escola
        </motion.div>
        
        {/* Abas */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab("inicio")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm",
              activeTab === "inicio" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
            )}
          >
            Painel Inicial
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm",
              activeTab === "usuarios" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
            )}
          >
            Gerenciar Usuários
          </button>
        </div>
      </header>

      {/* PAINEL INICIAL */}
      {activeTab === "inicio" && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard className="p-6 border-l-4 border-indigo-500">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-indigo-400" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total Usuários</p>
                  <p className="text-2xl font-black">{usuarios.length}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Professores</p>
                  <p className="text-2xl font-black">{usuarios.filter(u => u.tipo === 'professor').length}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6 border-l-4 border-emerald-500">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Atividades Ativas</p>
                  <p className="text-2xl font-black">{atividadesDemo.length}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-6 border-l-4 border-amber-500">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Recados</p>
                  <p className="text-2xl font-black">{recadosDemo.length}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Atividades Recentes */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Atividades Enviadas
            </h3>
            <div className="space-y-3">
              {atividadesDemo.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
                  <div>
                    <p className="font-bold text-white">{a.turma}</p>
                    <p className="text-sm text-slate-400">{a.atividade}</p>
                    <p className="text-xs text-indigo-400">Prof. {a.professor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-400">{a.concluidos}/{a.total}</p>
                    <p className="text-xs text-slate-500">concluídos</p>
                    <div className="w-20 h-2 bg-slate-800 rounded-full mt-1">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(a.concluidos/a.total)*100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recados Recentes */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Recados Recentes
            </h3>
            <div className="space-y-3">
              {recadosDemo.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
                  <div>
                    <p className="font-bold text-white">{r.turma}</p>
                    <p className="text-sm text-slate-400">{r.recado}</p>
                    <p className="text-xs text-amber-400">Prof. {r.professor}</p>
                  </div>
                  <span className="text-xs text-slate-500">{r.data}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* GERENCIAR USUÁRIOS */}
      {activeTab === "usuarios" && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
              <div>
                  <h1 className="text-3xl font-black mb-2">Gestão de Usuários</h1>
                  <p className="text-slate-500">Adicione, remova ou edite usuários.</p>
              </div>
              <div className="flex gap-3">
                  <button onClick={handleImportClick} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">
                    Importar CSV
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">
                    + Adicionar
                  </button>
                  <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".csv" />
              </div>
          </div>

          <div className="relative group max-w-xl mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                  type="text" 
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Buscar usuário..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white"
              />
          </div>

          <div className="space-y-2">
              {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-4">
                          <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                              user.tipo === 'professor' ? "bg-purple-600/20 text-purple-400" : "bg-emerald-600/20 text-emerald-400"
                          )}>
                              {user.nome.charAt(0)}
                          </div>
                          <div>
                              <p className="font-bold text-white">{user.nome}</p>
                              <p className="text-xs text-slate-500">{user.tipo === 'professor' ? 'Professor' : 'Aluno'} • {user.turma}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">{user.codigo}</span>
                          <button onClick={() => deleteUser(user.id)} className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
        </>
      )}

      {/* Modal Adicionar */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-black mb-4">Adicionar Usuário</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Nome"
                  value={novoUsuario.nome}
                  onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white"
                />
                <input 
                  type="email" 
                  placeholder="Email"
                  value={novoUsuario.email}
                  onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white"
                />
                <select 
                  value={novoUsuario.tipo}
                  onChange={e => setNovoUsuario({...novoUsuario, tipo: e.target.value as "aluno" | "professor"})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white"
                >
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                </select>
                <select 
                  value={novoUsuario.turma}
                  onChange={e => setNovoUsuario({...novoUsuario, turma: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white"
                >
                  {TURMAS_COLS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold">Cancelar</button>
                <button 
                  onClick={() => {
                    const novo = { ...novoUsuario, id: Math.random().toString(36).substr(2, 9), codigo: generateCode(novoUsuario.tipo) };
                    setUsuarios([...usuarios, novo]);
                    setIsModalOpen(false);
                    setNovoUsuario({ nome: "", email: "", turma: "9º A", tipo: "aluno" });
                    showToast("✅ Usuário adicionado!");
                  }} 
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Suspense } from "react";

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Carregando...</div>}>
      <AdminContent />
    </Suspense>
  );
}
