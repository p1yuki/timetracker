import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { Analytics } from './components/Analytics';
import { Header } from './components/Header';
import { useTaskStore } from './store/taskStore';

function App() {
  const { activeTab, setActiveTab } = useTaskStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto p-6">
        <main>
          {/* タブナビゲーション */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              今日のタスク
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              振り返り
            </button>
          </div>
          
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <AddTaskForm />
              <TaskList />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Analytics />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App; 