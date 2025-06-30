import { Task } from '../types';

export function exportTasksToCSV(tasks: Task[]) {
  const header = ['タイトル', 'ジャンル', '開始', '終了', '状態', '作成日', 'メモ', '繰越'];
  const rows = tasks.map(task => [
    task.title,
    task.genre,
    task.startTime,
    task.endTime,
    task.status,
    task.createdAt instanceof Date ? task.createdAt.toLocaleString() : String(task.createdAt),
    task.memo || '',
    task.isCarriedOver ? '○' : '',
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksToMarkdown(tasks: Task[]) {
  const header = '| タイトル | ジャンル | 開始 | 終了 | 状態 | 作成日 | メモ | 繰越 |';
  const sep = '|---|---|---|---|---|---|---|---|';
  const rows = tasks.map(task => `| ${task.title} | ${task.genre} | ${task.startTime} | ${task.endTime} | ${task.status} | ${(task.createdAt instanceof Date ? task.createdAt.toLocaleString() : String(task.createdAt))} | ${task.memo || ''} | ${task.isCarriedOver ? '○' : ''} |`);
  const md = [header, sep, ...rows].join('\n');
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks_${new Date().toISOString().slice(0,10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
} 