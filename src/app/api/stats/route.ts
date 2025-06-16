import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 總體統計
    const [
      totalProblems,
      totalSolutions,
      uniqueLanguages,
      averageAttempts
    ] = await Promise.all([
      db.problem.count(),
      db.solution.count(),
      db.solution.groupBy({
        by: ['language'],
        _count: { id: true }
      }),
      db.solution.aggregate({
        _avg: { attemptNo: true }
      })
    ])

    // 難度分布統計
    const difficultyStats = await db.problem.groupBy({
      by: ['difficulty'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // 語言使用統計
    const languageStats = await db.solution.groupBy({
      by: ['language'],
      _count: {
        id: true
      },
      _avg: {
        runtime: true,
        memory: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // 標籤統計
    const tagStats = await db.$queryRaw`
      SELECT t.name, t.color, COUNT(pt."A") as count
      FROM tags t
      LEFT JOIN "_ProblemTags" pt ON t.id = pt."B"
      GROUP BY t.id, t.name, t.color
      ORDER BY COUNT(pt."A") DESC
      LIMIT 10
    ` as Array<{ name: string; color: string | null; count: bigint }>

    // 解題狀態統計
    const statusStats = await db.solution.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // 每月解題趨勢（最近12個月）
    const monthlyProgress = await db.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(DISTINCT "problemId") as problems_solved,
        COUNT(*) as solutions_added
      FROM solutions
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    ` as Array<{ 
      month: Date; 
      problems_solved: bigint; 
      solutions_added: bigint 
    }>

    // 每週解題趨勢（最近8週）
    const weeklyProgress = await db.$queryRaw`
      SELECT 
        DATE_TRUNC('week', "createdAt") as week,
        COUNT(DISTINCT "problemId") as problems_solved,
        COUNT(*) as solutions_added
      FROM solutions
      WHERE "createdAt" >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY week ASC
    ` as Array<{ 
      week: Date; 
      problems_solved: bigint; 
      solutions_added: bigint 
    }>

    // 性能統計
    const performanceStats = await db.solution.aggregate({
      _avg: {
        runtime: true,
        memory: true
      },
      _min: {
        runtime: true,
        memory: true
      },
      _max: {
        runtime: true,
        memory: true
      },
      where: {
        runtime: { not: null },
        memory: { not: null }
      }
    })

    // 最近活動
    const recentActivity = await db.solution.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        problem: {
          select: {
            lcId: true,
            title: true,
            difficulty: true
          }
        }
      }
    })

    // 收藏題目統計
    const starredCount = await db.problem.count({
      where: { starred: true }
    })

    // 分類統計
    const categoryStats = await db.$queryRaw`
      SELECT c.name, c.description, COUNT(pc."A") as count
      FROM categories c
      LEFT JOIN "_ProblemCategories" pc ON c.id = pc."B"
      GROUP BY c.id, c.name, c.description
      ORDER BY COUNT(pc."A") DESC
    ` as Array<{ name: string; description: string | null; count: bigint }>

    return NextResponse.json({
      overview: {
        totalProblems,
        totalSolutions,
        uniqueLanguagesCount: uniqueLanguages.length,
        averageAttempts: Math.round((averageAttempts._avg.attemptNo || 0) * 100) / 100,
        starredCount
      },
      difficulty: difficultyStats.map(stat => ({
        difficulty: stat.difficulty,
        count: stat._count.id
      })),
      languages: languageStats.map(stat => ({
        language: stat.language,
        count: stat._count.id,
        avgRuntime: Math.round((stat._avg.runtime || 0) * 100) / 100,
        avgMemory: Math.round((stat._avg.memory || 0) * 100) / 100
      })),
      tags: tagStats.map(stat => ({
        name: stat.name,
        color: stat.color,
        count: Number(stat.count)
      })),
      status: statusStats.map(stat => ({
        status: stat.status,
        count: stat._count.id
      })),
      trends: {
        monthly: monthlyProgress.map(item => ({
          month: item.month.toISOString().slice(0, 7), // YYYY-MM format
          problemsSolved: Number(item.problems_solved),
          solutionsAdded: Number(item.solutions_added)
        })),
        weekly: weeklyProgress.map(item => ({
          week: item.week.toISOString().slice(0, 10), // YYYY-MM-DD format
          problemsSolved: Number(item.problems_solved),
          solutionsAdded: Number(item.solutions_added)
        }))
      },
      performance: {
        avgRuntime: Math.round((performanceStats._avg.runtime || 0) * 100) / 100,
        avgMemory: Math.round((performanceStats._avg.memory || 0) * 100) / 100,
        minRuntime: performanceStats._min.runtime || 0,
        maxRuntime: performanceStats._max.runtime || 0,
        minMemory: Math.round((performanceStats._min.memory || 0) * 100) / 100,
        maxMemory: Math.round((performanceStats._max.memory || 0) * 100) / 100
      },
      categories: categoryStats.map(stat => ({
        name: stat.name,
        description: stat.description,
        count: Number(stat.count)
      })),
      recentActivity: recentActivity.map(solution => ({
        id: solution.id,
        language: solution.language,
        status: solution.status,
        createdAt: solution.createdAt.toISOString(),
        problem: solution.problem
      }))
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: '獲取統計數據失敗' },
      { status: 500 }
    )
  }
} 