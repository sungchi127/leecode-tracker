import { Prisma } from '@prisma/client'

// 基礎類型
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Language = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java' | 'go' | 'rust'
export type Status = 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compile Error'

// 包含關聯的複雜類型
export type ProblemWithDetails = Prisma.ProblemGetPayload<{
  include: {
    tags: true
    categories: true
    solutions: {
      orderBy: { createdAt: 'desc' }
    }
    _count: {
      select: { solutions: true }
    }
  }
}>

export type SolutionWithProblem = Prisma.SolutionGetPayload<{
  include: {
    problem: {
      include: {
        tags: true
        categories: true
      }
    }
  }
}>

// 搜尋和篩選相關
export interface ProblemFilter {
  difficulty?: Difficulty[]
  tags?: number[]
  categories?: number[]
  starred?: boolean
  solved?: boolean
  search?: string
}

export interface SolutionFilter {
  language?: Language[]
  status?: Status[]
  problemId?: number
  dateRange?: {
    from: Date
    to: Date
  }
}

// 統計相關
export interface ProblemStats {
  total: number
  solved: number
  byDifficulty: {
    Easy: { total: number; solved: number }
    Medium: { total: number; solved: number }
    Hard: { total: number; solved: number }
  }
  byCategory: Array<{
    name: string
    total: number
    solved: number
  }>
  recentActivity: Array<{
    date: string
    problemsSolved: number
  }>
}

// 表單相關
export interface CreateProblemData {
  lcId: number
  title: string
  difficulty: Difficulty
  url?: string
  description?: string
  tagIds?: number[]
  categoryIds?: number[]
}

export interface CreateSolutionData {
  problemId: number
  code: string
  language: Language
  complexity?: string
  runtime?: number
  memory?: number
  note?: string
  attemptNo: number
  status?: Status
} 