import 'reflect-metadata'
import { Field, InputType, Int } from 'type-graphql'

@InputType()
export class PaginationInput {
  @Field({ nullable: true })
  next?: string

  @Field(() => Int, { nullable: true })
  limit?: number
}
