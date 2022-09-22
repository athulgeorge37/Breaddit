const express = require("express");
const router = express.Router();

const db = require("../models");

// allows us to hash our password
const bcrypt = require("bcrypt");

// required to use webtokens
const { sign } = require("jsonwebtoken");

// sends a get request to "/user" from the client
router.get("/get_all", async (request, response) => {
    // since getting the data takes some time
    // we must put async on the function,  
    // and await for the ORM query "findAll"

    const list_of_users = await db.User.findAll()
    // once we get the list, we send the response back to the client
    // in the form of a list of json objects
    response.json(list_of_users)
    
})

router.get("/get_by_user_id/:id", async (request, response) => {
    // gets user details by user_id
    // when user does not exist, response is null

    const user_details = await db.User.findByPk(request.params.id)
    response.json(user_details)
})


// when a post request to "/user" from the client
// it will get the data from the url
// and add the data to the database through sequelize ORM
// for testing purposes, we will send a json response
// to show that the request worked
router.post("/create_user", async (request, response) => {

    // where user_details = {
    //     "email": "email3@gmail.com",
    //     "username": "donkey",
    //     "password": "Pass1!",
    //     "profile_pic": "https://fd.png",
    //     "bio": "This isfdsfsmy bio"
    // }
    
    try {
        // getting the data from the request url
        const { email, username, password, profile_pic, bio } = request.body

        // hashing the password
        const hashed_pssword = await bcrypt.hash(password, 10);  
        // increase 10 to increase strength

        const user_details = await db.User.create({
            email: email,
            username: username,
            password: hashed_pssword,
            profile_pic: profile_pic,
            bio: bio
        })
        
        response.json(user_details)
        
    } catch (e) {
        // we can get an error message when our query does not work
        response.json(e.errors[0].message)

        // to see the whole error, replace below with "e"
        //response.json(e)
    }
})


router.post("/login", async (request, response) => {

    const { email, password } = request.body;

    // finding the first user in db where emails match
    const user_details = await db.User.findOne({
        where: {
            email: email
        }
    })

    // if user_details returns none, send error
    if (!user_details) {
        response.json({
            error: "User does not exist"
        })
    } else {
        // comparing password user inputted
        // with the password in the db
        bcrypt.compare(password, user_details.password).then((match) => {
            // if they do not match, send error
            if (!match) {
                response.json({
                    error: "Wrong Email Password Combination"
                })
            } else {

                // generating web token, when doing succesful login
                // passing in the data we want to hide on client side
                const web_access_token = sign({
                    user_id: user_details.id 
                }, "secret_for_web_token")
                // sign is similart to hashing, however 
                // if we know the secret, we can get the data back

                // otherwise send successful login msg
                response.json({
                    msg: "You Logged in",
                    web_access_token: web_access_token
                })
            }
        })
    }

})


module.exports = router