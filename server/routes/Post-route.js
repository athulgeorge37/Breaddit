const determine_order_by = require("../helper/FilterBy");
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const db = require("../models");

const { validate_request } = require("../middlewares/AuthenticateRequests");

router.get("/get_all", async (request, response) => {
    // when getting list of posts, we also get
    // the user details who made that post
    try {
        const limit = parseInt(request.query.limit);
        let page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const order_by = determine_order_by(request.query.filter_by);
        const search_input = request.query.search_input;

        // console.log("");
        // console.log(request.query);
        // console.log("");

        let where_search = {
            is_inappropriate: false,
        };

        if (search_input !== "") {
            // searching all the posts where the title or text is equal to the search_input
            where_search = {
                is_inappropriate: false,
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${search_input}%`,
                        },
                    },
                    {
                        text: {
                            [Op.like]: `%${search_input}%`,
                        },
                    },
                ],
            };
        }

        const list_of_posts = await db.Post.findAll({
            where: where_search,
            order: order_by,
            include: [
                {
                    model: db.User,
                    as: "author_details",
                    attributes: ["username", "profile_pic"],
                },
            ],
            limit: limit,
            offset: offset,
        });

        response.json({
            msg: "succesfully got list of posts",
            all_posts: list_of_posts,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_by_post_id/:post_id", async (request, response) => {
    // the user details who made that post
    try {
        const post_id = parseInt(request.params.post_id);

        const post_details = await db.Post.findOne({
            where: {
                id: post_id,
            },
            include: [
                {
                    model: db.User,
                    as: "author_details",
                    attributes: ["username", "profile_pic"],
                },
            ],
        });

        response.json({
            msg: "succesfully got post details",
            post_details: post_details,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get(
    "/get_all/by_curr_user",
    validate_request,
    async (request, response) => {
        // gets all the post made by an  author using author_id
        try {
            const list_of_posts = await db.Post.findAll({
                include: [
                    {
                        model: db.User,
                        as: "author_details",
                        attributes: ["username", "profile_pic"],
                    },
                ],
                where: {
                    author_id: request.user_id,
                },
            });
            response.json({
                all_posts: list_of_posts,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get("/get_all/by_username/:username", async (request, response) => {
    // gets all the post made by an  author using author_id
    try {
        const user_details = await db.User.findOne({
            where: {
                username: request.params.username,
            },
        });

        const list_of_posts = await db.Post.findAll({
            include: [
                {
                    model: db.User,
                    as: "author_details",
                    attributes: ["username", "profile_pic"],
                },
            ],
            where: {
                author_id: user_details.id,
                is_inappropriate: false,
            },
        });
        response.json({
            all_posts: list_of_posts,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

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
        const user_id = request.user_id;

        const post_details = request.body;
        post_details.author_id = user_id;

        const new_post_details = await db.Post.create(post_details);
        response.json({
            msg: "successfully created post",
            new_post_details: new_post_details,
        });
    } catch (e) {
        // response.json({
        //     error: e.errors[0].message
        // })
        response.json({
            error: e,
        });
    }
});

router.delete(
    "/delete_post/by_id/:id",
    validate_request,
    async (request, response) => {
        try {
            // const post = db.Post.findOne({
            //     where: {
            //         id: request.params.id,
            //         author_id: request.user_id
            //     }
            // })

            // await post.destroy()

            await db.Post.destroy({
                where: {
                    id: request.params.id,
                    author_id: request.user_id,
                },
            });

            response.json({
                msg: "Succesfully removed post from db",
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.put("/edit_post", validate_request, async (request, response) => {
    // where edited_post_details = {
    //     "post_id": 2,
    //     "post_text": "new_post_text",
    //     "post_image": "new_img_url"
    // }

    try {
        const { post_id, post_title, post_text, post_image } = request.body;

        await db.Post.update(
            {
                title: post_title,
                text: post_text,
                image: post_image,
                edited: true,
            },
            {
                where: {
                    id: post_id,
                    author_id: request.user_id,
                },
            }
        );

        response.json({
            msg: "Succesfully edited post in db",
        });
    } catch (e) {
        response.json({
            error: e.errors[0].message,
        });

        // response.json({
        //     error: e
        // })
    }
});

module.exports = router;
