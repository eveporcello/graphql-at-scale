const { ApolloServer } = require("@apollo/server");
const {
  startStandaloneServer,
} = require("@apollo/server/standalone");
const { gql } = require("graphql-tag");
const lifts = require("./lift-data.json");
const fs = require("fs");

const gqlFile = fs.readFileSync(
  "./lifts-schema.graphql",
  "UTF-8"
);
const typeDefs = gql(gqlFile);

const resolvers = {
  Query: {
    allLifts: (root, { status }) =>
      !status
        ? lifts
        : lifts.filter((lift) => lift.status === status),
    Lift: (root, { id }) =>
      lifts.find((lift) => id === lift.id),
    liftCount: (root, { status }) =>
      !status
        ? lifts.length
        : lifts.filter((lift) => lift.status === status)
            .length,
  },
  Mutation: {
    setLiftStatus: (root, { id, status }) => {
      let updatedLift = lifts.find(
        (lift) => id === lift.id
      );
      updatedLift.status = status;
      return updatedLift;
    },
  },
};

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 5000 },
  });
  console.log(`Server running at ${url}`);
}
startApolloServer();
