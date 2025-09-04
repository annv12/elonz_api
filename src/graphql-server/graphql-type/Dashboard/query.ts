import { extendType, stringArg, intArg,  nonNull } from 'nexus'
import 'dotenv/config'

import {
  AccountOverview,
  AggregatePayload,
  HolderItem,
  IdoOverview,
  Place,
  RefferalsOverview,
  TransactionItem,
} from './types'
import { getIdoContract } from 'src/helpers/contract-accessor'
import { ethers } from 'ethers'
import { getNextPrice, stages } from '../../../config/constants'

export const UserQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.field('accountOverview', {
      type: AccountOverview,
      args: {
        account: nonNull(stringArg()),
      },
      resolve: async (_, { account }, ctx) => {
        try {
          const contract = getIdoContract()
          const balance = Number(
            ethers.formatEther(await contract.buyAmount(account)),
          )
          return {
            balance: balance.toString(),
            tokenWorth: (balance * 0.005).toString(),
            address: account,
          }
        } catch (error) {
          return {
            balance: '0',
            tokenWorth: '0',
            address: account,
          }
        }
      },
    })
    t.field('idoOverview', {
      type: IdoOverview,
      resolve: async (_, args, ctx) => {
        const contract = getIdoContract()
        const [usdRaised, tokensSold, price] = await Promise.all([
          contract.usdRaised(),
          contract.tokensSold(),
          contract.priceUsd(),
        ])
        const curPrice = ethers.formatEther(price)
        return {
          usdRaised: ethers.formatEther(usdRaised),
          tokensSold: ethers.formatEther(tokensSold),
          price: curPrice,
          nextPrice: getNextPrice(curPrice),
          stage: stages[curPrice],
        }
      },
    })

    t.list.field('holders', {
      type: HolderItem,
      args: { limit: intArg(), skip: intArg() },
      resolve: async (_, { limit = 10, skip = 0 }, ctx) => {
        const data = await ctx.prisma.ido.groupBy({
          by: ['wallet'],
          _sum: {
            amountToken: true,
          },
          orderBy: {
            _sum: {
              amountToken: 'desc',
            },
          },
          skip,
          take: limit,
        })
        return data.map((item) => ({
          wallet: item.wallet,
          amount: item._sum.amountToken?.toString() || '0',
        }))
      },
    })
    t.field('holderAggregate', {
      type: AggregatePayload,
      resolve: async (_, args, ctx) => {
        const data = await ctx.prisma.ido.findMany({
          distinct: ['wallet'],
          select: {
            wallet: true,
          },
        })
        return { count: data.length }
      },
    })

    t.field('myPlace', {
      type: Place,
      args: { account: stringArg() },
      resolve: async (_, { account }, ctx) => {
        const data = await ctx.prisma.ido.groupBy({
          by: ['wallet'],
          _sum: {
            amountToken: true,
          },
          orderBy: {
            _sum: {
              amountToken: 'desc',
            },
          },
        })
        const index = data.findIndex((item) => item.wallet == account)
        console.log('🚀 ~ index:', index)
        return index == -1
          ? { wallet: account, amount: '0', place: '0' }
          : {
              wallet: account,
              amount: data[index]._sum.amountToken.toString(),
              place: index + 1,
            }
      },
    })

    t.list.field('transactions', {
      type: TransactionItem,
      args: { account: nonNull(stringArg()), limit: intArg(), skip: intArg() },
      resolve: async (_, { account, limit = 10, skip = 0 }, ctx) => {
        const data = await ctx.prisma.ido.findMany({
          where: { wallet: ethers.getAddress(account) },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        })
        return data.map((item) => ({
          stage: stages[item.price.toString()],
          investedAmount: (item.action == 'BUY_BNB'
            ? item.amountBnb
            : item.amountUsd
          ).toString(),
          receivedAmount: item.amountToken.toString(),
          buyType: item.action == 'BUY_BNB' ? 'BNB' : 'USDT',
          price: item.price.toString(),
          hash: item.hash,
        }))
      },
    })
    t.field('transactionAggregate', {
      type: AggregatePayload,
      args: { account: nonNull(stringArg()) },
      resolve: async (_, { account }, ctx) => {
        const count = await ctx.prisma.ido.count({
          where: { wallet: account },
        })
        return { count }
      },
    })

    t.field('refferalsOverview', {
      type: RefferalsOverview,
      args: { account: nonNull(stringArg()) },
      resolve: async (_, { account }, ctx) => {
        const contract = getIdoContract()
        const [raisedViaRef, balance, referrals] = await Promise.all([
          contract.raisedRef(account),
          contract.refRewards(account),
          contract.countRef(account),
        ])
        return {
          raisedViaRef: ethers.formatEther(raisedViaRef),
          balance: ethers.formatEther(balance),
          referrals: referrals.toString(),
        }
      },
    })
  },
})
