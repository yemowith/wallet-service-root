import { ListClustersCommand } from '@aws-sdk/client-ecs'
import aws from '../../providers/ecsclient'

const createTask = async (
  containerUrl: string,
  clusterName: string,
  taskDefinitionName: string,
  containerName: string,
  tagName: string,
  environment: { name: string; value: string }[],
) => {
  let taskDefinitionArn: string = ''
  let clusterArn: string = ''

  let taskDefinitions = await aws.listTaskDefinitions()
  if (!taskDefinitions || taskDefinitions.taskDefinitionArns?.length === 0) {
    console.log('No task definitions found')
    let taskDefinition = await aws.createTaskDefinition(
      taskDefinitionName,
      containerName,
      containerUrl,
      [{ name: 'name', value: containerName }],
    )
    taskDefinitionArn = taskDefinition?.taskDefinitionArn || ''
  } else {
    const hasTaskDefinition = taskDefinitions.taskDefinitionArns?.find(
      (taskDefinition) => taskDefinition.includes(taskDefinitionName),
    )
    if (!hasTaskDefinition) {
      let taskDefinition = await aws.createTaskDefinition(
        taskDefinitionName,
        containerName,
        containerUrl,
        [{ name: 'name', value: containerName }],
      )
      taskDefinitionArn = taskDefinition?.taskDefinitionArn || ''
    } else {
      taskDefinitionArn = hasTaskDefinition
    }
  }

  console.log('taskDefinitionArn', taskDefinitionArn)

  let clusters = await aws.getClusters()
  if (!clusters || clusters.clusterArns?.length === 0) {
    let cluster = await aws.createCluster(clusterName, [
      { key: 'Name', value: tagName },
    ])
    clusterArn = cluster?.clusterArn || ''
  } else {
    const hasCluster = clusters.clusterArns?.find((cluster) =>
      cluster.includes(clusterName),
    )
    if (!hasCluster) {
      let cluster = await aws.createCluster(clusterName, [
        { key: 'Name', value: tagName },
      ])
      clusterArn = cluster?.clusterArn || ''
    } else {
      clusterArn = hasCluster
    }
  }

  console.log('clusterArn', clusterArn)

  if (taskDefinitionArn && clusterArn) {
    let newTask = await aws.runNewTask(
      environment,
      clusterName,
      taskDefinitionArn,
    )

    console.log('newTask', newTask)

    return newTask
  } else {
    console.log('No task definition or cluster found')
  }
}

export default createTask
