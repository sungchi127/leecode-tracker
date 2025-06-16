'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Star, 
  StarOff,
  ExternalLink,
  Code,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { getDifficultyColor, formatDate, debounce } from '@/lib/utils'
import { ProblemWithDetails } from '@/lib/types'

interface ProblemsResponse {
  problems: ProblemWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  
  // 篩選狀態
  const [filters, setFilters] = useState({
    search: '',
    difficulty: 'all',
    starred: 'all'
  })

  // 搜尋防抖
  const debouncedSearch = debounce(async (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }, 300)

  // 獲取題目列表
  const fetchProblems = async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty }),
        ...(filters.starred !== 'all' && { starred: filters.starred }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/problems?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch problems')
      }

      const data: ProblemsResponse = await response.json()
      setProblems(data.problems)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching problems:', error)
      // TODO: Add toast notification
    } finally {
      setLoading(false)
    }
  }

  // 切換收藏狀態
  const toggleStar = async (problemId: number, currentStarred: boolean) => {
    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ starred: !currentStarred }),
      })

      if (!response.ok) {
        throw new Error('Failed to update problem')
      }

      // 更新本地狀態
      setProblems(prev => 
        prev.map(problem => 
          problem.id === problemId 
            ? { ...problem, starred: !currentStarred }
            : problem
        )
      )
    } catch (error) {
      console.error('Error updating problem:', error)
      // TODO: Add toast notification
    }
  }

  // 當篩選或分頁改變時重新獲取數據
  useEffect(() => {
    fetchProblems()
  }, [filters, pagination.page])

  // 重置到第一頁當篩選改變時
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [filters.difficulty, filters.starred, filters.search])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">題目管理</h1>
              <p className="text-gray-600 mt-1">管理你的 LeetCode 題庫</p>
            </div>
            <Link
              href="/problems/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              新增題目
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜尋和篩選 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜尋 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋題目標題或描述..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
            </div>

            {/* 難度篩選 */}
            <div>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">所有難度</option>
                <option value="Easy">簡單</option>
                <option value="Medium">中等</option>
                <option value="Hard">困難</option>
              </select>
            </div>

            {/* 收藏篩選 */}
            <div>
              <select
                value={filters.starred}
                onChange={(e) => setFilters(prev => ({ ...prev, starred: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部題目</option>
                <option value="true">已收藏</option>
                <option value="false">未收藏</option>
              </select>
            </div>
          </div>
        </div>

        {/* 題目列表 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">載入中...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">沒有找到符合條件的題目</p>
            <Link
              href="/problems/new"
              className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
            >
              新增第一個題目
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      題目
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      難度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      標籤
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      解答數
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新時間
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleStar(problem.id, problem.starred)}
                            className="mr-3 text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            {problem.starred ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-500 mr-2">
                                #{problem.lcId}
                              </span>
                              <Link
                                href={`/problems/${problem.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                              >
                                {problem.title}
                              </Link>
                            </div>
                            {problem.url && (
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-indigo-600 flex items-center mt-1"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                LeetCode
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(problem.difficulty as any)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {problem.tags.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium text-gray-500">
                              +{problem.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Code className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{problem._count.solutions}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(new Date(problem.updatedAt))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/problems/${problem.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          查看
                        </Link>
                        <Link
                          href={`/problems/${problem.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          編輯
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      顯示第 <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> 至{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      筆，共 <span className="font-medium">{pagination.total}</span> 筆結果
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      上一頁
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一頁
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 