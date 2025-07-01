import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

export const Header = () => {
  const { selectedDate, setSelectedDate } = useTaskStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClock, setShowClock] = useState(true);
  const [showDate, setShowDate] = useState(true);

  // selectedDateが確実にDateオブジェクトであることを確認
  const targetDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const changeDate = (direction: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年M月d日（E）', { locale: ja });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm:ss');
  };

  return (
    <header className="header-gradient text-white p-4 text-center fixed top-0 left-0 right-0 z-50 min-h-[120px] flex flex-col justify-center">
      {/* 時計・日付表示部分（左上） */}
      <div className="absolute top-3 left-6 flex flex-col items-start" style={{minWidth: '120px'}}>
        {/* 日付表示（上） */}
        {showDate ? (
          <span
            className="text-sm text-gray-200/80 font-normal cursor-pointer select-none mb-1 text-left block max-w-[180px] truncate"
            onClick={() => setShowDate(false)}
            title="クリックで日付を非表示"
            style={{wordBreak: 'keep-all'}}
          >
            {formatDate(currentTime)}
          </span>
        ) : (
          <button
            onClick={() => setShowDate(true)}
            className="mb-1 p-1 rounded-full transition-all duration-200 hover:scale-110"
            title="日付を表示"
            style={{lineHeight: 0}}
          >
            <Calendar size={18} className="text-gray-300" />
          </button>
        )}
        {/* 時計表示（下） */}
        {showClock ? (
          <span
            className="font-mono text-3xl font-bold select-none cursor-pointer text-left block max-w-[180px] truncate"
            onClick={() => setShowClock(false)}
            title="クリックで時計を非表示"
            style={{wordBreak: 'keep-all'}}
          >
            {formatTime(currentTime)}
          </span>
        ) : (
          <button
            onClick={() => setShowClock(true)}
            className="p-1 rounded-full transition-all duration-200 hover:scale-110"
            title="時計を表示"
            style={{lineHeight: 0}}
          >
            <Clock size={24} className="text-gray-300" />
          </button>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-1 tracking-tight">TimeTracker</h1>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => changeDate(-1)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-base font-medium min-w-[150px]">
          {formatDate(targetDate)}
        </div>
        <button
          onClick={() => changeDate(1)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </header>
  );
}; 