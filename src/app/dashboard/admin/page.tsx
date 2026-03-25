"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, FileSpreadsheet, 
  Search, Shield, Database, 
  Trash2, Edit3, CheckCircle, 
  X, Loader2, Download, Filter, 
  MoreHorizontal, ChevronRight, Key, Plus
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState, useRef } from "react";
import { playNotification } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { exportToCSV } from "@/lib/schedule"; 
import { cn } from "@/lib/utils";

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    turma: string;
    codigo: string;
    tipo: 'aluno' | 'professor';
}

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  
  // Base de dados de usuários
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
      showToast("🗑️ Usuário removido permanentemente.");
  };

  const filteredUsers = usuarios.filter(u => 
      u.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
      u.codigo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="flex flex-col relative pb-32">
      {/* Toast Notification Premium */}
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

      <header className="mb-12">
        <BackButton />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
          <Shield className="w-4 h-4" /> Admin Super Console v3.5
        </motion.div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <h1 className="text-4xl font-black mb-4 tracking-tighter">Gestão de Usuários</h1>
                <p className="text-slate-500 font-medium text-lg">Administre perfis, códigos de acesso e permissões.</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <button 
                   onClick={() => {
                        const csv = exportToCSV();
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('download', 'Grade_Horaria_Mestre_Escola.csv');
                        a.setAttribute('href', url);
                        a.click();
                        showToast("📥 Quadro de Horários exportado!");
                   }}
                   className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 font-bold text-xs"
                >
                    <Download className="w-4 h-4" /> Exportar Grade
                </button>
                <button 
                   onClick={handleImportClick}
                   className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-3 font-bold text-xs"
                >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    Importar CSV
                </button>
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".csv" />
            </div>
        </div>
      </header>

      {/* Busca e Tabela Principal */}
      <section className="space-y-8">
         <div className="relative group max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-hover:text-indigo-500 transition-colors" />
            <input 
                type="text" 
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar por nome ou código de acesso..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-16 pr-6 text-slate-200 placeholder-slate-700 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-bold"
            />
         </div>

         <div className="bg-slate-950 border border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="grid grid-cols-[80px_1fr_150px_180px_150px] p-6 bg-slate-900/50 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="text-center">Tipo</div>
                  <div>Nome Completo</div>
                  <div className="text-center">Turma</div>
                  <div className="text-center">Código Acesso</div>
                  <div className="text-center">Ações</div>
              </div>

              <div className="divide-y divide-slate-900">
                {filteredUsers.length === 0 && <div className="p-20 text-center text-slate-600 font-bold italic">Nenhum usuário encontrado para "{termoBusca}"</div>}
                {filteredUsers.map((user) => (
                    <div 
                        key={user.id} 
                        className="grid grid-cols-[80px_1fr_150px_180px_150px] p-6 items-center hover:bg-white/[2%] transition-colors group"
                    >
                        <div className="flex justify-center">
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter",
                                user.tipo === 'professor' ? "bg-purple-600/20 text-purple-400" : "bg-emerald-600/20 text-emerald-400"
                            )}>
                                {user.tipo === 'professor' ? 'PROF' : 'ALUN'}
                            </span>
                        </div>
                        <div>
                            <p className="font-black text-slate-200">{user.nome}</p>
                            <p className="text-xs text-slate-600 font-medium">{user.email}</p>
                        </div>
                        <div className="text-center font-bold text-slate-500 text-sm">{user.turma}</div>
                        <div className="flex justify-center">
                             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 group-hover:border-indigo-500/30 transition-all">
                                <Key className="w-3 h-3 text-indigo-400" />
                                <code className="text-xs font-black text-indigo-100">{user.codigo}</code>
                             </div>
                        </div>
                        <div className="flex justify-center gap-2">
                             <button className="p-3 bg-white/5 text-slate-600 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95" title="Editar">
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => deleteUser(user.id)}
                                className="p-3 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all active:scale-95" 
                                title="Apagar"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ))}
              </div>
         </div>
      </section>

      {/* Resumo de Infra */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatusCard label="Usuários Ativos" value={usuarios.length.toString()} color="text-indigo-400" />
           <StatusCard label="Professores" value={usuarios.filter(u => u.tipo === 'professor').length.toString()} color="text-purple-400" />
           <StatusCard label="Turmas Ativas" value="9" color="text-emerald-400" />
      </div>

    </div>
  );
}

function StatusCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <GlassCard className="p-8 border-white/5 space-y-4">
             <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{label}</p>
             <h3 className={cn("text-4xl font-black tracking-tighter", color)}>{value}</h3>
        </GlassCard>
    );
}
