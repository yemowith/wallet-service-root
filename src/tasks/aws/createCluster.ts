import ensureTaskDefinition from './helpers/ensureTaskDefinition'
import ensureCluster from './helpers/ensureCluster'
import aws from '../../providers/awsProvider'
import task from '../task'
import createClusterFunc from './helpers/createClusterFunc'

const createCluster = async (args: any) => {
  return await task('create-cluster', args, async (args: any) => {
    let containerId = args[0]
    if (!containerId)
      return { success: false, message: 'Container ID is required' }

    await createClusterFunc(containerId)
  })
}

export default createCluster
