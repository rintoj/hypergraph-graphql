import { GraphQLScalarType } from 'graphql'

export const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description:
    'The javascript `Date` as string. Type represents date and time as the ISO Date string.',
  serialize(value: number): string {
    return new Date(value).toISOString()
  },
  parseValue(value: number): Date {
    return new Date(value)
  },
})
