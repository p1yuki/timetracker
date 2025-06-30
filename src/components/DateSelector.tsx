import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';

export const DateSelector = () => {
  const { selectedDate, setSelectedDate } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);

  // selectedDateが確実にDateオブジェクトであることを確認
  const targetDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getCurrentMonthDates = () => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || dates.length < 42) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getFullYear() === targetDate.getFullYear() &&
      date.getMonth() === targetDate.getMonth() &&
      date.getDate() === targetDate.getDate()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === targetDate.getMonth();
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(targetDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(targetDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>📅</span>
        <span>{formatDate(targetDate)}</span>
        <span>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 min-w-[280px]">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h3 className="text-sm font-medium">
              {targetDate.getFullYear()}年{targetDate.getMonth() + 1}月
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-xs text-center text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {getCurrentMonthDates().map((date, index) => (
              <button
                key={index}
                onClick={() => selectDate(date)}
                className={`p-2 text-xs rounded hover:bg-gray-100 transition-colors ${
                  isSelected(date)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : isToday(date)
                    ? 'bg-yellow-100 text-yellow-800'
                    : !isCurrentMonth(date)
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </button>
            ))}
          </div>

          {/* クイック選択ボタン */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setIsOpen(false);
              }}
              className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              今日
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday);
                setIsOpen(false);
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              昨日
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow);
                setIsOpen(false);
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              明日
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 