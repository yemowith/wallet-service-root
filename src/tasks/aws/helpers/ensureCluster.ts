import aws from '../../../providers/awsProvider'

const ensureCluster = async (clusterName: string, tagName: string) => {
  let clusters = await aws.getClusters()
  if (!clusters || clusters.clusterArns?.length === 0) {
    console.log('No clusters found, creating a new one...')
    let cluster = await aws.createCluster(clusterName, [
      { key: 'Name', value: tagName },
    ])
    return cluster?.clusterArn || ''
  }

  const hasCluster = clusters.clusterArns?.find((cluster) =>
    cluster.includes(clusterName),
  )

  if (!hasCluster) {
    console.log('Cluster not found, creating a new one...')
    let cluster = await aws.createCluster(clusterName, [
      { key: 'Name', value: tagName },
    ])
    return cluster?.clusterArn || ''
  }

  console.log('Cluster found:', hasCluster)
  return hasCluster
}

export default ensureCluster
