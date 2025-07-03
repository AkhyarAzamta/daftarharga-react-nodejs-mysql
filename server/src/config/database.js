import { PrismaClient } from '@prisma/client'

// Singleton pattern with Accelerate extension
const prisma = new PrismaClient().$extends({
  name: 'accelerate',
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now()
      const result = await query(args)
      const duration = Date.now() - start
      console.log(`Query ${operation} on ${model} took ${duration}ms`)
      return result
    }
  }
})

// Handle clean shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma