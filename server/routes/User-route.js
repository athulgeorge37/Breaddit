const express = require("express");
const router = express.Router();

const db = require("../models");

// allows us to hash our password
const bcrypt = require("bcrypt");

// required to use webtokens
const { sign } = require("jsonwebtoken");
const { validate_request } = require("../middlewares/AuthenticateRequests");

router.get("/get_user_details", async (request, response) => {
    // gets user details by user_id
    // when user does not exist, response is null

    try {
        const username = request.query.username;
        const user_details = await db.User.findOne({
            where: {
                username: username,
            },
        });

        if (user_details === null) {
            response.json({
                error: `account with username: ${username} does not exist`,
            });
            return;
        }

        response.json({
            user_details: {
                id: user_details.id,
                username: user_details.username,
                profile_pic: user_details.profile_pic,
                bio: user_details.bio,
                createdAt: user_details.createdAt,
            },
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get(
    "/get_user_profile_details/by_username/:username",
    async (request, response) => {
        // gets user details by user_id
        // when user does not exist, response is null

        try {
            const username = request.params.username;
            // user_id is the account we want to seach for
            const user_details = await db.User.findOne({
                where: {
                    username: username,
                },
            });

            // account we want to search for doesnt exists
            if (user_details === null) {
                response.json({
                    error: `account with username: ${username} does not exist`,
                });
            }

            response.json({
                user_details: {
                    username: user_details.username,
                    profile_pic: user_details.profile_pic,
                    bio: user_details.bio,
                    createdAt: user_details.createdAt,
                },
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get("/check_is_unique_email/:new_email", async (request, response) => {
    // checks if the entered email is unique

    const users_with_new_email = await db.User.count({
        where: {
            email: request.params.new_email,
        },
    });

    response.json(users_with_new_email === 0 ? true : false);
});

router.get("/check_is_unique_username", async (request, response) => {
    // checks if the entered username is unique
    const username = request.query.username;
    const users_with_new_username = await db.User.findOne({
        where: {
            username: username,
        },
    });

    // console.log("");
    // console.log({ users: JSON.stringify(users_with_new_username) });
    // console.log("");
    let is_unique = true;
    if (
        users_with_new_username !== null &&
        users_with_new_username.username === username
    ) {
        is_unique = false;
    }

    response.json({
        is_unique: is_unique,
    });
    // response.json({
    //     is_unique: users_with_new_username === 0 ? true : false,
    // });
});

router.get(
    "/check_is_valid_web_token",
    validate_request,
    async (request, response) => {
        // checks if the token in local_storage is valid or not
        try {
            const user_id = request.user_id;

            const user_details = await db.User.findByPk(user_id);
            // const log_in_details = await db.UserActivity.
            response.json({
                username: user_details.username,
                profile_pic: user_details.profile_pic,
                role: user_details.role,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

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
        const { email, username, password, profile_pic, bio } = request.body;

        // generating the salt
        const salt = await bcrypt.genSalt(10); // higher this number, higher the strength

        // hashing the password, with the salt
        // so hashed_password = salt + hash(password + salt)
        const hashed_password = await bcrypt.hash(password, salt);

        const user_details = await db.User.create({
            email: email,
            username: username,
            password: hashed_password,
            profile_pic: profile_pic,
            bio: bio,
            role: "user",
        });

        // this will create login_details when the user is initally a user, but becomes an admin
        const login_details = await db.UserActivity.create({
            user_id: user_details.id,
            login_time: new Date(),
        });

        // once user is created in db, we get the user id to create a web token
        const web_access_token = sign(
            {
                user_id: user_details.id,
                role: user_details.role,
                login_id: login_details.id,
            },
            "secret_for_web_token"
        );

        // giving the web token back to the client
        response.json({
            msg: "Succesfully Signed Up User",
            username: user_details.username,
            profile_pic: user_details.profile_pic,
            web_access_token: web_access_token,
        });
    } catch (e) {
        // we can get an error message when our query does not work
        response.json({
            error: e.errors[0].message,
        });

        // to see the whole error, replace below with "e"
        //response.json(e)
    }
});

router.post("/sign_in", async (request, response) => {
    const { email, password } = request.body;

    // finding the first user in db where emails match
    const user_details = await db.User.findOne({
        where: {
            email: email,
        },
    });

    // if user_details returns none, send error
    if (!user_details) {
        response.json({
            error: "User does not exist",
        });
    } else {
        if (user_details.is_banned === true) {
            response.json({
                error: "The Account associated with this login is banned",
                is_banned: user_details.is_banned,
            });
        }

        // comparing password user inputted
        // with the hashed password in the db
        // this hashed password already contains the salt, so we dont need to pass it again
        bcrypt.compare(password, user_details.password).then((match) => {
            // if they do not match, send error
            if (!match) {
                response.json({
                    error: "Wrong Email Password Combination",
                });
            }
        });

        let login_details = { id: 0 };
        if (user_details.role !== "admin") {
            login_details = await db.UserActivity.create({
                user_id: user_details.id,
                login_time: new Date(),
            });
        }

        // generating web token, when doing succesful login
        // passing in the data we want to hide on client side
        const web_access_token = sign(
            {
                user_id: user_details.id,
                role: user_details.role,
                login_id: login_details.id,
            },
            "secret_for_web_token"
        );
        // sign is similart to hashing, however
        // if we know the secret, we can get the data back

        // otherwise send successful login msg
        response.json({
            msg: "You Logged in",
            web_access_token: web_access_token,
        });
    }
});

router.put("/sign_out", validate_request, async (request, response) => {
    try {
        if (request.role === "admin") {
            response.json({
                msg: "not recording user activity for admins",
            });
        }

        await db.UserActivity.update(
            {
                logout_time: new Date(),
            },
            {
                where: {
                    id: request.login_id,
                },
            }
        );

        response.json({
            msg: "You Logged Out",
        });
    } catch (e) {
        response,
            json({
                error: e,
            });
    }
});

router.delete("/delete_user", validate_request, async (request, response) => {
    // doesnt work rn, cus the cascade part doesnt work, something to do with comments
    try {
        await db.User.destroy({
            where: {
                id: request.user_id,
            },
        });

        response.json("Succesfully removed user from db");
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.put(
    "/edit_user_details",
    validate_request,
    async (request, response) => {
        try {
            const { email, username, profile_pic, bio } = request.body;

            // will only add to object if it is defined
            const fields_to_update = {
                ...(email && { email }),
                ...(username && { username }),
                ...(profile_pic && {
                    // when we want to make profile_pic null
                    // make sure to pass profile_pic from body as "null" string
                    // if we pass null, we wont append profile_pic to fields_to_update object
                    // and we wont edit it in DB
                    profile_pic: profile_pic === "null" ? null : profile_pic,
                }),
                ...(bio && {
                    // same logic for bio as it was for profile pic
                    bio: bio === "null" ? null : bio,
                }),
            };

            // updating user in DB
            await db.User.update(fields_to_update, {
                where: {
                    id: request.user_id,
                },
            });

            // console.log("");
            // console.log({
            //     profile_pic: updated_user_details.profile_pic,
            // });
            // console.log("");

            response.json({
                msg: "Succesfully edited profile in db",
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

module.exports = router;
