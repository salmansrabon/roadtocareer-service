const errorHandler = (err, req, res, next) => {
  if (err.code)
    return res.status(err.code).send({
      message: err.message,
      ...(err.error && { error: err.error }),
    });

  if (err.name === "JsonWebTokenError")
    return res.status(401).send({
      message: "Token missing or invalid",
    });

  if (err.name === "ValidationError")
    return res.status(400).send({
      message: "Validation Error",
      error: err.details,
    });

  if (err.name === "SequelizeValidationError")
    return res.status(400).send({
      message: "Sequelize Error",
      error: err.errors,
    });
  return res.status(400).send({ error: err , message:"Bad Request"});
};

module.exports = errorHandler;
