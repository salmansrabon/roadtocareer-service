const chalk = require("chalk");

const info = (...params) => console.log(chalk.blue(...params));
const success = (...params) => console.log(chalk.green(...params));
const error = (...params) => console.error(chalk.red(...params));
const query = (...params) => {
  // console.log(chalk.cyan("\nSequelize query..."));
  // console.log(chalk.rgb(161, 161, 161).dim(...params));
};

module.exports = {
  info,
  query,
  success,
  error,
};
