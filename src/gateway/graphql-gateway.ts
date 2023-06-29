import { ApolloGateway } from '@apollo/gateway'
import { ApolloServer } from 'apollo-server-express'
import 'reflect-metadata'

interface GraphQLServerConfig {
  gateway?: ApolloGateway
}

export async function initializeGraphqlGateway({ gateway }: GraphQLServerConfig) {
  try {
    const server = new ApolloServer({
      gateway,
      subscriptions: false,
      playground: true,
    })
    await server.start()
    return server.getMiddleware()
  } catch (e) {
    console.error(e)
  }
}
