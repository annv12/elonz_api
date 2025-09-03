import { customAlphabet } from 'nanoid'
import { Prisma, PrismaClient } from '@prisma/client'
import jwt from '../libs/jwt'
import { YogaInitialContext } from 'graphql-yoga'
import { Address } from '@ton/core'
import { Lock } from 'redlock'

export const nanoid = customAlphabet('1234567890QWERTYUIOPASDFGHJKLZXCVBNM', 8)

type AuthorizedUser = {
  payload?: Payload
  iat?: number
  exp?: number
  aud?: string
  iss?: string
  sub?: string
  userId: string
}
export interface Payload {
  userId: string
  address: string
}

export function getUserId(initialContext: YogaInitialContext): AuthorizedUser {
  const Authorization = initialContext.request?.headers.get('Authorization')
  if (Authorization) {
    try {
      const token = Authorization.replace('Bearer ', '')
      const verifiedToken = jwt.verify(token) as AuthorizedUser
      return { ...verifiedToken, userId: verifiedToken.userId }
    } catch (err) {
      return { userId: undefined }
    }
  } else {
    return { userId: undefined }
  }
}

export async function generateRefId(prisma: PrismaClient) {
  let code = ''
  while (true) {
    code = nanoid() + nanoid()
    let sponsor = await prisma.user.findFirst({
      where: {
        refCode: code,
      },
    })
    if (!sponsor) return code
  }
  return
}

export const generateNonce = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  10,
)

export function getCurrentDate() {
  let now = new Date()
  let month = now.getUTCMonth() + 1
  // month = month < 10 ? '0' + month : month
  let date = now.getUTCDate()
  return `${now.getUTCFullYear()}-${month < 10 ? '0' + month : month}-${
    date < 10 ? '0' + date : date
  }T00:00:00.000Z`
}

export function getNextDay() {
  let now = new Date()
  now.setDate(now.getDate() + 1)
  let month = now.getUTCMonth() + 1
  // month = month < 10 ? '0' + month : month
  let date = now.getUTCDate()
  return `${now.getUTCFullYear()}-${month < 10 ? '0' + month : month}-${
    date < 10 ? '0' + date : date
  }T00:00:00.000Z`
}

export function getCurrentDay() {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)

  const end = new Date()
  end.setUTCHours(23, 59, 59, 999)
  return {
    start,
    end,
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function isUuid(uuid: string) {
  const regex = new RegExp(
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
  )

  return regex.test(uuid)
}

export function getDayDiff(start: Date, end: Date) {
  const time = end.getTime() - start.getTime()
  return Math.ceil(time / 86400000)
}

export function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function parseAddressTon(address: string) {
  try {
    return Address.parseFriendly(address)
  } catch (error) {}
  return null
}

export function getRandomColor() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  )
}

export async function getCoinBalance(prisma: PrismaClient, userId: string) {
  const [balance, total] = await Promise.all([
    prisma.balanceChange.aggregate({
      where: {
        userId,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.balanceChange.aggregate({
      where: {
        userId,
        amount: {
          gt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ])
  return {
    balance: balance._sum?.amount || 0n,
    totalEarned: total._sum?.amount || 0n,
  }
}

export async function releaseLock(lock: Lock) {
  try {
    await lock.release()
  } catch (error) {}
}
