import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStats, GenreStats } from '../types';

const DEFAULT_GENRES = ['クライアントワーク', '写真現像', 'ルーチン'];

interface TaskStore {
  tasks: Task[];
  customGenres: string[]; // カスタムジャンルを保存
  selectedDate: Date;
  activeTab: 'tasks' | 'analytics';
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>, targetDate?: Date) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  startTask: (id: string) => void;
  pauseTask: (id: string) => void;
  completeTask: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setActiveTab: (tab: 'tasks' | 'analytics') => void;
  updateElapsedTime: (id: string, elapsedTime: number) => void;
  addCustomGenre: (genre: string) => void;
  
  // Computed values
  getTasksForDate: (date: Date) => Task[];
  getTaskStats: (date: Date) => TaskStats;
  getGenreStats: (date: Date) => GenreStats[];
  getWeeklyStats: () => GenreStats[];
  getAllGenres: () => string[];

  // New actions
  carryOverTasksIfNeeded: () => void;

  // 完了済みタスクのステータスリセット
  resetTaskStatus: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      customGenres: [],
      selectedDate: new Date(),
      activeTab: 'tasks',

      addTask: (taskData, targetDate) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: targetDate || new Date(),
          status: 'pending',
        };
        
        // カスタムジャンルの場合、保存リストに追加
        if (!DEFAULT_GENRES.includes(taskData.genre)) {
          const { customGenres } = get();
          if (!customGenres.includes(taskData.genre)) {
            set((state) => ({
              customGenres: [...state.customGenres, taskData.genre],
            }));
          }
        }
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      startTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const now = new Date();
        let newStartedAt = now;
        let accumulatedTime = task.totalTime || 0;

        // 中断状態から再開する場合、累積中断時間を計算
        if (task.status === 'paused' && task.pausedAt) {
          const pausedAt = new Date(task.pausedAt);
          const pausedDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
          const newTotalPausedTime = (task.totalPausedTime || 0) + pausedDuration;
          
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id
                ? { 
                    ...t, 
                    status: 'in-progress', 
                    startedAt: task.startedAt, // 元の開始時間を保持
                    totalPausedTime: newTotalPausedTime,
                    pausedAt: undefined // 中断時間をクリア
                  }
                : t
            ),
          }));
          return;
        }

        // 通常の開始処理
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { 
                  ...t, 
                  status: 'in-progress', 
                  startedAt: newStartedAt,
                  totalTime: accumulatedTime
                }
              : t
          ),
        }));
      },

      pauseTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task || task.status !== 'in-progress') return;

        const now = new Date();
        const startedAt = task.startedAt || now;
        const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
        const newTotalTime = (task.totalTime || 0) + elapsed;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { 
                  ...t, 
                  status: 'paused',
                  totalTime: newTotalTime,
                  pausedAt: now, // 中断開始時間を記録
                  // startedAtは保持する（開始時間を消さない）
                }
              : t
          ),
        }));
      },

      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const now = new Date();
        let finalTotalTime = task.totalTime || 0;

        // 進行中の場合は現在の経過時間を加算
        if (task.status === 'in-progress' && task.startedAt) {
          const startedAt = new Date(task.startedAt);
          const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          finalTotalTime += elapsed;
        }

        // 中断中の場合は中断時間を累積
        if (task.status === 'paused' && task.pausedAt) {
          const pausedAt = new Date(task.pausedAt);
          const pausedDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
          const newTotalPausedTime = (task.totalPausedTime || 0) + pausedDuration;
          
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: 'completed',
                    completedAt: now,
                    totalTime: finalTotalTime,
                    totalPausedTime: newTotalPausedTime,
                    pausedAt: undefined
                  }
                : t
            ),
          }));
          return;
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'completed',
                  completedAt: now,
                  totalTime: finalTotalTime,
                  // startedAtは保持する（開始時間を消さない）
                }
              : t
          ),
        }));
      },

      updateElapsedTime: (id, elapsedTime) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, elapsedTime } : task
          ),
        }));
      },

      addCustomGenre: (genre) => {
        const { customGenres } = get();
        if (!customGenres.includes(genre) && !DEFAULT_GENRES.includes(genre)) {
          set((state) => ({
            customGenres: [...state.customGenres, genre],
          }));
        }
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
        get().carryOverTasksIfNeeded();
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      getTasksForDate: (date) => {
        const { tasks } = get();
        // dateパラメータを確実にDateオブジェクトとして扱う
        const targetDate = date instanceof Date ? date : new Date(date);
        
        return tasks.filter((task) => {
          const taskDate = new Date(task.createdAt);
          return (
            taskDate.getFullYear() === targetDate.getFullYear() &&
            taskDate.getMonth() === targetDate.getMonth() &&
            taskDate.getDate() === targetDate.getDate()
          );
        });
      },

      getTaskStats: (date) => {
        const tasks = get().getTasksForDate(date);
        const completedTasks = tasks.filter((task) => task.status === 'completed');
        const totalTime = tasks.reduce((sum, task) => sum + (task.totalTime || 0), 0);
        const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

        return {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          totalTime,
          completionRate,
        };
      },

      getGenreStats: (date) => {
        const tasks = get().getTasksForDate(date);
        const genreMap = new Map<string, { totalTime: number; taskCount: number }>();

        tasks.forEach((task) => {
          const current = genreMap.get(task.genre) || { totalTime: 0, taskCount: 0 };
          genreMap.set(task.genre, {
            totalTime: current.totalTime + (task.totalTime || 0),
            taskCount: current.taskCount + 1,
          });
        });

        return Array.from(genreMap.entries()).map(([genre, stats]) => ({
          genre,
          ...stats,
        }));
      },

      getWeeklyStats: () => {
        const { tasks } = get();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weeklyTasks = tasks.filter((task) => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= weekAgo && taskDate <= now;
        });

        const genreMap = new Map<string, { totalTime: number; taskCount: number }>();

        weeklyTasks.forEach((task) => {
          const current = genreMap.get(task.genre) || { totalTime: 0, taskCount: 0 };
          genreMap.set(task.genre, {
            totalTime: current.totalTime + (task.totalTime || 0),
            taskCount: current.taskCount + 1,
          });
        });

        return Array.from(genreMap.entries()).map(([genre, stats]) => ({
          genre,
          ...stats,
        }));
      },

      getAllGenres: () => {
        const { customGenres } = get();
        return [...DEFAULT_GENRES, ...customGenres];
      },

      carryOverTasksIfNeeded: () => {
        const { tasks } = get();
        // 今日の日付
        const today = new Date();
        today.setHours(0,0,0,0);
        // 前日の日付
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // 前日分の未完了タスク（繰越済みでないもの）
        const carryOverTargets = tasks.filter(task => {
          const created = new Date(task.createdAt);
          created.setHours(0,0,0,0);
          return (
            (task.status === 'pending' || task.status === 'in-progress') &&
            !task.isCarriedOver &&
            created.getFullYear() === yesterday.getFullYear() &&
            created.getMonth() === yesterday.getMonth() &&
            created.getDate() === yesterday.getDate()
          );
        });

        // ルーチンタスクの自動追加
        const routineTasks = tasks.filter(task => {
          const created = new Date(task.createdAt);
          created.setHours(0,0,0,0);
          return (
            task.genre === 'ルーチン' &&
            created.getFullYear() === yesterday.getFullYear() &&
            created.getMonth() === yesterday.getMonth() &&
            created.getDate() === yesterday.getDate()
          );
        });

        const newTasks: Task[] = [];

        // 繰越タスクを追加
        if (carryOverTargets.length > 0) {
          const carryOverTasks = carryOverTargets.map(task => ({
            ...task,
            id: crypto.randomUUID(),
            createdAt: today,
            startedAt: undefined,
            completedAt: undefined,
            totalTime: 0,
            status: 'pending' as Task['status'],
            isCarriedOver: true,
          }));
          newTasks.push(...carryOverTasks);
        }

        // ルーチンタスクを追加
        if (routineTasks.length > 0) {
          const routineTasksForToday = routineTasks.map(task => ({
            ...task,
            id: crypto.randomUUID(),
            createdAt: today,
            startedAt: undefined,
            completedAt: undefined,
            totalTime: 0,
            status: 'pending' as Task['status'],
            isCarriedOver: false,
          }));
          newTasks.push(...routineTasksForToday);
        }

        if (newTasks.length > 0) {
          set((state) => ({
            tasks: [...state.tasks, ...newTasks]
          }));
        }
      },

      // 完了済みタスクのステータスリセット
      resetTaskStatus: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'pending',
                  startedAt: undefined,
                  completedAt: undefined,
                  pausedAt: undefined,
                  totalPausedTime: 0,
                  totalTime: 0,
                }
              : task
          ),
        }));
      },
    }),
    {
      name: 'task-store',
      // Dateオブジェクトの復元を確実にする
      partialize: (state) => ({
        ...state,
        selectedDate: state.selectedDate.toISOString(),
        tasks: state.tasks.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString(),
          startedAt: task.startedAt ? task.startedAt.toISOString() : undefined,
          completedAt: task.completedAt ? task.completedAt.toISOString() : undefined,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 復元時にDateオブジェクトに変換
          state.selectedDate = new Date(state.selectedDate);
          state.tasks = state.tasks.map(task => ({
            ...task,
            createdAt: new Date(task.createdAt),
            startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          }));
          // ストア復元時にも繰越処理を実行
          setTimeout(() => {
            // ZustandのonRehydrateStorageは非同期なのでsetTimeoutで呼ぶ
            useTaskStore.getState().carryOverTasksIfNeeded();
          }, 0);
        }
      },
    }
  )
); 