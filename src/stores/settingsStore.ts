import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = '@fittrack/settings';

interface SettingsState {
  duracaoDescansoPadrao: number;
  hapticsAtivos: boolean;
  carregado: boolean;
  carregar: () => Promise<void>;
  setDuracaoDescansoPadrao: (s: number) => void;
  setHapticsAtivos: (v: boolean) => void;
}

const PADRAO = {
  duracaoDescansoPadrao: 90,
  hapticsAtivos: true,
};

async function persistir(state: Pick<SettingsState, 'duracaoDescansoPadrao' | 'hapticsAtivos'>) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        duracaoDescansoPadrao: state.duracaoDescansoPadrao,
        hapticsAtivos: state.hapticsAtivos,
      })
    );
  } catch {
    // ignora — settings não-críticas
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...PADRAO,
  carregado: false,

  carregar: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>;
        set({
          duracaoDescansoPadrao:
            parsed.duracaoDescansoPadrao ?? PADRAO.duracaoDescansoPadrao,
          hapticsAtivos: parsed.hapticsAtivos ?? PADRAO.hapticsAtivos,
          carregado: true,
        });
        return;
      }
    } catch {
      // ignora
    }
    set({ carregado: true });
  },

  setDuracaoDescansoPadrao: (s) => {
    set({ duracaoDescansoPadrao: s });
    persistir({ ...get(), duracaoDescansoPadrao: s });
  },

  setHapticsAtivos: (v) => {
    set({ hapticsAtivos: v });
    persistir({ ...get(), hapticsAtivos: v });
  },
}));
