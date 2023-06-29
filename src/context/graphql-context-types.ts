import { Request } from 'express'
import { DependencyContainer } from 'tsyringe'

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
  req?: Request
}
