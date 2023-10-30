import { Request } from 'express'
import { ById } from 'tsds-tools'
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
  repositories?: ById<any>
  req?: Request
}
