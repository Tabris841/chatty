import * as path from 'path';
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

import { Mocks } from './mocks';
import { Resolvers } from './resolvers';

const typesArray = fileLoader(path.join(__dirname, '.'), {
  extensions: ['.graphql']
});

export const executableSchema = makeExecutableSchema({
  typeDefs: mergeTypes(typesArray, { all: true }),
  resolvers: Resolvers
});

// addMockFunctionsToSchema({
//   schema: executableSchema,
//   mocks: Mocks,
//   preserveResolvers: true,
// });

export default executableSchema;
