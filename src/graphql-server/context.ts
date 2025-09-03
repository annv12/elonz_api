import { PrismaClient } from '@prisma/client'
import { getUserId } from './utils'
// import { PubSub } from 'graphql-yoga'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis, { RedisOptions } from 'ioredis'
// import { setLocale } from './lib/i18n-utils'
import Redlock from 'redlock'
// import RedisSMQ from 'rsmq'
// import { initQueue } from './lib/redis-queue-utils'
import { YogaInitialContext } from '@graphql-yoga/node'
import RedisSMQ from 'rsmq'
import { setLocale } from '../libs/i18n-utils'

const redisHost = process.env.REDIS_HOST || '127.0.0.1'

// const rsmq = new RedisSMQ({ host: redisHost, port: 6379, ns: 'rsmq' })

// initQueue(rsmq)

const options: RedisOptions = {
  host: redisHost,
  port: Number(process.env.REDIS_PORT || 6379),
  db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  retryStrategy: (times: number) => {
    // reconnect after
    return Math.min(times * 50, 2000)
  },
}
export const rsmq = new RedisSMQ({
  host: options.host,
  port: options.port,
  ns: 'rsmq',
})

const redis = new Redis(options)

const redlock = new Redlock(
  // you should have one client for each independent redis node
  // or cluster
  // @ts-ignore
  [redis],
  {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 15,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms
  },
)
redlock.on('clientError', function (err) {
  console.error('A redis lock error has occurred:', err)
})

export const prisma = new PrismaClient({
  // log: ["query"],
})

export interface GraphqlContext {
  prisma: PrismaClient
  user: string
  pubsub: RedisPubSub
  request: any
  i18n: any
  redlock: Redlock
  rsmq: RedisSMQ
  redis: Redis
}

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
})

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<GraphqlContext> {
  // @ts-ignore
  const tokenData = getUserId(initialContext)

  return {
    ...initialContext,
    user: tokenData.userId,
    prisma,
    pubsub,
    i18n: setLocale(initialContext.request),
    redlock: redlock,
    rsmq,
    redis,
  }
}
