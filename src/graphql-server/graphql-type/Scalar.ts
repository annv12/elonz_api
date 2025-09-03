import { Prisma } from '@prisma/client'
import { GraphQLScalarType, Kind } from 'graphql'
import { asNexusMethod, scalarType } from 'nexus'

///  E X P O R T

const GraphqlDecimal = new GraphQLScalarType({
  name: 'Decimal',
  description: 'The `Decimal` scalar type to represent currency values',

  serialize(value: Prisma.Decimal) {
    return value.toString()
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      // @ts-ignore | TS2339
      throw new TypeError(`${String(ast.value)} is not a valid decimal value.`)
    }

    return new Prisma.Decimal(ast.value)
  },

  parseValue(value: string) {
    return new Prisma.Decimal(value)
  },
})

export const GQLDecimal = asNexusMethod(GraphqlDecimal, 'decimal')
export const BigIntScalar = scalarType({
  name: 'BigInt',
  asNexusMethod: 'bigint', // để dùng .bigint() trong objectType
  description: 'Big integer scalar type',
  parseValue(value: any) {
    return BigInt(value) // từ client -> server
  },
  serialize(value) {
    if (typeof value === 'bigint') return value.toString()
    return value
  },
  parseLiteral(ast) {
    if (ast.kind === 'StringValue' || ast.kind === 'IntValue') {
      return BigInt(ast.value)
    }
    return null
  },
})
