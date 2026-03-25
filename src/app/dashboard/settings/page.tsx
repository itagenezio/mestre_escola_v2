"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone,
  Shield, Bell, Moon, Sun,
  Trash2, Save, Settings, CheckCircle, Lock, Eye, EyeOff
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    nome: "João Victor da Silva",
    email: "joao.silva@escola.br",
    telefone: "(11) 98765-4321",
  });

  // Password state
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwd, setPwd] = useState({ atual: "", nova: "", confirmar: "" });
  const [showPwd, setShowPwd] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    playNotification("success");
    showToast("✅ Preferências salvas com sucesso!");
  };

  const handleSavePwd = () => {
    if (!pwd.atual || !pwd.nova) {
      playNotification("alert");
      showToast("⚠️ Preencha todos os campos de senha.");
      return;
    }
    if (pwd.nova !== pwd.confirmar) {
      playNotification("alert");
      showToast("❌ As senhas não coincidem!");
      return;
    }
    playNotification("success");
    showToast("🔒 Senha alterada com sucesso!");
    setShowChangePwd(false);
    setPwd({ atual: "", nova: "", confirmar: "" });
  };

  const handleLogout = () => {
    playNotification("alert");
    if (confirm("Você tem certeza que deseja sair de todos os aparelhos?")) {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 text-sm max-w-sm"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <BackButton />

      <header className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-4 tracking-tight"
        >
          Minha Conta
        </motion.h1>
        <p className="text-slate-500 font-medium text-lg">Gerencie seu perfil e preferências</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Profile Card */}
        <GlassCard delay={0.1} className="p-8">
          <h2 className="text-xl font-black mb-8 border-b border-white/5 pb-4">Dados Pessoais</h2>
          <div className="space-y-5">
            <EditField
              icon={<User />}
              label="Nome Completo"
              value={form.nome}
              onChange={(v) => setForm({ ...form, nome: v })}
            />
            <EditField
              icon={<Mail />}
              label="E-mail Acadêmico"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              type="email"
            />
            <EditField
              icon={<Phone />}
              label="WhatsApp (Responsável)"
              value={form.telefone}
              onChange={(v) => setForm({ ...form, telefone: v })}
              type="tel"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </GlassCard>

        {/* Preferences & Security */}
        <div className="flex flex-col gap-6">
          <GlassCard delay={0.2} className="p-6">
            <h2 className="text-xl font-black mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Preferências
            </h2>

            <ToggleRow
              icon={isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              iconClass="bg-indigo-600/10 text-indigo-400"
              label="Modo Escuro"
              enabled={isDarkMode}
              color="bg-indigo-600"
              onToggle={() => { setIsDarkMode(!isDarkMode); playNotification("notification"); showToast(isDarkMode ? "☀️ Modo claro ativado" : "🌙 Modo escuro ativado"); }}
            />

            <ToggleRow
              icon={<Bell className="w-5 h-5" />}
              iconClass="bg-purple-600/10 text-purple-400"
              label="Notificações Push"
              enabled={pushEnabled}
              color="bg-purple-600"
              onToggle={() => { setPushEnabled(!pushEnabled); playNotification("notification"); showToast(pushEnabled ? "🔕 Notificações desativadas" : "🔔 Notificações ativadas"); }}
              className="mt-3"
            />

            <ToggleRow
              icon={<Mail className="w-5 h-5" />}
              iconClass="bg-emerald-600/10 text-emerald-400"
              label="Avisos por E-mail"
              enabled={emailNotif}
              color="bg-emerald-600"
              onToggle={() => { setEmailNotif(!emailNotif); playNotification("notification"); showToast(emailNotif ? "📭 E-mail desativado" : "📬 E-mail ativado"); }}
              className="mt-3"
            />
          </GlassCard>

          {/* Security Card */}
          <GlassCard delay={0.3} className="p-6">
            <h2 className="text-xl font-black mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" /> Segurança
            </h2>

            <button
              onClick={() => setShowChangePwd(!showChangePwd)}
              className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Lock className="w-5 h-5" /></div>
                <span className="font-bold text-sm">Alterar Senha</span>
              </div>
              <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", showChangePwd ? "text-amber-400" : "text-slate-600")}>
                {showChangePwd ? "Fechar" : "Abrir"}
              </span>
            </button>

            <AnimatePresence>
              {showChangePwd && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3">
                    <PwdField label="Senha Atual" value={pwd.atual} show={showPwd} onChange={(v) => setPwd({ ...pwd, atual: v })} onToggleShow={() => setShowPwd(!showPwd)} />
                    <PwdField label="Nova Senha" value={pwd.nova} show={showPwd} onChange={(v) => setPwd({ ...pwd, nova: v })} />
                    <PwdField label="Confirmar Nova Senha" value={pwd.confirmar} show={showPwd} onChange={(v) => setPwd({ ...pwd, confirmar: v })} />
                    <button
                      onClick={handleSavePwd}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-95 mt-2"
                    >
                      Confirmar Alteração
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>

      {/* Danger Zone */}
      <GlassCard delay={0.4} className="p-6 border-red-500/10 mb-20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between group p-2 hover:bg-red-500/5 rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-red-300">Deslogar de todos os aparelhos</span>
              <p className="text-red-500/50 text-xs font-medium uppercase tracking-wider mt-0.5">Segurança Extra</p>
            </div>
          </div>
        </button>
      </GlassCard>
    </div>
  );
}

function EditField({ icon, label, value, onChange, type = "text" }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-slate-900/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  );
}

function PwdField({ label, value, show, onChange, onToggleShow }: {
  label: string; value: string; show: boolean; onChange: (v: string) => void; onToggleShow?: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none transition-colors pr-12"
      />
      {onToggleShow && (
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function ToggleRow({ icon, iconClass, label, enabled, color, onToggle, className }: {
  icon: React.ReactNode; iconClass: string; label: string; enabled: boolean; color: string; onToggle: () => void; className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between p-4 bg-white/5 rounded-2xl", className)}>
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", iconClass)}>{icon}</div>
        <span className="font-bold">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn("w-14 h-8 rounded-full p-1 transition-all duration-300 shadow-inner cursor-pointer", enabled ? color : "bg-slate-800")}
      >
        <div className={cn("w-6 h-6 bg-white rounded-full shadow-md transition-transform", enabled ? "translate-x-6" : "translate-x-0")} />
      </button>
    </div>
  );
}
