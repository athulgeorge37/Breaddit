module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Rule = sequelize.define(
        "Rule",
        {
            title: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(300),
                allowNull: false,
            },
        },
        {
            timestamps: false,
        }
    );

    // the asssociation this table has with other tables
    // Rule.associate = (models) => {
    //     Rule.belongsTo(models.Thread, {
    //         foreignKey: {
    //             allowNull: false,
    //             name: "thread_id",
    //         },
    //         as: "all_rules",
    //     });
    // };

    return Rule;
};
