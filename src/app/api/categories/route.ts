import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// 創建分類驗證
const createCategorySchema = z.object({
  name: z.string().min(1, '分類名稱不能為空').max(50, '分類名稱不能超過50字'),
  description: z.string().max(200, '描述不能超過200字').optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    if (includeStats) {
      // 獲取分類及其統計數據
      const categories = await db.category.findMany({
        include: {
          _count: {
            select: {
              problems: true
            }
          },
          problems: {
            include: {
              _count: {
                select: {
                  solutions: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      const categoriesWithStats = categories.map(category => {
        const problemsCount = category._count.problems
        const solvedCount = category.problems.filter(problem => 
          problem._count.solutions > 0
        ).length
        const totalSolutions = category.problems.reduce((sum, problem) => 
          sum + problem._count.solutions, 0
        )

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          stats: {
            problemsCount,
            solvedCount,
            totalSolutions,
            completionRate: problemsCount > 0 ? Math.round((solvedCount / problemsCount) * 100) : 0
          }
        }
      })

      return NextResponse.json({ categories: categoriesWithStats })
    } else {
      // 簡單獲取分類列表
      const categories = await db.category.findMany({
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({ categories })
    }

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: '獲取分類失敗' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // 檢查分類名稱是否已存在
    const existingCategory = await db.category.findUnique({
      where: { name: validatedData.name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: '分類名稱已存在' },
        { status: 400 }
      )
    }

    // 創建分類
    const category = await db.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
      }
    })

    return NextResponse.json({ category }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '驗證失敗' },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: '創建分類失敗' },
      { status: 500 }
    )
  }
} 