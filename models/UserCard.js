module.exports = (sequelize, DataTypes) => {
    const UserCard = sequelize.define('UserCard', {
        userid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        cardid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
    }, {
        tableName: 'user_card',
        timestamps: false
    });

    return UserCard;
};
