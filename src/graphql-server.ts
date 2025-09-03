import { permissions } from './graphql-server/permissions'
import { createYoga } from 'graphql-yoga'
import { createContext } from './graphql-server/context'
import { schema } from './graphql-server/schema'
import { applyMiddleware } from 'graphql-middleware'

export const graphqlServer = createYoga({
  graphqlEndpoint: '/graphql',
  schema: applyMiddleware(schema, permissions),
  context(initialContext) {
    return createContext(initialContext)
  },
  graphiql: {
    // Use WebSockets in GraphiQL
    subscriptionsProtocol: 'WS',
  },
})
