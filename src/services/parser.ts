import type { TipoMedicao } from '@/types';

export interface ItemParseado {
  nome: string;
  series: number;
  reps: string;
  tipoMedicao: TipoMedicao;
  notas?: string;
  alternativas?: string;
}

export interface ResultadoParse {
  itens: ItemParseado[];
  linhasIgnoradas: string[];
}

/**
 * Aceita texto livre tipo:
 *   "Supino Reto (Halteres ou Barra): 4 séries x 8-12 reps."
 *   "Tríceps Testa ou Francês: 3 séries x 8-12 reps."
 *   "Prancha Abdominal: 3 séries de tempo máximo (Manter contraído)."
 *   "Alongamento Peitoral: 1 série de 45-60 segundos."
 */
export function parseRotinaText(texto: string): ResultadoParse {
  const itens: ItemParseado[] = [];
  const linhasIgnoradas: string[] = [];

  const linhas = texto
    .split('\n')
    .map(limparLinhaPrefixo)
    .filter((l) => l.length > 0);

  for (const linha of linhas) {
    const parsed = parseLinha(linha);
    if (parsed) itens.push(parsed);
    else if (pareceCabecalho(linha)) continue;
    else linhasIgnoradas.push(linha);
  }

  return { itens, linhasIgnoradas };
}

function limparLinhaPrefixo(linha: string): string {
  return linha
    .trim()
    .replace(/^[-•●*]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pareceCabecalho(linha: string): boolean {
  if (/^(treino|rotina|circuito|ficha)\b/i.test(linha)) return true;
  if (/^[A-ZÀ-Ý][A-ZÀ-Ý\s\-—:,]{4,}$/.test(linha)) return true;
  return false;
}

function parseLinha(linha: string): ItemParseado | null {
  const m = linha.match(/^(.+?)\s*[:\-—]\s*(.+)$/);
  if (!m) return null;
  let [, nomePart, prescricao] = m;
  prescricao = prescricao.replace(/\.$/, '').trim();

  if (!/\d/.test(prescricao)) return null;

  const notas: string[] = [];
  prescricao = prescricao
    .replace(/\(([^)]+)\)/g, (_, p) => {
      const t = (p as string).trim();
      if (t) notas.push(t);
      return ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();

  const { series, reps, tipoMedicao } = extrairPrescricao(prescricao);
  if (!reps) return null;

  const { nome, alternativas, notasExtra } = extrairNomeEAlternativas(nomePart);
  if (notasExtra) notas.unshift(notasExtra);

  return {
    nome,
    series,
    reps,
    tipoMedicao,
    notas: notas.length ? notas.join('. ') : undefined,
    alternativas,
  };
}

function extrairPrescricao(p: string): {
  series: number;
  reps: string;
  tipoMedicao: TipoMedicao;
} {
  const tempoMax = p.match(/(\d+)\s*s[ée]ries?\s*(?:de|com)?\s*tempo\s*m[áa]ximo/i);
  if (tempoMax) {
    return { series: parseInt(tempoMax[1], 10), reps: 'máx', tipoMedicao: 'tempo' };
  }

  const segRange = p.match(
    /(\d+)\s*s[ée]ries?\s*(?:de|com)?\s*(\d+)\s*(?:a|[-–—])\s*(\d+)\s*(?:s|seg|segundos?)/i
  );
  if (segRange) {
    return {
      series: parseInt(segRange[1], 10),
      reps: `${segRange[2]}-${segRange[3]}`,
      tipoMedicao: 'tempo',
    };
  }

  const segSimples = p.match(
    /(\d+)\s*s[ée]ries?\s*(?:de|com)?\s*(\d+)\s*(?:s|seg|segundos?)/i
  );
  if (segSimples) {
    return {
      series: parseInt(segSimples[1], 10),
      reps: segSimples[2],
      tipoMedicao: 'tempo',
    };
  }

  const semSeries = p.match(
    /^(\d+)\s*(?:a|[-–—])\s*(\d+)\s*(?:s|seg|segundos?)/i
  );
  if (semSeries) {
    return {
      series: 1,
      reps: `${semSeries[1]}-${semSeries[2]}`,
      tipoMedicao: 'tempo',
    };
  }

  const repsRange = p.match(
    /(\d+)\s*s[ée]ries?\s*(?:x|por|de)\s*(\d+(?:[-–—]\d+)?)\s*(?:reps?|repeti[çc][õo]es?)?/i
  );
  if (repsRange) {
    return {
      series: parseInt(repsRange[1], 10),
      reps: repsRange[2].replace(/[–—]/g, '-'),
      tipoMedicao: 'reps',
    };
  }

  const compacto = p.match(/(\d+)\s*[x×]\s*(\d+(?:[-–—]\d+)?)/i);
  if (compacto) {
    return {
      series: parseInt(compacto[1], 10),
      reps: compacto[2].replace(/[–—]/g, '-'),
      tipoMedicao: 'reps',
    };
  }

  return { series: 0, reps: '', tipoMedicao: 'reps' };
}

function extrairNomeEAlternativas(nomeBruto: string): {
  nome: string;
  alternativas?: string;
  notasExtra?: string;
} {
  let nome = nomeBruto.trim().replace(/\s+/g, ' ');
  let alternativas: string | undefined;
  let notasExtra: string | undefined;

  const parenMatch = nome.match(/^(.+?)\s*\(([^)]+)\)\s*(.*)$/);
  if (parenMatch) {
    const base = parenMatch[1].trim();
    const dentro = parenMatch[2].trim();
    const resto = parenMatch[3].trim();

    if (/\bou\b/i.test(dentro)) {
      alternativas = dentro
        .split(/\s+ou\s+/i)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(',');
      nome = (base + (resto ? ' ' + resto : '')).trim();
    } else {
      notasExtra = dentro;
      nome = (base + (resto ? ' ' + resto : '')).trim();
    }
  }

  if (!alternativas) {
    const directOu = nome.match(/^(.+?)\s+ou\s+(.+)$/i);
    if (directOu) {
      const esquerda = directOu[1].trim();
      const direita = directOu[2].trim();
      alternativas = `${esquerda},${direita}`;
      nome = esquerda;
    }
  }

  return { nome, alternativas, notasExtra };
}
