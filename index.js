const express = require("express");
const env = require("./config/environment");
const logger = require("morgan");

// require dotenv
require("dotenv").config();

const bodyParser = require("body-parser");

// Setup for cookie
const cookieParser = require("cookie-parser");

const app = express();
require("./config/view-helper")(app);
const port = process.env.PORT;

// set up the layouts
const expressLayouts = require("express-ejs-layouts");
// app.use(expressLayouts);

// setup database
const db = require("./config/mongoose");

// use for session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const passportGoogle = require("./config/passport-google-oauth2-strategy");
const passportJWT = require("./config/passport-jwt-strategy");

const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const customMware = require("./config/middleware");

// setup the chat server to be used with socket.io
const chatServer = require("http").Server(app);
const chatSockets = require("./config/chat_sockets").chatSockets(chatServer);
chatServer.listen(5000);
console.log("Chat server is lisening on port 5000");

const path = require("path");
const { config } = require("process");
// example:  path.join(_dirname, env.asset_path, 'scss');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded()); //add body-parser

// cookie
app.use(cookieParser());

// use assets like css js and images
app.use(express.static(__dirname + env.asset_path));
app.use(express.static(__dirname + "/public/assets"));

// make the uploads path available to the browser
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(logger(env.morgan.mode, env.morgan.options));
app.use(expressLayouts);

// extract style and script from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// set up the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// mongo store is used to store session cookie in the db
app.use(
  session({
    name: "codeial",
    //Todo change the secret before deployment in production mode
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false, //true
    cookie: {
      maxAge: 2000 * 60 * 100,
    },
    Store: MongoStore.create(
      {
        mongoUrl: "mongodb://127.0.0.1/codeial_delopment",
        autoRemove: "disable",
      },
      function (err) {
        console.log(err || "connect-mongodb setup OK");
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`Error is running the server: ${err}`);
  }

  console.log(`Server is running in port: ${port}`);
});
