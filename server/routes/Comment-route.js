const express = require("express");
const router = express.Router();

const db = require("../models");


router.get("/get_all", async (request, response) => {

    const list_of_comments = await db.Comment.findAll({
        include: [db.User]
    })
    response.json(list_of_comments)
})

router.get("/get_all/by_parent_id/:id/is_reply/:is_reply", async (request, response) => {
    // gets all the comments of a post or the replies of a comment
    // where the id is the post_id
    // and the is_reply determines if the response is 
    // a list of comments or a list of replies

    let is_reply = request.params.is_reply;

    if (is_reply === "true") {
        is_reply = 1
    } else if (is_reply === "false") {
        is_reply = 0
    } else {
        response.json(`${is_reply} is an invalid is_reply param`)
    }

    const list_of_comments = await db.Comment.findAll({
        include: [db.User],
        where: {
            parent_id: request.params.id,
            is_reply: is_reply
        }
    })
    response.json(list_of_comments)
})


router.post("/create_comment", async (request, response) => {
    
    // where comment_details = {
    //     "author_id": 2,
    //     "parent_id": 2,
    //     "text": "hello",
    //     "is_reply": true,
    //     "edited": false
    // }

    
    try {
        const comment_details = request.body
        await db.Comment.create(comment_details)
        response.json(comment_details)
    } catch (e) {
        // response.json(e.errors[0].message)
        response.json(e)
    }
})


module.exports = router