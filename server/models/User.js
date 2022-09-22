module.exports = (sequelize, DataTypes) => {
    
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const User = sequelize.define("User", {
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    args: true,
                    msg: "email is not valid"
                }
            }
        },
        username: {
            type: DataTypes.STRING(30),  // client side will limit to 15
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [3, 15],
                    msg: "username length must be betweeen [3, 15]"
                }
            }
        }, 
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profile_pic: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        bio: {
            type: DataTypes.STRING(200),
            allowNull: true,
            validate: {
                notEmpty: true
            }
        }

    }, {
        timestamps: true,
        updatedAt: false
    })

    // the asssociation this table has with other tables
    User.associate = (models) => {

        User.hasMany(models.Post, {
            // the foreign key when we create a post will be called "author_id"
            foreignKey: "author_id",
            // when a row in User is deleted,
            // any table that relates to this will also be deleted
            onDelete: "cascade"
        });

        User.hasMany(models.Comment, {
            // the foreign key when we create a post will be called "author_id"
            foreignKey: "author_id",
            // when a row in User is deleted,
            // any table that relates to this will also be deleted
            onDelete: "cascade"
        });

        User.hasMany(models.Vote, {
            // the foreign key when we create a post will be called "author_id"
            foreignKey: "user_id",
            // when a row in User is deleted,
            // any table that relates to this will also be deleted
            onDelete: "cascade"
        });

    }

    return User
}