import { useEffect, useState } from 'react';
import { Play, Pause, Square, Trash2 } from 'lucide-react';
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

// 開始時間と作業時間から終了時間を計算する関数
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

// 秒を分に変換する関数
const secondsToMinutes = (seconds: number): number => {
  return Math.round(seconds / 60);
};

// タイトルの長さに応じてフォントサイズを変える関数を追加
const getTitleFontSize = (title: string) => {
  const len = Array.from(title).length;
  if (len <= 10) return "text-base"; // 基本サイズ（日本語5～10文字想定）
  if (len <= 20) return "text-sm";
  return "text-xs";
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const { startTask, pauseTask, completeTask, deleteTask, updateElapsedTime, updateTask, getAllGenres } = useTaskStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEditingGenre, setIsEditingGenre] = useState(false);
  const [editingGenre, setEditingGenre] = useState(task.genre);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editingStartTime, setEditingStartTime] = useState(task.scheduledStartTime);
  const [editingDuration, setEditingDuration] = useState(task.scheduledDuration);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(task.title);
  const [isEditingActualStart, setIsEditingActualStart] = useState(false);
  const [editingActualStart, setEditingActualStart] = useState(task.startedAt ? formatDateTime(new Date(task.startedAt)) : '');
  const [isEditingActualEnd, setIsEditingActualEnd] = useState(false);
  const [editingActualEnd, setEditingActualEnd] = useState(task.completedAt ? formatDateTime(new Date(task.completedAt)) : '');
  const [isEditingActualTime, setIsEditingActualTime] = useState(false);
  const [editingActualTime, setEditingActualTime] = useState(task.totalTime ? secondsToMinutes(task.totalTime) : 0);

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

  // 予定時間編集の保存
  const handleScheduleSave = () => {
    if (editingStartTime !== task.scheduledStartTime || editingDuration !== task.scheduledDuration) {
      updateTask(task.id, { 
        scheduledStartTime: editingStartTime, 
        scheduledDuration: editingDuration 
      });
    }
    setIsEditingSchedule(false);
  };

  // タスク名編集の保存
  const handleTitleSave = () => {
    if (editingTitle.trim() && editingTitle !== task.title) {
      updateTask(task.id, { title: editingTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // 実際の開始時間編集の保存
  const handleActualStartSave = () => {
    if (editingActualStart.trim() && editingActualStart !== (task.startedAt ? formatDateTime(new Date(task.startedAt)) : '')) {
      try {
        // "YYYY/MM/DD HH:MM" 形式をDateオブジェクトに変換
        const [datePart, timePart] = editingActualStart.split(' ');
        const [year, month, day] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        const newStartDate = new Date(year, month - 1, day, hours, minutes);
        updateTask(task.id, { startedAt: newStartDate });
      } catch (error) {
        console.error('Invalid date format:', error);
      }
    }
    setIsEditingActualStart(false);
  };

  // 実際の終了時間編集の保存
  const handleActualEndSave = () => {
    if (editingActualEnd.trim() && editingActualEnd !== (task.completedAt ? formatDateTime(new Date(task.completedAt)) : '')) {
      try {
        // "YYYY/MM/DD HH:MM" 形式をDateオブジェクトに変換
        const [datePart, timePart] = editingActualEnd.split(' ');
        const [year, month, day] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        const newEndDate = new Date(year, month - 1, day, hours, minutes);
        updateTask(task.id, { completedAt: newEndDate });
      } catch (error) {
        console.error('Invalid date format:', error);
      }
    }
    setIsEditingActualEnd(false);
  };

  // 実績時間の保存
  const handleActualTimeSave = () => {
    if (!isNaN(editingActualTime) && editingActualTime !== task.totalTime) {
      updateTask(task.id, { totalTime: editingActualTime * 60 });
    }
    setIsEditingActualTime(false);
  };

  // 1行レイアウト用スタイル
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'border-gray-300 bg-gray-200 text-gray-500';
      case 'in-progress':
        return 'border-orange-200 bg-orange-50/30';
      case 'paused':
        return 'border-yellow-200 bg-yellow-50/30';
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
  const getGenreBgColor = (genre: string) => {
    const colors = {
      'クライアントワーク': 'bg-blue-800',
      '写真現像': 'bg-green-800',
      'ルーチン': 'bg-purple-800',
    };
    return colors[genre as keyof typeof colors] || 'bg-gray-800';
  };
  const displayTime = task.status === 'in-progress' 
    ? (task.totalTime || 0) + elapsedTime
    : (task.totalTime || 0);

  // 終了予定時間を計算
  const endTime = calculateEndTime(task.scheduledStartTime, task.scheduledDuration);
  
  // 実際の作業時間（分）- 中断時間を除外
  const actualWorkTime = displayTime - (task.totalPausedTime || 0);
  const actualDurationMinutes = secondsToMinutes(actualWorkTime);
  
  // 予定時間との差分を計算
  const timeDifference = actualDurationMinutes - task.scheduledDuration;
  const timeDifferenceText = timeDifference > 0 
    ? `(+${timeDifference})` 
    : timeDifference < 0 
      ? `(${timeDifference})` 
      : '';

  // 中断時間（分）
  const pausedMinutes = secondsToMinutes(task.totalPausedTime || 0);

  // 現在時間が予定時間範囲内にあるかチェック
  const isCurrentlyScheduled = (() => {
    if (!task.scheduledStartTime || !task.scheduledDuration) return false;
    const now = new Date();
    const [startHour, startMin] = task.scheduledStartTime.split(':').map(Number);
    const start = new Date(now);
    start.setHours(startHour, startMin, 0, 0);
    const end = new Date(start.getTime() + task.scheduledDuration * 60 * 1000);
    return now >= start && now < end;
  })();

  return (
    <div className={`task-card flex items-center gap-2 px-3 py-2 min-h-0 ${getStatusColor(task.status)} ${isCurrentlyScheduled ? 'ring-2 ring-red-400 bg-red-50/60 shadow-lg border-red-200' : ''}`}
      style={{fontSize: '0.97rem'}}>
      {/* タイトル＋ジャンル（固定幅、ジャンルバッジ右端揃え） */}
      <div className="flex items-center min-w-0 w-[300px] max-w-[400px]" style={{flexShrink: 1}}>
        {isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className={`font-semibold text-gray-900 ${getTitleFontSize(editingTitle)} border rounded px-1 py-0.5 flex-1 min-w-0`}
            style={{ minWidth: '60px', marginRight: '8px' }}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            maxLength={30}
            autoFocus
          />
        ) : (
          <span
            className={`font-semibold text-gray-900 ${getTitleFontSize(task.title)} overflow-hidden text-ellipsis whitespace-nowrap flex-1 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors`}
            style={{ minWidth: '60px', marginRight: '8px' }}
            title={task.title}
            onClick={() => setIsEditingTitle(true)}
          >
            {task.title}
          </span>
        )}
        <div className="flex items-center justify-end shrink-0">
          {isEditingGenre ? (
            <select
              value={editingGenre}
              onChange={(e) => setEditingGenre(e.target.value)}
              className="text-xs border rounded px-1 py-0.5 ml-0"
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
          ) : (
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-bold ml-0 ${getGenreColor(task.genre)}`}
              style={{
                color: 'white',
                backgroundColor: getGenreBgColor(task.genre),
                opacity: 1,
                filter: 'none',
              }}
              onClick={() => setIsEditingGenre(true)}
              tabIndex={0}
              onBlur={handleGenreSave}
            >
              {task.genre}
            </span>
          )}
          {task.isCarriedOver && (
            <span className="bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-medium ml-1 shrink-0">繰越</span>
          )}
        </div>
      </div>
      {/* 予定時間（左揃え、より目立つ表示） */}
      <div className="flex flex-col items-start shrink-0 min-w-[80px]">
        {isEditingSchedule ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={editingStartTime}
                onChange={(e) => setEditingStartTime(e.target.value)}
                className="text-xs border rounded px-1 py-0.5 w-20"
                onKeyDown={(e) => e.key === 'Enter' && handleScheduleSave()}
                onBlur={handleScheduleSave}
                autoFocus
              />
              <span className="text-gray-400 text-xs">~</span>
              <span className="text-gray-600 text-xs">{calculateEndTime(editingStartTime, editingDuration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">予定:</span>
              <input
                type="number"
                value={editingDuration}
                onChange={(e) => setEditingDuration(Number(e.target.value))}
                className="text-xs border rounded px-1 py-0.5 w-12"
                min="1"
                max="480"
                onKeyDown={(e) => e.key === 'Enter' && handleScheduleSave()}
                onBlur={handleScheduleSave}
              />
              <span className="text-gray-500 text-xs">分</span>
            </div>
          </div>
        ) : (
          <div 
            className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
            onClick={() => setIsEditingSchedule(true)}
            title="クリックして編集"
          >
            <span className="text-gray-600 text-xs font-medium">{task.scheduledStartTime}~{endTime}</span>
            <span className="text-gray-500 text-xs block">予定: {task.scheduledDuration}分</span>
          </div>
        )}
      </div>
      
      {/* 実際の開始・終了時間 */}
      {task.startedAt && (
        <div className="text-blue-600 text-xs shrink-0">
          {isEditingActualStart ? (
            <input
              type="text"
              value={editingActualStart}
              onChange={(e) => setEditingActualStart(e.target.value)}
              className="text-blue-600 text-xs border rounded px-1 py-0.5 w-32"
              placeholder="YYYY/MM/DD HH:MM"
              onBlur={handleActualStartSave}
              onKeyDown={(e) => e.key === 'Enter' && handleActualStartSave()}
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
              onClick={() => setIsEditingActualStart(true)}
              title="クリックして編集"
            >
              開始: {formatDateTime(new Date(task.startedAt))}
            </span>
          )}
        </div>
      )}
      {task.completedAt && (
        <div className="text-green-600 text-xs shrink-0">
          {isEditingActualEnd ? (
            <input
              type="text"
              value={editingActualEnd}
              onChange={(e) => setEditingActualEnd(e.target.value)}
              className="text-green-600 text-xs border rounded px-1 py-0.5 w-32"
              placeholder="YYYY/MM/DD HH:MM"
              onBlur={handleActualEndSave}
              onKeyDown={(e) => e.key === 'Enter' && handleActualEndSave()}
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer hover:bg-green-50 rounded px-1 py-0.5 transition-colors"
              onClick={() => setIsEditingActualEnd(true)}
              title="クリックして編集"
            >
              終了: {formatDateTime(new Date(task.completedAt))}
            </span>
          )}
        </div>
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
        {task.status === 'paused' && (
          <>
            <button onClick={() => startTask(task.id)} className="btn-primary flex items-center gap-1 py-1 px-3 text-xs">
              <Play size={13} />再開
            </button>
            <button onClick={() => completeTask(task.id)} className="btn-success flex items-center gap-1 py-1 px-3 text-xs">
              <Square size={13} />終了
            </button>
          </>
        )}
        {task.status === 'completed' && (
          <div className="flex items-center gap-2 text-xs">
            {/* 実績時間の表示・編集 */}
            {isEditingActualTime ? (
              <input
                type="number"
                value={editingActualTime}
                min={0}
                onChange={e => setEditingActualTime(Number(e.target.value))}
                onBlur={handleActualTimeSave}
                onKeyDown={e => e.key === 'Enter' && handleActualTimeSave()}
                className="w-16 text-blue-600 border rounded px-1 py-0.5 text-xs"
                autoFocus
              />
            ) : (
              <span className="text-blue-600 cursor-pointer" onClick={() => {
                setEditingActualTime(actualDurationMinutes);
                setIsEditingActualTime(true);
              }}>
                実績: {actualDurationMinutes}分{timeDifferenceText}
              </span>
            )}
            {pausedMinutes > 0 && (
              <span className="text-yellow-600">（中断合計{pausedMinutes}分）</span>
            )}
            <div className="text-green-600 font-medium flex items-center gap-1">✅ 完了</div>
            <button
              onClick={() => useTaskStore.getState().resetTaskStatus(task.id)}
              className="ml-2 text-gray-400 hover:text-blue-500 p-1 rounded-xl hover:bg-blue-50 transition-colors border border-blue-200 text-xs"
              title="ステータスをリセット"
            >
              リセット
            </button>
          </div>
        )}
        <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-xl hover:bg-red-50 transition-colors" title="削除">
          <Trash2 size={13} />
        </button>
      </div>
      {/* 経過時間 */}
      <div className={`px-3 py-1 rounded-2xl font-medium text-xs ml-2 shrink-0 ${
        task.status === 'in-progress' 
          ? 'bg-orange-100 text-orange-700 border border-orange-200' 
          : task.status === 'paused'
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            : 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}
        style={{minWidth: '70px', textAlign: 'center'}}>
        {formatTime(displayTime)}
        {task.status === 'in-progress' && (<span className="ml-1">⏱️</span>)}
        {task.status === 'paused' && (<span className="ml-1">⏸️</span>)}
      </div>
    </div>
  );
}; 