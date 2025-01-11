import { Container } from '@prisma/client'
import dbClient from '../core/clients/db-prisma'

const container = {
  create: async (
    mnemonic: string[],
    permutations: number,
    slug: string,
  ): Promise<Container> => {
    return await dbClient.container.create({
      data: {
        mnemonic: mnemonic,
        permutations: permutations,
        slug: slug,
      },
    })
  },
  get: async (id: string) => {
    return await dbClient.container.findUnique({
      where: {
        id: id,
      },
    })
  },
  generateUniqueSlug: (): string => {
    const randomLetter = String.fromCharCode(
      97 + Math.floor(Math.random() * 26),
    ) // 'a' to 'z'

    // Generate the rest of the string
    const randomString = `${Math.random()
      .toString(36)
      .substring(2, 8)}${Date.now().toString(36)}`

    // Combine the random letter with the rest of the string
    return `${randomLetter}${randomString}`
  },
}
const dbPrismaProvider = { container }

export default dbPrismaProvider
