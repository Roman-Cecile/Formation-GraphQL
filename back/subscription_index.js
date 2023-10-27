import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import http from "http";
import { PubSub } from "graphql-subscriptions";

import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { execute, subscribe } from "graphql";

const pubsub = new PubSub();

const typeDefs = gql`
  type Message {
    content: String
    id: Int
  }

  type Mutation {
    addMessage(content: String): Message
  }

  type Query {
    messages: [Message]
    addMessage(messageContent: String!): Message
  }

  type Subscription {
    messageAdded: Message
  }
`;

let messages = [];
let messageId = 1;

const resolvers = {
  Mutation: {
    addMessage: (_, { content }) => {
      const messageToSend = {
        id: messageId++,
        content: content,
      };
      messages.push(messageToSend);
      pubsub.publish("MESSAGE_ADDED", { messageAdded: messageToSend });
      return messageToSend;
    },
  },
  Query: {
    messages: () => messages,
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(["MESSAGE_ADDED"]),
    },
  },
};

const app = express();
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context: ({ req, res }) => {
    return {
      req,
      res,
      pubsub,
    };
  },
});

const startServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const httpServer = http.createServer(app);
  const PORT = 4000;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
  
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );
};

startServer();
