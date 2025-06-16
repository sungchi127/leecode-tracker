import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Difficulty, Language } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDifficultyColor(difficulty: Difficulty) {
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

export function getLanguageColor(language: Language) {
  const colors = {
    javascript: 'text-yellow-600 bg-yellow-50',
    typescript: 'text-blue-600 bg-blue-50',
    python: 'text-green-600 bg-green-50',
    cpp: 'text-purple-600 bg-purple-50',
    java: 'text-orange-600 bg-orange-50',
    go: 'text-cyan-600 bg-cyan-50',
    rust: 'text-red-600 bg-red-50'
  }
  return colors[language] || 'text-gray-600 bg-gray-50'
}

export function formatRuntime(runtime?: number) {
  if (!runtime) return '未知'
  return `${runtime}ms`
}

export function formatMemory(memory?: number) {
  if (!memory) return '未知'
  return `${memory}MB`
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function getProblemUrl(lcId: number) {
  return `https://leetcode.com/problems/${lcId}/`
}

export function extractProblemIdFromUrl(url: string): number | null {
  const match = url.match(/leetcode\.com\/problems\/(\d+)\//)
  return match ? parseInt(match[1]) : null
}

export function calculateSuccessRate(solved: number, total: number): number {
  if (total === 0) return 0
  return Math.round((solved / total) * 100)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
} 