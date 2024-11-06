export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`; // menor que 1 KB, exibe em bytes
  } else if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`; // formata para KB
  } else {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`; // formata para MB
  }
}

export function extractFileName(path: string): string | null {
  const regex = /([^\\/]+)$/;
  const match = path.match(regex);
  return match ? match[0] : null;
}

export const mapEnumToName = {
  0: 'DEFAULT',

  1: 'PICTURE',

  2: 'PHOTO',

  3: 'DRAWING',

  4: 'ICON',

  5: 'TEXT',
};
