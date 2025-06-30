import { useTaskStore } from '../store/taskStore';
import { TaskCard } from './TaskCard';

export const TaskList = () => {
  const { selectedDate, getTasksForDate } = useTaskStore();
  
  // selectedDateが確実にDateオブジェクトであることを確認
  const targetDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
  const tasks = getTasksForDate(targetDate);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">タスク一覧</h3>
      </div>
      
      <div className="mb-4 text-sm text-gray-600">
        タスク数: {tasks.length}
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">タスクがありません</h3>
          <p className="text-gray-500 text-sm">新しいタスクを追加して作業を始めましょう！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}; 