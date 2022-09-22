const express = require("express");
const router = express.Router();

const db = require("../models");

const { validate_request } = require("../middlewares/AuthenticateRequests")

router.get("/get_all", async (request, response) => {
    // when getting list of posts, we also get 
    // the user details who made that post
    const list_of_posts = await db.Post.findAll({
        include: [db.User]
    })
    response.json(list_of_posts)
})

router.get("/get_all/by_author_id/:id", async (request, response) => {
    // gets all the post made by an  author using author_id
    const list_of_posts = await db.Post.findAll({
        include: [db.User],
        where: {
            author_id: request.params.id
        }
    })
    response.json(list_of_posts)
})


router.post("/create_post", validate_request, async (request, response) => {

    // where post_details = {
    //   "author_id": 2,
    //   "title": "post 2 by 2",
    //   "text": "hello",
    //   "image": "img.png",
    //   "edited": false
    // }
   
    
    try {
        // we are now getting the user_id through the validate_request function
        const user_id = request.user_id

        const post_details = request.body
        post_details.author_id = user_id

        await db.Post.create(post_details)
        response.json(post_details)
    } catch (e) {
        response.json(e.errors[0].message)
        //response.json(e)
    }
})


module.exports = router