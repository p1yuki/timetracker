import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTaskStore } from '../store/taskStore';

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}時間${minutes}分`;
};

export const Analytics = () => {
  const { selectedDate, getTaskStats, getGenreStats, getWeeklyStats } = useTaskStore();
  
  // selectedDateが確実にDateオブジェクトであることを確認
  const targetDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
  
  const stats = getTaskStats(targetDate);
  const genreStats = getGenreStats(targetDate);
  const weeklyStats = getWeeklyStats();

  const chartData = genreStats.map(stat => ({
    name: stat.genre,
    time: Math.round(stat.totalTime / 60), // 分単位に変換
    tasks: stat.taskCount,
  }));

  return (
    <div className="space-y-8">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalTasks}</div>
          <div className="text-gray-600 font-medium">今日のタスク数</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-bold text-gray-900 mb-2">{formatTime(stats.totalTime)}</div>
          <div className="text-gray-600 font-medium">総作業時間</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-bold text-gray-900 mb-2">{stats.completedTasks}</div>
          <div className="text-gray-600 font-medium">完了タスク数</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-bold text-gray-900 mb-2">{Math.round(stats.completionRate)}%</div>
          <div className="text-gray-600 font-medium">完了率</div>
        </div>
      </div>

      {/* ジャンル別グラフ */}
      <div className="chart-container">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">ジャンル別作業時間</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => [`${value}分`, '作業時間']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="time" fill="#374151" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p>データがありません</p>
          </div>
        )}
      </div>

      {/* 週間統計 */}
      <div className="chart-container">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">週間ジャンル別統計</h3>
        {weeklyStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyStats.map((stat) => (
              <div key={stat.genre} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="font-semibold text-gray-900 mb-2">{stat.genre}</div>
                <div className="text-sm text-gray-600">
                  <div>作業時間: {formatTime(stat.totalTime)}</div>
                  <div>タスク数: {stat.taskCount}個</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📈</div>
            <p>週間データがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}; 