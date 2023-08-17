const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config,)

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Card = require('./Card')(sequelize, Sequelize);
db.Store = require('./Store')(sequelize, Sequelize);
db.Benefit = require('./Benefit')(sequelize, Sequelize);
db.UserCard = require('./UserCard')(sequelize, Sequelize);
db.UserStore = require('./UserStore')(sequelize, Sequelize);
db.CardBenefit = require('./CardBenefit')(sequelize, Sequelize);
db.StoreBenefit = require('./StoreBenefit')(sequelize, Sequelize);

// db.User.belongsToMany(db.Card, {through: db.UserCard});
// db.Card.belongsToMany(db.User, {through: db.UserCard});
//
// db.User.belongsToMany(db.Store, {through: db.UserStore});
// db.Store.belongsToMany(db.User, {through: db.UserStore});
//
// db.Card.belongsToMany(db.Benefit, {as: "benefits", through: db.CardBenefit});
// db.Benefit.belongsToMany(db.Card, {through: db.CardBenefit});
//
// db.Store.belongsToMany(db.Benefit, {through: db.StoreBenefit});
// db.Benefit.belongsToMany(db.Store, {through: db.StoreBenefit});

db.User.belongsToMany(db.Card, { through: db.UserCard, foreignKey: 'userid', otherKey: 'cardid' });
db.Card.belongsToMany(db.User, { through: db.UserCard, foreignKey: 'cardid', otherKey: 'userid' });

db.User.belongsToMany(db.Store, { through: db.UserStore, foreignKey: 'userid', otherKey: 'storeid' });
db.Store.belongsToMany(db.User, { through: db.UserStore, foreignKey: 'storeid', otherKey: 'userid' });

db.Card.belongsToMany(db.Benefit, { as: "benefits", through: db.CardBenefit, foreignKey: 'cardid', otherKey: 'benefitid' });
db.Benefit.belongsToMany(db.Card, { through: db.CardBenefit, foreignKey: 'benefitid', otherKey: 'cardid' });

db.Store.belongsToMany(db.Benefit, { through: db.StoreBenefit, foreignKey: 'storeid', otherKey: 'benefitid' });
db.Benefit.belongsToMany(db.Store, { through: db.StoreBenefit, foreignKey: 'benefitid', otherKey: 'storeid' });

db.User.hasMany(db.UserCard, { foreignKey: 'userid'});
db.UserCard.belongsTo(db.User, { foreignKey: 'userid' });

db.UserCard.belongsTo(db.Card, { foreignKey: 'cardid'});
db.Card.hasMany(db.UserCard, { foreignKey: 'cardid' });

db.UserStore.belongsTo(db.Store, { foreignKey: 'storeid' });
db.Store.hasMany(db.UserStore, { foreignKey: 'storeid' });

module.exports = db;
