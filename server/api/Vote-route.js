const express = require("express");
const {
    validate_request,
    validate_role,
} = require("../middlewares/AuthenticateRequests");
const determine_order_by = require("../helper/FilterBy");
const router = express.Router();

const db = require("../models");

router.get(
    // currently not being used
    "/get_vote_count/by_vote_id/:vote_id/vote_type/:vote_type",
    async (request, response) => {
        // gets the likes and dislikes of a vote based on its id and type
        // vote_type is either a "comment", "reply", "post"

        const vote_id = request.params.vote_id;
        const vote_type = request.params.vote_type;

        let parent_to_use;
        if (vote_type === "post") {
            parent_to_use = {
                post_id: vote_id,
                parent_type: vote_type,
            };
        } else if (vote_type === "comment" || vote_type === "reply") {
            parent_to_use = {
                comment_id: vote_id,
                parent_type: vote_type,
            };
        } else {
            response.json({
                error: `${vote_type} is an invalid vote_type`,
            });
        }

        try {
            // const vote_details = request.body
            const up_vote_count = await db.Vote.count({
                where: { ...parent_to_use, up_vote: true },
            });

            const down_vote_count = await db.Vote.count({
                where: { ...parent_to_use, up_vote: false },
            });

            response.json({
                up_vote_count,
                down_vote_count,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get("/get_post_votes_by_user", async (request, response) => {
    // finds the curr_vote a user has made for a specific
    // parent_type of parent_id

    try {
        const username = request.query.username;
        const up_voted = request.query.up_voted;

        const order_by = determine_order_by(request.query.filter_by);

        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const user_details = await db.User.findOne({
            where: {
                username: username,
            },
        });

        const all_votes = await db.Vote.findAll({
            where: {
                user_id: user_details.id,
                parent_type: "post",
                up_vote: up_voted === "true" ? true : false,
            },
        });

        const list_of_post_ids = all_votes.map((vote_field) => {
            return vote_field.post_id;
        });

        // const all_posts = await db.Post.findAll({
        //     where: {
        //         id: list_of_post_ids,
        //         is_inappropriate: false,
        //     },
        //     order: order_by,
        //     include: [
        //         {
        //             model: db.User,
        //             as: "author_details",
        //             attributes: ["username", "profile_pic"],
        //         },
        //     ],
        //     limit: limit,
        //     offset: offset,
        // });
        const all_posts_initial = await db.Post.findAll({
            where: {
                id: list_of_post_ids,
                // is_inappropriate: false,
            },
            order: order_by,
            limit: limit,
            offset: offset,
        });

        const all_posts = [];
        await Promise.all(
            all_posts_initial.map(async (post) => {
                all_posts.push({
                    ...JSON.parse(JSON.stringify(post)),
                    author_details: await db.User.findOne({
                        where: {
                            id: post.author_id,
                        },
                        attributes: ["username", "profile_pic"],
                    }),
                });
            })
        );

        response.json({
            msg: "succefully got all posts",
            all_items: all_posts,
        });
        return;
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_comment_votes_by_user", async (request, response) => {
    // finds the curr_vote a user has made for a specific
    // parent_type of parent_id

    try {
        const username = request.query.username;
        const up_voted = request.query.up_voted;

        const order_by = determine_order_by(request.query.filter_by);

        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const user_details = await db.User.findOne({
            where: {
                username: username,
            },
        });

        const all_votes = await db.Vote.findAll({
            where: {
                user_id: user_details.id,
                parent_type: "comment",
                up_vote: up_voted === "true" ? true : false,
            },
        });

        const list_of_comment_ids = all_votes.map((vote_field) => {
            return vote_field.comment_id;
        });

        // const all_comments = await db.Comment.findAll({
        //     where: {
        //         id: list_of_comment_ids,
        //         // is_inappropriate: false,
        //     },
        //     order: order_by,
        //     include: [
        //         {
        //             model: db.User,
        //             as: "author_details",
        //             attributes: ["username", "profile_pic"],
        //         },
        //     ],
        //     limit: limit,
        //     offset: offset,
        // });
        const all_comments_initial = await db.Comment.findAll({
            where: {
                id: list_of_comment_ids,
                // is_inappropriate: false,
            },
            order: order_by,
            limit: limit,
            offset: offset,
        });

        const all_comments = [];
        await Promise.all(
            all_comments_initial.map(async (comment) => {
                all_comments.push({
                    ...JSON.parse(JSON.stringify(comment)),
                    author_details: await db.User.findOne({
                        where: {
                            id: comment.author_id,
                        },
                        attributes: ["username", "profile_pic"],
                    }),
                });
            })
        );

        response.json({
            msg: "succefully got all comments",
            all_items: all_comments,
        });
        return;
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_reply_votes_by_user", async (request, response) => {
    // finds the curr_vote a user has made for a specific
    // parent_type of parent_id

    try {
        const username = request.query.username;
        const up_voted = request.query.up_voted;

        const order_by = determine_order_by(request.query.filter_by);

        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const user_details = await db.User.findOne({
            where: {
                username: username,
            },
        });

        const all_votes = await db.Vote.findAll({
            where: {
                user_id: user_details.id,
                parent_type: "reply",
                up_vote: up_voted === "true" ? true : false,
            },
            limit: limit,
            offset: offset,
        });

        const list_of_reply_ids = all_votes.map((vote_field) => {
            return vote_field.comment_id;
        });

        // const all_user_replies = await db.Comment.findAll({
        //     where: {
        //         id: list_of_reply_ids,
        //     },
        //     order: order_by,
        //     include: [
        //         {
        //             model: db.User,
        //             as: "author_details",
        //             attributes: ["username", "profile_pic"],
        //         },
        //     ],
        // });
        const all_user_replies_initial = await db.Comment.findAll({
            where: {
                id: list_of_reply_ids,
            },
            order: order_by,
        });

        const all_user_replies = [];
        await Promise.all(
            all_user_replies_initial.map(async (reply) => {
                all_user_replies.push({
                    ...JSON.parse(JSON.stringify(reply)),
                    author_details: await db.User.findOne({
                        where: {
                            id: reply.author_id,
                        },
                        attributes: ["username", "profile_pic"],
                    }),
                });
            })
        );

        const all_parent_comment_ids = await db.Reply.findAll({
            where: {
                reply_id: list_of_reply_ids,
            },
        });

        const all_reply_and_parent_comments = [];
        await Promise.all(
            all_parent_comment_ids.map(async (item, index) => {
                // const parent_comment = await db.Comment.findOne({
                //     where: {
                //         id: item.parent_comment_id,
                //     },
                //     include: [
                //         {
                //             model: db.User,
                //             as: "author_details",
                //             attributes: ["username", "profile_pic"],
                //         },
                //     ],
                // });
                const parent_comment = await db.Comment.findOne({
                    where: {
                        id: item.parent_comment_id,
                    },
                });

                all_reply_and_parent_comments.push({
                    parent_comment: {
                        ...JSON.parse(JSON.stringify(parent_comment)),
                        author_details: await db.User.findOne({
                            where: {
                                id: parent_comment.author_id,
                            },
                            attributes: ["username", "profile_pic"],
                        }),
                    },
                    reply_comment: all_user_replies[index],
                });
            })
        );

        response.json({
            msg: "succefully got all comments",
            all_items: all_reply_and_parent_comments,
        });
        return;
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get(
    "/get_curr_user_vote/by_parent_id/:id/parent_type/:parent_type",
    validate_request,
    async (request, response) => {
        // finds the curr_vote a user has made for a specific
        // parent_type of parent_id

        let search_to_use;
        const parent_type = request.params.parent_type;
        const parent_id = parseInt(request.params.id);
        if (parent_type === "post") {
            search_to_use = {
                post_id: parent_id,
                parent_type: parent_type,
                user_id: request.user_id,
            };
        } else if (parent_type === "comment" || parent_type === "reply") {
            search_to_use = {
                comment_id: parent_id,
                parent_type: parent_type,
                user_id: request.user_id,
            };
        } else {
            response.json({
                error: `${parent_type} is an invalid parent_type`,
            });
        }

        try {
            const curr_user_vote_details = await db.Vote.findOne({
                where: search_to_use,
            });

            if (curr_user_vote_details === null) {
                response.json({
                    curr_user_vote: null,
                });
            } else {
                response.json({
                    curr_user_vote: curr_user_vote_details.up_vote,
                });
            }
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.post("/make_vote", validate_request, async (request, response) => {
    // Vote table validates any entries
    // ensures that only 1 of comment_id or post_id is entered
    // also ensure a correct combination of inputs are made

    // where vote_details = {
    // "vote_id": 1,
    // "vote_type": "reply",      // post, comment, reply | Vote table validates this
    // "up_vote": true
    // }

    // up_vote: true when up_vote, false when down_vote,
    // up_vote: null when remove_vote
    // however this means the existing vote in the db will be destoryed

    // this will also increment, or decrement the count for a post or comment,
    // in their respective tables

    try {
        const user_id = request.user_id;
        const { vote_id, vote_type, up_vote } = request.body;

        const post_search = {
            user_id: user_id,
            post_id: vote_id,
            parent_type: vote_type,
        };

        const comment_search = {
            user_id: user_id,
            comment_id: vote_id,
            parent_type: vote_type,
        };

        let post_id = null;
        let comment_id = null;
        let user_vote_details = null;
        if (vote_type === "post") {
            // check if user has liked or disliked a post
            post_id = vote_id;
            user_vote_details = await db.Vote.findOne({
                where: post_search,
            });
        } else if (vote_type === "comment" || vote_type === "reply") {
            // check if user has liked or disliked a comment or reply
            comment_id = vote_id;
            user_vote_details = await db.Vote.findOne({
                where: comment_search,
            });
        } else {
            response.json({
                error: `${vote_type} is an invalid vote_type`,
            });
        }

        // response.json(user_vote_details)

        const update_vote_counts = async (
            vote_id, // the post_id or comment_id for the DB we want to update
            vote_type, // do we want to affect the Post or Comment DB, "post", "comment", "reply"
            up_vote, // which field in the db we want to update, up_votes or down_votes
            direction, // if we want to increment a vote: "postive", or decrement: "negative"
            update_other = false // if want to increment one field, and decrement the other
        ) => {
            // this function will ensure the vote count for the respective DB
            // matches the

            // does the user want to increment or decrement their vote counts
            const increment_by =
                direction === "postive" ? 1 : direction === "negative" ? -1 : 0;
            if (increment_by === 0) return;

            // so we dont have nested if statements depending on the DB we want to update
            const db_to_update = vote_type === "post" ? db.Post : db.Comment;

            // same as 1 comment above
            const field_to_update = up_vote
                ? { up_votes: increment_by }
                : { down_votes: increment_by };

            // will increment or decrement the respective field based on the vote_id
            await db_to_update.increment(field_to_update, {
                where: {
                    id: vote_id,
                },
            });

            // when a user is changing from up_vote to down_vote
            // we need to update the other vote_count to reflect the changes
            if (update_other) {
                const other_field_to_update = up_vote
                    ? { down_votes: increment_by * -1 }
                    : { up_votes: increment_by * -1 };

                await db_to_update.increment(other_field_to_update, {
                    where: {
                        id: vote_id,
                    },
                });
            }
        };

        // user_vote_details is null when they have not liked or disliked a post
        // as in their vote does not exist in the DB
        if (!user_vote_details) {
            if (up_vote === null) {
                response.json({
                    error: `user already has null vote`,
                });
            } else {
                // send the request body details to create a new Vote row
                await db.Vote.create({
                    parent_type: vote_type,
                    post_id: post_id,
                    comment_id: comment_id,
                    up_vote: up_vote,
                    user_id: user_id,
                });

                update_vote_counts(
                    vote_id,
                    vote_type,
                    up_vote,
                    "postive",
                    false
                );

                response.json({
                    msg: `succesfully added new ${up_vote ? "Up" : "Down"}Vote`,
                });
            }
        } else {
            // executes else when user has previously liked or disliked the parent_type
            const search_to_use =
                vote_type === "post" ? post_search : comment_search;

            if (up_vote === null) {
                // user wants to remove their vote
                await db.Vote.destroy({ where: search_to_use });

                update_vote_counts(
                    vote_id,
                    vote_type,
                    user_vote_details.up_vote,
                    "negative",
                    false
                );

                response.json({
                    msg: `succesfully removed your previous ${
                        user_vote_details.up_vote ? "Up" : "Down"
                    }Vote`,
                });
            } else if (up_vote === user_vote_details.up_vote) {
                // when the user up_vote and user_vote_details.up_vote is the same value
                // runs when they have arleady liked, or already disliked vote_type
                response.json({
                    error: `user has already ${
                        up_vote ? "Up" : "Down"
                    }Voted this ${vote_type}`,
                });
            } else if (up_vote === !user_vote_details.up_vote) {
                // when the new vote is the opposite of the exisitng vote

                await db.Vote.update(
                    // comment_id remains the same
                    { up_vote: up_vote },
                    { where: search_to_use }
                );

                update_vote_counts(
                    vote_id,
                    vote_type,
                    up_vote,
                    "postive",
                    true
                );

                response.json({
                    msg: `succesfully updated old ${
                        user_vote_details.up_vote ? "Up" : "Down"
                    }Vote to new ${up_vote ? "Up" : "Down"}Vote`,
                });
            }
        }
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_all_voters", validate_role, async (request, response) => {
    try {
        const parent_type = request.query.parent_type;
        const parent_id = parseInt(request.query.parent_id);
        let up_vote = request.query.up_vote; // true or false only
        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        let can_continue = false;
        const allowed_up_votes = ["true", "false"];
        for (const each_up_vote_type of allowed_up_votes) {
            if (each_up_vote_type === up_vote) {
                can_continue = true;
            }
        }
        if (can_continue === false) {
            response.json({
                error: `${up_vote} is an invalid up_vote`,
                allowed: allowed_up_votes,
            });
            return;
        }
        up_vote = up_vote === "true" ? true : false;

        let parent_id_to_use = {};
        can_continue = false;
        const allowed_parent_type = ["post", "comment", "reply"];
        for (const each_parent_type of allowed_parent_type) {
            if (each_parent_type === parent_type) {
                can_continue = true;
            }
        }
        if (can_continue === false) {
            response.json({
                error: `${parent_type} is an invalid parent_type`,
                allowed: allowed_parent_type,
            });
            return;
        }

        if (parent_type === "post") {
            parent_id_to_use = {
                post_id: parent_id,
            };
        } else {
            parent_id_to_use = {
                comment_id: parent_id,
            };
        }

        // const all_voters = await db.Vote.findAll({
        //     where: {
        //         ...parent_id_to_use,
        //         parent_type: parent_type,
        //         up_vote: up_vote,
        //     },
        //     include: [
        //         {
        //             model: db.User,
        //             as: "voter_details",
        //             attributes: ["username", "profile_pic", "id"],
        //         },
        //     ],
        //     limit: limit,
        //     offset: offset,
        // });
        const all_voters_initial = await db.Vote.findAll({
            where: {
                ...parent_id_to_use,
                parent_type: parent_type,
                up_vote: up_vote,
            },
            limit: limit,
            offset: offset,
        });

        const all_voters = [];
        await Promise.all(
            all_voters_initial.map(async (voter) => {
                all_voters.push({
                    ...JSON.parse(JSON.stringify(voter)),
                    voter_details: await db.User.findOne({
                        where: {
                            id: voter.user_id,
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
            response.json({
                msg: "got all profiles for all_voters",
                all_voters: all_voters,
            });
            return;
        }

        const new_follower_data = [];
        await Promise.all(
            all_voters.map(async (row) => {
                const voter_id = row.voter_details.id;

                const following_details = await db.Follower.findOne({
                    where: {
                        followed_by: request.user_id,
                        user_id: voter_id,
                    },
                });

                const is_following = following_details === null ? false : true;

                new_follower_data.push({
                    voter_details: row.voter_details,
                    is_following: is_following,
                    id: row.id,
                });
            })
        );

        response.json({
            msg: "got all profiles for all_voters",
            all_voters: new_follower_data,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

module.exports = router;
