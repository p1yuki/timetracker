import { useTaskStore } from '../store/taskStore';
import { TaskCard } from './TaskCard';

export const TaskList = () => {
  const { selectedDate, getTasksForDate } = useTaskStore();
  
  // selectedDateが確実にDateオブジェクトであることを確認
  const targetDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
  const tasks = getTasksForDate(targetDate);

  // タスクを開始予定時間順に並び替え
  const sortedTasks = [...tasks].sort((a, b) => {
    // 開始予定時間を比較
    const timeA = a.scheduledStartTime;
    const timeB = b.scheduledStartTime;
    
    if (timeA < timeB) return -1;
    if (timeA > timeB) return 1;
    return 0;
  });

  // 時間帯別にタスクを分類
  const categorizeTasks = (tasks: typeof sortedTasks) => {
    const morning = tasks.filter(task => {
      const hour = parseInt(task.scheduledStartTime.split(':')[0]);
      return hour >= 4 && hour < 8;
    });
    
    const forenoon = tasks.filter(task => {
      const hour = parseInt(task.scheduledStartTime.split(':')[0]);
      return hour >= 8 && hour < 12;
    });
    
    const afternoon = tasks.filter(task => {
      const hour = parseInt(task.scheduledStartTime.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    
    const evening = tasks.filter(task => {
      const hour = parseInt(task.scheduledStartTime.split(':')[0]);
      return hour >= 18 || hour < 4;
    });

    return { morning, forenoon, afternoon, evening };
  };

  const { morning, forenoon, afternoon, evening } = categorizeTasks(sortedTasks);

  const renderTimeSection = (title: string, tasks: typeof sortedTasks, bgColor: string, textColor: string) => {
    if (tasks.length === 0) return null;
    
    return (
      <div className={`${bgColor} rounded-lg p-4 mb-4`}>
        <h4 className={`text-sm font-semibold ${textColor} mb-3 flex items-center`}>
          <span className="mr-2">⏰</span>
          {title} ({tasks.length}件)
        </h4>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <span>タスク一覧</span>
          <span className="text-xs text-gray-400 font-normal ml-2">タスク数: {sortedTasks.length}</span>
        </h3>
      </div>
      
      {sortedTasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">タスクがありません</h3>
          <p className="text-gray-500 text-sm">新しいタスクを追加して作業を始めましょう！</p>
        </div>
      ) : (
        <div>
          {renderTimeSection('🌅 朝 (4:00-8:00)', morning, 'bg-blue-50', 'text-blue-800')}
          {renderTimeSection('☀️ 午前 (8:00-12:00)', forenoon, 'bg-yellow-50', 'text-yellow-800')}
          {renderTimeSection('🌤️ 午後 (12:00-18:00)', afternoon, 'bg-orange-50', 'text-orange-800')}
          {renderTimeSection('🌙 夜 (18:00-4:00)', evening, 'bg-purple-50', 'text-purple-800')}
        </div>
      )}
    </div>
  );
}; 