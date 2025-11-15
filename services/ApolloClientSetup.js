import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT

const httpLink = new HttpLink({
  uri: 'https://api-us-west-2.hygraph.com/v2/cluv5zjbi0rkm07uwrz17d03v/master',
});

const cache = new InMemoryCache({
  typePolicies: {
    Article: {
      // If your schema uses a different unique field (e.g., "slug"),
      // set keyFields accordingly or ensure queries include "id".
      fields: {
        content: {
          // Replace the nested rich-text object instead of attempting to merge it.
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache,
});

export default client;