import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { finished } from "stream/promises";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import cors from "cors";
import fs from "fs";

const UPLOAD_FOLDER = "./uploads";

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER);
}

const typeDefs = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }

  type Query {
    otherFields: Boolean!
  }
  type Mutation {
    uploadFile(file: Upload!): File!
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    uploadFile: async (_, { file }) => {
      try {
        console.log("FILE ===========", file)
        const { createReadStream, filename, mimetype, encoding } = await file;
        const stream = createReadStream();
        const path = `${UPLOAD_FOLDER}/${filename}`;
        await finished(stream.pipe(fs.createWriteStream(path)));
        return {
          filename,
          mimetype,
          encoding,
          url: `http://localhost:4000/${path}`,
        };
      } catch (error) {
        console.log("ERROR ===========", error);
      }
    },
  },
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    stopOnTerminationSignals: false,
    cache: "bounded",
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });
  await server.start();

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(
    graphqlUploadExpress({ maxFieldSize: 2 * 1000 * 1000, maxFiles: 10 })
  );

  app.use("/uploads", express.static(UPLOAD_FOLDER));
  server.applyMiddleware({ app });

  await new Promise((r) => app.listen({ port: 4000 }, r));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
startServer();
