import pgClient from '../core/clients/db-pg'
import createContainer from './container/createContainer'

const registeredTasks = [
  {
    name: 'create-container',
    task: createContainer,
  },
]

const runTask = async (taskName: string) => {
  const task = registeredTasks.find((task) => task.name === taskName)
  if (task) {
    await task.task()
  }
}

// Get the task name from command-line arguments
const main = async () => {
  await pgClient.connect()
  const taskName = process.argv[2] // Get the third argument (first after "node" and script name)
  if (!taskName) {
    console.error('Please provide a task name as an argument.')
    process.exit(1)
  }

  try {
    await runTask(taskName)
  } catch (error) {
    console.error(`Error while running task "${taskName}":`, error)
  } finally {
    await pgClient.end()
    process.exit(0)
  }
}

main()
