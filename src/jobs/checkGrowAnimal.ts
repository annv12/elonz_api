import { PrismaClient } from '@prisma/client'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { getGrownPets } from 'src/graphql-server/graphql-type'
import { checkAnimalAdult } from 'src/helpers/animal'

export async function checkAnimalGrow(
  prisma: PrismaClient,
  pubsub: RedisPubSub,
) {
  const animals = await prisma.pet.findMany({
    where: {
      isAdult: false,
    },
    include: {
      Animal: true,
    },
  })
  const now = Date.now()
  const pets = animals.filter((animal) => checkAnimalAdult(animal, now))

  await prisma.pet.updateMany({
    where: {
      id: { in: pets.map((item) => item.id) },
    },
    data: {
      isAdult: true,
    },
  })
  const users = pets.reduce(
    (rs, item) => ({
      ...rs,
      [item.userId]: item.userId,
    }),
    {} as Record<string, string>,
  )

  // await Promise.all(
  //   Object.values(users).map(async (user) => {
  //     const animals = await getGrownPets(prisma, user)
  //     pubsub.publish(`grown-pet.${user}`, {
  //       pets: animals,
  //     })
  //   }),
  // )
}
