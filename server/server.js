require("dotenv").config();

// creating our express app
const express = require("express");
const app = express();

// allows anything returned by express to be in JSON format
app.use(express.json());

// allows us to send api requests from the client
const cors = require("cors");
app.use(cors());

// Routers:
// each route gives the app access to the sequlize queries for that route
// client can send an axios request to
// http://localhost:3001/api/user + (route endpoint) within userRoute
// to get, post, delete, put data in db

const userRoutes = require("./routes/User-route");
const postRoutes = require("./routes/Post-route");
const commentRoutes = require("./routes/Comment-route");
const voteRoutes = require("./routes/Vote-route");
const followerRoutes = require("./routes/Follower-route");
const emailRoutes = require("./routes/Email-route");
const profileVisitRoutes = require("./routes/ProfileVisits-route");
const threadRoutes = require("./routes/Thread-route");

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/follower", followerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/profile_visits", profileVisitRoutes);
app.use("/api/thread", threadRoutes);

// graphql typedefs and resolvers, required for our apollo server
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { typeDefs } = require("./schema/TypeDefs");
const { resolvers } = require("./schema/Resolvers");
const schema = makeExecutableSchema({ typeDefs, resolvers });

// adding http to our app server
const http = require("http");
const httpServer = http.createServer(app);

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

// websocket server where the subcriptions will run on
const { WebSocketServer } = require("ws");
const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
});

const { useServer } = require("graphql-ws/lib/use/ws");
// Passing in an instance of a GraphQLSchema and
// telling the WebSocketServer to start listening
const serverCleanup = useServer(
    {
        schema,
        context: () => {
            // giving access to the pubsub throgh the context param
            // for our subscription listener
            return {
                pubsub,
            };
        },
    },
    wsServer
);

const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
// Same ApolloServer initialization as before, plus the drain plugin.
const server = new ApolloServer({
    schema,
    persistedQueries: false,
    // passing the same pubsub so our apollo server can publish a subscription event
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

// go into ./config/config.js to see the db connection information
// this require below will run the ./models/index.js file, to start db
const db = require("./models");
// sync will make sure our db tables are synced with the database
db.sequelize
    .sync()
    .then(() => {
        // db.sequelize.sync({ force: true });

        // starting our server when we
        // run npm start within the server dir
        // Nodemon will automatically update our
        // server when we make changes and save

        server.start().then((response) => {
            // so we can use our apollo server for graphql with our app server
            server.applyMiddleware({ app });

            // httpServer contains both subscription server, apollo server and app server
            httpServer.listen(process.env.PORT || 3001, () => {
                //console.log("server running on port 3001");
            });
        });
    })
    .catch((e) => {
        //console.log(e);
    });
