const { Sequelize, DataTypes } = require("sequelize");
const { DB, USER, PASSWORD, HOST, dialect, pool } = require("./db");
const { logger } = require("../utils");

const sequelize = new Sequelize(DB, USER, PASSWORD, {
  host: HOST,
  dialect: dialect,
  operatorsAliases: '0',
  pool: {
    max: pool.max,
    min: pool.min,
    acquire: pool.acquire,
    idle: pool.idle,
  },

  logging:
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test" ? false : logger.query,
});

sequelize
  .authenticate()
  .then(() => logger.success("Connected to DB"))
  .catch((err) => logger.error(err));

sequelize.sync({alter:true}).then(() => {
  logger.info("Synced with DB");
});
module.exports = { sequelize, DataTypes };
