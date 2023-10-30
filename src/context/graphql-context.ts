import { Request } from 'express'
import { ById } from 'tsds-tools'
import { container } from 'tsyringe'
import { GraphQLContext, UserRole } from './graphql-context-types'
import { INTERNAL_AUTH_TOKEN } from './graphql-internal-token'

function toBase64(object: any) {
  const str = JSON.stringify(object)
  return Buffer.from(str).toString('base64')
}

function fromBase64<T>(base64String: string | undefined): T | undefined {
  if (base64String == null) {
    return undefined
  }
  try {
    const json = Buffer.from(base64String, 'base64').toString()
    return JSON.parse(json)
  } catch (e) {
    throw new Error('Invalid base64 string')
  }
}

export interface TokenVerifier {
  (token: string): Promise<null | {
    userId: string
    providerUserId: string
    userRoles: UserRole[]
  }>
}

export interface RepositoryResolver {
  (context: GraphQLContext): ById<any>
}

export function createGQLContext(
  verifyToken?: TokenVerifier,
  createRepoResolver?: RepositoryResolver,
) {
  return async function graphQLContext({ req }: { req: Request }): Promise<GraphQLContext> {
    const authorization = req?.headers?.authorization
    const internalAuthToken = req?.headers?.[`x-auth-token`] as string | undefined
    const context: GraphQLContext = { container: container.createChildContainer(), req }
    context.repositories = createRepoResolver?.(context)
    if (internalAuthToken && internalAuthToken === INTERNAL_AUTH_TOKEN) {
      return {
        ...context,
        userId: 'SYSTEM',
        userRoles: [UserRole.INTERNAL],
      }
    }

    if (authorization && verifyToken) {
      try {
        const token = authorization.replace(/Bearer /i, '')
        const decoded = await verifyToken(token)
        if (!decoded) throw new Error('Invalid bearer token!')
        return {
          ...context,
          token,
          providerUserId: decoded.providerUserId,
          userId: decoded.userId,
          userRoles: decoded.userRoles,
        }
      } catch (e) {
        console.warn('Invalid authorization token!', e)
      }
    }
    return context
  }
}

export function encodeGQLContext(context: GraphQLContext) {
  return toBase64(context)
}

export async function serviceContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const token = req?.headers?.[`x-token`] as string | undefined
  const userToken = req?.headers?.[`x-user-token`] as string | undefined
  if (userToken) {
    try {
      const context = fromBase64<GraphQLContext>(userToken) ?? {}
      return {
        ...context,
        token,
        container: container.createChildContainer(),
        req,
      }
    } catch (e) {
      console.log('Invalid x-user-token!')
    }
  }

  return { container: container.createChildContainer(), req }
}

export function subscriberContext(): GraphQLContext {
  return { container: container.createChildContainer() }
}

export function cliContext(): GraphQLContext {
  return { container: container.createChildContainer() }
}
