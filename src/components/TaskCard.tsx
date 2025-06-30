import { useEffect, useState } from 'react';
import { Play, Pause, Square, Trash2, Edit2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const { startTask, pauseTask, completeTask, deleteTask, updateElapsedTime, updateTask, getAllGenres } = useTaskStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEditingGenre, setIsEditingGenre] = useState(false);
  const [editingGenre, setEditingGenre] = useState(task.genre);

  const allGenres = getAllGenres();

  // リアルタイム経過時間の更新
  useEffect(() => {
    let interval: number;
    if (task.status === 'in-progress' && task.startedAt) {
      const updateTime = () => {
        const now = new Date();
        const startedAt = new Date(task.startedAt!);
        const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
        setElapsedTime(elapsed);
        updateElapsedTime(task.id, elapsed);
      };
      updateTime();
      interval = setInterval(updateTime, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [task.status, task.startedAt, task.id, updateElapsedTime]);

  // ジャンル編集の保存
  const handleGenreSave = () => {
    if (editingGenre.trim() && editingGenre !== task.genre) {
      updateTask(task.id, { genre: editingGenre });
    }
    setIsEditingGenre(false);
  };

  // 1行レイアウト用スタイル
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'border-gray-200 bg-gray-50';
      case 'in-progress':
        return 'border-orange-200 bg-orange-50/30';
      default:
        return 'border-gray-100';
    }
  };
  const getGenreColor = (genre: string) => {
    const colors = {
      'クライアントワーク': 'bg-blue-600',
      '写真現像': 'bg-green-600',
      'ルーチン': 'bg-purple-600',
    };
    return colors[genre as keyof typeof colors] || 'bg-gray-500';
  };
  const displayTime = task.status === 'in-progress' 
    ? (task.totalTime || 0) + elapsedTime
    : (task.totalTime || 0);

  return (
    <div className={`task-card flex items-center gap-2 px-3 py-2 min-h-0 ${getStatusColor(task.status)}`}
      style={{fontSize: '0.97rem'}}>
      {/* タイトル */}
      <div className="font-semibold text-gray-900 truncate max-w-[18vw] md:max-w-[200px]">{task.title}</div>
      
      {/* ジャンル（編集可能） */}
      {isEditingGenre ? (
        <div className="flex items-center gap-1">
          <select
            value={editingGenre}
            onChange={(e) => setEditingGenre(e.target.value)}
            className="text-xs border rounded px-1 py-0.5"
            onBlur={handleGenreSave}
            onKeyDown={(e) => e.key === 'Enter' && handleGenreSave()}
            autoFocus
          >
            {allGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className={`${getGenreColor(task.genre)} text-white px-2 py-0.5 rounded-full text-xs font-medium shrink-0`}>
            {task.genre}
          </span>
          <button
            onClick={() => setIsEditingGenre(true)}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
            title="ジャンルを編集"
          >
            <Edit2 size={10} />
          </button>
        </div>
      )}
      
      {/* 繰越タグ */}
      {task.isCarriedOver && (
        <span className="bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-medium ml-1 shrink-0">繰越</span>
      )}
      
      {/* 予定時間 */}
      <span className="text-gray-500 text-xs shrink-0">{task.startTime}~{task.endTime}</span>
      
      {/* 実際の開始・終了時間 */}
      {task.startedAt && (
        <span className="text-blue-600 text-xs shrink-0">
          開始: {formatDateTime(new Date(task.startedAt))}
        </span>
      )}
      {task.completedAt && (
        <span className="text-green-600 text-xs shrink-0">
          終了: {formatDateTime(new Date(task.completedAt))}
        </span>
      )}
      
      {/* メモ（省略表示） */}
      {task.memo && <span className="text-gray-400 text-xs truncate max-w-[10vw] md:max-w-[120px]">{task.memo}</span>}
      
      {/* 操作ボタン */}
      <div className="flex gap-1 ml-auto shrink-0">
        {task.status === 'pending' && (
          <button onClick={() => startTask(task.id)} className="btn-primary flex items-center gap-1 py-1 px-3 text-xs">
            <Play size={13} />開始
          </button>
        )}
        {task.status === 'in-progress' && (
          <>
            <button onClick={() => pauseTask(task.id)} className="btn-warning flex items-center gap-1 py-1 px-3 text-xs">
              <Pause size={13} />中断
            </button>
            <button onClick={() => completeTask(task.id)} className="btn-success flex items-center gap-1 py-1 px-3 text-xs">
              <Square size={13} />終了
            </button>
          </>
        )}
        {task.status === 'completed' && (
          <div className="text-green-600 font-medium flex items-center gap-1 text-xs">✅ 完了</div>
        )}
        <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-xl hover:bg-red-50 transition-colors" title="削除">
          <Trash2 size={13} />
        </button>
      </div>
      
      {/* 経過時間 */}
      <div className={`px-3 py-1 rounded-2xl font-medium text-xs ml-2 shrink-0 ${task.status === 'in-progress' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}
        style={{minWidth: '70px', textAlign: 'center'}}>
        {formatTime(displayTime)}
        {task.status === 'in-progress' && (<span className="ml-1">⏱️</span>)}
      </div>
    </div>
  );
}; 