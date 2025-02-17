var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const { Pool } = require("pg");

const pool = new Pool({
  user: "feriprasetiyo",
  host: "localhost",
  database: "barang",
  password: "12345",
  port: 5432,
});

var indexRouter = require("./routes/index")(pool);
var usersRouter = require("./routes/barang")(pool);
var beliRouter = require("./routes/beli")(pool);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(fileUpload());

app.use("/", indexRouter);
app.use("/barang", usersRouter);
app.use("/beli", beliRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
