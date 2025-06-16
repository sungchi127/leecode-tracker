import Link from 'next/link'
import { PlusCircle, BookOpen, Target, TrendingUp, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">LeetCode 刷題追蹤器</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/problems" className="text-gray-600 hover:text-indigo-600 font-medium">
                題庫
              </Link>
              <Link href="/solutions" className="text-gray-600 hover:text-indigo-600 font-medium">
                解答
              </Link>
              <Link href="/stats" className="text-gray-600 hover:text-indigo-600 font-medium">
                統計
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-indigo-600 font-medium">
                分類
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            系統化追蹤你的 LeetCode 學習歷程
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            記錄每一次的解題思路、程式碼版本，建立你的演算法知識庫。
            支援多種程式語言、標籤分類、進度追蹤，讓刷題更有效率。
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/problems/new"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              新增題目
            </Link>
            <Link 
              href="/problems"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              瀏覽題庫
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Target className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">智能分類</h3>
            <p className="text-gray-600">
              支援 Top 150、劍指 Offer 等經典題集，
              以及動態規劃、圖論等演算法標籤分類
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">進度追蹤</h3>
            <p className="text-gray-600">
              視覺化顯示刷題進度，追蹤每日練習量，
              分析難度分佈和正確率趨勢
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Star className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">版本比較</h3>
            <p className="text-gray-600">
              記錄多次嘗試的解法，支援程式碼 diff 比較，
              追蹤你的優化歷程
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">快速概覽</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">0</div>
              <div className="text-gray-600">總題數</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-gray-600">已解決</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <div className="text-gray-600">解答數</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">0%</div>
              <div className="text-gray-600">完成率</div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-16 bg-indigo-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-semibold mb-4">開始使用</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <h4 className="font-semibold">新增題目</h4>
              </div>
              <p className="text-indigo-100">
                從 LeetCode 新增題目，系統會自動抓取基本資訊
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h4 className="font-semibold">記錄解答</h4>
              </div>
              <p className="text-indigo-100">
                儲存你的程式碼、思路筆記和效能數據
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <h4 className="font-semibold">分析進步</h4>
              </div>
              <p className="text-indigo-100">
                查看統計圖表，追蹤你的學習成果
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LeetCode 刷題追蹤器. 讓刷題更有系統更有效率.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
