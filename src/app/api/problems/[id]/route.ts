import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// 題目更新 schema
const updateProblemSchema = z.object({
  lcId: z.number().min(1).optional(),
  title: z.string().min(1).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  starred: z.boolean().optional(),
  tagIds: z.array(z.number()).optional(),
  categoryIds: z.array(z.number()).optional(),
})

// GET /api/problems/[id] - 獲取單個題目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無效的題目 ID' },
        { status: 400 }
      )
    }

    const problem = await db.problem.findUnique({
      where: { id },
      include: {
        tags: true,
        categories: true,
        solutions: {
          orderBy: { createdAt: 'desc' },
          take: 5, // 只顯示最近 5 個解答
        },
        _count: {
          select: { solutions: true }
        }
      }
    })

    if (!problem) {
      return NextResponse.json(
        { error: '題目不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(problem)
  } catch (error) {
    console.error('Error fetching problem:', error)
    return NextResponse.json(
      { error: '獲取題目失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/problems/[id] - 更新題目
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無效的題目 ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateProblemSchema.parse(body)
    
    // 檢查題目是否存在
    const existingProblem = await db.problem.findUnique({
      where: { id }
    })
    
    if (!existingProblem) {
      return NextResponse.json(
        { error: '題目不存在' },
        { status: 404 }
      )
    }

    // 如果更新 lcId，檢查是否與其他題目衝突
    if (validatedData.lcId && validatedData.lcId !== existingProblem.lcId) {
      const conflictProblem = await db.problem.findUnique({
        where: { lcId: validatedData.lcId }
      })
      
      if (conflictProblem) {
        return NextResponse.json(
          { error: `LeetCode 題號 ${validatedData.lcId} 已被其他題目使用` },
          { status: 400 }
        )
      }
    }

    // 更新題目
    const updatedProblem = await db.problem.update({
      where: { id },
      data: {
        ...validatedData,
        tags: validatedData.tagIds ? {
          set: validatedData.tagIds.map(tagId => ({ id: tagId }))
        } : undefined,
        categories: validatedData.categoryIds ? {
          set: validatedData.categoryIds.map(categoryId => ({ id: categoryId }))
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

    return NextResponse.json(updatedProblem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '輸入數據格式錯誤', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating problem:', error)
    return NextResponse.json(
      { error: '更新題目失敗' },
      { status: 500 }
    )
  }
}

// DELETE /api/problems/[id] - 刪除題目
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無效的題目 ID' },
        { status: 400 }
      )
    }

    // 檢查題目是否存在
    const existingProblem = await db.problem.findUnique({
      where: { id },
      include: {
        _count: {
          select: { solutions: true }
        }
      }
    })
    
    if (!existingProblem) {
      return NextResponse.json(
        { error: '題目不存在' },
        { status: 404 }
      )
    }

    // 刪除題目（由於設置了 Cascade，相關的 solutions 也會被刪除）
    await db.problem.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: '題目已成功刪除',
      deletedSolutions: existingProblem._count.solutions
    })
  } catch (error) {
    console.error('Error deleting problem:', error)
    return NextResponse.json(
      { error: '刪除題目失敗' },
      { status: 500 }
    )
  }
} 