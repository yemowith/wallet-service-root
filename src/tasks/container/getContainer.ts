import enums from '../../core/helpers/enums'
import dbPgProvider from '../../providers/dbPgProvider'
import dbPrismaProvider from '../../providers/dbPrismaProvider'
import redisProvider from '../../providers/redisProvider'
import task from '../task'

const getContainer = async (args: any) => {
  return await task('get-container', args, async (args: any) => {
    let containerId = args[0]
    if (!containerId) {
      throw new Error('Container ID is required')
    }

    const container = await dbPrismaProvider.container.get(containerId)
    if (!container) {
      throw new Error('Container not found')
    }

    const redisContainer = await redisProvider.container().get(containerId)

    return {
      success: true,
      container: container,
      redisContainer: await redisContainer?.get(),
    }
  })
}

export default getContainer
