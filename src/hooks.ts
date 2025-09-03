import { ethers } from 'ethers'
import { MoralisStreamTransactions } from './moralis'
import { prisma } from './graphql-server/context'
import { getIdoContract, provider } from './helpers/contract-accessor'
import { getIdoAddress } from './helpers/addressHelpers'

export async function monitorIdo(req, res) {
  const data: MoralisStreamTransactions = req.body
  if (!data.confirmed) return res.status(200).json({ message: 'Not confirmed' })
  try {
    const { logs } = data
    if (!logs.length) {
      return res.status(200).json({ message: 'No transactions' })
    }
    const hash = logs[0].transactionHash
    const [existsIdo, existsReward] = await Promise.all([
      prisma.ido.findFirst({
        where: {
          hash,
        },
      }),
      prisma.reward.findFirst({
        where: {
          hash,
        },
      }),
    ])
    if (existsIdo || existsReward) {
      return res.status(200).json({ message: 'exitst hash' })
    }
    const transaction = await provider.getTransactionReceipt(hash)
    await handleTransaction(transaction)
    return res.status(200).json({ message: 'Done' })
  } catch (error) {
    const now = new Date().toISOString()
    console.log(now, '🚀 ~ file: Webhooks.ts:150 ~ monitorIdo ~ error:', error)
    res.status(400).json({ error: true, message: error.message })
  }
}
const idoAddress = getIdoAddress()
const idoContract = getIdoContract()

async function handleTransaction(transaction: ethers.TransactionReceipt) {
  const logs = transaction.logs.filter(
    (log) => log.address.toLowerCase() == idoAddress.toLowerCase(),
  )
  if (!logs.length) {
    return false
  }
  for (let log of logs) {
    const dataLog = await idoContract.interface.parseLog({
      data: log.data,
      topics: log.topics,
    })
    if (dataLog.name == 'Purchased') {
      const amountBnb = Number(ethers.formatEther(dataLog.args['amountBnb']))
      await prisma.ido.create({
        data: {
          createdAt: new Date(
            Number(dataLog.args['timestamp']) * 1000,
          ).toISOString(),
          wallet: ethers.getAddress(dataLog.args['account']),
          amountBnb,
          amountUsd: Number(ethers.formatEther(dataLog.args['amountUsd'])),
          amountToken: Number(ethers.formatEther(dataLog.args['amountToken'])),
          action: amountBnb > 0 ? 'BUY_BNB' : 'BUY_USDT',
          price: Number(ethers.formatEther(dataLog.args['price'])),
          hash: transaction.hash,
        },
      })
    }
    if (dataLog.name == 'RefReward') {
      const amount = Number(ethers.formatEther(dataLog.args['rewardUsd']))
      await prisma.reward.create({
        data: {
          createdAt: new Date(
            Number(dataLog.args['timestamp']) * 1000,
          ).toISOString(),
          user: ethers.getAddress(dataLog.args['sponsor']),
          ref: ethers.getAddress(dataLog.args['user']),
          amount,
          action: 'REWARD',
          price: Number(ethers.formatEther(await idoContract.priceUsd())),
          hash: transaction.hash,
        },
      })
    }
    if (dataLog.name == 'ClaimReward') {
      const amount = Number(ethers.formatEther(dataLog.args['amount']))
      await prisma.reward.create({
        data: {
          createdAt: new Date(
            Number(dataLog.args['timestamp']) * 1000,
          ).toISOString(),
          user: ethers.getAddress(dataLog.args['user']),
          ref: ethers.getAddress(dataLog.args['user']),
          amount,
          amountBnb: Number(ethers.formatEther(dataLog.args['amountBnb'])),
          action: 'CLAIM',
          price: Number(ethers.formatEther(await idoContract.priceUsd())),
          hash: transaction.hash,
        },
      })
    }
    if (dataLog.name == 'ConvertReward') {
      const data = await prisma.ido.create({
        data: {
          createdAt: new Date(
            Number(dataLog.args['timestamp']) * 1000,
          ).toISOString(),
          wallet: ethers.getAddress(dataLog.args['user']),
          amountBnb: 0,
          amountUsd: Number(ethers.formatEther(dataLog.args['amountUsd'])),
          amountToken: Number(ethers.formatEther(dataLog.args['amountToken'])),
          action: 'CONVERT',
          price: Number(ethers.formatEther(dataLog.args['price'])),
          hash: transaction.hash,
        },
      })
      await prisma.reward.create({
        data: {
          createdAt: data.createdAt,
          user: data.wallet,
          ref: data.wallet,
          amount: -data.amountUsd,
          amountBnb: 0,
          action: 'CONVERT',
          price: data.price,
          hash: transaction.hash,
        },
      })
    }
  }
}
