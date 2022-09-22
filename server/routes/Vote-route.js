const express = require("express");
const router = express.Router();

const db = require("../models");



router.get("/get_all/by_post_id/:id/up_vote/:up_vote", async (request, response) => {

    // getting all the votes by a certain parent_id
    // where 
    // parent_id can be 

    try {
        const vote_details = request.body
        await db.Vote.findAll(vote_details)
        response.json(vote_details)
    } catch (e) {
        response.json(e)
    }
})



router.post("/make_vote", async (request, response) => {

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
        const { user_id, comment_id, post_id, parent_type, up_vote } = request.body

        let user_vote_details = null

        const post_search = {
            user_id: user_id,
            post_id: post_id
        }

        const comment_search = {
            user_id: user_id,
            comment_id: comment_id
        }

        if (parent_type === "post") {
            // check if user has liked or disliked a post
            user_vote_details = await db.Vote.findOne({
                where: post_search
            })
        } else if ( parent_type === "comment" || parent_type === "reply") {
            // check if user has liked or disliked a comment or reply
            user_vote_details = await db.Vote.findOne({
                where: comment_search
            })
        } else {
            response.json({
                error: `${parent_type} is an invalid parent_type`
            })
        }

        // response.json(user_vote_details)

        // user_vote_details is null when they have not liked or disliked a post
        if (!user_vote_details) {
            // send the request body details to create a new Vote row
            await db.Vote.create(request.body)
            response.json(`succesfully added new ${up_vote ? "Up" : "Down"}Vote`)
        } else {
            // executes else when user has previously liked or disliked the parent_type
            const search_to_use = parent_type === "post" ? post_search : comment_search

            if (up_vote === null) {
                // user wants to remove their vote
                await db.Vote.destroy(
                    { where: search_to_use}
                )
                response.json(`succesfully removed your previous ${user_vote_details.up_vote ? "Up" : "Down"}Vote`)
            } else if (up_vote === user_vote_details.up_vote) {
                // when the user up_vote and user_vote_details.up_vote is the same value
                // runs when they have arleady liked, or already disliked parent_type
                response.json({
                    error: `user has already ${up_vote ? "Up" : "Down"}Voted this ${parent_type}`
                })
            } else if (up_vote === !user_vote_details.up_vote) {
                // when the new vote is the opposite of the exisitng vote
                // response.json(`executing change, up_vote=${up_vote}, user_vote_details.up_vote=${user_vote_details.up_vote}, user_vote_details.id=${user_vote_details.id}`)
                await db.Vote.update(
                    // comment_id remains the same
                    { up_vote: up_vote}, 
                    { where: search_to_use}
                )
                response.json(`succesfully updated old ${user_vote_details.up_vote ? "Up" : "Down"}Vote to new ${up_vote ? "Up" : "Down"}Vote`)
            }
        }



        // response.json("some error occured within try statment")

    } catch (e) {
        response.json(e)
        //response.json(e.errors[0].message)
    }


    // try {
    //     const vote_details = request.body
    //     await db.Vote.create(vote_details)
    //     response.json(vote_details)
    // } catch (e) {
    //     response.json(e)
    //     //response.json(e.errors[0].message)
    // }
})




module.exports = router