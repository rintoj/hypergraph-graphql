import 'reflect-metadata'
import { Directive, Field, FieldOptions, ObjectType, ObjectTypeOptions } from 'type-graphql'
import { MethodAndPropDecorator, ReturnTypeFunc } from 'type-graphql/dist/decorators/types'

export function ExternalType(name?: string, options?: ObjectTypeOptions): ClassDecorator {
  return (target: any) => {
    Directive('@extends')(target)
    Directive('@key(fields: "id")')(target)
    return ObjectType(name as string, options)(target)
  }
}

export function ExternalField(
  returnTypeFunction?: ReturnTypeFunc,
  options?: FieldOptions,
): MethodAndPropDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Directive('@external')(target, propertyKey)
    return Field(returnTypeFunction, options)(target, propertyKey)
  }
}
