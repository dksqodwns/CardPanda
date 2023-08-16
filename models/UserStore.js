module.exports = (sequelize, DataTypes) => {
    const UserStore = sequelize.define('UserStore', {
        userid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        storeid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
    }, {
        tableName: "user_store",
        timestamps: false
    });

    return UserStore;
};
