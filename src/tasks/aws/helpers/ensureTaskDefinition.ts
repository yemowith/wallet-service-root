import aws from '../../../providers/awsProvider'

const ensureTaskDefinition = async (
  taskDefinitionName: string,
  containerName: string,
  containerUrl: string,
  environment: { name: string; value: string }[],
) => {
  let taskDefinitions = await aws.listTaskDefinitions()
  if (!taskDefinitions || taskDefinitions.taskDefinitionArns?.length === 0) {
    console.log('No task definitions found, creating a new one...')
    let taskDefinition = await aws.createTaskDefinition(
      taskDefinitionName,
      containerName,
      containerUrl,
      environment,
    )
    return taskDefinition?.taskDefinitionArn || ''
  }

  const hasTaskDefinition = taskDefinitions.taskDefinitionArns?.find(
    (taskDefinition) => taskDefinition.includes(taskDefinitionName),
  )

  if (!hasTaskDefinition) {
    console.log('TaskDefinition not found, creating a new one...')
    let taskDefinition = await aws.createTaskDefinition(
      taskDefinitionName,
      containerName,
      containerUrl,
      environment,
    )
    return taskDefinition?.taskDefinitionArn || ''
  }

  console.log('TaskDefinition found:', hasTaskDefinition)
  return hasTaskDefinition
}

export default ensureTaskDefinition
