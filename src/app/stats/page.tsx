'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart, 
  TrendingUp, 
  Target, 
  Code, 
  Clock, 
  MemoryStick,
  Star,
  Activity,
  PieChart as PieChartIcon,
  Users,
  Calendar,
  Award
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface StatsData {
  overview: {
    totalProblems: number
    totalSolutions: number
    uniqueLanguagesCount: number
    averageAttempts: number
    starredCount: number
  }
  difficulty: Array<{ difficulty: string; count: number }>
  languages: Array<{ 
    language: string; 
    count: number; 
    avgRuntime: number; 
    avgMemory: number 
  }>
  tags: Array<{ name: string; color: string | null; count: number }>
  status: Array<{ status: string; count: number }>
  trends: {
    monthly: Array<{ month: string; problemsSolved: number; solutionsAdded: number }>
    weekly: Array<{ week: string; problemsSolved: number; solutionsAdded: number }>
  }
  performance: {
    avgRuntime: number
    avgMemory: number
    minRuntime: number
    maxRuntime: number
    minMemory: number
    maxMemory: number
  }
  categories: Array<{ name: string; description: string | null; count: number }>
  recentActivity: Array<{
    id: number
    language: string
    status: string
    createdAt: string
    problem: {
      lcId: number
      title: string
      difficulty: string
    }
  }>
}

const DIFFICULTY_COLORS = {
  'Easy': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  'Medium': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  'Hard': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
}

const STATUS_COLORS = {
  'Accepted': 'bg-green-100 text-green-800',
  'Wrong Answer': 'bg-red-100 text-red-800',
  'Time Limit Exceeded': 'bg-yellow-100 text-yellow-800',
  'Memory Limit Exceeded': 'bg-orange-100 text-orange-800',
  'Runtime Error': 'bg-red-100 text-red-800',
  'Compile Error': 'bg-purple-100 text-purple-800'
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performance'>('overview')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('獲取統計數據失敗')
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getCompletionRate = () => {
    if (!stats) return 0
    const { totalProblems, totalSolutions } = stats.overview
    return totalProblems > 0 ? Math.round((totalSolutions / totalProblems) * 100) : 0
  }

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || 
           { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">載入統計數據中...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || '無法載入數據'}</p>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">學習統計</h1>
              <p className="text-gray-600 mt-1">追蹤你的刷題進度和表現</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                數據更新於 {formatDate(new Date())}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 總覽卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">總題數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalProblems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">解答數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalSolutions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">使用語言</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.uniqueLanguagesCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">收藏題目</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.starredCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">完成率</p>
                <p className="text-2xl font-bold text-gray-900">{getCompletionRate()}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: '總覽', icon: BarChart },
                { key: 'trends', label: '趨勢', icon: TrendingUp },
                { key: 'performance', label: '性能', icon: Activity }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* 難度分布 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">難度分布</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.difficulty.map((item) => {
                      const colors = getDifficultyColor(item.difficulty)
                      const percentage = stats.overview.totalProblems > 0 
                        ? Math.round((item.count / stats.overview.totalProblems) * 100) 
                        : 0
                      
                      return (
                        <div key={item.difficulty} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                          <div className={`text-lg font-semibold ${colors.text}`}>
                            {item.difficulty}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {item.count}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {percentage}% 的題目
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 語言使用統計 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">程式語言使用統計</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            語言
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            解答數
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            平均執行時間
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            平均記憶體
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.languages.map((lang) => (
                          <tr key={lang.language}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {lang.language}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lang.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lang.avgRuntime > 0 ? `${lang.avgRuntime}ms` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lang.avgMemory > 0 ? `${lang.avgMemory}MB` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 熱門標籤 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門標籤 Top 10</h3>
                  <div className="flex flex-wrap gap-3">
                    {stats.tags.map((tag) => (
                      <span
                        key={tag.name}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : '#F3F4F6',
                          color: tag.color || '#6B7280',
                          border: `1px solid ${tag.color || '#D1D5DB'}`
                        }}
                      >
                        {tag.name}
                        <span className="ml-2 text-xs bg-white bg-opacity-80 px-2 py-0.5 rounded-full">
                          {tag.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">解題趨勢（最近12個月）</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stats.trends.monthly.slice(-4).map((item) => (
                        <div key={item.month} className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-600">{item.month}</div>
                          <div className="text-2xl font-bold text-gray-900">{item.problemsSolved}</div>
                          <div className="text-xs text-gray-500">{item.solutionsAdded} 個解答</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">每週進度（最近8週）</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.trends.weekly.slice(-4).map((item) => (
                      <div key={item.week} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">
                          {new Date(item.week).toLocaleDateString('zh-TW')}
                        </div>
                        <div className="text-xl font-bold text-gray-900">{item.problemsSolved}</div>
                        <div className="text-xs text-gray-500">{item.solutionsAdded} 個解答</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">性能統計</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <Clock className="h-8 w-8 text-blue-600 mb-3" />
                      <div className="text-sm text-blue-600 font-medium">平均執行時間</div>
                      <div className="text-2xl font-bold text-blue-900">{stats.performance.avgRuntime}ms</div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <MemoryStick className="h-8 w-8 text-green-600 mb-3" />
                      <div className="text-sm text-green-600 font-medium">平均記憶體</div>
                      <div className="text-2xl font-bold text-green-900">{stats.performance.avgMemory}MB</div>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <Award className="h-8 w-8 text-yellow-600 mb-3" />
                      <div className="text-sm text-yellow-600 font-medium">最佳執行時間</div>
                      <div className="text-2xl font-bold text-yellow-900">{stats.performance.minRuntime}ms</div>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <Target className="h-8 w-8 text-purple-600 mb-3" />
                      <div className="text-sm text-purple-600 font-medium">平均嘗試次數</div>
                      <div className="text-2xl font-bold text-purple-900">{stats.overview.averageAttempts}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">狀態分布</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.status.map((item) => (
                      <div key={item.status} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                          {item.status}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-2">{item.count}</div>
                        <div className="text-sm text-gray-600">
                          {stats.overview.totalSolutions > 0 
                            ? Math.round((item.count / stats.overview.totalSolutions) * 100)
                            : 0
                          }% 的解答
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 最近活動 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近活動</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentActivity.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                還沒有活動記錄
              </div>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                        {activity.language}
                      </div>
                      <Link
                        href={`/problems/${activity.problem.lcId}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        #{activity.problem.lcId} {activity.problem.title}
                      </Link>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(activity.problem.difficulty).bg} ${getDifficultyColor(activity.problem.difficulty).text} ${getDifficultyColor(activity.problem.difficulty).border}`}>
                        {activity.problem.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(activity.createdAt))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 