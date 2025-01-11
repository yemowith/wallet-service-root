import pgClient from '../core/clients/db-pg'
import resetAllClusters from './aws/resetAllClusters'
import createContainer from './container/createContainer'
import getContainer from './container/getContainer'
import resetAllContainers from './container/resetAllContainers'

const registeredTasks = [
  {
    name: 'create-container',
    task: createContainer,
  },
  {
    name: 'reset-all-containers',
    task: resetAllContainers,
  },
  {
    name: 'get-container',
    task: getContainer,
  },
  {
    name: 'reset-all-clusters',
    task: resetAllClusters,
  },
]

const runTask = async (taskName: string, args: any) => {
  const task = registeredTasks.find((task) => task.name === taskName)
  if (task) {
    await task.task(args)
  } else {
    console.error(`Task "${taskName}" is not registered.`)
  }
}

const main = async () => {
  await pgClient.connect()
  const taskName = process.argv[2]
  if (!taskName) {
    console.error('Please provide a task name as an argument.')
    process.exit(1)
  }

  try {
    await runTask(taskName, process.argv.slice(3))
  } catch (error) {
    console.error(`Error while running task "${taskName}":`, error)
  } finally {
    await pgClient.end()
    process.exit(0)
  }
}

main()
