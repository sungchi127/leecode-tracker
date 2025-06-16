import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// 更新分類驗證
const updateCategorySchema = z.object({
  name: z.string().min(1, '分類名稱不能為空').max(50, '分類名稱不能超過50字').optional(),
  description: z.string().max(200, '描述不能超過200字').optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類ID' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeProblems = searchParams.get('includeProblems') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (includeProblems) {
      // 獲取分類及其題目
      const [category, totalProblems] = await Promise.all([
        db.category.findUnique({
          where: { id: categoryId },
          include: {
            problems: {
              include: {
                _count: {
                  select: {
                    solutions: true
                  }
                },
                tags: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              },
              orderBy: { lcId: 'asc' },
              skip,
              take: limit
            },
            _count: {
              select: {
                problems: true
              }
            }
          }
        }),
        db.category.findUnique({
          where: { id: categoryId },
          select: {
            _count: {
              select: {
                problems: true
              }
            }
          }
        })
      ])

      if (!category) {
        return NextResponse.json(
          { error: '分類不存在' },
          { status: 404 }
        )
      }

      const solvedCount = category.problems.filter(problem => 
        problem._count.solutions > 0
      ).length

      return NextResponse.json({
        category: {
          ...category,
          stats: {
            problemsCount: category._count.problems,
            solvedCount,
            completionRate: category._count.problems > 0 
              ? Math.round((solvedCount / category._count.problems) * 100) 
              : 0
          }
        },
        pagination: {
          page,
          limit,
          total: totalProblems?._count.problems || 0,
          pages: Math.ceil((totalProblems?._count.problems || 0) / limit)
        }
      })
    } else {
      // 簡單獲取分類信息
      const category = await db.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: '分類不存在' },
          { status: 404 }
        )
      }

      return NextResponse.json({ category })
    }

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: '獲取分類失敗' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // 檢查分類是否存在
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: '分類不存在' },
        { status: 404 }
      )
    }

    // 如果要更新名稱，檢查是否與其他分類重複
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await db.category.findUnique({
        where: { name: validatedData.name }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: '分類名稱已存在' },
          { status: 400 }
        )
      }
    }

    // 更新分類
    const category = await db.category.update({
      where: { id: categoryId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
      }
    })

    return NextResponse.json({ category })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '驗證失敗' },
        { status: 400 }
      )
    }

    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: '更新分類失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: '無效的分類ID' },
        { status: 400 }
      )
    }

    // 檢查分類是否存在
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            problems: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: '分類不存在' },
        { status: 404 }
      )
    }

    // 檢查是否有關聯的題目
    if (existingCategory._count.problems > 0) {
      return NextResponse.json(
        { error: `無法刪除分類，還有 ${existingCategory._count.problems} 個題目使用此分類` },
        { status: 400 }
      )
    }

    // 刪除分類
    await db.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ message: '分類已刪除' })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: '刪除分類失敗' },
      { status: 500 }
    )
  }
} 