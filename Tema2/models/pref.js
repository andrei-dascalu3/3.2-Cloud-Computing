const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Pref = sequelize.define(
  "pref",
  {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    movie_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
  },
  {
    timestamps: false,
    tableName: "users",
  }
);

module.exports = Pref;
