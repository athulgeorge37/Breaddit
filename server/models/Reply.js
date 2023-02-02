module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Reply = sequelize.define(
        "Reply",
        {
            id: {
                type: DataTypes.INTEGER,
                // allowNull: false,
                // unique: true,
                primaryKey: true,
                autoIncrement: true,
            },
            reply_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            parent_comment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
        }
    );

    // the asssociation this table has with other tables
    // Reply.associate = (models) => {
    //     Reply.belongsTo(models.Comment, {
    //         foreignKey: "reply_id",
    //         as: "reply_content",

    //         onDelete: "cascade",
    //     });
    //     Reply.belongsTo(models.Comment, {
    //         foreignKey: "parent_comment_id",
    //         as: "parent_comment_id_content",

    //         onDelete: "cascade",
    //     });
    // };

    return Reply;
};
