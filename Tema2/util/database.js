const Sequelize = require("sequelize");
const Config = require("../config.json");

let db = Config.database;
const sequelize = new Sequelize(db.name, db.user, db.password, {
    dialect: "mysql",
    host: "localhost",
});

module.exports = sequelize;