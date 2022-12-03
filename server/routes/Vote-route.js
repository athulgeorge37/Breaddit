const express = require("express");
const { validate_request } = require("../middlewares/AuthenticateRequests");
const router = express.Router();

const db = require("../models");

router.get(
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
    // "comment_id": 1,
    // "post_id": null,
    // "parent_type": "reply",      // post, comment, reply | Vote table validates this
    // "user_id": 1,
    // "up_vote": true
    // }

    // up_vote: true when up_vote, false when down_vote,
    // up_vote: null when remove_vote
    // however this means the existing vote in the db will be destoryed

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
                response.json({
                    msg: `succesfully removed your previous ${
                        user_vote_details.up_vote ? "Up" : "Down"
                    }Vote`,
                });
            } else if (up_vote === user_vote_details.up_vote) {
                // when the user up_vote and user_vote_details.up_vote is the same value
                // runs when they have arleady liked, or already disliked parent_type
                response.json({
                    error: `user has already ${
                        up_vote ? "Up" : "Down"
                    }Voted this ${vote_type}`,
                });
            } else if (up_vote === !user_vote_details.up_vote) {
                // when the new vote is the opposite of the exisitng vote
                // response.json(`executing change, up_vote=${up_vote}, user_vote_details.up_vote=${user_vote_details.up_vote}, user_vote_details.id=${user_vote_details.id}`)
                await db.Vote.update(
                    // comment_id remains the same
                    { up_vote: up_vote },
                    { where: search_to_use }
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
        //response.json({
        //     error: e.errors[0].message
        // })
    }
});

module.exports = router;
