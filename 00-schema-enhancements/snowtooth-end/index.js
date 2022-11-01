const { addMocksToSchema } = require("@graphql-tools/mock");
const {
  makeExecutableSchema,
} = require("@graphql-tools/schema");
const { ApolloServer } = require("@apollo/server");
const {
  startStandaloneServer,
} = require("@apollo/server/standalone");
const lifts = require("./data/lifts.json");
const trails = require("./data/trails.json");
const typeDefs = `
    type Lift {
        id: ID!
        name: String!
        status: LiftStatus!
        capacity: Int
        night: Boolean
        elevationGain: Int!
        url: String!
        trailAccess: [Trail!]!
    }
    enum LiftStatus {
        OPEN
        HOLD
        CLOSED
    }
    type Trail {
        id: ID!
        name: String!
        status: TrailStatus!
        difficulty: String!
        groomed: Boolean!
    }
    enum TrailStatus {
        OPEN
        CLOSED
    }
    union SearchResult = Lift | Trail

    type Query {
        liftCount: Int!
        allLifts: [Lift!]!
        liftById(id: ID!): Lift!
        allTrails: [Trail!]!
        trailById(id: ID!): Trail!
        trailCount(status: TrailStatus): Int!
        else: Int!
        search(term: String): [SearchResult!]!
    }
`;

const resolvers = {
  Query: {
    liftCount: () => lifts.length,
    allLifts: () => lifts,
    liftById: (parent, args) =>
      lifts.find((lift) => lift.id === args.id),
    allTrails: () => trails,
    trailById: (parent, args) =>
      trails.find((trail) => trail.id === args.id),
    trailCount: (parent, args) =>
      !args.status
        ? trails.length
        : trails.filter(
            (trail) => trail.status === args.status
          ).length,
    search: (parent, { term }) => {
      let liftsNTrails = [...lifts, ...trails];

      const byTerm = (t) => (item) =>
        t.toLowerCase() ===
        item.id.substr(0, t.length).toLowerCase();

      liftsNTrails = liftsNTrails.filter(byTerm(term));

      return liftsNTrails;
    },
  },
  Lift: {
    url: (parent) => `/lifts/${parent.id}`,
    trailAccess: (parent) =>
      parent.trails.map((id) =>
        trails.find((t) => id === t.id)
      ),
  },
  SearchResult: {
    __resolveType: (parent) =>
      parent.elevationGain ? "Lift" : "Trail",
  },
};

const mocks = {
  Int: () => 6,
  Float: () => 22.1,
  String: () => "Hello",
};
async function startApolloServer() {
  const server = new ApolloServer({
    schema: addMocksToSchema({
      schema: makeExecutableSchema({ typeDefs, resolvers }),
      mocks,
      preserveResolvers: true,
    }),
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`Server running at ${url}`);
}
startApolloServer();
