"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

interface SchoolStore {
  userRole: 'admin' | 'teacher' | 'student';
  userName: string;
  userClass: string;
  atividades: Record<string, string>; 
  recados: Record<string, string[]>;  
  vistos: Record<string, string[]>; 
  concluidos: Record<string, string[]>; 
  
  setUserRole: (role: 'admin' | 'teacher' | 'student') => void;
  setUserName: (name: string) => void;
  setUserClass: (turma: string) => void;
  fetchFromSupabase: () => Promise<void>;
  setAtividade: (turma: string, texto: string) => Promise<void>;
  addRecado: (turma: string, texto: string) => Promise<void>;
  marcarLido: (idRecado: string, aluno: string) => Promise<void>;
  marcarConcluido: (turma: string, aluno: string) => Promise<void>;
  limparTudo: () => Promise<void>;
}

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set, get) => ({
      userRole: 'admin', // Default role
      userName: 'Usuário',
      userClass: '9º B',
      atividades: {},
      recados: {},
      vistos: {},
      concluidos: {},

      setUserRole: (role) => set({ userRole: role }),
      setUserName: (name) => set({ userName: name }),
      setUserClass: (turma) => set({ userClass: turma }),

      fetchFromSupabase: async () => {
        const { data: posts } = await supabase.from('posts').select('*');
        const { data: actions } = await supabase.from('tracked_actions').select('*');

        const atividades: Record<string, string> = {};
        const recados: Record<string, string[]> = {};
        const vistos: Record<string, string[]> = {};
        const concluidos: Record<string, string[]> = {};

        posts?.forEach(p => {
          if (p.type === 'atividade') atividades[p.turma] = p.content;
          if (p.type === 'recado') {
            if (!recados[p.turma]) recados[p.turma] = [];
            recados[p.turma].push(p.content);
          }
        });

        actions?.forEach(a => {
          const key = a.post_id || 'global';
          if (a.action_type === 'visto') {
            if (!vistos[key]) vistos[key] = [];
            vistos[key].push(a.student_name);
          }
          if (a.action_type === 'concluido') {
            if (!concluidos[key]) concluidos[key] = [];
            concluidos[key].push(a.student_name);
          }
        });

        set({ atividades, recados, vistos, concluidos });
      },

      setAtividade: async (turma, texto) => {
        set((state) => ({
          atividades: { ...state.atividades, [turma]: texto },
          concluidos: { ...state.concluidos, [turma]: [] }
        }));
        await supabase.from('posts').upsert({ turma, type: 'atividade', content: texto });
      },

      addRecado: async (turma, texto) => {
        set((state) => ({
          recados: { ...state.recados, [turma]: [texto, ...(state.recados[turma] || [])].slice(0, 5) }
        }));
        await supabase.from('posts').insert({ turma, type: 'recado', content: texto });
      },

      marcarLido: async (idRecado, aluno) => {
        set((state) => ({
          vistos: { 
            ...state.vistos, 
            [idRecado]: Array.from(new Set([...(state.vistos[idRecado] || []), aluno])) 
          }
        }));
        // Rastreio persistente no banco (idRecado pode ser ID do post se disponível)
        await supabase.from('tracked_actions').insert({ student_name: aluno, action_type: 'visto' });
      },

      marcarConcluido: async (turma, aluno) => {
        set((state) => ({
          concluidos: { 
            ...state.concluidos, 
            [turma]: Array.from(new Set([...(state.concluidos[turma] || []), aluno])) 
          }
        }));
        await supabase.from('tracked_actions').insert({ student_name: aluno, action_type: 'concluido' });
      },

      limparTudo: async () => {
        set({ atividades: {}, recados: {}, vistos: {}, concluidos: {} });
        await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
    }),
    { name: 'mestre-escola-v3-advanced-store' }
  )
);
