import 'reflect-metadata'

import { GraphQLResolverMap } from 'apollo-graphql'
import { sync } from 'fast-glob'
import { AuthChecker, BuildSchemaOptions } from 'type-graphql'
import { GraphQLContext } from '../context/graphql-context-types'
import { buildFederatedSchema } from '../federation/graphql-federated-schema'
import { isInternalClass } from '../gateway/graphql-internal-decorator'

export type Resolvers = Omit<BuildSchemaOptions, 'skipCheck'>
export type ReferenceResolvers = GraphQLResolverMap<any>

export interface GraphQLSchemaConfig {
  resolvers: Resolvers
  referenceResolvers?: ReferenceResolvers
  isLocal?: boolean
  isInternal?: boolean
  context?: () => GraphQLContext
  authChecker?: AuthChecker<GraphQLContext>
}

function isFieldResolver(classDeclaration: any) {
  return /FieldResolver$/.test(classDeclaration.name ?? '')
}

export async function createGraphqlSchema({
  resolvers,
  referenceResolvers,
  authChecker,
  isInternal,
}: GraphQLSchemaConfig) {
  const resolverFunctions = resolvers.resolvers.flatMap(resolverPath => {
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
      ...resolvers,
      resolvers: resolverFunctions as any,
      authChecker,
      emitSchemaFile: false,
      validate: false,
    },
    referenceResolvers,
  )
}
