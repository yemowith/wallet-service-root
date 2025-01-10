import { ListClustersCommand } from '@aws-sdk/client-ecs'
import aws from '../../providers/awsProvider'

const resetAll = async () => {
  let clusters = await aws.getClusters()

  for (const cluster of clusters?.clusterArns || []) {
    await aws.stopAllTasks(cluster)
  }

  await aws.deleteAllClusters()

  let taskDefinitions = await aws.listTaskDefinitions()
  for (const taskDefinition of taskDefinitions?.taskDefinitionArns || []) {
    await aws.deleteTaskDefinition(taskDefinition)
  }
}

export default resetAll
