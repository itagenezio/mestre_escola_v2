"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiJson, apiPost, apiPut, apiDelete } from './api';

// ─────────────────────────────────────────────────────────────
// Tipos vindos da API
// ─────────────────────────────────────────────────────────────
interface Post {
  id: number;
  turma: string;
  type: string;
  content: string;
  criado_em: string;
}

interface Action {
  id: number;
  student_name: string;
  action_type: string;
  post_id: string | null;
}

interface PostsResponse {
  posts: Post[];
  actions: Action[];
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────
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
  fetchFromSupabase: () => Promise<void>;   // nome mantido para não quebrar chamadas existentes
  setAtividade: (turma: string, texto: string) => Promise<void>;
  addRecado: (turma: string, texto: string) => Promise<void>;
  marcarLido: (idRecado: string, aluno: string) => Promise<void>;
  marcarConcluido: (turma: string, aluno: string) => Promise<void>;
  limparTudo: () => Promise<void>;
}

export const useSchoolStore = create<SchoolStore>()(
  persist(
    (set, get) => ({
      userRole: 'admin',
      userName: 'Usuário',
      userClass: '9º B',
      atividades: {},
      recados: {},
      vistos: {},
      concluidos: {},

      setUserRole: (role) => set({ userRole: role }),
      setUserName:  (name)  => set({ userName: name }),
      setUserClass: (turma) => set({ userClass: turma }),

      /** Carrega posts e ações da API do VPS */
      fetchFromSupabase: async () => {
        try {
          const { posts, actions } = await apiJson<PostsResponse>('/api/mestre/posts');

          const atividades: Record<string, string>   = {};
          const recados:    Record<string, string[]> = {};
          const vistos:     Record<string, string[]> = {};
          const concluidos: Record<string, string[]> = {};

          posts.forEach((p) => {
            if (p.type === 'atividade') atividades[p.turma] = p.content;
            if (p.type === 'recado') {
              if (!recados[p.turma]) recados[p.turma] = [];
              recados[p.turma].push(p.content);
            }
          });

          actions.forEach((a) => {
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
        } catch {
          // Silencioso — não quebra o app se a API estiver offline
        }
      },

      setAtividade: async (turma, texto) => {
        set((state) => ({
          atividades: { ...state.atividades, [turma]: texto },
          concluidos: { ...state.concluidos, [turma]: [] },
        }));
        try {
          await apiPut('/api/mestre/posts/atividade', { turma, content: texto });
        } catch { /* silencioso */ }
      },

      addRecado: async (turma, texto) => {
        set((state) => ({
          recados: {
            ...state.recados,
            [turma]: turma === 'PROFESSORES'
              ? [texto, ...(state.recados['PROFESSORES'] || [])].slice(0, 5)
              : [texto, ...(state.recados[turma] || [])].slice(0, 5),
          },
        }));
        try {
          await apiPost('/api/mestre/posts', { turma, type: 'recado', content: texto });
        } catch { /* silencioso */ }
      },

      marcarLido: async (idRecado, aluno) => {
        set((state) => ({
          vistos: {
            ...state.vistos,
            [idRecado]: Array.from(new Set([...(state.vistos[idRecado] || []), aluno])),
          },
        }));
        try {
          await apiPost('/api/mestre/tracked-actions', {
            student_name: aluno,
            action_type: 'visto',
          });
        } catch { /* silencioso */ }
      },

      marcarConcluido: async (turma, aluno) => {
        set((state) => ({
          concluidos: {
            ...state.concluidos,
            [turma]: Array.from(new Set([...(state.concluidos[turma] || []), aluno])),
          },
        }));
        try {
          await apiPost('/api/mestre/tracked-actions', {
            student_name: aluno,
            action_type: 'concluido',
          });
        } catch { /* silencioso */ }
      },

      limparTudo: async () => {
        set({ atividades: {}, recados: {}, vistos: {}, concluidos: {} });
        try {
          await apiDelete('/api/mestre/posts');
        } catch { /* silencioso */ }
      },
    }),
    { name: 'mestre-escola-v3-advanced-store' }
  )
);
