'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Folder, 
  CheckCircle, 
  Circle,
  Search,
  Target,
  TrendingUp,
  BookOpen,
  X,
  Save
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  stats?: {
    problemsCount: number
    solvedCount: number
    totalSolutions: number
    completionRate: number
  }
}

interface CategoriesResponse {
  categories: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // 創建/編輯分類的狀態
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // 刪除確認狀態
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories?includeStats=true')
      if (!response.ok) throw new Error('獲取分類失敗')

      const data: CategoriesResponse = await response.json()
      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      setError('分類名稱不能為空')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '創建分類失敗')
      }

      await fetchCategories()
      setShowCreateModal(false)
      setFormData({ name: '', description: '' })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '創建分類失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      setError('分類名稱不能為空')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新分類失敗')
      }

      await fetchCategories()
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新分類失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '刪除分類失敗')
      }

      await fetchCategories()
      setDeletingCategory(null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除分類失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setError('')
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50'
    if (rate >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">載入分類中...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">分類管理</h1>
              <p className="text-gray-600 mt-1">管理題目分類，追蹤學習進度</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              新增分類
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索分類名稱或描述..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* 分類列表 */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm ? '沒有找到符合條件的分類' : '還沒有分類'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-indigo-600 hover:text-indigo-700 font-medium mt-2"
              >
                創建第一個分類
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                        title="編輯分類"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(category)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="刪除分類"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {category.stats && (
                    <div className="space-y-3">
                      {/* 統計數據 */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {category.stats.problemsCount}
                          </div>
                          <div className="text-xs text-gray-600">總題數</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {category.stats.solvedCount}
                          </div>
                          <div className="text-xs text-gray-600">已解決</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {category.stats.totalSolutions}
                          </div>
                          <div className="text-xs text-gray-600">解答數</div>
                        </div>
                      </div>

                      {/* 完成率 */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">完成率</span>
                          <span className={`font-medium px-2 py-1 rounded ${getCompletionColor(category.stats.completionRate)}`}>
                            {category.stats.completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${category.stats.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {formatDate(new Date(category.createdAt))}
                      </div>
                      <Link
                        href={`/categories/${category.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        查看題目 →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 創建/編輯分類對話框 */}
      {(showCreateModal || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? '編輯分類' : '新增分類'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類名稱 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="輸入分類名稱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="輸入分類描述（可選）"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={200}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                disabled={submitting || !formData.name.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingCategory ? '更新' : '創建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認對話框 */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">刪除分類</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                確定要刪除分類「{deletingCategory.name}」嗎？此操作無法復原。
                {deletingCategory.stats && deletingCategory.stats.problemsCount > 0 && (
                  <span className="text-red-600 font-medium">
                    <br />注意：此分類還有 {deletingCategory.stats.problemsCount} 個題目，無法刪除。
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setDeletingCategory(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={submitting || (deletingCategory.stats && deletingCategory.stats.problemsCount > 0)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 