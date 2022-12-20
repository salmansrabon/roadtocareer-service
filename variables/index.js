require("dotenv").config();

const brand = process.env.BRAND;
const jwtSecret = process.env.JWT_SECRET;
const appPort = process.env.APP_PORT || "8000";
const dbHost = process.env.DB_HOST || "localhost";
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const nodemailerUser = process.env.NODEMAILER_USER;
const nodemailerPassword = process.env.NODEMAILER_PASSWORD;
const baseUrl = process.env.BASE_URL || "localhost:3000"
const nodemailerHost = process.env.NODEMAILER_HOST
const nodemailerPort = process.env.NODEMAILER_PORT
console.log({ dbHost });

module.exports = {
  brand,
  jwtSecret,
  appPort,
  dbHost,
  dbName,
  dbUser,
  dbPassword,
  nodemailerUser,
  nodemailerPassword,
  baseUrl
};
