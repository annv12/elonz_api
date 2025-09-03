// subscription-client.js
import { createClient } from 'graphql-ws'

const client = createClient({
  url: 'wss://tiny.lunpad.com/graphql',
  // url: 'ws://128.199.98.186:4000/graphql',
  connectionParams: {
    Authorization:
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhY2VmZjZkYS0zNWNlLTQ5ODMtYjE4NS00YzMyMzcyYjYxMzciLCJjaGF0SWQiOiI3MjAxMDg0ODQwIiwiaWF0IjoxNzQ4NTczMTI1LCJleHAiOjE3NTExNjUxMjUsImF1ZCI6Imh0dHBzOi8vZG9tYWluLmNvbSIsImlzcyI6IkRyYWdvbiIsInN1YiI6ImFkbWluQGRvbWFpbi5jb20ifQ.TS9ZMxhuK8AawsSOBT2ndufLwPgLScl8c_LsViji7gYcVVmfQ8SVQXgkqDUYo3gW2983VX4n6KKJZ2UV1NhTiIETmdd65TsLtsD4zku76ZqjgWMY0Ej7UKp_7Pf9Q086sCFPBUIwfNRze28AQAraa0SQwDbPHIquIc43SQLzYTKx80n7xLJJJJFAn7yvHFEp0PwZdnKV8Q0qQonz1fDfe-XhrheqRb8fhqXs5CUQTv4kzbX3Ez_schcAA-gDRVUVn0iqydIaxZI23TE0Xttf1AzlPoG_eLoBOy7S6zD5a5uVT9o-Ey8vszreR-YDuw4SKu67qgevWu75TizwqeqKrw',
  },
})

1

// Tạo subscription query
const query = `
  subscription {
  coinChange{
    balance
    totalEarned
  }
}
`

// Gửi subscription
async function start() {
  console.log('🔗 Connecting to subscription...')

  const onNext = (data) => {
    console.log('📥 Subscription data:', data)
  }

  await new Promise((resolve, reject) => {
    client.subscribe(
      {
        query,
      },
      {
        next: onNext,
        error: reject,
        // @ts-ignore
        complete: resolve,
      },
    )
  })
}

start().catch((err) => {
  console.error('❌ Subscription error:', err)
})
