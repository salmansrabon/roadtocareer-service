const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const errors = require("express-async-errors");
const cors = require("cors");
const logger = require("morgan");
const Logger = require("./utils/logger");

const { appPort } = require("./variables");
const { publicRouter, privateRouter, adminAccessRouter } = require("./routes");
const { auth, errorHandler, withAdminAuth } = require("./middlewires");
const { withAuth } = require("./middlewires/withAuth");

const app = express();

const PORT = appPort || 8000;

app.use(express.static(path.join(__dirname, "public")));

// middlewires
app.use(cors());
app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer().array())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Replace this with your own logic to get the user ID
    const destinationFolder = `./public/tempDir`;
    // Check if destination folder exists
    if (!fs.existsSync(destinationFolder)) {
      // Create destination folder if it doesn't exist
      fs.mkdirSync(destinationFolder, { recursive: true });
    }
    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
// app.use(upload.array())

// Define POST /upload-image endpoint to handle file uploads
app.post("/upload-image", withAuth, upload.single("image"), (req, res) => {
  // If the file was uploaded successfully, send a success response
  let dir = req.body.destination;
  let fileName = req.file.filename;
  let dest_path = "./public/images/" + dir + "/";
  if (!fs.existsSync(dest_path)) {
    fs.mkdirSync(dest_path, { recursive: true });
  }
  if (typeof req.body?.previous !== undefined) {
    fs.unlink(`./public/images/${dir}/${req.body.previous}`, (err) => {
      if (err) console.log(err);
      console.log(` succesfully deleted ./public/images/${dir}/${req.body.previous}`);
    });
  }

  fs.move("./public/tempDir/" + fileName, dest_path + fileName, { overwrite: true })
    .then(() => {
      res.send({ message: "Image uploaded successfully" });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error movoing image" });
    });
});
// routers
app.use(publicRouter);
app.use(auth.withAuth, privateRouter);
app.use(auth.withAdminAuth, adminAccessRouter);

// error handler
app.use(errorHandler);

// server
app.listen(PORT, () => {
  Logger.success(`Server is listening on port ${PORT}`);
});

module.exports = app;
