const express = require("express");
const errors = require("express-async-errors");
const cors = require("cors");
const logger = require("morgan");
const Logger = require("./utils/logger");

const { appPort } = require("./variables");
const { publicRouter, privateRouter } = require("./routes");
const { withAuth, errorHandler } = require("./middlewires");

const app = express();

const PORT = appPort || 8000;

// middlewires
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routers
app.use(publicRouter);
app.use(withAuth, privateRouter);

// error handler
app.use(errorHandler);

// server
app.listen(PORT, () => {
  Logger.success(`Server is listening on port ${PORT}`);
});

module.exports = app;
