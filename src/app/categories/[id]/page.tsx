'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  MemoryStick,
  Star,
  Tag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Tag {
  id: number
  name: string
  color: string | null
}

interface Problem {
  id: number
  lcId: number
  title: string
  difficulty: string
  description: string | null
  starred: boolean
  createdAt: string
  _count: {
    solutions: number
  }
  tags: Tag[]
}

interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  problems: Problem[]
  stats: {
    problemsCount: number
    solvedCount: number
    completionRate: number
  }
}

interface CategoryResponse {
  category: Category
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function CategoryDetailPage() {
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCategoryDetail = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/categories/${categoryId}?includeProblems=true&page=${page}&limit=${pagination.limit}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('分類不存在')
        }
        throw new Error('獲取分類詳情失敗')
      }

      const data: CategoryResponse = await response.json()
      setCategory(data.category)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetail(1)
    }
  }, [categoryId])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Hard':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50'
    if (rate >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading && !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">載入分類詳情中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            href="/categories"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            返回分類列表
          </Link>
        </div>
      </div>
    )
  }

  if (!category) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/categories"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回分類列表
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              創建於 {formatDate(new Date(category.createdAt))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">總題數</p>
                <p className="text-2xl font-bold text-gray-900">{category.stats.problemsCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">已解決</p>
                <p className="text-2xl font-bold text-gray-900">{category.stats.solvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">完成率</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900 mr-2">{category.stats.completionRate}%</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCompletionColor(category.stats.completionRate)}`}>
                    {category.stats.completionRate >= 80 ? '優秀' : 
                     category.stats.completionRate >= 50 ? '良好' : '需努力'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 題目列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">題目列表</h2>
            <div className="text-sm text-gray-600">
              共 {pagination.total} 個題目
            </div>
          </div>

          {category.problems.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">此分類還沒有題目</p>
              <Link
                href="/problems/new"
                className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
              >
                新增第一個題目
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {category.problems.map((problem) => (
                <div key={problem.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          {problem._count.solutions > 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <Link
                            href={`/problems/${problem.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            #{problem.lcId} {problem.title}
                          </Link>
                        </div>
                        
                        {problem.starred && (
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        )}
                        
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>

                      {problem.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {problem.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {problem._count.solutions} 個解答
                        </div>
                        <div>
                          {formatDate(new Date(problem.createdAt))}
                        </div>
                      </div>

                      {problem.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {problem.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: tag.color ? `${tag.color}20` : '#F3F4F6',
                                color: tag.color || '#6B7280'
                              }}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/problems/${problem.id}`}
                      className="ml-4 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded-md hover:bg-indigo-50"
                    >
                      查看詳情
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分頁 */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                顯示 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} 項，
                共 {pagination.total} 項
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchCategoryDetail(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  第 {pagination.page} 頁，共 {pagination.pages} 頁
                </span>
                
                <button
                  onClick={() => fetchCategoryDetail(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages || loading}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 