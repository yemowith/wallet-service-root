import pgClient from './core/clients/db-pg'
import redisProvider from './providers/redisProvider'
import createClusterFunc from './tasks/aws/helpers/createClusterFunc'
import createContainer from './tasks/container/createContainer'
;(async () => {
  let id = 'caea1a26-8cb4-497f-8d41-ebdef9442a25'
  await createClusterFunc(id)
})()

//runTask();
