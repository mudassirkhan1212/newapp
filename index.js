const express = require("express");
const path = require("path");

const collection = require("./models/post");
const imagestorage = require("./models/imagestorage");
const cloudinary = require("cloudinary").v2;
const MongoDBconnection = require("./connection");
const postRoutes = require("./routes/postroutes");

const dotenv = require("dotenv");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const multer = require("multer");

// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));
dotenv.config({ path: "config.env" });
app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyparser.urlencoded({ extended: true }));
// log requests
app.use(morgan("tiny"));

MongoDBconnection();


// Use routes
app.use("/", postRoutes);

const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
