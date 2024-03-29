const determine_order_by = require("../helper/FilterBy");
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
const { validate_request } = require("../middlewares/AuthenticateRequests");
const delete_post = require("../helper/delete/delete_post");

router.get("/get_all_posts", async (request, response) => {
    // when getting list of posts, we also get
    // the user details who made that post
    try {
        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const order_by = determine_order_by(request.query.filter_by);
        const search_input = request.query.search_input;

        const thread_title = request.query.thread_title;

        let where_search = {};

        if (thread_title !== "null") {
            const thread_details = await db.Thread.findOne({
                where: {
                    title: thread_title,
                },
            });

            where_search = {
                thread_id: thread_details.id,
            };
        }

        if (search_input !== "null") {
            // searching all the posts where the title or text is equal to the search_input
            where_search = {
                ...where_search,
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

        // const all_posts = await db.Post.findAll({
        //     where: { ...where_search, is_inappropriate: false },
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
            where: { ...where_search, is_inappropriate: false },
            order: order_by,
            limit: limit,
            offset: offset,
        });

        const all_posts = [];
        await Promise.all(
            all_posts_initial.map(async (post) => {
                const post_details = {
                    ...JSON.parse(JSON.stringify(post)),
                    author_details: await db.User.findOne({
                        where: {
                            id: post.author_id,
                        },
                        attributes: ["username", "profile_pic"],
                    }),
                };

                all_posts.push(post_details);
            })
        );

        response.json({
            msg: "succesfully got list of posts",
            all_posts: all_posts,
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

        // const post_details = await db.Post.findOne({
        //     where: {
        //         id: post_id,
        //     },
        //     include: [
        //         {
        //             model: db.User,
        //             as: "author_details",
        //             attributes: ["username", "profile_pic"],
        //         },
        //     ],
        // });
        let post_details_initial = await db.Post.findOne({
            where: {
                id: post_id,
            },
        });

        const post_details = {
            ...JSON.parse(JSON.stringify(post_details_initial)),
            author_details: await db.User.findOne({
                where: {
                    id: post_details_initial.author_id,
                },
                attributes: ["username", "profile_pic"],
            }),
        };

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
            // const list_of_posts = await db.Post.findAll({
            //     where: {
            //         author_id: request.user_id,
            //     },
            //     include: [
            //         {
            //             model: db.User,
            //             as: "author_details",
            //             attributes: ["username", "profile_pic"],
            //         },
            //     ],
            // });
            const list_of_posts = await db.Post.findAll({
                where: {
                    author_id: request.user_id,
                },
            });

            const all_posts = [];
            await Promis.all(
                list_of_posts.map(async (post) => {
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
                all_posts: all_posts,
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get("/get_all_posts_by_username", async (request, response) => {
    // gets all the post made by an  author using author_id
    try {
        const limit = parseInt(request.query.limit);
        const page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const order_by = determine_order_by(request.query.filter_by);
        const search_input = request.query.search_input;

        const username = request.query.username;

        const user_details = await db.User.findOne({
            where: {
                username: username,
            },
        });

        let where_search = {
            author_id: user_details.id,
        };

        if (search_input !== "null") {
            // searching all the posts where the title or text is equal to the search_input
            where_search = {
                ...where_search,
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

        // const all_posts = await db.Post.findAll({
        //     where: { ...where_search, is_inappropriate: false },
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
            where: { ...where_search, is_inappropriate: false },
            order: order_by,
            limit: limit,
            offset: offset,
        });

        const all_posts = [];
        await Promise.all(
            all_posts_initial.map(async (post) => {
                const user_details = await db.User.findOne({
                    where: {
                        id: post.author_id,
                    },
                    attributes: ["username", "profile_pic"],
                });

                all_posts.push({
                    ...JSON.parse(JSON.stringify(post)),
                    author_details: user_details,
                });
            })
        );

        response.json({
            msg: `succesfully got list of posts by username ${username}`,
            all_posts: all_posts,
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

        const updated_post_details = {
            title: post_details.title,
            text: post_details.text,
            image: post_details.image,
            thread_id: post_details.thread_id,
            author_id: user_id,
            edited: false,
            edited_time: new Date(),
        };
        // post_details.author_id = user_id;

        const new_post_details = await db.Post.create(updated_post_details);

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
    "/delete_post/post_id/:post_id",
    validate_request,
    async (request, response) => {
        try {
            const post_id = parseInt(request.params.post_id);
            const user_id = request.user_id;

            const result = await delete_post(post_id, user_id);

            response.json(result);
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
                edited_time: new Date(),
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
            error: e,
        });

        // response.json({
        //     error: e
        // })
    }
});

module.exports = router;
