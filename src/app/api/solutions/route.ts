import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// 解答創建 schema
const createSolutionSchema = z.object({
  problemId: z.number().min(1),
  code: z.string().min(1),
  language: z.enum(['javascript', 'typescript', 'python', 'cpp', 'java', 'go', 'rust']),
  complexity: z.string().optional(),
  runtime: z.number().min(0).optional(),
  memory: z.number().min(0).optional(),
  note: z.string().optional(),
  status: z.enum(['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compile Error']).default('Accepted'),
})

// 查詢參數驗證
const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  language: z.string().optional(),
  problemId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'runtime', 'memory']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// GET /api/solutions - 獲取解答列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      language: searchParams.get('language') || undefined,
      problemId: searchParams.get('problemId') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit

    // 構建查詢條件
    const whereConditions: any = {}
    
    if (query.language) {
      whereConditions.language = query.language
    }
    
    if (query.problemId) {
      whereConditions.problemId = parseInt(query.problemId)
    }
    
    if (query.search) {
      whereConditions.OR = [
        {
          problem: {
            title: {
              contains: query.search,
              mode: 'insensitive'
            }
          }
        },
        {
          note: {
            contains: query.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // 排序條件
    const orderBy: any = {}
    orderBy[query.sortBy] = query.sortOrder

    // 查詢解答
    const [solutions, total] = await Promise.all([
      db.solution.findMany({
        where: whereConditions,
        orderBy,
        skip,
        take: limit,
        include: {
          problem: {
            select: {
              id: true,
              lcId: true,
              title: true,
              difficulty: true,
            }
          }
        }
      }),
      db.solution.count({ where: whereConditions })
    ])

    // 獲取語言統計
    const languageStats = await db.solution.groupBy({
      by: ['language'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    return NextResponse.json({
      solutions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        languages: languageStats.map(stat => ({
          language: stat.language,
          count: stat._count.id
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching solutions:', error)
    return NextResponse.json(
      { error: '獲取解答失敗' },
      { status: 500 }
    )
  }
}

// POST /api/solutions - 創建新解答
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSolutionSchema.parse(body)
    
    // 檢查題目是否存在
    const problem = await db.problem.findUnique({
      where: { id: validatedData.problemId }
    })
    
    if (!problem) {
      return NextResponse.json(
        { error: '指定的題目不存在' },
        { status: 400 }
      )
    }

    // 計算這是第幾次嘗試這題
    const attemptCount = await db.solution.count({
      where: { problemId: validatedData.problemId }
    })

    // 創建解答
    const solution = await db.solution.create({
      data: {
        ...validatedData,
        attemptNo: attemptCount + 1,
      },
      include: {
        problem: {
          select: {
            id: true,
            lcId: true,
            title: true,
            difficulty: true,
          }
        }
      }
    })

    return NextResponse.json(solution, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '輸入數據格式錯誤', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating solution:', error)
    return NextResponse.json(
      { error: '創建解答失敗' },
      { status: 500 }
    )
  }
} 