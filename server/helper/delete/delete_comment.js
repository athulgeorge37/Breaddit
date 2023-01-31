const db = require("../../models");

const delete_comment = async (comment_id, user_id = null) => {
    if (user_id !== null) {
        const comment_to_delete = await db.Comment.findOne({
            where: {
                id: comment_id,
                author_id: user_id,
                is_reply: false,
            },
        });

        if (comment_to_delete === null) {
            return {
                deleted: false,
                msg: "comment does not exist",
            };
        }
    }

    // deleting all the comments votes
    await db.Vote.destroy({
        where: {
            comment_id: comment_id,
            parent_type: "comment",
        },
    });

    // getting all the replies associated with the comment
    const all_replies = await db.Reply.findAll({
        where: {
            parent_comment_id: comment_id,
        },
    });

    // getting all the reply ids associated with the comment
    const all_reply_ids = all_replies.map((item) => {
        return item.reply_id;
    });

    // deleting all the comment reply relationship in Reply table
    await db.Reply.destroy({
        where: {
            parent_comment_id: comment_id,
        },
    });

    // deleting all the votes associated with the replies
    await db.Vote.destroy({
        where: {
            comment_id: all_reply_ids,
            parent_type: "reply",
        },
    });

    // deleting all the reply comments in the Comment table
    await db.Comment.destroy({
        where: {
            id: all_reply_ids,
            is_reply: true,
        },
    });

    // finally deleting the actual comment
    await db.Comment.destroy({
        where: {
            id: comment_id,
            is_reply: false,
        },
    });

    return {
        deleted: true,
        msg: "succesfully deleted comment",
    };
};

module.exports = delete_comment;
