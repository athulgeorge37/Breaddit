const express = require("express");
const router = express.Router();
const db = require("../models");

const {
    validate_request,
    validate_role,
} = require("../middlewares/AuthenticateRequests");

router.get("/get_all_followers", validate_role, async (request, response) => {
    try {
        // getting all the required data from query params
        const follower_type = request.query.follower_type.toLowerCase();
        const user_id = parseInt(request.query.user_id);
        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        // ensuring the requests inputs are valid
        let can_continue = false;
        const allowed_follower_types = ["followers", "following"];
        for (const each_follower_type of allowed_follower_types) {
            if (each_follower_type.toLowerCase() === follower_type) {
                can_continue = true;
                break;
            }
        }
        if (can_continue === false) {
            response.json({
                error: `${follower_type} is an invalid follower_type`,
                allowed: allowed_follower_types,
            });
            return;
        }

        // ensuring we use the right coloumn in the dtatabse depending on follower_type
        let follower_id_to_use = {};
        // so we can get the correct profile details  through sequqelize association
        let as_relationship_to_use = "";
        if (follower_type === "followers") {
            follower_id_to_use = {
                user_id: user_id,
            };
            as_relationship_to_use = "followed_by_user_details";
        } else {
            follower_id_to_use = {
                followed_by: user_id,
            };
            as_relationship_to_use = "user_id_details";
        }

        // getting all the profiles we need who are either following or being followed by user_id
        // const all_profiles = await db.Follower.findAll({
        //     where: {
        //         ...follower_id_to_use,
        //     },
        //     include: [
        //         {
        //             model: db.User,
        //             as: as_relationship_to_use, // so we include the correct profile details
        //             attributes: ["username", "profile_pic", "id"],
        //         },
        //     ],
        //     limit: limit,
        //     offset: offset,
        // });
        const all_profiles_initial = await db.Follower.findAll({
            where: {
                ...follower_id_to_use,
            },
            limit: limit,
            offset: offset,
        });

        const all_profiles = [];
        await Promise.all(
            all_profiles_initial.map(async (row) => {
                all_profiles.push({
                    ...JSON.parse(JSON.stringify(row)),
                    user_details: await db.User.findOne({
                        where: {
                            id:
                                follower_type === "followers"
                                    ? row.followed_by
                                    : row.user_id,
                        },
                        attributes: ["username", "profile_pic", "id"],
                    }),
                });
            })
        );

        if (request.role === "public_user") {
            // when user is public user, we do not need to check
            // if they are following the found accounts
            // since they themselves do not have an account

            const all_followers = all_profiles.map((row) => {
                // if (follower_type === "followers") {
                //     return {
                //         follower_details: row.followed_by_user_details,
                //         is_following: null,
                //         id: row.id,
                //     };
                // } else {
                //     return {
                //         follower_details: row.user_id_details,
                //         is_following: null,
                //         id: row.id,
                //     };
                // }
                return {
                    follower_details: row.user_details,
                    is_following: null,
                    id: row.id,
                };
            });

            response.json({
                msg: `got all profiles for follower_type:${follower_type}`,
                all_followers: all_followers,
            });
            return;
        }

        const new_follower_data = [];
        await Promise.all(
            all_profiles.map(async (row) => {
                let where_clause_to_use = {};
                // if (follower_type === "followers") {
                //     where_clause_to_use = {
                //         user_id: user_id,
                //         followed_by: row.followed_by_user_details.id,
                //     };
                // } else {
                //     where_clause_to_use = {
                //         user_id: row.user_id_details.id,
                //         followed_by: user_id,
                //     };
                // }
                if (follower_type === "followers") {
                    where_clause_to_use = {
                        user_id: user_id,
                        followed_by: row.user_details.id,
                    };
                } else {
                    where_clause_to_use = {
                        user_id: row.user_details.id,
                        followed_by: user_id,
                    };
                }

                const following_details = await db.Follower.findOne({
                    where: where_clause_to_use,
                });

                // if the user_id is following, following_details should not be null
                const is_following = following_details === null ? false : true;

                // attaching the users username and profile pic to the is_following
                // const follower_details =
                //     follower_type === "followers"
                //         ? row.followed_by_user_details
                //         : row.user_id_details;

                new_follower_data.push({
                    // follower_details: follower_details,
                    follower_details: row.user_details,
                    is_following: is_following,
                    id: row.id,
                });
            })
        );

        response.json({
            msg: "got all profiles for all_voters",
            msg: `got all profiles for follower_type:${follower_type}`,
            all_followers: new_follower_data,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_follower_following_counts", async (request, response) => {
    try {
        const user_id = parseInt(request.query.user_id);

        const follower_count = await db.Follower.count({
            where: {
                user_id: user_id,
            },
        });

        const following_count = await db.Follower.count({
            where: {
                followed_by: user_id,
            },
        });

        response.json({
            follower_count: follower_count,
            following_count: following_count,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.post(
    "/follow_or_unfollow_account",
    validate_request,
    async (request, response) => {
        try {
            const user_id = request.user_id;
            const account_id = request.body.account_id;

            if (account_id === user_id) {
                response.json({
                    error: "cannot follow yourself",
                });
            }

            // since user_id is trying to follow account_to_follow_details.id,
            // we make followed_by = user_id
            const [row, created] = await db.Follower.findOrCreate({
                where: {
                    user_id: account_id,
                    followed_by: user_id,
                },

                // the way to read this object is that user_id is being followed
                // by whoever is in followed_by
            });

            if (created) {
                response.json({
                    is_following: true,
                    msg: `succesfully followed ${account_id}`,
                });
            } else {
                await db.Follower.destroy({
                    where: {
                        user_id: account_id,
                        followed_by: user_id,
                    },
                });

                response.json({
                    is_following: false,
                    msg: `succesfully unfollowed ${account_id}`,
                });
            }
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

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
                username: account_to_follow,
            },
        });

        if (account_to_follow_details.id === user_id) {
            response.json({
                error: "cannot follow yourself",
            });
        }

        // since user_id is trying to follow account_to_follow_details.id,
        // we make followed_by = user_id
        const [row, created] = await db.Follower.findOrCreate({
            where: {
                user_id: account_to_follow_details.id,
                followed_by: user_id,
            },

            // the way to read this object is that user_id is being followed
            // by whoever is in followed_by
        });

        if (created) {
            response.json({
                new_follow: row,
                msg: `succesfully followed ${account_to_follow}`,
            });
        } else {
            response.json({
                error: "cannot follow same user again",
            });
        }
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.delete(
    "/unfollow_account/by_username/:username",
    validate_request,
    async (request, response) => {
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
                    username: account_to_unfollow,
                },
            });

            if (account_to_unfollow_details === null) {
                response.json({
                    error: `cannot unfollow ${account_to_unfollow} account you are not already following`,
                });
            }

            await db.Follower.destroy({
                where: {
                    user_id: account_to_unfollow_details.id,
                    followed_by: user_id,
                },
            });

            response.json({
                msg: `succesfully unfollowed ${account_to_unfollow}`,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get(
    "/get_all/accounts/of_type/:type/username/:username",
    async (request, response) => {
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

            let search_to_use;
            let as_search;
            const type = request.params.type;
            if (type === "follower") {
                search_to_use = {
                    user_id: user_details.id,
                };
                as_search = "followed_by_user_details";
            } else if (type === "following") {
                search_to_use = {
                    followed_by: user_details.id,
                };
                as_search = "user_id_details";
            } else {
                response.json({
                    error: `${type} is an invalid type`,
                });
            }

            // const all_accounts = await db.Follower.findAll({
            //     where: search_to_use,
            //     include: [
            //         {
            //             model: db.User,
            //             as: as_search,
            //             attributes: ["username", "profile_pic"],
            //         },
            //         // {
            //         //     model: db.User,
            //         //     as: "user_id_details",
            //         //     attributes: ["username", "profile_pic"]
            //         // }
            //     ],
            // });
            const all_accounts_initial = await db.Follower.findAll({
                where: search_to_use,
            });

            const all_accounts = [];
            await Promise.all(
                all_accounts_initial.map(async (item) => {
                    all_accounts.push({
                        ...JSON.parse(JSON.stringify(item)),
                        user_details: await db.User.findOne({
                            where: {
                                id:
                                    type === "follower"
                                        ? item.followed_by
                                        : item.user_id,
                            },
                            attributes: ["username", "profile_pic"],
                        }),
                    });
                })
            );

            // when there are no followers, this array will be = []
            response.json({
                all_accounts: all_accounts,
                // user_id: user_details
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get(
    "/get_count_of/accounts/of_type/:type/username/:username",
    async (request, response) => {
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

            let search_to_use;
            const type = request.params.type;
            if (type === "follower") {
                search_to_use = {
                    user_id: user_details.id,
                };
            } else if (type === "following") {
                search_to_use = {
                    followed_by: user_details.id,
                };
            } else {
                response.json({
                    error: `${type} is an invalid type`,
                });
            }

            const count = await db.Follower.count({
                where: search_to_use,
            });

            response.json({
                count: count,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get(
    "/check_is_following/by_username/:username",
    validate_request,
    async (request, response) => {
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

            const is_following = await db.Follower.findOne({
                where: {
                    user_id: user_details.id,
                    followed_by: request.user_id,
                },
            });

            if (is_following === null) {
                response.json({
                    is_following: false,
                });
            } else {
                response.json({
                    is_following: true,
                });
            }
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

module.exports = router;
