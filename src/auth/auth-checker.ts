import { intersection } from 'lodash'
import { AuthChecker, ResolverData } from 'type-graphql'
import { GraphQLContext, UserRole } from '../context'

export type IdSelector = <T>(props: { context: GraphQLContext; args: T }) => string

export function isAdmin() {
  return async ({ context }: { context: GraphQLContext }): Promise<boolean> => {
    return (
      (context.userRoles ?? []).includes(UserRole.ADMIN) ||
      (context.userRoles ?? []).includes(UserRole.INTERNAL)
    )
  }
}

export const authChecker: AuthChecker<GraphQLContext> = async (
  { context, args, info, root },
  allowedRolesOrRule: string[] | Array<(data: ResolverData<GraphQLContext>) => boolean>,
) => {
  if (context.userId != undefined && (await isAdmin()({ context }))) {
    return true
  }

  if (
    allowedRolesOrRule &&
    typeof allowedRolesOrRule[0] === 'function' &&
    allowedRolesOrRule[0]({ context, args, info, root })
  ) {
    return true
  }

  const allowedRoles: UserRole[] =
    allowedRolesOrRule.length === 0
      ? [UserRole.USER]
      : [...(allowedRolesOrRule as any[]).filter(i => typeof i === 'string')]

  if (intersection(context.userRoles, allowedRoles as any).length > 0) {
    return true
  }

  throw new Error('Unauthorized')
}
