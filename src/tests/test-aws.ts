import { ListClustersCommand } from '@aws-sdk/client-ecs'
import aws from '../providers/awsProvider'
import createTask from '../tasks/aws/createCluster'
import resetAll from '../tasks/aws/resetAllClusters'
import createClusterFunc from '../tasks/aws/helpers/createClusterFunc'
;(async () => {
  createClusterFunc('')
})()

//runTask();
