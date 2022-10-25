const express = require("express");
const router = express.Router();
const db = require("../models");

const { validate_request } = require("../middlewares/AuthenticateRequests");

router.post("/follow_account", validate_request, async (request, response) => {

    // where request.body = {
    //     "user_id": 1,        // the user_id of the user who is trying to follow someone else
    //     "followed_by": 2       // the account_id they want to follow
    // }


    // the request.user_id of the user who is trying to follow someone else
    // account_to_follow is the the username of the account they want to follow
    // where request.body = {
    //     account_to_follow: SHREK,        
    // }

    try {
        const user_id = request.user_id;
        const account_to_follow = request.body.account_to_follow;


        const account_to_follow_details = await db.User.findOne({
            where: {
                username: account_to_follow
            }
        })

        if (account_to_follow_details.id === user_id) {
            response.json({
                error: "cannot follow yourself"
            })
        }

        // since user_id is trying to follow account_to_follow_details.id,
        // we make followed_by = user_id
        const [row, created] = await db.Follower.findOrCreate({
            where: {
                user_id: account_to_follow_details.id,
                followed_by: user_id
            }

            // the way to read this object is that user_id is being followed 
            // by whoever is in followed_by
        });

        if (created) {
            response.json({
                new_follow: row,
                msg: `succesfully followed ${account_to_follow}`
            })
        } else {
            response.json({
                error: "cannot follow same user again"
            })
        }


    } catch (e) {
        response.json({
            error: e
        })
    }
})

router.delete("/unfollow_account/by_username/:username", validate_request, async (request, response) => {


    // the request.user_id of the user who is trying to follow someone else
    // account_to_follow is the the username of the account they want to follow
    // where request.body = {
    //     account_to_follow: SHREK,        
    // }

    try {
        const user_id = request.user_id;
        const account_to_unfollow = request.params.username;


        const account_to_unfollow_details = await db.User.findOne({
            where: {
                username: account_to_unfollow
            }
        })

        if (account_to_unfollow_details === null) {
            response.json({
                error: `cannot unfollow ${account_to_unfollow} account you are not already following`
            })
        }

        await db.Follower.destroy({
            where: {
                user_id: account_to_unfollow_details.id,
                followed_by: user_id
            }
        });

        response.json({
            msg: `succesfully unfollowed ${account_to_unfollow}`
        })


    } catch (e) {
        response.json({
            error: e
        })
    }
})


router.get("/get_all/accounts/of_type/:type/username/:username", async (request, response) => {

    try {
        const username = request.params.username
        // user_id is the account we want to seach for
        const user_details = await db.User.findOne({
            where: {
                username: username
            }
        })

        // account we want to search for doesnt exists
        if (user_details === null) {
            response.json({
                error: `account with username: ${username} does not exist`
            })
        } 

        let search_to_use
        let as_search
        const type = request.params.type;
        if (type === "follower") {
            search_to_use = {
                user_id: user_details.id
            }
            as_search = "followed_by_user_details"
        } else if (type === "following") {
            search_to_use = {
                followed_by: user_details.id
            }
            as_search = "user_id_details"
        } else {
            response.json({
                error: `${type} is an invalid type`
            })
        }


        const all_accounts = await db.Follower.findAll({
            where: search_to_use,
            include: [{
                model: db.User,
                as: as_search,
                attributes: ["username", "profile_pic"]
            }, 
            // {
            //     model: db.User,
            //     as: "user_id_details",
            //     attributes: ["username", "profile_pic"]
            // }
            ]
        });

        // when there are no followers, this array will be = []
        response.json({
            all_accounts: all_accounts,
            // user_id: user_details
        })

    } catch (e) {
        response.json({
            error: e
        })
    }
})

router.get("/get_count_of/accounts/of_type/:type/username/:username", async (request, response) => {

    try {
        const username = request.params.username
        // user_id is the account we want to seach for
        const user_details = await db.User.findOne({
            where: {
                username: username
            }
        })

        // account we want to search for doesnt exists
        if (user_details === null) {
            response.json({
                error: `account with username: ${username} does not exist`
            })
        }

        let search_to_use
        const type = request.params.type;
        if (type === "follower") {
            search_to_use = {
                user_id: user_details.id
            }
        } else if (type === "following") {
            search_to_use = {
                followed_by: user_details.id
            }
        } else {
            response.json({
                error: `${type} is an invalid type`
            })
        }


        const count = await db.Follower.count({
            where: search_to_use
        });

        response.json({
            count: count
        })

    } catch (e) {
        response.json({
            error: e
        })
    }
})

router.get("/check_is_following/by_username/:username", validate_request, async (request, response) => {

    try {
        const username = request.params.username
        // user_id is the account we want to seach for
        const user_details = await db.User.findOne({
            where: {
                username: username
            }
        })

        // account we want to search for doesnt exists
        if (user_details === null) {
            response.json({
                error: `account with username: ${username} does not exist`
            })
        } 

        const is_following = await db.Follower.findOne({
            where: {
                user_id: user_details.id,
                followed_by: request.user_id
            }
        });

        if (is_following === null) {
            response.json({
                is_following: false
            })
        } else {
            response.json({
                is_following: true
            })
        }

    } catch (e) {
        response.json({
            error: e
        })
    }
})

module.exports = router