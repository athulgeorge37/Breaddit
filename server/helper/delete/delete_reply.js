const db = require("../../models");

const delete_reply = async (reply_id, user_id) => {
    const reply_to_delete = await db.Comment.findOne({
        where: {
            author_id: user_id,
            id: reply_id,
            is_reply: true,
        },
    });
    if (reply_to_delete === null) {
        return {
            deleted: false,
            msg: "unable to delete non existing reply",
        };
    }

    // deleting all the votes associated with the reply
    await db.Vote.destroy({
        where: {
            comment_id: reply_id,
            parent_type: "reply",
        },
    });

    // deleting the parent comment and reply relationship in the Reply table
    await db.Reply.destroy({
        where: {
            reply_id: reply_id,
        },
    });

    // deleting the reply
    await db.Comment.destroy({
        where: {
            id: reply_id,
            is_reply: true,
        },
    });

    return {
        deleted: true,
        msg: "succesfully deleted reply",
    };
};

module.exports = delete_reply;
