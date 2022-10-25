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
            allowNull: false,
            validate: {
                len: {
                    args: [0, 600],
                    msg: "post text length must be betweeen [1, 500]"
                }
            }
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
        },
        is_inappropriate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: false
    })


    // the asssociation this table has with other tables
    Post.associate = (models) => {
        // Post.hasMany(models.Comment, {
        //     onDelete: "cascade"
        // });

        Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                name: "author_id",
                
            },
            as: "author_details"
            // when using include when findAll, and we want an alias
            // we use"as" here and there so sequelize knows what to use
        })

        Post.hasMany(models.Comment, {
            foreignKey: {
                allowNull: false,
                name: "post_id"
            },
            onDelete: "cascade",
            // hooks: true
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