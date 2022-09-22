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
    })


    // the asssociation this table has with other tables
    Comment.associate = (models) => {

        Comment.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                name: "author_id"
            }
        })

        Comment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false,
                name: "parent_id"
            }
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