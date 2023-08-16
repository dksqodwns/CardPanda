
module.exports = (sequelize, DataTypes) => {
    const Card = sequelize.define('Card', {
        cardid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        card_company: DataTypes.STRING,
        card_name: DataTypes.STRING,
        card_image: DataTypes.STRING
    },{
        tableName: 'card',
        timestamps: false
    })
    return Card;
}