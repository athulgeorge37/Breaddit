const express = require("express");
const router = express.Router();

const db = require("../models");

// allows us to hash our password
const bcrypt = require("bcrypt");

// required to use webtokens
const { sign } = require("jsonwebtoken");
const { validate_request } = require("../middlewares/AuthenticateRequests");
const { request } = require("express");



// sends a get request to "/user" from the client
router.get("/get_all", validate_request, async (request, response) => {
    // since getting the data takes some time
    // we must put async on the function,  
    // and await for the ORM query "findAll"

    const list_of_users = await db.User.findAll()
    // once we get the list, we send the response back to the client
    // in the form of a list of json objects
    response.json(list_of_users)
    
})

router.get("/get_curr_user_details", validate_request, async (request, response) => {
    // gets user details by user_id
    // when user does not exist, response is null

    try {
        const user_details = await db.User.findByPk(request.user_id)

        response.json({
            user_details: {
                username: user_details.username,
                email: user_details.email,
                profile_pic: user_details.profile_pic,
                bio: user_details.bio,
                createdAt: user_details.createdAt
            }
        })

    } catch (e) {
        response.json({
            error: e
        })
    }
})

router.get("/check_is_unique_email/:new_email", async (request, response) => {
    // checks if the entered email is unique

    const users_with_new_email = await db.User.count({
        where: {
            email: request.params.new_email
        }
    })

    response.json((users_with_new_email === 0 ? true : false))
})

router.get("/check_is_unique_username/:new_username", async (request, response) => {
    // checks if the entered username is unique

    const users_with_new_username = await db.User.count({
        where: {
            username: request.params.new_username
        }
    })

    response.json((users_with_new_username === 0 ? true: false))
})

router.get("/check_is_valid_web_token", validate_request, async (request, response) => {
    // checks if the token in local_storage is valid or not
    try {
        const user_id = request.user_id;

        const user_details = await db.User.findByPk(user_id)
        response.json({
            username: user_details.username,
            profile_pic: user_details.profile_pic
        })

    } catch (e) {
        response.json({
            error: e
        })
    }
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

        // once user is created in db, we get the user id to create a web token
        const web_access_token = sign({
            user_id: user_details.id 
        }, "secret_for_web_token")
        
        // giving the web token back to the client
        response.json({
            msg: "Succesfully Signed Up",
            username: user_details.username,
            profile_pic: user_details.profile_pic,
            web_access_token: web_access_token
        })
        
    } catch (e) {
        // we can get an error message when our query does not work
        response.json({
            error: e.errors[0].message
        })

        // to see the whole error, replace below with "e"
        //response.json(e)
    }
})


router.post("/sign_in", async (request, response) => {

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

router.delete("/delete_user", validate_request, async (request, response) => {
    // doesnt work rn, cus the cascade part doesnt work, something to do with comments
    try {

        await db.User.destroy({
            where: {
                id: request.user_id
            }
        })

        response.json("Succesfully removed user from db")

    } catch (e) {
        response.json({
            error: e
        })
    }
})


router.put("/edit_user_details", validate_request, async (request, response) => {
    
    // where edited_post_details = {
    //     "post_id": 2,
    //     "post_text": "new_post_text",
    //     "post_image": "new_img_url"
    // }

    
    try {
        const { email, username, profile_pic, bio } = request.body

        const updated_user_details = await db.User.update({
            email: email,
            username: username,
            profile_pic: profile_pic,
            bio: bio
        }, {
            where: {
                id: request.user_id
            }
        })

        response.json({
            msg: "Succesfully edited profile in db"
            // updated_user_details: {
            //     email: updated_user_details.email,
            //     username: updated_user_details.username,
            //     profile_pic: updated_user_details.profile_pic,
            //     bio: updated_user_details.bio
            // }
        })

    } catch (e) {
        response.json({
            error: e.errors[0].message
        })

        // response.json({
        //     error: e
        // })
    }
    
})


module.exports = router