import { useTaskStore } from '../store/taskStore';

export const TabNavigation = () => {
  const { activeTab, setActiveTab, selectedDate, setSelectedDate } = useTaskStore();

  const tabs = [
    { id: 'tasks', label: '今日のタスク', icon: '📋' },
    { id: 'analytics', label: '振り返り', icon: '📊' },
  ] as const;

  const quickDateButtons = [
    { label: '今日', days: 0 },
    { label: '昨日', days: -1 },
    { label: '明日', days: 1 },
  ];

  const setQuickDate = (daysOffset: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysOffset);
    setSelectedDate(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  };

  return (
    <div className="space-y-4">
      {/* メインタブ */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 日付クイック選択（タスクタブがアクティブな時のみ表示） */}
      {activeTab === 'tasks' && (
        <div className="flex gap-2">
          {quickDateButtons.map((button) => {
            const isSelected = (() => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + button.days);
              return (
                selectedDate.getFullYear() === targetDate.getFullYear() &&
                selectedDate.getMonth() === targetDate.getMonth() &&
                selectedDate.getDate() === targetDate.getDate()
              );
            })();

            return (
              <button
                key={button.label}
                onClick={() => setQuickDate(button.days)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {button.label}
              </button>
            );
          })}
          {!isToday() && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
            >
              今日に戻る
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 