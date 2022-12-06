const express = require("express");
const { validate_request } = require("../middlewares/AuthenticateRequests");
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

            // console.log("");
            // console.log({
            //     vote_id,
            //     vote_type,
            //     up_vote,
            //     direction,
            //     update_other,
            // });
            // console.log("");

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
        //response.json({
        //     error: e.errors[0].message
        // })
    }
});

module.exports = router;
