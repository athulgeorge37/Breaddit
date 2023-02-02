module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Vote = sequelize.define(
        "Vote",
        {
            parent_type: {
                type: DataTypes.STRING(50),
                allowNull: false,
                validate: {
                    isIn: {
                        // ensures that parent type is on of the following
                        args: [["post", "comment", "reply"]],
                        msg: "parent_type must be one of ['post', 'comment', 'reply']",
                    },
                },
            },
            up_vote: {
                type: DataTypes.BOOLEAN, // client side will limit to 15
                allowNull: false,
                // up_vote = true,
                // down_vote = false
                // no like = not in the table
            },
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            comment_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            createdAt: false,
            validate: {
                // validates any entry into Vote table
                // ensuring that all fields are entered corectly
                validate_vote_combination() {
                    // if (this.post_id === undefined) {
                    //     this.post_id = null
                    // }
                    // if (this.comment_id === undefined) {
                    //     this.comment_id = null
                    // }

                    if (this.post_id === null && this.comment_id === null) {
                        throw new Error(
                            "Both post_id and comment_id cannot be null, only 1 can be null"
                        );
                    }

                    // if (!this.post_id && !this.comment_id) {
                    //     throw new Error(`Both post_id and comment_id cannot be filled, only 1 can be filled post_id=${this.post_id}, comment_id=${this.comment_id}`)
                    // }

                    if (
                        this.post_id !== null &&
                        (this.parent_type === "comment" ||
                            this.parent_type === "reply")
                    ) {
                        throw new Error(
                            "Please ensure parent_type is 'post' when filling post_id"
                        );
                    }

                    if (
                        this.comment_id !== null &&
                        this.parent_type === "post"
                    ) {
                        throw new Error(
                            "Please ensure parent_type is 'comment' or 'reply' when filling comment_id"
                        );
                    }
                },
            },
        }
    );

    // the asssociation this table has with other tables
    // Vote.associate = (models) => {
    //     Vote.belongsTo(models.Post, {
    //         foreignKey: {
    //             // can be null,
    //             name: "post_id",
    //         },
    //     });

    //     Vote.belongsTo(models.Comment, {
    //         foreignKey: {
    //             // can be null
    //             name: "comment_id",
    //         },
    //     });

    //     Vote.belongsTo(models.User, {
    //         foreignKey: {
    //             allowNull: false,
    //             name: "user_id",
    //         },
    //         as: "voter_details",
    //     });
    // };

    return Vote;
};
