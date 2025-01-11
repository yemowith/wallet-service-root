import enums from '../../core/helpers/enums'
import { logger } from '../../core/helpers/helpers'
import awsProvider from '../../providers/awsProvider'
import dbPgProvider from '../../providers/dbPgProvider'
import dbPrismaProvider from '../../providers/dbPrismaProvider'
import redisProvider from '../../providers/redisProvider'
import resetAllClusters from '../aws/resetAllClusters'
import task from '../task'

const resetAllContainers = async (args: any) => {
  return await task('reset-all-containers', args, async (args: any) => {
    logger('Resetting all containers with arguments:', args)

    // delete all container table rows
    await dbPrismaProvider.container.deleteMany()

    // delete all containers databases
    await dbPgProvider.deleteDatabasesWithPrefix(
      enums.config.CONTAINER_DB_PREFIX,
    )
    // delete all containers redis
    await redisProvider.container().deleteAll()

    // delete all containers aws
    await resetAllClusters({})

    return { success: true }
  })
}

export default resetAllContainers
