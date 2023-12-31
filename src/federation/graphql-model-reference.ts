import { ClassType } from 'type-graphql'

export interface EntityReference {
  id: string
  __typename: string
}

export function createEntityReference(
  type: ClassType | string,
  id: string | undefined | null,
): EntityReference | undefined {
  if (id) {
    return { __typename: typeof type === 'string' ? type : type.name, id }
  }
}
