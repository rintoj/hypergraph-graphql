import { DocumentNode } from 'graphql'
import { createContext } from '../context/graphql-context'
import { GraphQLContext } from '../context/graphql-context-types'
import { resolveGatewayService } from '../gateway/graphql-gateway-service'

export interface QueryHookOptions<RequestType> {
  query?: DocumentNode
  variables?: RequestType
  skip?: boolean
  context?: GraphQLContext
}

export async function useQuery<QueryType, RequestType>(
  query: DocumentNode,
  options?: QueryHookOptions<RequestType>,
): Promise<QueryType> {
  const gatewayService = resolveGatewayService()
  const source = query?.loc?.source?.body
  if (!source) {
    throw new Error(`useQuery: query must have a source`)
  }
  if (options?.skip) {
    throw new Error(`useQuery: skip is not supported in gateway service`)
  }
  return (await gatewayService.runGraphQLQuery(
    { query: source, variables: options?.variables },
    options?.context ?? createContext(),
  )) as QueryType
}
