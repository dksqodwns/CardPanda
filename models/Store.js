const {DataTypes} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const Store = sequelize.define('Store', {
        storeid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        store_name: DataTypes.STRING,
        store_category: DataTypes.STRING,
        category_number: DataTypes.INTEGER,
    },
        {
        tableName: 'store',
        timestamps: false
    })
    return Store;
}