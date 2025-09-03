import cors from 'cors'
import express from 'express'
import { graphqlServer } from './graphql-server'
import { WebSocketServer } from 'ws'
// @ts-ignore
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'node:http'
import { monitorIdo } from './hooks'
const originalStringify = JSON.stringify

JSON.stringify = (value, replacer, space) =>
  originalStringify(
    value,
    (key, val) => (typeof val === 'bigint' ? val.toString() : val),
    space,
  )
const app = express()
const PORT = process.env.PORT ?? 4000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.get('/test', (req, res) => {
  res.json({ error: false, messge:'test trigger' })
})
app.post('/0f38b5aa-8e54-46f6-8464-8afc30976243/stream', monitorIdo)

app.use('/', graphqlServer)

const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

useServer(
  {
    execute: (args: any) => args.rootValue.execute(args),
    subscribe: (args: any) => args.rootValue.subscribe(args),
    onSubscribe: async (ctx, msg) => {
      let headers: any = ctx.extra.request.headers
      let token = headers.cookie
        ?.split(';')
        .find((c: string) => c.trim().startsWith('token'))
        ?.split('=')[1]

      if (!headers.authorization || !headers.Authorization) {
        if (ctx.connectionParams.token)
          headers.authorization = ctx.connectionParams.token
        else if (ctx.connectionParams.Authorization)
          headers.authorization = ctx.connectionParams.Authorization
        else headers.authorization = `Bearer ${token}`
      }
      const { schema, execute, subscribe, contextFactory, parse, validate } =
        graphqlServer.getEnveloped({
          ...ctx,
          req: ctx.extra.request,
          request: {
            ...ctx.extra.request,
            headers: {
              ...headers,
              get: (key: string) => headers[key.toLowerCase()],
            },
          },
          socket: ctx.extra.socket,
        })

      const args = {
        schema,
        // operationName: params.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe,
        },
      }

      const errors = validate(args.schema, args.document)
      if (errors.length) return errors
      return args
    },
  },
  wsServer,
)

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}`)
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`,
  )
})

// watchTransactions().catch(console.error)
