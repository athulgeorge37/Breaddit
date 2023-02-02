module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const User = sequelize.define(
        "User",
        {
            role: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "user",
                validate: {
                    isIn: {
                        // ensures that parent role is on of the following
                        args: [["user", "admin"]],
                        msg: "parent_type must be one of ['user', 'admin']",
                    },
                },
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        args: true,
                        msg: "email is not valid",
                    },
                },
            },
            username: {
                type: DataTypes.STRING(30), // client side will limit to 15
                allowNull: false,
                unique: true,
                validate: {
                    len: {
                        args: [3, 15],
                        msg: "username length must be betweeen [3, 15]",
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            profile_pic: {
                type: DataTypes.STRING(100),
                allowNull: true,
                validate: {
                    isUrl: true,
                },
            },
            bio: {
                type: DataTypes.STRING(200),
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            is_banned: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            updatedAt: false,
        }
    );

    // the asssociation this table has with other tables
    // User.associate = (models) => {
    //     User.hasMany(models.Post, {
    //         // the foreign key when we create a post will be called "author_id"
    //         foreignKey: "author_id",
    //         // when a row in User is deleted,
    //         // any table that relates to this will also be deleted
    //         onDelete: "cascade",
    //     });

    //     User.hasMany(models.Comment, {
    //         foreignKey: "author_id",
    //         onDelete: "cascade",
    //     });

    //     User.hasMany(models.Vote, {
    //         foreignKey: "user_id",
    //         onDelete: "cascade",
    //     });

    //     User.hasMany(models.Thread, {
    //         foreignKey: "creator_id",
    //         onDelete: "cascade",
    //     });

    //     // assoications for user login/logout activity
    //     User.hasMany(models.UserActivity, {
    //         foreignKey: "user_id",
    //         onDelete: "cascade",
    //     });

    //     // associations for follower table
    //     User.belongsToMany(models.User, {
    //         through: models.Follower,
    //         as: "User_ids",
    //         foreignKey: "user_id",
    //     });
    //     User.belongsToMany(models.User, {
    //         through: models.Follower,
    //         as: "Followed_by",
    //         foreignKey: "followed_by",
    //     });

    //     User.hasMany(models.Follower, {
    //         foreignKey: "user_id",
    //         // as: 'FollowerLinks',

    //         onDelete: "cascade",
    //     });
    //     User.hasMany(models.Follower, {
    //         foreignKey: "followed_by",
    //         // as: 'FollowingLinks',

    //         onDelete: "cascade",
    //     });
    // };

    return User;
};
