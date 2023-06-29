import { GraphQLContext } from '../context/graphql-context-types'

interface ClassType<T = any> {
  new (...args: any[]): T
}

interface Repository<T> {
  findById: (id: string | null | undefined) => Promise<T | null>
}

export function referenceResolver<T>(repositoryClass: ClassType<Repository<T>>) {
  return {
    __resolveReference: async (
      reference: { id?: string },
      context: GraphQLContext | any,
    ): Promise<T | null> => {
      if (!reference.id) return null
      return context.container.resolve(repositoryClass)?.findById(reference.id) ?? null
    },
  }
}
