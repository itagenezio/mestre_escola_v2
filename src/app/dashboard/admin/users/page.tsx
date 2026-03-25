"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, FileSpreadsheet, 
  Search, Trash2, CheckCircle, 
  Loader2, Plus, X
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useRef } from "react";
import { playNotification } from "@/lib/notify";
import { TURMAS_COLS } from "@/lib/schedule"; 
import { cn } from "@/lib/utils";

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    turma: string;
    codigo: string;
    tipo: 'aluno' | 'professor';
}

export default function UsersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", turma: "9º A", tipo: "aluno" as "aluno" | "professor" });

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
          showToast(`🚀 ${newUsers.length} usuários importados!`);
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

  return (
    <div className="flex flex-col relative pb-32">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-8 right-8 z-[100] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8">
        <BackButton />
        <h1 className="text-3xl font-black mt-4">Gerenciar Usuários</h1>
        <p className="text-slate-500">Adicione, remova ou edite usuários.</p>
      </header>

      <div className="flex gap-3 mb-6">
          <button onClick={handleImportClick} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Importar CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
          <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".csv" />
      </div>

      <div className="relative mb-6">
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

      {/* Modal */}
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
