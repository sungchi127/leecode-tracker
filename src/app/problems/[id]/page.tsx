'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Star, 
  StarOff, 
  ExternalLink, 
  Edit, 
  Trash2,
  Plus,
  Code,
  Clock,
  MemoryStick,
  Calendar
} from 'lucide-react'
import { getDifficultyColor, getLanguageColor, formatDate, formatRuntime, formatMemory } from '@/lib/utils'
import { ProblemWithDetails } from '@/lib/types'

export default function ProblemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<ProblemWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const problemId = parseInt(params.id as string)

  // 獲取題目詳情
  const fetchProblem = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/problems/${problemId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('題目不存在')
        }
        throw new Error('獲取題目詳情失敗')
      }

      const data = await response.json()
      setProblem(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取題目詳情失敗')
    } finally {
      setLoading(false)
    }
  }

  // 切換收藏狀態
  const toggleStar = async () => {
    if (!problem) return

    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ starred: !problem.starred }),
      })

      if (!response.ok) {
        throw new Error('更新收藏狀態失敗')
      }

      setProblem(prev => prev ? { ...prev, starred: !prev.starred } : null)
    } catch (err) {
      console.error('Error updating star:', err)
      // TODO: Add toast notification
    }
  }

  // 刪除題目
  const deleteProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('刪除題目失敗')
      }

      router.push('/problems')
    } catch (err) {
      console.error('Error deleting problem:', err)
      // TODO: Add toast notification
    }
  }

  useEffect(() => {
    if (problemId && !isNaN(problemId)) {
      fetchProblem()
    } else {
      setError('無效的題目 ID')
      setLoading(false)
    }
  }, [problemId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">載入中...</p>
        </div>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || '題目不存在'}</p>
          <Link
            href="/problems"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            返回題目列表
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/problems"
                className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-500 mr-3">
                    #{problem.lcId}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
                  <button
                    onClick={toggleStar}
                    className="ml-3 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {problem.starred ? (
                      <Star className="h-6 w-6 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="h-6 w-6" />
                    )}
                  </button>
                </div>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-md border ${getDifficultyColor(problem.difficulty as any)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.url && (
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      在 LeetCode 上查看
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/problems/${problem.id}/solutions/new`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                新增解答
              </Link>
              <Link
                href={`/problems/${problem.id}/edit`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                編輯
              </Link>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側 - 題目詳情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 題目描述 */}
            {problem.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">題目描述</h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                    {problem.description}
                  </pre>
                </div>
              </div>
            )}

            {/* 解答列表 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  解答記錄 ({problem._count.solutions})
                </h2>
                <Link
                  href={`/problems/${problem.id}/solutions/new`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  新增解答
                </Link>
              </div>

              {problem.solutions.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">還沒有解答記錄</p>
                  <Link
                    href={`/problems/${problem.id}/solutions/new`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
                  >
                    新增第一個解答
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {problem.solutions.map((solution) => (
                    <div
                      key={solution.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getLanguageColor(solution.language as any)}`}>
                            {solution.language}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            第 {solution.attemptNo} 次嘗試
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            solution.status === 'Accepted' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {solution.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {solution.runtime && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRuntime(solution.runtime)}
                            </div>
                          )}
                          {solution.memory && (
                            <div className="flex items-center">
                              <MemoryStick className="h-3 w-3 mr-1" />
                              {formatMemory(solution.memory)}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(new Date(solution.createdAt))}
                          </div>
                        </div>
                      </div>
                      
                      {solution.complexity && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">複雜度:</span> {solution.complexity}
                        </p>
                      )}
                      
                      {solution.note && (
                        <p className="text-sm text-gray-700 mb-3">
                          {solution.note.length > 150 
                            ? `${solution.note.substring(0, 150)}...` 
                            : solution.note}
                        </p>
                      )}
                      
                      <div className="flex justify-end">
                        <Link
                          href={`/solutions/${solution.id}`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          查看詳情 →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側 - 元數據 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">LeetCode 題號</dt>
                  <dd className="text-sm text-gray-900">#{problem.lcId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">難度</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(problem.difficulty as any)}`}>
                      {problem.difficulty}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">解答數量</dt>
                  <dd className="text-sm text-gray-900">{problem._count.solutions} 個</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">創建時間</dt>
                  <dd className="text-sm text-gray-900">{formatDate(new Date(problem.createdAt))}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">最後更新</dt>
                  <dd className="text-sm text-gray-900">{formatDate(new Date(problem.updatedAt))}</dd>
                </div>
              </dl>
            </div>

            {/* 標籤 */}
            {problem.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">標籤</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 分類 */}
            {problem.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">分類</h3>
                <div className="space-y-2">
                  {problem.categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center p-2 bg-indigo-50 rounded-md"
                    >
                      <span className="text-sm font-medium text-indigo-700">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">確認刪除</h3>
            <p className="text-gray-600 mb-6">
              確定要刪除這個題目嗎？這將同時刪除所有相關的解答記錄，此操作無法撤銷。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={deleteProblem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 