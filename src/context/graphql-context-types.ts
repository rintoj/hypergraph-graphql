import { Request } from 'express'
import { ById } from 'tsds-tools'
import { DependencyContainer } from 'tsyringe'
import { PaginationInput } from '../gql-types'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  INTERNAL = 'INTERNAL',
}

export interface GraphQLContext {
  provider?: string
  providerUserId?: string
  userId?: string
  userRoles?: UserRole[]
  token?: string
  container: DependencyContainer
  repositories?: ById<any>
  pagination?: PaginationInput
  withPagination: (pagination?: PaginationInput) => GraphQLContext
  req?: Request
}
