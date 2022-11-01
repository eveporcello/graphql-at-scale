const { ApolloServer } = require("@apollo/server");
const {
  startStandaloneServer,
} = require("@apollo/server/standalone");
const trails = require("./trail-data.json");
const fs = require("fs");
const { gql } = require("graphql-tag");

const gqlFile = fs.readFileSync(
  "./trails-schema.graphql",
  "UTF-8"
);
const typeDefs = gql(gqlFile);

const resolvers = {
  Query: {
    allTrails: (root, { status }) =>
      !status
        ? trails
        : trails.filter((trail) => trail.status === status),
    Trail: (root, { id }) =>
      trails.find((trail) => id === trail.id),
    trailCount: (root, { status }) =>
      !status
        ? trails.length
        : trails.filter((trail) => trail.status === status)
            .length,
  },
  Mutation: {
    setTrailStatus: (root, { id, status }) => {
      let updatedTrail = trails.find(
        (trail) => id === trail.id
      );
      updatedTrail.status = status;
      return updatedTrail;
    },
  },
};

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 5001 },
  });
  console.log(`Server running at ${url}`);
}
startApolloServer();
