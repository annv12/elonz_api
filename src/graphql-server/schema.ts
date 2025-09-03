import { connectionPlugin, declarativeWrappingPlugin, makeSchema } from 'nexus'
import path from 'path'
import * as types from './graphql-type'
import { NodePlugin } from './nexus-plugin'

const DEBUGGING_CURSOR = true

let fn = DEBUGGING_CURSOR ? (i: string) => i : undefined

export const schema = makeSchema({
  types: types,
  plugins: [
    // NodePlugin({
    //   idFetcher: async ({ id, type }, ctx) => {
    //     let data = await ctx.prisma.user.findUnique({ where: { id } })
    //     console.log("🚀 ~> file: schema.ts ~> line 16 ~> idFetcher: ~> data", data)
    //     if (data) {
    //       // @ts-ignore
    //       data['__typename'] = type
    //       return data
    //     } else {
    //       return
    //     }
    //   },
    // }),
    declarativeWrappingPlugin(),
    connectionPlugin({
      extendConnection: {
        totalCount: { type: 'Int' },
      },
      includeNodesField: true,
      strictArgs: true,
      cursorFromNode(node) {
        return node.id
      },
      encodeCursor: fn,
      decodeCursor: fn,
    }),
  ],
  contextType: {
    module: path.join(__dirname, 'context.ts'),
    export: 'GraphqlContext',
  },
  sourceTypes: {
    modules: [{ module: '@prisma/client', alias: 'PrismaClient' }],
  },
  outputs: {
    typegen: path.join(
      __dirname,
      '../../node_modules/@types/nexus-typegen/index.d.ts',
    ),
    schema: path.join(__dirname, './api.graphql'),
  },
  shouldExitAfterGenerateArtifacts: Boolean(
    process.env.NEXUS_SHOULD_EXIT_AFTER_REFLECTION,
  ),
})
