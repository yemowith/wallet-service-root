import { ListClustersCommand } from '@aws-sdk/client-ecs'
import aws from '../providers/awsProvider'
import createTask from '../tasks/aws/createTask'
import resetAll from '../tasks/aws/resetAll'
;(async () => {
  let containerUrl =
    '913524904473.dkr.ecr.eu-north-1.amazonaws.com/wallet-container-service:latest'
  let clusterName = 'wallet-container-cluster'
  let taskDefinitionName = 'wallet-container-task'
  let containerName = 'wallet-container'
  let tagName = 'wallet-container'

  let environment = [{ name: 'CONTAINER_ID', value: '1' }]

  await createTask(
    containerUrl,
    clusterName,
    taskDefinitionName,
    containerName,
    tagName,
    environment,
  )
})()

//runTask();
