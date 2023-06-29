import 'reflect-metadata'
import { Directive, ObjectType, ObjectTypeOptions } from 'type-graphql'

export function ShareableType(name?: string, options?: ObjectTypeOptions): ClassDecorator {
  return (target: any) => {
    Directive('@key(fields: "id")')(target)
    return ObjectType(name as string, options)(target)
  }
}
