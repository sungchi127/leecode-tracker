'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Play, Clock, MemoryStick } from 'lucide-react'
import { CreateSolutionData, Language, Status } from '@/lib/types'

// 表單驗證 schema
const solutionSchema = z.object({
  code: z.string().min(1, '程式碼不能為空'),
  language: z.enum(['javascript', 'typescript', 'python', 'cpp', 'java', 'go', 'rust'] as const, {
    required_error: '請選擇程式語言'
  }),
  complexity: z.string().optional(),
  runtime: z.number().min(0).optional(),
  memory: z.number().min(0).optional(),
  note: z.string().optional(),
  status: z.enum(['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compile Error'] as const).default('Accepted'),
})

type FormData = z.infer<typeof solutionSchema>

interface Problem {
  id: number
  lcId: number
  title: string
  difficulty: string
}

export default function NewSolutionPage() {
  const params = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchingProblem, setFetchingProblem] = useState(true)

  const problemId = parseInt(params.id as string)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      language: 'javascript',
      status: 'Accepted'
    }
  })

  const selectedLanguage = watch('language')

  // 獲取題目信息
  const fetchProblem = async () => {
    try {
      setFetchingProblem(true)
      const response = await fetch(`/api/problems/${problemId}`)
      
      if (!response.ok) {
        throw new Error('題目不存在')
      }

      const data = await response.json()
      setProblem({
        id: data.id,
        lcId: data.lcId,
        title: data.title,
        difficulty: data.difficulty
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取題目信息失敗')
    } finally {
      setFetchingProblem(false)
    }
  }

  // 獲取語言對應的範例代碼
  const getCodeTemplate = (language: Language): string => {
    const templates = {
      javascript: `// JavaScript 解法
function twoSum(nums, target) {
    // 在這裡寫你的解法
    
}`,
      typescript: `// TypeScript 解法
function twoSum(nums: number[], target: number): number[] {
    // 在這裡寫你的解法
    
}`,
             python: `# Python 解法
def two_sum(nums, target):
    # 在這裡寫你的解法
    pass`,
      cpp: `// C++ 解法
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // 在這裡寫你的解法
        
    }
};`,
      java: `// Java 解法
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 在這裡寫你的解法
        
    }
}`,
      go: `// Go 解法
func twoSum(nums []int, target int) []int {
    // 在這裡寫你的解法
    
}`,
      rust: `// Rust 解法
impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // 在這裡寫你的解法
        
    }
}`
    }
    return templates[language] || ''
  }

  // 當語言改變時更新代碼模板
  useEffect(() => {
    const currentCode = watch('code')
    if (!currentCode || currentCode.trim() === '') {
      setValue('code', getCodeTemplate(selectedLanguage))
    }
  }, [selectedLanguage, setValue, watch])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError('')

      const createData: CreateSolutionData = {
        problemId,
        code: data.code,
        language: data.language,
        complexity: data.complexity || undefined,
        runtime: data.runtime || undefined,
        memory: data.memory || undefined,
        note: data.note || undefined,
        status: data.status,
        attemptNo: 1 // 後端會自動計算
      }

      const response = await fetch('/api/solutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '創建解答失敗')
      }

      const solution = await response.json()
      router.push(`/solutions/${solution.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '創建解答失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (problemId && !isNaN(problemId)) {
      fetchProblem()
    } else {
      setError('無效的題目 ID')
      setFetchingProblem(false)
    }
  }, [problemId])

  if (fetchingProblem) {
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
          <div className="flex items-center">
            <Link
              href={`/problems/${problem.id}`}
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">新增解答</h1>
              <p className="text-gray-600 mt-1">
                為題目 <span className="font-medium">#{problem.lcId} {problem.title}</span> 添加解答
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側 - 代碼編輯器 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">程式碼</h2>
                  <div className="flex items-center space-x-3">
                    <label htmlFor="language" className="text-sm font-medium text-gray-700">
                      語言:
                    </label>
                    <select
                      {...register('language')}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <textarea
                    {...register('code')}
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    placeholder="在這裡輸入你的程式碼..."
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 右側 - 詳細信息 */}
            <div className="space-y-6">
              {/* 執行結果 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">執行結果</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      狀態
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Accepted">Accepted</option>
                      <option value="Wrong Answer">Wrong Answer</option>
                      <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                      <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
                      <option value="Runtime Error">Runtime Error</option>
                      <option value="Compile Error">Compile Error</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="runtime" className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
                        執行時間 (ms)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        {...register('runtime', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="例如：64"
                      />
                    </div>

                    <div>
                      <label htmlFor="memory" className="block text-sm font-medium text-gray-700 mb-2">
                        <MemoryStick className="h-4 w-4 inline mr-1" />
                        記憶體 (MB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        {...register('memory', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="例如：14.2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 複雜度分析 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">複雜度分析</h3>
                <div>
                  <textarea
                    {...register('complexity')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="例如：時間複雜度 O(n)，空間複雜度 O(1)"
                  />
                </div>
              </div>

              {/* 筆記 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">解題筆記</h3>
                <div>
                  <textarea
                    {...register('note')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="記錄你的解題思路、優化過程、遇到的問題等..."
                  />
                  <p className="mt-1 text-sm text-gray-500">支援 Markdown 格式</p>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存解答
                    </>
                  )}
                </button>
                
                <Link
                  href={`/problems/${problem.id}`}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  取消
                </Link>
              </div>
            </div>
          </div>
        </form>

        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 切換程式語言會自動載入對應的代碼模板</li>
            <li>• 執行時間和記憶體使用量是可選的，可以稍後補充</li>
            <li>• 解題筆記支援 Markdown 格式，方便添加程式碼和圖片</li>
            <li>• 系統會自動計算這是你第幾次嘗試解決這個題目</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 