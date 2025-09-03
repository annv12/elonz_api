import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import rsmqWorker from 'rsmq-worker'
import { redisOptions } from '../context'
import { TASK_REWARD_QUEUE } from '../libs/redis-queue-utils'
import { sendNotifyAdmin } from '../libs/bot'
import {
  MELON_TASK_GAME,
  MELON_TASK_INVITE,
  MELON_TASK_SPIN,
} from '../config/constants'
import { countDropGame, countInvite } from '../helpers/task'

const prisma = new PrismaClient()

const worker = new rsmqWorker(TASK_REWARD_QUEUE, {
  host: redisOptions.host,
  port: redisOptions.port,
  ns: 'rsmq',
  timeout: 600000,
})

worker.on('message', async function (msg: any, next: any, id: any) {
  const data = JSON.parse(msg) as {
    userId: string
    type: 'INVITE' | 'DROP_GAME' | 'SPIN_GAME'
    time: Date
  }
  console.log('🚀 ~ data ~ data:', data)
  try {
    switch (data.type) {
      case 'INVITE':
        await checkTaskInvite(data.userId)
        break
      case 'DROP_GAME':
        await checkTaskDropGame(data.userId, data.time)
        break
      case 'SPIN_GAME':
        await checkTaskSpinGame(data.userId, data.time)
        break
    }
  } catch (err) {
    console.log(new Date().toISOString(), '🚀 ~ err:', err)
    await sendNotifyAdmin('worker check task reward error:  ' + err.message)
  } finally {
    next()
  }
})

// optional error listeners
worker.on('error', function (err: any, msg: any) {
  console.log('ERROR', err, msg.id)
})
worker.on('exceeded', function (msg: any) {
  console.log('EXCEEDED', msg.id)
})
worker.on('timeout', function (msg: any) {
  console.log('TIMEOUT', msg.id, msg.rc)
})

worker.start()

async function checkTaskInvite(userId: string) {
  const count = await countInvite(prisma, userId)
  if (count == 3) {
    await prisma.balanceChange.create({
      data: {
        userId,
        melon: MELON_TASK_INVITE,
        changeLog: 'TASK',
      },
    })
  }
}

async function checkTaskSpinGame(userId: string, time: Date) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const count = await prisma.balanceChange.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: time,
      },
      userId,
      changeLog: 'SPIN_GAME',
    },
  })
  if (count == 2) {
    await prisma.balanceChange.create({
      data: {
        userId,
        melon: MELON_TASK_SPIN,
        changeLog: 'TASK',
      },
    })
  }
}
async function checkTaskDropGame(userId: string, time: Date) {
  const count = await countDropGame(prisma, userId, time)
  if (count == 5) {
    await prisma.balanceChange.create({
      data: {
        userId,
        melon: MELON_TASK_GAME,
        changeLog: 'TASK',
      },
    })
  }
}
