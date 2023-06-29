import { red } from 'chalk'
import { GraphQLError } from 'graphql'

export function formatError(error: GraphQLError) {
  console.error(red(error.message))
  console.error(error)
  return error
}
