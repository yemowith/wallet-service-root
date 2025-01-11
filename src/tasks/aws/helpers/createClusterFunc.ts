import ensureCluster from './ensureCluster'
import ensureTaskDefinition from './ensureTaskDefinition'
import aws from '../../../providers/awsProvider'
import { CONTAINER_SERVICE_URL } from '../../../config'
import enums from '../../../core/helpers/enums'
import dbPrismaProvider from '../../../providers/dbPrismaProvider'

const createClusterFunc = async (containerId: string) => {
  let containerUrl: string = CONTAINER_SERVICE_URL
  let clusterName: string = `w-c-${containerId}`
  let taskDefinitionName: string = `w-c-task`
  let containerName: string = `w-c-${containerId}`
  let tagName: string = `w-c-${containerId}`

  const container = await dbPrismaProvider.container.get(containerId)
  if (!container) {
    throw new Error('Container not found')
  }

  let environment: { name: string; value: string }[] = [
    {
      name: 'CONTAINER_ID',
      value: containerId,
    },
    {
      name: 'PG_DATABASE',
      value: enums.setContainerDbName(container.slug),
    },
  ]

  const taskDefinitionArn = await ensureTaskDefinition(
    taskDefinitionName,
    containerName,
    containerUrl,
    environment,
  )

  const clusterArn = await ensureCluster(clusterName, tagName)

  if (taskDefinitionArn && clusterArn) {
    console.log('Running a new task...')
    let newTask = await aws.runNewTask(
      environment,
      clusterName,
      taskDefinitionArn,
    )

    console.log('New Task Response:', newTask)

    return {
      clusterArn,
      taskDefinitionArn,
      newTask,
    }
  } else {
    console.log('No task definition or cluster found. Task creation failed.')
    return {}
  }
}

export default createClusterFunc
