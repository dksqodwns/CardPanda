module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        userid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    },{
        tableName: 'user',
        timestamps: false
    });

    return User;
}