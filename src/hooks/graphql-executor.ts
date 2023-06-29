import { graphql, GraphQLSchema } from 'graphql'
import { serviceContext } from '../context/graphql-context'

export interface GraphqlRequest<V extends { [id: string]: any } = any, C = any> {
  request: string
  variables?: V
  context?: C
}

export async function runGraphqlRequest(
  schema: GraphQLSchema,
  { request, variables, context = serviceContext }: GraphqlRequest,
) {
  const result = await graphql({
    schema,
    source: request,
    variableValues: variables,
    contextValue: context,
  })

  if (result.errors?.length) {
    const errors = result.errors.map(error => error.message).join(', ')
    throw new Error(`GQL ERROR: ${errors}`)
  }
  return result.data
}
