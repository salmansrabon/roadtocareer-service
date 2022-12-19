module.exports = {
  logger: require("./logger"),
  validator: require("./validator"),
  customError: require("./errorConstructor"),
  mailer: require("./mailer"),
  randomPassGenerate: require('./password_generator'),
  isEmail:require('./checkEmail')
};
