// import { subscriptionField, objectType } from 'nexus'
// import { GrownPet } from 'src/graphql-server/graphql-type/Animal'

// export const GrownPetPayload = objectType({
//   name: 'GrownPetPayload',
//   definition: (t) => {
//     t.list.field('pets', { type: GrownPet })
//   },
// })
// export const CleanPoopPayload = objectType({
//   name: 'CleanPoopPayload',
//   definition: (t) => {
//     t.string('totalClean')
//   },
// })
// export const CoinchangePayload = objectType({
//   name: 'CoinchangePayload',
//   definition: (t) => {
//     t.string('totalEarned')
//     t.string('balance')
//   },
// })

// export const grownPetSubscription = subscriptionField('grownPet', {
//   type: GrownPet,

//   subscribe: async (_, args, ctx) => {
//     return ctx.pubsub.asyncIterator(`grown-pet.${ctx.user}`)
//   },
//   resolve: (payload: any) => {
//     if (payload) return payload
//   },
// })

// export const coinChangeSubscription = subscriptionField('coinChange', {
//   type: CoinchangePayload,

//   subscribe: async (_, args, ctx) => {
//     return ctx.pubsub.asyncIterator(`coin-change.${ctx.user}`)
//   },
//   resolve: (payload: any) => {
//     if (payload) return payload
//   },
// })

// export const cleanPoop = subscriptionField('cleanPoop', {
//   type: CleanPoopPayload,

//   subscribe: async (_, args, ctx) => {
//     return ctx.pubsub.asyncIterator(`clean-poop.${ctx.user}`)
//   },
//   resolve: (payload: any) => {
//     if (payload) return payload
//   },
// })
