import { PrismaClient } from '@prisma/client'

// 防止在開發環境中創建多個 Prisma 實例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db 