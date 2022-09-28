const { text } = require("express");
const express = require("express");
const { validate_request } = require("../middlewares/AuthenticateRequests");
const router = express.Router();

const db = require("../models");


router.get("/get_all", async (request, response) => {

    const list_of_comments = await db.Comment.findAll({
        include: [{
            model: db.User,
            as: "author_details",
            attributes: ["username", "profile_pic"]
        }]
    })
    response.json(list_of_comments)
})

router.get("/get_all/by_parent_id/:id/is_reply/:is_reply", async (request, response) => {
    // gets all the comments of a post or the replies of a comment
    // where the id is the post_id
    // and the is_reply determines if the response is 
    // a list of comments or a list of replies

    try {
        let is_reply = request.params.is_reply;

        if (is_reply === "true") {
            is_reply = 1
        } else if (is_reply === "false") {
            is_reply = 0
        } else {
            response.json(`${is_reply} is an invalid is_reply param`)
        }

        const list_of_comments = await db.Comment.findAll({
            include: [{
                model: db.User,
                as: "author_details",
                attributes: ["username", "profile_pic"]
            }],
            where: {
                parent_id: request.params.id,
                is_reply: is_reply
            }
        })
        response.json({
            msg: "succesfully got comments of parent_id",
            all_comments: list_of_comments
        })
    } catch (e) {
        response.json({
            error: e
        })
    }
})


router.post("/create_comment", validate_request, async (request, response) => {
    
    // where comment_details = {
    //     "parent_id": 2,
    //     "text": "hello",
    //     "is_reply": true,
    //     "edited": false
    // }

    
    try {
        const comment_details = request.body
        comment_details.author_id = request.user_id

        // response.json(comment_details)

        await db.Comment.create(comment_details)

        response.json({
            msg: `succesfully created ${comment_details.is_reply ? "reply" : "comment"}`
        })
    } catch (e) {
        // response.json({
        //     error: e.errors[0].message
        // })

        response.json({
            error: e
        })
    }
    
})

router.delete("/delete_comment/by_id/:id", validate_request, async (request, response) => {
        
    try {
        await db.Comment.destroy({
            where: {
                id: request.params.id,
                author_id: request.user_id
            }
        })

        response.json({
            msg: "Succesfully removed comment from db"
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


router.put("/edit_comment", validate_request, async (request, response) => {
    
    // where edited_comment_details = {
    //     "parent_id": 2,
    //     "text": "new_comment_text"
    // }

    
    try {
        const { comment_id, comment_text } = request.body

        await db.Comment.update({
            text: comment_text,
            edited: true
        }, {
            where: {
                id: comment_id,
                author_id: request.user_id
            }
        })

        response.json({
            msg: "Succesfully edited comment/reply in db"
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