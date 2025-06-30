import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';

export const Header = () => {
  const { selectedDate, setSelectedDate } = useTaskStore();

  // selectedDateが確実にDateオブジェクトであることを確認
  const targetDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

  const changeDate = (direction: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy年M月d日（E）', { locale: ja });
  };

  return (
    <header className="header-gradient text-white p-6 text-center">
      <h1 className="text-3xl font-bold mb-3 tracking-tight">TimeTracker</h1>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => changeDate(-1)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-base font-medium min-w-[180px]">
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