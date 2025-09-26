// Initializing connection to Posrtgres using Prisma ORM for quering the database

import { PrismaClient } from '@prisma/client'

    const globalPrisma = globalThis

    const prisma = globalPrisma.prisma ||new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalPrisma.prisma = prisma
}

export default prisma
