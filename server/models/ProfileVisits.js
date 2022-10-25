module.exports = (sequelize, DataTypes) => {
    
    // when adding any data into this db Table,
    // it automatically generates an id, createdAt, updatedAt columns

    const ProfileVisits = sequelize.define("ProfileVisits", {
        id: {
            type: DataTypes.INTEGER,
            // allowNull: false,
            // unique: true,
            primaryKey: true,
            autoIncrement: true,
        },
        visit_time: {
            type: DataTypes.DATE,
            allowNull: false
        },      
        user_id: {
            type: DataTypes.INTEGER,
            // foreignKey: true,
            allowNull: false
        },
        visited_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
        // createdAt: false
    })

    // had to manually create foreign keys, with no association
    // cus if we try to add a new profile visit with the same user id and visited by
    // we get a sequelize duplication error

    // when there is no assoication we can create multiple entries 
    // for the same profile visit when the times are different

    return ProfileVisits
}