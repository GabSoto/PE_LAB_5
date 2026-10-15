import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Aporte, Sugerencia } from '@/types';

interface EcoState {
  nombreUsuario: string;
  aportes: Aporte[];
  sugerencias: Sugerencia[];
  setNombreUsuario: (nombre: string) => void;
  addAporte: (puntoId: string) => void;
  addSugerencia: (
    sugerencia: Omit<Sugerencia, 'id' | 'fecha' | 'estado'>,
  ) => void;
}

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useEcoStore = create<EcoState>()(
  persist(
    (set) => ({
      nombreUsuario: '',
      aportes: [],
      sugerencias: [],

      setNombreUsuario: (nombre) => set({ nombreUsuario: nombre }),

      addAporte: (puntoId) =>
        set((state) => ({
          aportes: [
            { id: generarId(), puntoId, fecha: new Date().toISOString() },
            ...state.aportes,
          ],
        })),

      addSugerencia: (sugerencia) =>
        set((state) => ({
          sugerencias: [
            {
              ...sugerencia,
              id: generarId(),
              fecha: new Date().toISOString(),
              estado: 'pendiente',
            },
            ...state.sugerencias,
          ],
        })),
    }),
    {
      name: 'ecocanje-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
