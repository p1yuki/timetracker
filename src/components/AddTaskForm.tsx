import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

// 現在時刻と1時間後の時刻を取得する関数
const getDefaultTimes = () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  
  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  return {
    scheduledStartTime: formatTime(now),
    scheduledDuration: 60, // デフォルト60分
  };
};

// 開始時間と作業時間から終了時間を計算する関数
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

// 日付をフォーマットする関数
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AddTaskForm = () => {
  const { addTask, getAllGenres } = useTaskStore();
  const [formData, setFormData] = useState({
    title: '',
    genre: 'ルーチン',
    customGenre: '',
    scheduledStartTime: '09:00',
    scheduledDuration: 60,
    memo: '',
    targetDate: formatDate(new Date()), // 今日の日付をデフォルトに
  });
  const [isCustomGenre, setIsCustomGenre] = useState(false);

  const allGenres = getAllGenres();

  // コンポーネントマウント時にデフォルト時間を設定
  useEffect(() => {
    const defaultTimes = getDefaultTimes();
    setFormData(prev => ({
      ...prev,
      scheduledStartTime: defaultTimes.scheduledStartTime,
      scheduledDuration: defaultTimes.scheduledDuration,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const finalGenre = isCustomGenre ? formData.customGenre : formData.genre;
    if (!finalGenre.trim()) return;

    // 選択された日付をDateオブジェクトに変換
    const targetDate = new Date(formData.targetDate);
    targetDate.setHours(0, 0, 0, 0); // 時刻を00:00:00に設定

    addTask({
      title: formData.title,
      genre: finalGenre,
      scheduledStartTime: formData.scheduledStartTime,
      scheduledDuration: formData.scheduledDuration,
      memo: formData.memo,
    }, targetDate);

    // フォームをリセット（デフォルト時間を再設定）
    const defaultTimes = getDefaultTimes();
    setFormData({
      title: '',
      genre: 'ルーチン',
      customGenre: '',
      scheduledStartTime: defaultTimes.scheduledStartTime,
      scheduledDuration: defaultTimes.scheduledDuration,
      memo: '',
      targetDate: formatDate(new Date()), // 今日の日付をデフォルトに
    });
    setIsCustomGenre(false);
  };

  // 終了予定時間を計算
  const endTime = calculateEndTime(formData.scheduledStartTime, formData.scheduledDuration);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいタスクを追加</h3>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>ルーチン</strong>ジャンルのタスクは、翌日以降も自動で追加されます。毎日の習慣や定期的な作業にご利用ください。
        </p>
        <p className="text-sm text-blue-800 mt-2">
          📅 <strong>日付選択</strong>で未来の日付を選択すると、その日のタスクとして追加されます。今日以外の日付を選択した場合、その日付のタスク一覧に表示されます。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">タスク名</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例：企画書の作成"
            className="form-input py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
          <div className="space-y-1 mb-1">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="preset-genre"
                checked={!isCustomGenre}
                onChange={() => setIsCustomGenre(false)}
                className="text-gray-900"
              />
              <label htmlFor="preset-genre" className="text-xs text-gray-600">選択</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="custom-genre"
                checked={isCustomGenre}
                onChange={() => setIsCustomGenre(true)}
                className="text-gray-900"
              />
              <label htmlFor="custom-genre" className="text-xs text-gray-600">自由記入</label>
            </div>
          </div>
          
          {!isCustomGenre ? (
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="form-select py-2"
            >
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={formData.customGenre}
              onChange={(e) => setFormData({ ...formData, customGenre: e.target.value })}
              placeholder="ジャンルを入力"
              className="form-input py-2"
              required={isCustomGenre}
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="form-input py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始予定時間</label>
          <input
            type="time"
            value={formData.scheduledStartTime}
            onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
            className="form-input py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">作業予定時間（分）</label>
          <input
            type="number"
            value={formData.scheduledDuration}
            onChange={(e) => setFormData({ ...formData, scheduledDuration: parseInt(e.target.value) || 60 })}
            min="1"
            max="1440"
            className="form-input py-2"
          />
        </div>
        
        <button
          type="submit"
          className="btn-primary py-2"
        >
          追加
        </button>
      </form>
    </div>
  );
}; 