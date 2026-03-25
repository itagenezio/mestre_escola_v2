"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Play, FileText, Download,
  Video, Share2, Lock,
  CheckCircle, X, ExternalLink
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { playNotification } from "@/lib/notify";

const contents = [
  {
    id: 1, type: "video", text: "Trigonometria Básica", disciplina: "Matemática",
    duracao: "15 min", icon: Video,
    url: "https://www.youtube.com/watch?v=T9lt6MZKLck",
    descricao: "Aprenda as bases da trigonometria com exemplos práticos."
  },
  {
    id: 2, type: "pdf", text: "Apostila: Era de Ouro", disciplina: "História",
    duracao: "12 págs", icon: FileText,
    url: "#",
    descricao: "Material completo sobre o período áureo brasileiro."
  },
  {
    id: 3, type: "video", text: "Laboratório Virtual: Átomos", disciplina: "Química",
    duracao: "34 min", icon: Video,
    url: "https://www.youtube.com/watch?v=W2Xb2GFK2yc",
    descricao: "Explore a estrutura atômica de forma interativa."
  },
  {
    id: 4, type: "locked", text: "Simulado Final", disciplina: "Geral",
    duracao: "2 horas", icon: Lock,
    url: "#",
    descricao: "Disponível após concluir todos os módulos anteriores."
  },
];

export default function ContentPage() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "warn" } | null>(null);
  const [preview, setPreview] = useState<typeof contents[0] | null>(null);

  const showToast = (msg: string, type: "success" | "info" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccess = (item: typeof contents[0]) => {
    if (item.type === "locked") {
      playNotification("alert");
      showToast("🔒 Conteúdo bloqueado! Conclua os módulos anteriores.", "warn");
      return;
    }
    playNotification("success");
    setPreview(item);
  };

  const handleShare = (item: typeof contents[0]) => {
    if (item.type === "locked") {
      showToast("Conteúdo bloqueado não pode ser compartilhado.", "warn");
      return;
    }
    playNotification("notification");
    const text = `Confira: ${item.text} — ${item.disciplina} (${item.duracao})`;
    if (navigator.share) {
      navigator.share({ title: item.text, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text)
        .then(() => showToast("✅ Link copiado para a área de transferência!", "success"))
        .catch(() => showToast("ℹ️ Use Ctrl+C para copiar.", "info"));
    }
  };

  return (
    <div className="flex flex-col">
      <BackButton />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 text-sm max-w-sm",
              toast.type === "success" && "bg-emerald-600 text-white",
              toast.type === "warn" && "bg-amber-600 text-white",
              toast.type === "info" && "bg-indigo-600 text-white"
            )}
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Preview Modal */}
      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">
                    {preview.disciplina}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3">{preview.text}</h3>
                  <p className="text-slate-400 font-medium mt-2">{preview.descricao}</p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="text-slate-500 hover:text-white transition-colors ml-4 p-1 shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                {preview.type === "video" && (
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { playNotification("success"); setPreview(null); }}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Assistir Agora
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {preview.type === "pdf" && (
                  <button
                    onClick={() => {
                      playNotification("success");
                      showToast("📥 Download iniciado!", "success");
                      setPreview(null);
                    }}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Apostila
                  </button>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl text-sm transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-4 tracking-tight"
        >
          Central de Conteúdos
        </motion.h1>
        <p className="text-slate-500 font-medium text-lg">Acesse suas aulas, materiais e vídeos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contents.map((item, i) => (
          <GlassCard
            key={item.id}
            delay={i * 0.15}
            className={cn(
              "group cursor-pointer interactive",
              item.type === "locked" && "opacity-70"
            )}
          >
            <div className="flex items-start justify-between min-h-[140px]">
              <div className="flex flex-col h-full">
                <div className={cn(
                  "p-4 rounded-2xl w-fit shadow-inner mb-6",
                  item.type === "locked" ? "bg-slate-800/80 text-slate-600" : "bg-indigo-600/10 text-indigo-400"
                )}>
                  <item.icon className="w-8 h-8" />
                </div>

                <div>
                  <h3 className={cn(
                    "text-2xl font-bold tracking-tight mb-2",
                    item.type === "locked" ? "text-slate-500" : "text-white"
                  )}>
                    {item.text}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    <span className={item.type === "locked" ? "text-slate-600" : "text-indigo-500"}>{item.disciplina}</span>
                    <span>•</span>
                    <span>{item.duracao}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between h-full gap-10">
                <button
                  onClick={() => handleShare(item)}
                  className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-indigo-600 transition-all shadow-lg active:scale-90 cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleAccess(item)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 cursor-pointer",
                    item.type === "locked"
                      ? "bg-slate-800 text-slate-500 hover:bg-slate-700"
                      : "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.03]"
                  )}
                >
                  {item.type === "video" && <Play className="w-4 h-4 fill-white" />}
                  {item.type === "pdf" && <Download className="w-4 h-4" />}
                  {item.type === "locked" && <Lock className="w-4 h-4" />}
                  {item.type === "locked" ? "Bloqueado" : "Acessar"}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="h-20" />
    </div>
  );
}
