import { ApolloServer } from 'apollo-server-express'
import { Request } from 'express'
import { GraphQLSchema } from 'graphql'
import 'reflect-metadata'
import { serviceContext } from '../context/graphql-context'
import { GraphQLContext } from '../context/graphql-context-types'
import { formatError } from '../util/graphql-error-handler'
import graphqlRequestLogger from '../util/graphql-request-logger'

export interface GraphQLServerConfig {
  schema: GraphQLSchema
  isLocal?: boolean
  context?: (props: { req: Request }) => Promise<GraphQLContext>
}

export function initializeGraphqlServer({
  schema,
  context = serviceContext,
  isLocal = false,
}: GraphQLServerConfig) {
  const server = new ApolloServer({
    schema,
    context,
    formatError,
    playground: true,
    introspection: true,
    plugins: [isLocal ? graphqlRequestLogger : {}],
  })
  return server.getMiddleware({
    path: process.env.SERVICE_NAME ? `/${process.env.SERVICE_NAME}/graphql` : undefined,
    bodyParserConfig: {
      limit: '100mb',
    },
  })
}
