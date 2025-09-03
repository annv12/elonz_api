import RedisSMQ from 'rsmq'

export const TASK_REWARD_QUEUE = 'TASK_REWARD_QUEUE'

export function initQueue(rsmq: RedisSMQ) {
  // create a queue
  rsmq.createQueue({ qname: TASK_REWARD_QUEUE }, (err) => {
    console.log('start init queue', TASK_REWARD_QUEUE)
    if (err) {
      // if the error is `queueExists` we can keep going as it tells us that the queue is already there
      if (err.name !== 'queueExists') {
        console.error(err)
        return
      } else {
        console.log('queue exists.. resuming..')
      }
    }
  })
}

export async function createQueue(rsmq: RedisSMQ, queueName: string) {
  // create a queue
  try {
    await rsmq.createQueueAsync({ qname: queueName })
  } catch (error) {}
}

export async function sendCheckRewardMessage(data: string, rsmq: RedisSMQ) {
  const queues = await rsmq.listQueuesAsync()
  if (!queues.includes(TASK_REWARD_QUEUE)) {
    await createQueue(rsmq, TASK_REWARD_QUEUE)
  }
  rsmq.sendMessage(
    {
      qname: TASK_REWARD_QUEUE,
      message: data,
    },
    (err) => {
      if (err) {
        console.error(TASK_REWARD_QUEUE, data, err)
        return
      }

      console.log(TASK_REWARD_QUEUE, 'pushed new message into queue..')
    },
  )
}
