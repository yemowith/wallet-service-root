import { ListClustersCommand } from '@aws-sdk/client-ecs'
import aws from '../../providers/awsProvider'
import task from '../task'

const resetAllClusters = async (args: any) => {
  return await task('reset-all-clusters', args, async (args: any) => {
    let clusters = await aws.getClusters()

    for (const cluster of clusters?.clusterArns || []) {
      await aws.stopAllTasks(cluster)
    }

    await aws.deleteAllClusters()

    let taskDefinitions = await aws.listTaskDefinitions()
    for (const taskDefinition of taskDefinitions?.taskDefinitionArns || []) {
      await aws.deleteTaskDefinition(taskDefinition)
    }

    return { success: true, message: 'All clusters reset' }
  })
}

export default resetAllClusters
