export function formatDuracao(segundosTotal: number): string {
  if (!Number.isFinite(segundosTotal) || segundosTotal < 0) return '00:00';
  const h = Math.floor(segundosTotal / 3600);
  const m = Math.floor((segundosTotal % 3600) / 60);
  const s = segundosTotal % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDataCurta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDataLonga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function formatPeso(kg: number | null | undefined): string {
  if (kg == null) return '—';
  return `${kg.toFixed(kg % 1 === 0 ? 0 : 1)} kg`;
}

export function parseNumero(v: string): number {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
