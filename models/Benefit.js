module.exports = (sequelize, DataTypes) => {
    const Benefit = sequelize.define('Benefit', {
        benefitid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        store_category: DataTypes.STRING,
        benefit_detail: DataTypes.TEXT
    },{
        tableName: 'benefit',
        timestamps: false
    });

    return Benefit;
};
