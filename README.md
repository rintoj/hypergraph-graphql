# Hypergraph GraphQL

This package is published to handle all the graphql based implementations that can accelerate the
app development using Hypergraph.

## Install

Using npm:

```sh
npm install @hgraph/graphql
```

Using yarn:

```sh
yarn add @hgraph/graphql
```

## Usage

Create `src/schema.ts`

```ts
import { createGraphqlSchema } from '@hgraph/graphql'

export async function createSchema() {
  return await createGraphqlSchema({
    resolvers: [`${__dirname}/**/*-resolver.ts`],
  })
}
```

Add api server `src/index.ts`

```ts
import 'reflect-metadata'

import { initializeGraphqlServer } from '@hgraph/graphql'
import { bootstrapServer, createMiddleware } from '@hgraph/server'
import { createSchema } from './schema'

async function run() {
  const schema = await createSchema()
  const router = initializeGraphqlServer({ schema })
  await bootstrapServer({
    port: 4000,
    apiRoot: '/api',
    controllers: [`${__dirname}/**/*-controller.{ts,js}`],
    middlewares: [createMiddleware(router)],
  })
}
```

Create a user schema by adding `src/schema/user/user-schema.ts`

```ts
import { Field, ObjectType } from 'type-graphql'
import { Repository } from 'hypergraph-storage'

@ObjectType()
export class User {
  @Field()
  id!: string

  @Field()
  name?: string
}
```

Add resolver `src/resolver/user/user-resolver.ts`

```ts
import { Query, Resolver } from 'type-graphql'
import { User } from '../../schema/user/user'

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me() {
    return null
  }
}
```

Now start the service.

```sh
npx ts-node src/index.ts
```

This will expose a new endpoint [http://localhost:4000/graphql](http://localhost:4000/graphql)

## Auth Checker

Update `src/schema.ts` to add role based auth check

```ts
import { createGraphqlSchema, authChecker } from '@hgraph/graphql'

export async function createSchema() {
  return await createGraphqlSchema({
    resolvers: [`${__dirname}/**/*-resolver.{ts,js}`],
    authChecker,
  })
}
```

You can now restrict queries and mutations to be accessible to authenticated and authorized users.

```ts
import { Authorized, Resolver, UserRole, Query } from 'type-graphql'
import { User } from '../../schema/user/user'

@Resolver()
export class UserResolver {
  @Authorized() // any logged in user can access "me"
  @Query(() => User, { nullable: true })
  me() {
    return null
  }

  @Authorized(UserRole.ADMIN) // only admin user can access "user"
  @Query(() => User, { nullable: true })
  user() {
    return null
  }
}
```

You can have your own implementation of `authChecker` with the help of the following snippet.

```ts
import { GraphQLContext, UserRole, IdSelector } from '@hgraph/graphql'
import { intersection } from 'lodash'
import { AuthChecker, ResolverData } from 'type-graphql'

export const authChecker: AuthChecker<GraphQLContext> = async (
  { context, args, info, root },
  allowedRolesOrRule: string[] | Array<(data: ResolverData<GraphQLContext>) => boolean>,
) => {
  // your implementation
  throw new Error('Unauthorized')
}
```

## Sharable Type

Step 1: Configure the service to enable resolution of user references. Utilize the provided code
snippet to achieve this setup.

```tsx
// user-service/src/schema/user/user-schema.ts
import { ShareableType } from '@hgraph/graphql'
import { Field, ID } from 'type-graphql'

@ShareableType('User')
export class UserSchema {
  @Field(() => ID)
  id!: string

  @Field({ nullable: true })
  name?: string
}

// user-service/src/schema.ts
import { createGraphqlSchema, referenceResolver } from '@hgraph/graphql'
import { UserRepository } from './schema/user/user-repository'

export async function createSchema() {
  return await createGraphqlSchema({
    resolvers: [`${__dirname}/**/*-resolver.ts`],
    referenceResolvers: {
      User: referenceResolver(UserRepository), // ← ADD THIS
    },
  })
}
```

Step 2: In the other service, use `createEntityReference` to instruct the user service to resolve a
user by its ID.

```tsx
// src/query/collaborators-query-resolver.ts
import { createEntityReference } from '@hgraph/graphql'

@Resolver()
export class CollaboratorsQueryResolver {
  @Authorized()
  @Query(() => [UserSchema])
  async collaborators(@Ctx() context: GraphQLContext, @Arg('projectId') projectId: string) {
    const collaborators = await collaboratorRepository.findAll(query =>
      query.whereEqualTo('projectId', projectId),
    )
    // ADD THIS LINE
    return collaborators.map(collaborator => createEntityReference('User', collaborator.userId))
  }
}
```
