import { ClientSession, startSession } from 'mongoose'
import { logger } from '@/lib/logger'

export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
  existingSession?: ClientSession,
  operationName?: string
): Promise<T> {
  const session = existingSession || (await startSession())
  const isNewSession = !existingSession
  const operation = operationName || 'database operation'

  if (isNewSession) {
    session.startTransaction()
    logger.debug(`🚀 Started transaction for: ${operation}`)
  }

  try {
    const result = await callback(session)

    if (isNewSession) {
      await session.commitTransaction()
      logger.debug(`✅ Transaction committed successfully: ${operation}`)
    }

    return result
  } catch (error: unknown) {
    if (isNewSession) {
      await session.abortTransaction()
      logger.error(`❌ Transaction aborted for ${operation}:`, { error })
    }
    throw error
  } finally {
    if (isNewSession) {
      await session.endSession()
      logger.debug(`🧹 Session ended for: ${operation}`)
    }
  }
}
