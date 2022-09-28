module.exports = (sequelize, DataTypes) => {
    
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Comment = sequelize.define("Comment", {
        text: {
            type: DataTypes.STRING(250),
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
            as: "author_details"
        })

        Comment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false,
                name: "parent_id"
            }
        })

        // Comment.hasMany(models.Comment, {
        //     foreignKey: {
        //         // can be null
        //         name: "comment_parent_id"
        //     },
        //     as: "my_replies",
        //     through: "replies",
        //     onDelete: "cascade"
        // })
        Comment.belongsToMany(models.Comment, {
            foreignKey: {
                allowNull: false,
                name: "comment_id"
            },
            as: "replies",
            through: "Replies",
        })

        Comment.hasMany(models.Vote, {
            foreignKey: {
                // can be null
                name: "comment_id"
            },
            onDelete: "cascade"
        })
    }

    return Comment
}