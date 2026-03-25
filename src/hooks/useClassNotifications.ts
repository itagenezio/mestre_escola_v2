"use client";

import { useEffect, useRef } from "react";
import { playNotification } from "@/lib/notify";
import { HORARIOS_AULAS } from "@/lib/schedule";

const AULAS_NOTIFY = [
  "06:55", // 5 min antes da 1ª aula (07:00) - MANHÃ
  "12:55", // 5 min antes da 6ª aula (13:00) - TARDE
];

export function useClassNotifications() {
  const lastNotification = useRef<string>("");

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      // Verifica se é dia de semana (segunda a sexta)
      const day = now.getDay();
      if (day === 0 || day === 6) return; // Não Notificar nos fins de semana

      // Verifica se está no horário de notificação
      if (AULAS_NOTIFY.includes(currentTime) && lastNotification.current !== currentTime) {
        lastNotification.current = currentTime;
        playNotification("notification");
        
        // Remove o alerta após 1 minuto para permitir nova notificação
        setTimeout(() => {
          lastNotification.current = "";
        }, 60000);
      }
    };

    // Verifica a cada 30 segundos
    const interval = setInterval(checkTime, 30000);
    
    // Verifica imediatamente ao montar
    checkTime();

    return () => clearInterval(interval);
  }, []);
}
