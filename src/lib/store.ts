"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sistema avançado de rastro e atividades
interface SchoolStore {
  atividades: Record<string, string>; 
  recados: Record<string, string[]>;  
  
  // Rastreamento (ID do Aluno ou Nome)
  vistos: Record<string, string[]>; // { "recado_id": ["João", "Maria"] }
  concluidos: Record<string, string[]>; // { "atividade_turma": ["João"] }
  
  setAtividade: (turma: string, texto: string) => void;
  addRecado: (turma: string, texto: string) => void;
  marcarLido: (idRecado: string, aluno: string) => void;
  marcarConcluido: (turma: string, aluno: string) => void;
  limparTudo: () => void;
}

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set) => ({
      atividades: {},
      recados: {},
      vistos: {},
      concluidos: {},

      setAtividade: (turma, texto) => set((state) => ({
        atividades: { ...state.atividades, [turma]: texto },
        concluidos: { ...state.concluidos, [turma]: [] } // Limpa conclusões se a tarefa mudar
      })),

      addRecado: (turma, texto) => set((state) => ({
        recados: { ...state.recados, [turma]: [texto, ...(state.recados[turma] || [])].slice(0, 5) }
      })),

      marcarLido: (idRecado, aluno) => set((state) => ({
        vistos: { 
          ...state.vistos, 
          [idRecado]: Array.from(new Set([...(state.vistos[idRecado] || []), aluno])) 
        }
      })),

      marcarConcluido: (turma, aluno) => set((state) => ({
        concluidos: { 
          ...state.concluidos, 
          [turma]: Array.from(new Set([...(state.concluidos[turma] || []), aluno])) 
        }
      })),

      limparTudo: () => set({ atividades: {}, recados: {}, vistos: {}, concluidos: {} })
    }),
    { name: 'mestre-escola-v3-advanced-store' }
  )
);
