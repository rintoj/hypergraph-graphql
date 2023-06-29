import fetch from 'node-fetch'
import { container, singleton } from 'tsyringe'
import { GraphQLContext } from '../context/graphql-context-types'
import { INTERNAL_AUTH_TOKEN } from '../context/graphql-internal-token'

const GATEWAY_URL = process.env.GATEWAY_URL as string

interface Query<T> {
  query: string
  variables?: T
}

interface AuthHeader {
  Authorization?: string
  'x-auth-token'?: string
}

function getAuthHeader(context: GraphQLContext): AuthHeader {
  if (context.token) {
    return { Authorization: `Bearer ${context.token}` }
  } else if (INTERNAL_AUTH_TOKEN) {
    return { 'x-auth-token': INTERNAL_AUTH_TOKEN }
  }
  return {}
}

@singleton()
export class GatewayService {
  constructor() {
    if (!GATEWAY_URL) {
      throw new Error(
        'Missing a required variable variable: "GATEWAY_URL", failed to initialize GraphQLService',
      )
    }
  }

  public async runGraphQLQuery<T, V = any>(query: Query<V>, context: GraphQLContext): Promise<T> {
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeader(context),
      },
      body: JSON.stringify(query),
    })
    if (!response.ok) {
      throw new Error(`GatewayService: service request failed - ${await response.text()}`)
    }
    const { errors, data } = await response.json()
    if (errors?.length) {
      throw new Error(errors[0].message)
    }
    return data
  }
}

export function resolveGatewayService() {
  return container.resolve(GatewayService)
}
