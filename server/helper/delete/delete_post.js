const db = require("../../models");
const delete_comment = require("./delete_comment");

const delete_post = async (post_id, user_id) => {
    const post_details = await db.Post.findOne({
        where: {
            id: post_id,
            author_id: user_id,
        },
    });

    if (post_details === null) {
        return {
            deleted: false,
            msg: "post does not exist",
        };
    }

    // deleting all the votes associated with the post
    await db.Vote.destroy({
        where: {
            post_id: post_id,
            parent_type: "post",
        },
    });

    const all_post_comments = await db.Comment.findAll({
        where: {
            post_id: post_id,
        },
    });

    const all_post_comment_ids = all_post_comments.map((comment) => {
        return comment.id;
    });

    // console.log("");
    // console.log({ all_post_comment_ids });
    // console.log("");

    await Promise.all(
        all_post_comment_ids.map(async (comment_id) => {
            await delete_comment(comment_id);
        })
    );

    await db.Post.destroy({
        where: {
            id: post_id,
        },
    });

    return {
        deleted: true,
        msg: "Sucesfully deleted post",
    };
};

module.exports = delete_post;
