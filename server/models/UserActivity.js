module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const UserActivity = sequelize.define(
        "UserActivity",
        {
            login_time: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            logout_time: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            timestamps: false,
        }
    );

    // the asssociation this table has with other tables
    // UserActivity.associate = (models) => {
    //     UserActivity.belongsTo(models.User, {
    //         foreignKey: {
    //             // can be null,
    //             name: "user_id",
    //         },
    //     });
    // };

    return UserActivity;
};
