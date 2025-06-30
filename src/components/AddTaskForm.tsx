import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';

export const AddTaskForm = () => {
  const { addTask, getAllGenres } = useTaskStore();
  const [formData, setFormData] = useState({
    title: '',
    genre: 'クライアントワーク',
    customGenre: '',
    startTime: '09:00',
    endTime: '10:00',
    memo: '',
  });
  const [isCustomGenre, setIsCustomGenre] = useState(false);

  const allGenres = getAllGenres();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const finalGenre = isCustomGenre ? formData.customGenre : formData.genre;
    if (!finalGenre.trim()) return;

    addTask({
      title: formData.title,
      genre: finalGenre,
      startTime: formData.startTime,
      endTime: formData.endTime,
      memo: formData.memo,
    });

    // フォームをリセット
    setFormData({
      title: '',
      genre: 'クライアントワーク',
      customGenre: '',
      startTime: '09:00',
      endTime: '10:00',
      memo: '',
    });
    setIsCustomGenre(false);
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいタスクを追加</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="form-input py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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