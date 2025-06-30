import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStats, GenreStats } from '../types';

const DEFAULT_GENRES = ['クライアントワーク', '写真現像'];

interface TaskStore {
  tasks: Task[];
  customGenres: string[]; // カスタムジャンルを保存
  selectedDate: Date;
  activeTab: 'tasks' | 'analytics';
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
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
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      customGenres: [],
      selectedDate: new Date(),
      activeTab: 'tasks',

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
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

        // 中断状態から再開する場合、累積時間を保持
        if (task.status === 'pending' && task.startedAt) {
          const previousElapsed = Math.floor((now.getTime() - task.startedAt.getTime()) / 1000);
          accumulatedTime += previousElapsed;
        }

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
                  status: 'pending',
                  totalTime: newTotalTime,
                  startedAt: undefined // 開始時刻をクリア
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

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'completed',
                  completedAt: now,
                  totalTime: finalTotalTime,
                  startedAt: undefined
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
        }
      },
    }
  )
); 