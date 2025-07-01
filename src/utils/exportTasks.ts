import { Task } from '../types';

export function exportTasksToCSV(tasks: Task[]) {
  const header = ['タイトル', 'ジャンル', '開始', '終了', '状態', '作成日', 'メモ', '繰越'];
  const rows = tasks.map(task => {
    const start = task.scheduledStartTime;
    const end = calculateEndTime(task.scheduledStartTime, task.scheduledDuration);
    return [
      task.title,
      task.genre,
      start,
      end,
      task.status,
      task.createdAt instanceof Date ? task.createdAt.toLocaleString() : String(task.createdAt),
      task.memo || '',
      task.isCarriedOver ? '○' : '',
    ];
  });
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}

export function exportTasksToMarkdown(tasks: Task[]) {
  const header = '| タイトル | ジャンル | 開始 | 終了 | 状態 | 作成日 | メモ | 繰越 |';
  const sep = '|---|---|---|---|---|---|---|---|';
  const rows = tasks.map(task => {
    const start = task.scheduledStartTime;
    const end = calculateEndTime(task.scheduledStartTime, task.scheduledDuration);
    return `| ${task.title} | ${task.genre} | ${start} | ${end} | ${task.status} | ${(task.createdAt instanceof Date ? task.createdAt.toLocaleString() : String(task.createdAt))} | ${task.memo || ''} | ${task.isCarriedOver ? '○' : ''} |`;
  });
  const md = [header, sep, ...rows].join('\n');
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks_${new Date().toISOString().slice(0,10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
} 