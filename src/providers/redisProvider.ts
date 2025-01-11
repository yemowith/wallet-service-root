import redisClient from '../core/clients/redis'
import enums from '../core/helpers/enums'
import MNemonic from '../core/libs/MNemonic'
import {
  ContainerRowData,
  MnemonicInstanceType,
  RowInstanceType,
} from '../types'

const redisProvider = {
  container: () => {
    const createRowInstance = (
      containerId: string,
      mnemonic: string,
      slug: string,
      data = {},
    ) => {
      return {
        containerId: containerId,
        mnemonic: mnemonic,
        slug: slug,
        status: 'pending', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: null,
        isStarted: false,
        isDone: false,
        ...data,
      }
    }

    const rowInstance = (data: ContainerRowData): RowInstanceType => {
      let containerId = data.containerId
      if (!containerId) {
        throw new Error('Container ID is required')
      }
      return {
        getId: () => {
          return containerId
        },
        isStarted: () => {
          return data.isStarted
        },
        isDone: () => {
          return data.isDone
        },
        status: () => {
          return data.status
        },
        setStatus: async (status: string) => {
          data.status = status
          await redisClient.set(
            enums.setContainerRedisKey(containerId),
            JSON.stringify(data),
          )
        },
        setAsStarted: async () => {
          data.isStarted = true
          await redisClient.set(
            enums.setContainerRedisKey(containerId),
            JSON.stringify(data),
          )
        },
        setAsDone: async () => {
          data.isDone = true
          await redisClient.set(
            enums.setContainerRedisKey(containerId),
            JSON.stringify(data),
          )
        },
        addData: async (key: string, value: any) => {
          data[key] = value
          await redisClient.set(
            enums.setContainerRedisKey(containerId),
            JSON.stringify(data),
          )
        },
        getData: async (key: string) => {
          return data[key]
        },
        get: async () => {
          return data
        },
        save: async () => {
          await redisClient.set(
            enums.setContainerRedisKey(containerId),
            JSON.stringify(data),
          )
        },
        getMnemonic: (): MnemonicInstanceType => {
          return MNemonic.mnemonicInstance(data.mnemonic)
        },
        getSlug: () => {
          return data.slug
        },
      }
    }

    const isContainerExists = async (containerId: string) => {
      const containerData = await redisClient.get(
        enums.setContainerRedisKey(containerId),
      )
      return containerData ? true : false
    }

    const get = async (
      containerId: string,
    ): Promise<RowInstanceType | null> => {
      const containerData = await redisClient.get(
        enums.setContainerRedisKey(containerId),
      )
      return containerData ? rowInstance(JSON.parse(containerData)) : null
    }

    const register = async (
      containerId: string,
      mnemonic: string,
      slug: string,
      data = {},
    ): Promise<RowInstanceType> => {
      const existingContainer = await get(containerId)
      if (existingContainer) {
        console.log(
          `Container ${containerId} is already registered. Skipping registration.`,
        )
        return existingContainer
      }

      const containerRowData = createRowInstance(
        containerId,
        mnemonic,
        slug,
        data,
      )
      const container = rowInstance(containerRowData)
      await container.save()
      return container
    }

    const deleteRow = async (containerId: string) => {
      const container = await get(containerId)
      if (!container) {
        console.log(
          `Container ${containerId} is not registered. Nothing to delete.`,
        )
        return false
      }
      await redisClient.del(enums.setContainerRedisKey(containerId))
      console.log(`Container ${containerId} deleted successfully.`)
      return true
    }

    const deleteAll = async () => {
      await redisClient.del('container:*')
    }

    return {
      isExists: isContainerExists,
      createRowInstance,
      rowInstance,
      deleteAll,
      get,
      register,
      deleteRow,
    }
  },
}

export default redisProvider
