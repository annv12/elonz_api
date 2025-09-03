import RedisClient from 'ioredis'
import Redlock, { ResourceLockedError } from 'redlock'
import RedisSMQ from 'rsmq'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import { initQueue } from './libs/redis-queue-utils'

export const redisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6380),
  db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  // retryStrategy: (times: number) => {
  //   // reconnect after
  //   return Math.min(times * 50, 2000)
  // },
}
const redis = new RedisClient(redisOptions.port, redisOptions.host)

const rsmq = new RedisSMQ(redisOptions)
const pubsub = new RedisPubSub({
  publisher: new Redis(redisOptions),
  subscriber: new Redis(redisOptions),
})

// initQueue(rsmq)

const redlock = new Redlock(
  // You should have one client for each independent redis node
  // or cluster.
  [redis],
  {
    // The expected clock drift; for more details see:
    // http://redis.io/topics/distlock
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time

    // The max number of times Redlock will attempt to lock a resource
    // before erroring.
    retryCount: 10,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 500, // time in ms
  },
)

redlock.on('error', (error) => {
  // Ignore cases where a resource is explicitly marked as locked on a client.
  if (error instanceof ResourceLockedError) {
    return
  }

  // Log all other errors.
  console.error(error)
})

export { redis, redlock, RedisClient, Redlock, rsmq, pubsub }
