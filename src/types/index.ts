export interface Task {
  id: string;
  title: string;
  genre: string;
  scheduledStartTime: string; // 開始予定時間
  scheduledDuration: number; // 作業予定時間（分）
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalTime?: number; // 秒単位
  memo?: string;
  isCarriedOver?: boolean; // 翌日繰越タスクかどうか
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  totalTime: number;
  completionRate: number;
}

export interface GenreStats {
  genre: string;
  totalTime: number;
  taskCount: number;
}

export type TabType = 'tasks' | 'analytics';

// リアルタイム計測用の型
export interface TaskWithTimer extends Task {
  elapsedTime?: number; // リアルタイム経過時間（秒）
} 