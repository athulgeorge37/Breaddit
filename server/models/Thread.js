module.exports = (sequelize, DataTypes) => {
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const Thread = sequelize.define(
        "Thread",
        {
            title: {
                type: DataTypes.STRING(100),
                unique: true,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 500],
                        msg: "Thread description length must be betweeen [1, 500]",
                    },
                },
            },
            logo: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    isUrl: true,
                },
            },
            theme: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    isUrl: true,
                },
            },
            is_inappropriate: {
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
    Thread.associate = (models) => {
        Thread.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                name: "creator_id",
            },
            as: "creator_details",
            // when using include when findAll, and we want an alias
            // we use"as" here and there so sequelize knows what to use
        });

        Thread.hasMany(models.Rule, {
            foreignKey: {
                allowNull: false,
                name: "thread_id",
            },
            onDelete: "cascade",
            // hooks: true
            as: "thread_rules",
        });
    };

    return Thread;
};
