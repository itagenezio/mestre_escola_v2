"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, ShieldCheck, User, 
  ArrowRight, GraduationCap, 
  Monitor, Loader2, Sparkles,
  Lock
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { playNotification } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { useSchoolStore } from "@/lib/store";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    useSchoolStore.getState().fetchFromSupabase();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsValidating(true);
    setError(null);
    playNotification("notification");

    // Simulação de validação inteligente
    await new Promise(r => setTimeout(r, 1500));

    const upperCode = code.toUpperCase();

    if (upperCode.startsWith("ALUN-")) {
       playNotification("success");
       useSchoolStore.getState().setUserRole('student');
       useSchoolStore.getState().setUserClass('9º B');
       router.push("/dashboard/student");
    } else if (upperCode.startsWith("PROF-")) {
       const { data, error } = await supabase
         .from('professores')
         .select('nome')
         .eq('codigo_acesso', upperCode)
         .single();

       if (data && !error) {
         playNotification("success");
         const store = useSchoolStore.getState();
         store.setUserRole('teacher');
         store.setUserName(data.nome); // Guarda o nome do professor no estado global
         router.push("/dashboard/teacher");
       } else {
         setError("Código de professor inválido ou não encontrado.");
         playNotification("notification");
         setIsValidating(false);
       }
    } else if (upperCode === "ADMIN-MASTER" || upperCode.startsWith("ADMN-")) {
       playNotification("success");
       useSchoolStore.getState().setUserRole('admin');
       useSchoolStore.getState().setUserName('Administrador');
       router.push("/dashboard/admin");
    } else {
       setError("Código de acesso não reconhecido. Tente novamente.");
       playNotification("notification");
       setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs Futuristas */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo / Título */}
        <div className="text-center mb-12">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6"
            >
                <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Mestre da Escola</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">v3.5 • Sistema de Gestão Digital</p>
        </div>

        {/* Card de Login Glassmorphic */}
        <div className="bg-white/[3%] border border-white/5 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl relative">
            <h2 className="text-2xl font-black mb-8 text-center flex items-center justify-center gap-3">
               <Lock className="w-5 h-5 text-indigo-400" />
               Acesse o Seu Perfil
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Código de Acesso Único</label>
                    <div className="relative group">
                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ex: ALUN-X8B9"
                            disabled={isValidating}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 pl-16 pr-6 text-xl font-black tracking-widest placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-500 text-xs font-bold text-center bg-red-500/5 p-3 rounded-xl border border-red-500/20"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <button 
                    disabled={isValidating || !code}
                    type="submit"
                    className={cn(
                        "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group",
                        isValidating 
                            ? "bg-slate-800 text-slate-500" 
                            : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                    )}
                >
                    {isValidating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Entrar no Sistema
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* Rodapé / Dica */}
        <div className="mt-10 text-center space-y-4">
             <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-700">
                <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Seguro</span>
                <span className="flex items-center gap-2"><Monitor className="w-3 h-3" /> Dashboard On</span>
                <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> Powered by AI</span>
             </div>
             <p className="text-slate-800 font-bold text-[10px] uppercase tracking-tighter">Perdeu seu código? Contate a secretaria na sala dos professores.</p>
        </div>
      </motion.div>
    </div>
  );
}
