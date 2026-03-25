"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { userRole } = useSchoolStore();

  useEffect(() => {
    if (userRole === 'admin') {
      router.push("/dashboard/admin");
    } else if (userRole === 'teacher') {
      router.push("/dashboard/teacher");
    } else {
      router.push("/dashboard/student");
    }
  }, [userRole, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Redirecionando para seu Painel...</p>
      </div>
    </div>
  );
}

