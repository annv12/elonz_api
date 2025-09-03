import { rule, shield } from 'graphql-shield'
import { AuthenticationError } from '../../libs/errors'
import { GraphqlContext } from '../context'

const rules = {
  isAuthenticatedUser: rule()((parent, args, ctx: GraphqlContext) => {
    if (ctx.user) {
      return true
    }
    return new AuthenticationError('UNAUTHENTICATED')
  }),
}

const isAuthAndHealthy = rules.isAuthenticatedUser

export const permissions = shield(
  {
    // Query: {
    //   animals: isAuthAndHealthy,
    //   grownPets: isAuthAndHealthy,
    //   myPets: isAuthAndHealthy,
    //   userOverview: isAuthAndHealthy,
    //   myFacilities: isAuthAndHealthy,
    //   foods: isAuthAndHealthy,
    //   treatments: isAuthAndHealthy,
    //   facilities: isAuthAndHealthy,
    //   decorations: isAuthAndHealthy,
    //   backgrounds: isAuthAndHealthy,
    //   unusedFood: isAuthAndHealthy,
    //   myCollection: isAuthAndHealthy,
    // },
    // Mutation: {
    //   buyAnimal: isAuthAndHealthy,
    //   markFavourite: isAuthAndHealthy,
    //   updatePetName: isAuthAndHealthy,
    //   updateColor: isAuthAndHealthy,
    //   stayJuvenile: isAuthAndHealthy,
    //   addAnimalToFarm: isAuthAndHealthy,
    //   buyFood: isAuthAndHealthy,
    //   buyTreatment: isAuthAndHealthy,
    //   buyFacility: isAuthAndHealthy,
    //   upgradeFacility: isAuthAndHealthy,
    //   buyDecoration: isAuthAndHealthy,
    //   buyBackground: isAuthAndHealthy,
    //   buySlot: isAuthAndHealthy,
    //   cleanPoop: isAuthAndHealthy,
    //   claimCoin: isAuthAndHealthy,
    //   editNamePasture: isAuthAndHealthy,
    //   setting: isAuthAndHealthy,
    //   updateBackground: isAuthAndHealthy,
    // },
    // Subscription: {
    //   coinChange: isAuthAndHealthy,
    //   grownPet: isAuthAndHealthy,
    //   cleanPoop: isAuthAndHealthy,
    // },
  },
  {
    allowExternalErrors: true,
    // @ts-ignore
    fallbackError: (thrownThing, parent, args, context, info) => {
      return thrownThing
    },
  },
)
