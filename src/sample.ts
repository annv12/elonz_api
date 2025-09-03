import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })

import { TonClient, WalletContractV4 } from '@ton/ton'
// import Counter from "../wrappers/Counter"; // this is the interface class we just implemented
// keyPairFromSecretKey
import {
  keyPairFromSecretKey,
  mnemonicToPrivateKey,
  // sign,
  // signVerify,
} from 'ton-crypto'
import { sign, signVerify } from '@ton/crypto'
import { Address, beginCell, safeSign, safeSignVerify } from '@ton/core'

export async function run() {
  const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: '6abbc3703044980bbf419058feed619011c5463f9854d305a4b2245bcf7b2d34',
  })

  const mnemonic =
    'sister second famous round alley drum pink country return pact minute liberty assume major grunt rocket shop violin creek leaf grass history usage sign' // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToPrivateKey(mnemonic.split(' '))
  key.publicKey
  const wallet = client.open(
    WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    }),
  )
  const data = sign(Buffer.from('Login code: NOIDetcGdy'), key.secretKey)
  console.log(data.toString('base64'))
  console.log(key.publicKey.toString('base64'))
  // const valid = signVerify(
  //   Buffer.from('TG9naW4gY29kZTogamFGZlVnYmZNSA==', 'base64'),
  //   Buffer.from(
  //     'dPdPn2fDb0Ey7iTRkWWs8AZ9m/Cwn9YPCp71Tjju82ZjNrAXnbAVI87tst2UqRTgrs3y1csHIf5n7VGHnt+EDQ==',
  //     'base64',
  //   ),
  //   Buffer.from('Viy1UTYq40SpcVJ7XsXXj6cGtufY0cTMYM+Rxa6Z2vA=', 'base64'),
  // )
  // console.log(valid)
  // const data = await safeSign(
  //   beginCell().storeBuffer(Buffer.from('Login code: jaFfUgbfMH')).endCell(),
  //   key.secretKey,
  // )
  // // console.log('🚀 ~ run ~ data:', data)
  // const input = data.toString('base64')
  // // console.log('🚀 ~ run ~ input:', input)
  // console.log(key.publicKey)
  // console.log(Address.)
  // return
  // const valid: boolean = safeSignVerify(
  //   beginCell().storeBuffer(Buffer.from('Login code: jaFfUgbfMH')).endCell(),
  //   Buffer.from(input, 'base64'),
  //   key.publicKey,
  // )
  // console.log(valid)
}

run()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
