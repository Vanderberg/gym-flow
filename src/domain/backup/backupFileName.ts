const pad = (n: number) => String(n).padStart(2, '0');

/** Nome do arquivo de backup com a data local de `date` (sem conversão UTC). */
export function backupFileName(date: Date): string {
  return `gymflow-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}
