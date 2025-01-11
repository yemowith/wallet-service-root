import { Container as ContainerRow } from '@prisma/client'
import Container from '../../core/libs/Container'
import MNemonic from '../../core/libs/MNemonic'
import dbPrismaProvider from '../../providers/dbPrismaProvider'
import redisProvider from '../../providers/redisProvider'
import { RowInstanceType } from '../../types'
import { logger, measureExecutionTime } from '../../core/helpers/helpers'
import dbPgProvider from '../../providers/dbPgProvider'
import {
  calculateProcessCount,
  createProcesses,
} from '../../core/helpers/processor'
import SqsServiceProvider from '../../providers/SqsServiceProvider'

const createContainer = async () => {
  const mnemonic = MNemonic.randomGenerator()
  let container = Container.containerInstance(mnemonic)
  let permutations = container.permutations()
  let slug = dbPrismaProvider.container.generateUniqueSlug()

  let containerId: string = ''
  let dbRow: ContainerRow

  const saveToDb = async () => {
    dbRow = await dbPrismaProvider.container.create(
      mnemonic.toArray(),
      permutations,
      slug,
    )
    if (!dbRow) {
      throw new Error('Failed to create container')
    }

    logger(`Container ${containerId} created successfully in db`)

    return dbRow
  }

  const saveToRedis = async (containerId: string) => {
    await redisProvider
      .container()
      .register(containerId, mnemonic.toString(), slug)

    logger(`Container ${containerId} created successfully in redis`)
  }

  const createDatabase = async (slug: string) => {
    let dbName = `c_${slug}`
    await dbPgProvider.createDatabase(`c_${slug}`)
    logger(`Database ${dbName} created successfully`)
  }

  const migrateDatabase = async (slug: string) => {
    let dbName = `c_${slug}`
    await dbPgProvider.executeSqlFromFile(dbName)
    logger(`Database ${dbName} migrated successfully`)
  }

  const createQueue = async (containerId: string) => {
    let queueName = `wallet-process-${containerId}`
    await SqsServiceProvider.createQueue(queueName, {})
  }

  const sendProcesses = async (containerId: string) => {
    let queueName = `wallet-process-${containerId}`
    const totalItems = permutations
    const processSize = 100000

    logger(`Sending ${totalItems} processes to queue`)

    let countProcesses = calculateProcessCount(totalItems, processSize)
    logger(`Count processes: ${countProcesses}`)

    let types = {
      proccesWallets: 'proccesWallets',
    }
    for (let type in types) {
      let processes = createProcesses(
        totalItems,
        processSize,
        { containerId: containerId, slug: slug, type: type },
        (startNo, endNo, data) => ({
          ...data,
        }),
      )
      await SqsServiceProvider.sendBulkMessagesToQueue(
        queueName,
        processes.map((process) => JSON.stringify(process)),
      )
    }

    logger(`Processes sent to queue`)
  }

  await measureExecutionTime(`Create container...`, async () => {
    dbRow = await saveToDb()
    await saveToRedis(dbRow.id)
    await createDatabase(slug)
    await migrateDatabase(slug)
    await createQueue(dbRow.id)
    await sendProcesses(dbRow.id)
  })
}

export default createContainer
