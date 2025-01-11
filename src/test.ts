import pgClient from './core/clients/db-pg'
import redisProvider from './providers/redisProvider'
import createContainer from './tasks/container/createContainer'
;(async () => {
  await pgClient.connect()
  //await createContainer()

  let container = await redisProvider
    .container()
    .register('1', '1234567890', 'test')

  console.log(container.getId())

  let container2 = await redisProvider.container().get('1')
  console.log(container2?.getId())
})()

//runTask();
