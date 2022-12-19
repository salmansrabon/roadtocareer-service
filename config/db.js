const variables = require("../variables");

module.exports = {
  HOST: variables.dbHost,
  USER: variables.dbUser,
  PASSWORD: variables.dbPassword,
  DB: variables.dbName,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
