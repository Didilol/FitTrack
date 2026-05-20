import { Directory, File, Paths } from 'expo-file-system';

const FOTOS_DIR = 'fotos';

function ensureFotosDir(): Directory {
  const dir = new Directory(Paths.document, FOTOS_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function detectExtension(uri: string): string {
  const m = uri.match(/\.(jpe?g|png|heic|webp)(\?|$)/i);
  return m ? `.${m[1].toLowerCase()}` : '.jpg';
}

/**
 * Copia uma foto da URI temporária (image-picker) para a documentDirectory
 * persistente e devolve a nova URI estável.
 */
export function copiarFotoParaApp(sourceUri: string): string {
  const dir = ensureFotosDir();
  const ext = detectExtension(sourceUri);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const source = new File(sourceUri);
  const destino = new File(dir, filename);
  source.copy(destino);
  return destino.uri;
}

export function eliminarFotoLocal(uri: string): void {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // se já não existir, ignora
  }
}
