import 'reflect-metadata'

import { GraphQLResolverMap } from 'apollo-graphql'
import { sync } from 'fast-glob'
import 'reflect-metadata'
import { AuthChecker, NonEmptyArray } from 'type-graphql'
import { GraphQLContext } from '../context/graphql-context-types'
import { buildFederatedSchema } from '../federation/graphql-federated-schema'
import { isInternalClass } from '../gateway/graphql-internal-decorator'

export type ReferenceResolvers = GraphQLResolverMap<any>

export interface GraphQLSchemaConfig {
  // eslint-disable-next-line @typescript-eslint/ban-types
  resolvers: NonEmptyArray<Function> | NonEmptyArray<string>
  // eslint-disable-next-line @typescript-eslint/ban-types
  orphanedTypes?: Function[]
  referenceResolvers?: ReferenceResolvers
  isInternal?: boolean
  authChecker?: AuthChecker<GraphQLContext>
}

function isFieldResolver(classDeclaration: any) {
  return /FieldResolver$/.test(classDeclaration.name ?? '')
}

export async function createGraphqlSchema({
  resolvers,
  orphanedTypes = [],
  referenceResolvers = {},
  isInternal = false,
  authChecker,
}: GraphQLSchemaConfig) {
  const resolverFunctions = resolvers.flatMap(resolverPath => {
    const files = sync(resolverPath as string)
    return files.reduce(
      (a, file) => [
        ...a,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        ...Object.values(require(file)).filter((resolver: any) => {
          if (isFieldResolver(resolver)) return true
          return isInternal ? isInternalClass(resolver) : !isInternalClass(resolver)
        }),
      ],
      [] as any[],
    )
  })
  return await buildFederatedSchema(
    {
      // to avoid getting an error if the number of resolvers are empty
      resolvers: !resolverFunctions.length ? [() => null] : (resolverFunctions as any),
      orphanedTypes,
      emitSchemaFile: false,
      validate: false,
      authChecker,
    },
    referenceResolvers,
  )
}
