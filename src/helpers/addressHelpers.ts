import addresses from '../config/constants/contracts'
import { Address } from '../config/constants/types'

export const getAddress = (address: Address): string => {
  const chainId = process.env.CHAIN_ID

  if (!chainId) {
    throw new Error(`Missing 'CHAIN_ID' in environment variables`)
  }

  // @ts-ignore
  return address[chainId]
}

export const getIdoAddress = () => {
  return getAddress(addresses.ido)
}

export const getUsdtAddress = () => {
  return getAddress(addresses.usdt)
}
