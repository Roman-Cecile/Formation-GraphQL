import {
  InMemoryCache,
  ApolloClient,
  ApolloProvider
} from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

// const httpLink = new HttpLink({
//   uri: "http://localhost:4000/graphql",
// });

// const wsLink = new WebSocketLink({
//   ur: "ws://localhost:4000/graphql",
//   options: {
//     reconnect: true,
//   },
// });

// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === "OperationDefinition" &&
//       definition.operation === "subscription"
//     );
//   },
//   wsLink,
//   httpLink
// );

// const client = new ApolloClient({
//   link: splitLink,
//   cache: new InMemoryCache(),
// });

const client = new ApolloClient({
  link: createUploadLink({
    uri: "http://localhost:4000/graphql",
  }),
  cache: new InMemoryCache(),
});

export { ApolloProvider, client };
