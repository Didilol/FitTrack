import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import type { TipoMedicao } from '@/types';

export interface SerieAtiva {
  id: string;
  numeroSerie: number;
  cargaAnterior: number | null;
  repsAnteriores: number | null;
  duracaoAnterior: number | null;
  carga: string;
  reps: string;
  duracao: string;
  concluido: boolean;
}

export interface ExercicioAtivo {
  id: string;
  exercicioId: number;
  nome: string;
  grupoMuscular?: string;
  tipoMedicao: TipoMedicao;
  alternativas?: string | null;
  notas?: string | null;
  series: SerieAtiva[];
  seriesAlvo: number;
  pulado: boolean;
}

interface RestTimer {
  duracao: number;
  restante: number;
  ativo: boolean;
}

interface ActiveWorkoutState {
  rotinaId: number | null;
  nomeTreino: string;
  dataInicio: number | null;
  duracaoSegundos: number;
  exercicios: ExercicioAtivo[];
  restTimer: RestTimer;
  duracaoDescansoPadrao: number;

  iniciarTreino: (p: {
    rotinaId: number | null;
    nomeTreino: string;
    exercicios: ExercicioAtivo[];
  }) => void;
  tickCronometro: () => void;
  atualizarSerie: (
    exercicioId: string,
    serieId: string,
    campo: 'carga' | 'reps' | 'duracao',
    valor: string
  ) => void;
  alternarConcluido: (exercicioId: string, serieId: string) => void;
  adicionarSerie: (exercicioId: string) => void;
  removerSerie: (exercicioId: string, serieId: string) => void;
  removerUltimaSerie: (exercicioId: string) => boolean;
  alternarPularExercicio: (exercicioId: string) => void;
  iniciarDescanso: (segundos?: number) => void;
  tickDescanso: () => void;
  cancelarDescanso: () => void;
  ajustarDescanso: (delta: number) => void;
  setDuracaoDescansoPadrao: (s: number) => void;
  resetar: () => void;
}

const ESTADO_INICIAL = {
  rotinaId: null,
  nomeTreino: '',
  dataInicio: null,
  duracaoSegundos: 0,
  exercicios: [],
  restTimer: { duracao: 0, restante: 0, ativo: false },
  duracaoDescansoPadrao: 90,
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  ...ESTADO_INICIAL,

  iniciarTreino: ({ rotinaId, nomeTreino, exercicios }) =>
    set({
      rotinaId,
      nomeTreino,
      exercicios,
      dataInicio: Date.now(),
      duracaoSegundos: 0,
    }),

  tickCronometro: () => {
    const { dataInicio } = get();
    if (!dataInicio) return;
    set({ duracaoSegundos: Math.floor((Date.now() - dataInicio) / 1000) });
  },

  atualizarSerie: (exercicioId, serieId, campo, valor) =>
    set((state) => ({
      exercicios: state.exercicios.map((ex) =>
        ex.id !== exercicioId
          ? ex
          : {
              ...ex,
              series: ex.series.map((s) =>
                s.id !== serieId ? s : { ...s, [campo]: valor }
              ),
            }
      ),
    })),

  alternarConcluido: (exercicioId, serieId) => {
    let virouConcluido = false;
    let bloqueado = false;
    set((state) => ({
      exercicios: state.exercicios.map((ex) => {
        if (ex.id !== exercicioId) return ex;
        return {
          ...ex,
          series: ex.series.map((s) => {
            if (s.id !== serieId) return s;
            if (s.concluido) {
              virouConcluido = false;
              return { ...s, concluido: false };
            }
            const isTempo = ex.tipoMedicao === 'tempo';
            const valorVisivelReps = s.reps || (s.repsAnteriores != null ? String(s.repsAnteriores) : '');
            const valorVisivelCarga = s.carga || (s.cargaAnterior != null ? String(s.cargaAnterior) : '');
            const valorVisivelDuracao = s.duracao || (s.duracaoAnterior != null ? String(s.duracaoAnterior) : '');
            const podeConcluir = isTempo
              ? valorVisivelDuracao !== ''
              : valorVisivelReps !== '';
            if (!podeConcluir) {
              bloqueado = true;
              return s;
            }
            virouConcluido = true;
            return {
              ...s,
              concluido: true,
              carga: isTempo ? s.carga : valorVisivelCarga,
              reps: isTempo ? s.reps : valorVisivelReps,
              duracao: isTempo ? valorVisivelDuracao : s.duracao,
            };
          }),
        };
      }),
    }));
    if (bloqueado) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (virouConcluido) get().iniciarDescanso();
  },

  adicionarSerie: (exercicioId) =>
    set((state) => ({
      exercicios: state.exercicios.map((ex) => {
        if (ex.id !== exercicioId) return ex;
        const ultima = ex.series[ex.series.length - 1];
        return {
          ...ex,
          series: [
            ...ex.series,
            {
              id: `${exercicioId}-${Date.now()}`,
              numeroSerie: ex.series.length + 1,
              cargaAnterior: ultima?.cargaAnterior ?? null,
              repsAnteriores: ultima?.repsAnteriores ?? null,
              duracaoAnterior: ultima?.duracaoAnterior ?? null,
              carga: '',
              reps: '',
              duracao: '',
              concluido: false,
            },
          ],
        };
      }),
    })),

  removerSerie: (exercicioId, serieId) =>
    set((state) => ({
      exercicios: state.exercicios.map((ex) => {
        if (ex.id !== exercicioId) return ex;
        const series = ex.series
          .filter((s) => s.id !== serieId)
          .map((s, i) => ({ ...s, numeroSerie: i + 1 }));
        return { ...ex, series };
      }),
    })),

  removerUltimaSerie: (exercicioId) => {
    const ex = get().exercicios.find((e) => e.id === exercicioId);
    if (!ex) return false;
    if (ex.series.length <= 1) return false;
    const ultima = ex.series[ex.series.length - 1];
    if (ultima.concluido) return false;
    set((state) => ({
      exercicios: state.exercicios.map((e) => {
        if (e.id !== exercicioId) return e;
        const series = e.series
          .slice(0, -1)
          .map((s, i) => ({ ...s, numeroSerie: i + 1 }));
        return { ...e, series };
      }),
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    return true;
  },

  alternarPularExercicio: (exercicioId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    set((state) => ({
      exercicios: state.exercicios.map((ex) =>
        ex.id !== exercicioId ? ex : { ...ex, pulado: !ex.pulado }
      ),
    }));
  },

  iniciarDescanso: (segundos) => {
    const dur = segundos ?? get().duracaoDescansoPadrao;
    set({ restTimer: { duracao: dur, restante: dur, ativo: true } });
  },

  tickDescanso: () => {
    const { restTimer } = get();
    if (!restTimer.ativo) return;
    const restante = restTimer.restante - 1;
    if (restante <= 0) {
      set({
        restTimer: { duracao: restTimer.duracao, restante: 0, ativo: false },
      });
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    } else {
      set({ restTimer: { ...restTimer, restante } });
    }
  },

  cancelarDescanso: () =>
    set((state) => ({
      restTimer: { ...state.restTimer, ativo: false, restante: 0 },
    })),

  ajustarDescanso: (delta) =>
    set((state) => {
      if (!state.restTimer.ativo) return state;
      const restante = Math.max(1, state.restTimer.restante + delta);
      return { restTimer: { ...state.restTimer, restante } };
    }),

  setDuracaoDescansoPadrao: (s) => set({ duracaoDescansoPadrao: s }),

  resetar: () => set(ESTADO_INICIAL),
}));

export const selectCronometro = (s: ActiveWorkoutState) => s.duracaoSegundos;
export const selectRestTimer = (s: ActiveWorkoutState) => s.restTimer;
export const selectTreinoEmCurso = (s: ActiveWorkoutState) =>
  s.dataInicio !== null;
export const selectExercicios = (s: ActiveWorkoutState) => s.exercicios;

export type ExercicioStatus = 'completed' | 'skipped' | 'pending';

export function getExercicioStatus(ex: ExercicioAtivo): ExercicioStatus {
  if (ex.pulado) return 'skipped';
  if (ex.series.length > 0 && ex.series.every((s) => s.concluido)) {
    return 'completed';
  }
  return 'pending';
}
