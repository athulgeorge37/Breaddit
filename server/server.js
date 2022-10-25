const { typeDefs } = require("./schema/TypeDefs");
const { resolvers } = require("./schema/Resolvers");

const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

const { makeExecutableSchema } = require("@graphql-tools/schema");
// const gql = require("graphql-tag");
const express = require("express");
const http = require("http");
const { PubSub } = require("graphql-subscriptions");
// may need to install ws for graphql-ws to work

// Required logic for integrating with Express
const app = express();
app.use(express.json());

// allows us to send api requests from the client
const cors = require("cors");
app.use(cors());

// go into ./config/config.js to see the db connection information
// this require below will run the ./models/index.js file, to start db
const db = require("./models");

// Routers:
// each route gives the app access to the sequlize queries for that route
const userRoutes = require("./routes/User-route");
app.use("/api/user", userRoutes);
// client can send an axios request to
// http://localhost:3001/api/user + (route endpoint) within userRoute
// to get, post, delete, put data in db

const postRoutes = require("./routes/Post-route");
app.use("/api/post", postRoutes);

const commentRoutes = require("./routes/Comment-route");
app.use("/api/comment", commentRoutes);

const voteRoutes = require("./routes/Vote-route");
app.use("/api/vote", voteRoutes);

const followerRoutes = require("./routes/Follower-route");
app.use("/api/follower", followerRoutes);

const emailRoutes = require("./routes/Email-route");
app.use("/api/email", emailRoutes);

const profileVisitRoutes = require("./routes/ProfileVisits-route");
app.use("/api/profile_visits", profileVisitRoutes);

const httpServer = http.createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });
const pubsub = new PubSub();

const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
});

// Passing in an instance of a GraphQLSchema and
// telling the WebSocketServer to start listening
const serverCleanup = useServer(
    {
        schema,
        context: () => {
            return {
                pubsub,
            };
        },
    },
    wsServer
);

// Same ApolloServer initialization as before, plus the drain plugin.
const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, pubsub }),
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

db.sequelize.sync().then(() => {
    // db.sequelize.sync({ force: true });

    // starting our server when we
    // run npm start within the server dir
    // Nodemon will automatically update our
    // server when we make changes and save

    server.start().then((response) => {
        // so we can use our server for graphql with app
        server.applyMiddleware({ app });

        httpServer.listen(3001, () => {
            console.log("server running on port 3001");
        });
    });
});
