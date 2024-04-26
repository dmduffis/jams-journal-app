import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT

const httpLink = new HttpLink({
  uri: 'https://api-us-west-2.hygraph.com/v2/cluv5zjbi0rkm07uwrz17d03v/master',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;