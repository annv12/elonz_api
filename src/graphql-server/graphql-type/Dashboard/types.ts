import { enumType, objectType } from 'nexus'
import 'dotenv/config'

export const AccountOverview = objectType({
  name: 'AccountOverview',
  definition(t) {
    t.nonNull.string('balance')
    t.nonNull.string('tokenWorth')
    t.nonNull.string('address')
  },
})
export const RefferalsOverview = objectType({
  name: 'RefferalsOverview',
  definition(t) {
    t.nonNull.string('raisedViaRef')
    t.nonNull.string('balance')
    t.nonNull.string('referrals')
  },
})
export const IdoOverview = objectType({
  name: 'IdoOverview',
  definition(t) {
    t.nonNull.string('usdRaised')
    t.nonNull.string('tokensSold')
    t.nonNull.string('price')
    t.nonNull.string('nextPrice')
    t.nonNull.string('stage')
  },
})
export const HolderItem = objectType({
  name: 'HolderItem',
  definition(t) {
    t.nonNull.string('wallet')
    t.nonNull.string('amount')
  },
})
export const Place = objectType({
  name: 'Place',
  definition(t) {
    t.nonNull.string('wallet')
    t.nonNull.string('amount')
    t.nonNull.string('place')
  },
})

export const BuyType = enumType({
  name: 'BuyType',
  members: ['BNB', 'USDT'],
})

export const TransactionItem = objectType({
  name: 'TransactionItem',
  definition(t) {
    t.nonNull.string('stage')
    t.nonNull.string('investedAmount')
    t.nonNull.string('receivedAmount')
    t.nonNull.field('buyType', { type: BuyType })
    t.nonNull.string('price')
    t.nonNull.string('hash')
  },
})

export const AggregatePayload = objectType({
  name: 'AggregatePayload',
  definition(t) {
    t.int('count')
  },
})
