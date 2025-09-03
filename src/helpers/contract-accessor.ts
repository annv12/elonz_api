import 'dotenv/config'
import { ethers } from 'ethers'

import { IdoContract__factory } from '../types/ethers/'
import { getIdoAddress } from './addressHelpers'

const RPC_NODE_1 = process.env.RPC_NODE_1
const RPC_NODE_2 = process.env.RPC_NODE_2
const RPC_NODE_3 = process.env.RPC_NODE_3

export const providers = [RPC_NODE_1, RPC_NODE_2, RPC_NODE_3]

export function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getProvider() {
  const selectedRpc = providers[getRndInteger(0, providers.length - 1)]
  // console.log('🚀 ~> selectedRpc', selectedRpc)
  return new ethers.JsonRpcProvider(selectedRpc)
}

export function getProviderByChain(rpc_urls: string[]) {
  const selectedRpc = rpc_urls[getRndInteger(0, rpc_urls.length - 1)]
  return new ethers.JsonRpcProvider(selectedRpc)
}

export const provider = getProvider()

export function getIdoContract( signer?: any) {
  const provider = getProvider()
  return IdoContract__factory.connect(getIdoAddress(), signer || provider)
}

