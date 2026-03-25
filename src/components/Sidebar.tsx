"use client";

import { 
  Home, Users, Calendar, 
  Settings, LogOut, LayoutDashboard, 
  Monitor, FileText, MessageSquare, 
  LucideIcon, GraduationCap, ShieldUser
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSchoolStore } from "@/lib/store";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: ('admin' | 'teacher' | 'student')[];
}

const NAV_ITEMS: NavItem[] = [
  // Rotas do Administrador
  { icon: LayoutDashboard, label: "Painel Inicial", href: "/dashboard/admin", roles: ['admin'] },
  { icon: Users, label: "Gerenciar Usuários", href: "/dashboard/admin/users", roles: ['admin'] },
  { icon: Monitor, label: "Monitor Telão", href: "/dashboard/monitor", roles: ['admin'] },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings", roles: ['admin'] },
  
  // Rotas do Professor
  { icon: GraduationCap, label: "Gestão Sala", href: "/dashboard/teacher", roles: ['teacher'] },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings", roles: ['teacher'] },
  
  // Rotas do Aluno
  { icon: Home, label: "Painel Aluno", href: "/dashboard/student", roles: ['student'] },
  { icon: MessageSquare, label: "Mural de Recados", href: "/dashboard/mural", roles: ['student', 'teacher', 'admin'] },
  { icon: FileText, label: "Atividades", href: "/dashboard/tasks", roles: ['student', 'teacher'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, userName } = useSchoolStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  if (!mounted) return <div className="w-24 bg-slate-950 border-r border-white/5" />;

  return (

    <div className={cn(
        "bg-slate-950 border-r border-white/5 flex flex-col transition-all duration-500 relative z-50",
        isCollapsed ? "w-24" : "w-72"
    )}>
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        {!isCollapsed && (
          <span className="font-black text-xl tracking-tighter">MESTRE </span>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all group relative",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-white")} />
              {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
              {isActive && (
                <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 mt-auto">
        <div className={cn(
            "p-4 rounded-3xl bg-slate-900 flex items-center gap-3 transition-opacity",
            isCollapsed ? "justify-center" : ""
        )}>
            <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-indigo-500">
                {userName ? userName.charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase()}
             </div>
            {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                    <p className="font-black text-xs uppercase tracking-widest truncate">{userName || userRole}</p>
                    <p className="text-[10px] text-slate-500 font-bold">Online</p>
                </div>
            )}
            {!isCollapsed && (
                <button 
                  onClick={() => router.push("/")}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-700 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
