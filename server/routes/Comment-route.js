const determine_order_by = require("../helper/FilterBy");
const express = require("express");
const { validate_request } = require("../middlewares/AuthenticateRequests");
const router = express.Router();

const db = require("../models");

router.put(
    "/edit_comment_or_reply",
    validate_request,
    async (request, response) => {
        try {
            const { comment_id, updated_text } = request.body;

            await db.Comment.update(
                {
                    text: updated_text,
                    edited: true,
                    edited_time: new Date(),
                },
                {
                    where: {
                        id: comment_id,
                        // author_id: request.user_id
                    },
                }
            );

            response.json({
                msg: "Succesfully edited comment/reply in db",
            });
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get(
    "/is_any/of_type/:type/for_parent_id/:id",
    async (request, response) => {
        // checks if there is any comments,
        // required to quickly find if we should render the comment_section/show_replies btn

        // when type === comment, in which case parent_id is for a post
        // when type === reply, in which case parent_id is for a comment

        try {
            const type = request.params.type;
            const parent_id = request.params.id;

            let is_any;
            if (type === "comment") {
                is_any = await db.Comment.findOne({
                    where: {
                        post_id: parent_id,
                        is_reply: false,
                    },
                });
            } else if (type === "reply") {
                is_any = await db.Reply.findOne({
                    where: {
                        parent_comment_id: parent_id,
                    },
                });
            } else {
                response.json({
                    error: `${type} is not a valid type`,
                });
            }

            if (is_any === null) {
                response.json({
                    is_any: false,
                });
            } else {
                response.json({
                    is_any: true,
                });
            }
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.get("/get_all_comments_by_user", async (request, response) => {
    // checks if there is any comments,
    // required to quickly find if we should render the comment_section/show_replies btn

    // when type === comment, in which case parent_id is for a post
    // when type === reply, in which case parent_id is for a comment

    try {
        const username = request.query.username;

        const is_reply = request.query.is_reply;

        const limit = parseInt(request.query.limit);
        let page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const order_by = determine_order_by(request.query.filter_by);

        const user_details = await db.User.findOne({
            where: {
                username: username,
            },
        });

        const all_user_comments = await db.Comment.findAll({
            where: {
                author_id: user_details.id,
                is_reply: is_reply === "true" ? true : false,
            },
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

        if (is_reply === "false") {
            response.json({
                msg: "Sucesfully got comments",
                all_comments: all_user_comments,
            });
            return;
        }

        const list_of_reply_ids = all_user_comments.map((comment) => {
            return comment.id;
        });

        const all_parent_comment_ids = await db.Reply.findAll({
            where: {
                reply_id: list_of_reply_ids,
            },
        });

        const all_reply_and_parent_comments = [];
        await Promise.all(
            all_parent_comment_ids.map(async (item, index) => {
                const parent_comment = await db.Comment.findOne({
                    where: {
                        id: item.parent_comment_id,
                    },
                    include: [
                        {
                            model: db.User,
                            as: "author_details",
                            attributes: ["username", "profile_pic"],
                        },
                    ],
                });

                all_reply_and_parent_comments.push({
                    parent_comment: parent_comment,
                    reply_comment: all_user_comments[index],
                });
            })
        );

        response.json({
            msg: "succesfully got replies with parent comments",
            all_comments: all_reply_and_parent_comments,
        });
        return;
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_all_comments", async (request, response) => {
    // gets all the comments of a post or the replies of a comment
    // where the id is the post_id
    // and the is_reply determines if the response is
    // a list of comments or a list of replies

    try {
        const post_id = request.query.post_id;
        const limit = parseInt(request.query.limit);
        let page_num = parseInt(request.query.page_num);
        const offset = limit * page_num;

        const order_by = determine_order_by(request.query.filter_by);

        const list_of_comments = await db.Comment.findAll({
            where: {
                post_id: post_id,
                is_reply: false,
            },
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
            msg: "succesfully got comments of post_id",
            all_comments: list_of_comments,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.get("/get_all_replies", async (request, response) => {
    // gets all the comments of a post or the replies of a comment
    // where the id is the post_id
    // and the is_reply determines if the response is
    // a list of comments or a list of replies

    try {
        const comment_id = request.query.comment_id;
        const limit = parseInt(request.query.limit);
        let page_num = parseInt(request.query.page_num);

        const offset = limit * page_num;

        const order_by = determine_order_by(request.query.filter_by);

        // getting the list of reply ids
        const list_of_reply_ids_data = await db.Reply.findAll({
            where: {
                parent_comment_id: comment_id, // parent_id here is === parent_comment_id
            },
            attributes: ["reply_id"],
        });

        // only selecting the reply_id from the data
        const list_of_reply_ids = list_of_reply_ids_data.map(
            (row) => row.reply_id
        );

        const list_of_replies = await db.Comment.findAll({
            where: {
                id: list_of_reply_ids, // getting all comment details using the reply ids
            },
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
            msg: "succesfully got replies of parent_comment_id",
            all_replies: list_of_replies,
        });
    } catch (e) {
        response.json({
            error: e,
        });
    }
});

router.post(
    "/create/of_type/:type",
    validate_request,
    async (request, response) => {
        try {
            const type = request.params.type;
            // parent_comment_id is not required to be included in body when type === comment
            const { post_id, text, parent_comment_id } = request.body;
            const author_id = request.user_id;

            if (type === "comment") {
                const new_comment_details = await db.Comment.create({
                    author_id: author_id,
                    post_id: post_id,
                    text: text,
                    edited: false,
                    edited_time: new Date(),
                    is_reply: false,
                });

                response.json({
                    msg: `succesfully created comment`,
                    new_comment_or_reply_details: new_comment_details,
                });
            } else if (type === "reply") {
                const new_reply_details = await db.Comment.create({
                    post_id: post_id,
                    author_id: author_id,
                    text: text,
                    edited: false,
                    edited_time: new Date(),
                    is_reply: true,
                });

                await db.Reply.create({
                    reply_id: new_reply_details.id,
                    parent_comment_id: parent_comment_id,
                });

                response.json({
                    msg: `succesfully created reply`,
                    new_comment_or_reply_details: new_reply_details,
                });
            } else {
                response.json({
                    error: `${type} is not a valid type`,
                });
            }
        } catch (e) {
            response.json({
                error: e,
            });
        }
    }
);

router.delete("/delete/of_type/:type/by_id/:id", async (request, response) => {
    try {
        const type_to_delete_id = request.params.id;
        const type = request.params.type;

        if (type === "comment") {
            // had to implement delete replies when deleting comment
            // cus onDelete: 'cascade' would not work
            const all_replies = await db.Reply.findAll({
                where: {
                    parent_comment_id: type_to_delete_id,
                },
                attributes: ["reply_id"],
            });

            const reply_ids = [];
            for (const obj of all_replies) {
                reply_ids.push(obj.reply_id);
            }

            // destorying all replies of that comment in Comment table
            await db.Comment.destroy({
                where: {
                    id: reply_ids,
                },
            });
        } else if (type === "reply") {
            // pass
        } else {
            response.json({
                error: `${type} is not a valid type`,
            });
        }

        // destroying original comment or reply
        await db.Comment.destroy({
            where: {
                id: type_to_delete_id,
                // author_id: request.user_id  // get from validate_request
            },
        });

        if (type === "comment") {
            response.json({
                msg: "Succesfully removed comment and its replies from DB",
            });
        } else {
            response.json({
                msg: "Succesfully removed reply from DB",
            });
        }
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
