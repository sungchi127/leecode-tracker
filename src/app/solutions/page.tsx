'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Code, 
  Clock, 
  MemoryStick,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SolutionWithProblem {
  id: number
  code: string
  language: string
  complexity: string | null
  runtime: number | null
  memory: number | null
  note: string | null
  attemptNo: number
  status: string
  createdAt: string
  updatedAt: string
  problem: {
    id: number
    lcId: number
    title: string
    difficulty: string
  }
}

interface SolutionsResponse {
  solutions: SolutionWithProblem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    languages: { language: string; count: number }[]
  }
}

const LANGUAGES = [
  { value: '', label: '全部語言' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: '創建時間' },
  { value: 'updatedAt', label: '更新時間' },
  { value: 'runtime', label: '執行時間' },
  { value: 'memory', label: '記憶體使用' },
]

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<SolutionWithProblem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [stats, setStats] = useState<{ languages: { language: string; count: number }[] }>({
    languages: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 篩選狀態
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedSolution, setExpandedSolution] = useState<number | null>(null)

  const fetchSolutions = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      })

      if (search) params.append('search', search)
      if (language) params.append('language', language)

      const response = await fetch(`/api/solutions?${params}`)
      if (!response.ok) throw new Error('獲取解答失敗')

      const data: SolutionsResponse = await response.json()
      setSolutions(data.solutions)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolutions(1)
  }, [search, language, sortBy, sortOrder])

  const getLanguageDisplayName = (lang: string): string => {
    const found = LANGUAGES.find(l => l.value === lang)
    return found ? found.label : lang
  }

  const getSyntaxHighlighterLanguage = (lang: string): string => {
    const mapping: { [key: string]: string } = {
      'cpp': 'cpp',
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'go': 'go',
      'rust': 'rust',
    }
    return mapping[lang] || 'text'
  }

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

  if (loading && solutions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">載入中...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">解答管理</h1>
              <p className="text-gray-600 mt-1">查看和管理所有解答記錄</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                總計 {pagination.total} 個解答
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">總解答數</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">JS</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">最常用語言</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.languages[0]?.language || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">語言種類</p>
                <p className="text-2xl font-bold text-gray-900">{stats.languages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <MemoryStick className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">平均嘗試次數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {solutions.length > 0 
                    ? Math.round(solutions.reduce((sum, s) => sum + s.attemptNo, 0) / solutions.length * 10) / 10
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 篩選和搜索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索題目或筆記..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">程式語言</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序順序</label>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-center"
              >
                {sortOrder === 'desc' ? (
                  <>
                    <SortDesc className="h-4 w-4 mr-2" />
                    降序
                  </>
                ) : (
                  <>
                    <SortAsc className="h-4 w-4 mr-2" />
                    升序
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 解答列表 */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : solutions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">還沒有解答記錄</p>
            <Link
              href="/problems"
              className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
            >
              前往題目列表新增解答
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {solutions.map((solution) => (
              <div key={solution.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <Link
                          href={`/problems/${solution.problem.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          #{solution.problem.lcId} {solution.problem.title}
                        </Link>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(solution.problem.difficulty)}`}>
                          {solution.problem.difficulty}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                          {getLanguageDisplayName(solution.language)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {solution.runtime ? `${solution.runtime}ms` : 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <MemoryStick className="h-4 w-4 mr-1" />
                          {solution.memory ? `${solution.memory}MB` : 'N/A'}
                        </div>
                        <div>第 {solution.attemptNo} 次嘗試</div>
                        <div>狀態: {solution.status}</div>
                        <div>{formatDate(new Date(solution.createdAt))}</div>
                      </div>

                      {solution.complexity && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">複雜度: </span>
                          <span className="text-sm text-gray-600">{solution.complexity}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setExpandedSolution(
                        expandedSolution === solution.id ? null : solution.id
                      )}
                      className="ml-4 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded-md hover:bg-indigo-50"
                    >
                      {expandedSolution === solution.id ? '收起代碼' : '查看代碼'}
                    </button>
                  </div>

                  {expandedSolution === solution.id && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">程式碼</h4>
                        <div className="rounded-lg overflow-hidden">
                          <SyntaxHighlighter
                            language={getSyntaxHighlighterLanguage(solution.language)}
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              fontSize: '14px',
                              lineHeight: '1.5',
                            }}
                            showLineNumbers
                          >
                            {solution.code}
                          </SyntaxHighlighter>
                        </div>
                      </div>

                      {solution.note && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">解題筆記</h4>
                          <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">
                              {solution.note}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分頁 */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              顯示 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} 項，
              共 {pagination.total} 項
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchSolutions(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                第 {pagination.page} 頁，共 {pagination.pages} 頁
              </span>
              
              <button
                onClick={() => fetchSolutions(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 