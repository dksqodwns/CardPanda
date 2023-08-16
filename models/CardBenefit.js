module.exports = (sequelize, DataTypes) => {
    const CardBenefit = sequelize.define('CardBenefit', {
        cardid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        benefitid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
    }, {
        tableName: "Card_benefit",
        timestamps: false
    });

    return CardBenefit;
};
