const CustomError = ({ name, code, message }) => {
  const error = new Error(message);
  if (name) error.name = name;
  if (code) error.code = code;
  return error;
};

module.exports = CustomError;
