module.exports = (sequelize, DataTypes) => {
    
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Post = sequelize.define("Post", {
        title: {
            type: DataTypes.STRING(100),  
            allowNull: false,
        }, 
        text: {
            type: DataTypes.STRING(600),
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        edited: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        }
    }, {
        timestamps: true,
    })


    // the asssociation this table has with other tables
    Post.associate = (models) => {
        // Post.hasMany(models.Comment, {
        //     onDelete: "cascade"
        // });

        Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                name: "author_id"
            }
        })

        Post.hasMany(models.Comment, {
            foreignKey: {
                allowNull: false,
                name: "parent_id"
            },
            onDelete: "cascade"
        })

        Post.hasMany(models.Vote, {
            foreignKey: {
                // can be null
                name: "post_id"
            },
            onDelete: "cascade"
        })
    }

    return Post
}