const express = require("express");
const app = express();

// allows express to parse the body of the request url
app.use(express.json());

// allows us to send api requests from the client
const cors = require("cors");
app.use(cors());

// go into ./config/config.js to see the db connection information
// this require below will run the ./models/index.js file, to start db
const db = require("./models");

// Routers:
// each route gives the app access to the sequlize queries for that route
const userRoute = require("./routes/User-route");
app.use("/api/user", userRoute);
// client can send an axios request to 
// http://localhost:3001/api/user + (route endpoint) within userRoute
// to get, post, delete data in db

const postsRoute = require("./routes/Post-route");
app.use("/api/post", postsRoute);

const commentsRoute = require("./routes/Comment-route");
app.use("/api/comment", commentsRoute);

const votesRoute = require("./routes/Vote-route");
app.use("/api/vote", votesRoute);


// when starting server, checks if tables in db
// exists, if not, create them
db.sequelize.sync().then(() => {

    // db.sequelize.sync({ force: true });
    // starting our server when we 
    // run npm start within the server dir
    // Nodemon will automatically update our 
    // server when we make changes and save
    app.listen(3001, () => {
        console.log("server running on port 3001")
    })
})


