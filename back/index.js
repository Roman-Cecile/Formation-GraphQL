// import express from "express";
// const app = express();
// const port = 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  # This "Book" type defines the queryable fields for every book in our data source.

  type Book {
    id: Int
    title: String
    author: Author
    number: Int
  }

  type Author {
    id: Int
    name: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    book(id: Int!): Book
  }

  type Mutation {
    removeBook(id: Int!): Book
    updateBook(id: Int!, title: String, author: String): Book
    addBook(title: String!, author: String!): Book
  }
`;

const books = [
  {
    id: 1,
    title: "The Awakening",
    number: 10,
    author:{
        id: 1,
        name: "Kate Chopin"
    },
  },
  {
    id: 2,
    title: "City of Glass",
    number: 20,
    author: {
        id: 2,
        name: "Paul Auster"
    },
  },
];

const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id } ) => books.find((book) => book.id === id)
  },
  Mutation: {
    removeBook: (_, { id }) => {
      const bookIndex = books.findIndex((book) => book.id === id);
      if (bookIndex === -1) {
        throw new Error("Book not found");
      }
      const removedBook = books.splice(bookIndex, 1);
      return removedBook[0];
    },
    updateBook: (_, { id, title, author }) => {
      const bookIndex = books.findIndex((book) => book.id === id);
      if(bookIndex === -1) {
        throw new Error("Book not found");
      }
      const updatedBook = books[bookIndex]
      if(title) {
       updatedBook.title = title;
      }
      if(author) {
        updatedBook.author = author;
      }

      books[bookIndex] = updatedBook;
      return updatedBook

    },
    addBook: (_, { title, author }) => {
      const newBook = {
        id: books.length + 1,
        title,
        author,
        number: books.length + 10
      };
      books.push(newBook);
      return newBook;
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
