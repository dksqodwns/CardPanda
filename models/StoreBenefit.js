module.exports = (sequelize, DataTypes) => {
    const StoreBenefit = sequelize.define('StoreBenefit', {
        storeid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        benefitid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        category_number: DataTypes.INTEGER,
    }, {
        tableName: "store_benefit",
        timestamps: false
    });

    return StoreBenefit;
};
