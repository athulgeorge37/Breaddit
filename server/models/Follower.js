module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Follower = sequelize.define(
        "Follower",
        {
            id: {
                type: DataTypes.INTEGER,
                // allowNull: false,
                // unique: true,
                primaryKey: true,
                autoIncrement: true,
            },
            followed_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            createdAt: false,
        }
    );

    // the asssociation this table has with other tables
    // Follower.associate = (models) => {
    //     Follower.belongsTo(models.User, {
    //         foreignKey: "followed_by",
    //         as: "followed_by_user_details",
    //     });
    //     Follower.belongsTo(models.User, {
    //         foreignKey: "user_id",
    //         as: "user_id_details",
    //     });
    // };

    return Follower;
};
