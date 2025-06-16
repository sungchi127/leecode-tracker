import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// 題目創建 schema
const createProblemSchema = z.object({
  lcId: z.number().min(1),
  title: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  url: z.string().url().optional(),
  description: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
  categoryIds: z.array(z.number()).optional(),
})

// GET /api/problems - 獲取題目列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const starred = searchParams.get('starred')
    
    const skip = (page - 1) * limit
    
    // 構建查詢條件
    const where: any = {}
    
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (starred === 'true') {
      where.starred = true
    }

    const [problems, total] = await Promise.all([
      db.problem.findMany({
        where,
        include: {
          tags: true,
          categories: true,
          _count: {
            select: { solutions: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.problem.count({ where })
    ])

    return NextResponse.json({
      problems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching problems:', error)
    return NextResponse.json(
      { error: '獲取題目列表失敗' },
      { status: 500 }
    )
  }
}

// POST /api/problems - 創建新題目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProblemSchema.parse(body)
    
    // 檢查 lcId 是否已存在
    const existingProblem = await db.problem.findUnique({
      where: { lcId: validatedData.lcId }
    })
    
    if (existingProblem) {
      return NextResponse.json(
        { error: `LeetCode 題號 ${validatedData.lcId} 已存在` },
        { status: 400 }
      )
    }

    // 創建題目
    const problem = await db.problem.create({
      data: {
        lcId: validatedData.lcId,
        title: validatedData.title,
        difficulty: validatedData.difficulty,
        url: validatedData.url,
        description: validatedData.description,
        tags: validatedData.tagIds ? {
          connect: validatedData.tagIds.map(id => ({ id }))
        } : undefined,
        categories: validatedData.categoryIds ? {
          connect: validatedData.categoryIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        tags: true,
        categories: true,
        _count: {
          select: { solutions: true }
        }
      }
    })

    return NextResponse.json(problem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '輸入數據格式錯誤', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating problem:', error)
    return NextResponse.json(
      { error: '創建題目失敗' },
      { status: 500 }
    )
  }
} 