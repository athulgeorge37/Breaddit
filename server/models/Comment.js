module.exports = (sequelize, DataTypes) => {
    
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Comment = sequelize.define("Comment", {
        text: {
            type: DataTypes.STRING(600),
            allowNull: false
        },
        edited: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        is_reply: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: false
    })


    // the asssociation this table has with other tables
    Comment.associate = (models) => {

        Comment.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                name: "author_id"
            },
            as: "author_details",
        })

        Comment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false,
                name: "post_id"
            }
        })


        Comment.hasMany(models.Vote, {
            foreignKey: {
                // can be null
                name: "comment_id"
            },
            onDelete: "cascade"
        })

        // associations to Replys

        // Comment.belongsToMany(models.Comment, {
        //     foreignKey: {
        //         allowNull: false,
        //         name: "comment_id"
        //     },
        //     as: "replies",
        //     through: "Replies",
        // })

        Comment.belongsToMany(models.Comment, {
            through: models.Reply,
            as: "Reply_IDs",
            foreignKey: "reply_id",

            onDelete: 'cascade'
        })
        Comment.belongsToMany(models.Comment, {
            through: models.Reply,
            as: "Parent_Comment_IDs",
            foreignKey: "parent_comment_id",

            onDelete: 'cascade'
        })

        Comment.hasMany(models.Reply, {
            foreignKey: "reply_id",
            // as: 'FollowerLinks',

            // onDelete: "cascade"
        })
        Comment.hasMany(models.Reply, {
            foreignKey: "parent_comment_id",
            // as: 'FollowingLinks',

            // onDelete: "cascade"
        })
    }

    return Comment
}