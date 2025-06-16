'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, ExternalLink } from 'lucide-react'
import { CreateProblemData } from '@/lib/types'

// 表單驗證 schema
const problemSchema = z.object({
  lcId: z.number().min(1, '題號必須大於 0'),
  title: z.string().min(1, '題目標題不能為空'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    required_error: '請選擇難度'
  }),
  url: z.string().url('請輸入有效的 URL').optional().or(z.literal('')),
  description: z.string().optional(),
})

type FormData = z.infer<typeof problemSchema>

export default function NewProblemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'Medium'
    }
  })

  // 自動填充 URL
  const lcId = watch('lcId')
  const handleLcIdChange = (value: string) => {
    const id = parseInt(value)
    if (!isNaN(id) && id > 0) {
      setValue('lcId', id)
      // 可以在這裡添加自動獲取題目資訊的邏輯
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError('')

      const createData: CreateProblemData = {
        lcId: data.lcId,
        title: data.title,
        difficulty: data.difficulty,
        url: data.url || undefined,
        description: data.description || undefined,
      }

      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '創建題目失敗')
      }

      const problem = await response.json()
      router.push(`/problems/${problem.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '創建題目失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              href="/problems"
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">新增題目</h1>
              <p className="text-gray-600 mt-1">添加新的 LeetCode 題目到你的題庫</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">基本資訊</h2>

            {error && (
              <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LeetCode 題號 */}
              <div>
                <label htmlFor="lcId" className="block text-sm font-medium text-gray-700 mb-2">
                  LeetCode 題號 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('lcId', { 
                    valueAsNumber: true,
                    onChange: (e) => handleLcIdChange(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例如：1"
                />
                {errors.lcId && (
                  <p className="mt-1 text-sm text-red-600">{errors.lcId.message}</p>
                )}
              </div>

              {/* 難度 */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  難度 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Easy">簡單 (Easy)</option>
                  <option value="Medium">中等 (Medium)</option>
                  <option value="Hard">困難 (Hard)</option>
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                )}
              </div>
            </div>

            {/* 題目標題 */}
            <div className="mt-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                題目標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例如：Two Sum"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* LeetCode URL */}
            <div className="mt-6">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                LeetCode 連結
              </label>
              <div className="relative">
                <input
                  type="url"
                  {...register('url')}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={lcId ? `https://leetcode.com/problems/${lcId}/` : "https://leetcode.com/problems/..."}
                />
                <ExternalLink className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
              )}
              {lcId && (
                <button
                  type="button"
                  onClick={() => setValue('url', `https://leetcode.com/problems/${lcId}/`)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  使用標準 LeetCode URL
                </button>
              )}
            </div>

            {/* 題目描述 */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                題目描述
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="可以貼上題目的完整描述..."
              />
              <p className="mt-1 text-sm text-gray-500">支援 Markdown 格式</p>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/problems"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  創建中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  創建題目
                </>
              )}
            </button>
          </div>
        </form>

        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• LeetCode 題號是唯一的，系統會檢查重複</li>
            <li>• 可以先創建題目，稍後再添加解答和標籤</li>
            <li>• 題目描述支援 Markdown 格式，可以添加程式碼範例</li>
            <li>• URL 會用於快速跳轉到 LeetCode 原題</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 