const fs = require("fs");
const rfs = require("rotating-file-stream");
const path = require("path");

const logDirectory = path.join(__dirname, "../production_logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});

const development = {
  name: "development",
  asset_path: "/assets",
  session_cookie_key: "blahsomething",
  db: "codeial_devlopment",
  smtp: {
    service: "gmail",
    auth: {
      user: "demo759724@gmail.com",
      pass: process.env.CODEIAL_devlopment_smtp_pswd,
    },
  },
  google_client_id:
    "735296221009-87r72p14c1ep2end1cee2iamd9v36208.apps.googleusercontent.com",
  google_client_secret: "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",
  google_call_back_url: "http://localhost:9000/users/auth/google/callback",
  jwt_secret: "codeial",
  morgan: {
    mode: "dev",
    options: { stream: accessLogStream },
  },
};

const production = {
  name: "production",
  asset_path: process.env.CODEIAL_ASSET_PATH,
  session_cookie_key: process.env.CODEIAL_SESSION_COOKIE_KEY,
  db: process.env.CODEIAL_DB,
  smtp: {
    service: "gmail",
    auth: {
      user: process.env.CODEIAL_GMAIL_USERNAME,
      pass: process.env.CODEIAL_GMAIL_PASSWORD,
    },
  },
  google_client_id: process.env.CODEIAL_GOOGLE_CLIENT_ID,
  google_client_secret: process.env.CODEIAL_GOOGLE_CLIENT_SECRET,
  google_call_back_url: process.env.CODEIAL_GOOGLE_CALLBACK_RURL, //localhost:8000-codeial.com
  jwt_secret: process.env.CODEIAL_JWT_SECRET,
  morgan: {
    mode: "combined",
    options: { stream: accessLogStream },
  },
};

module.exports =
  eval(process.env.CODEIAL_ENVIRONMENT) == undefined
    ? development
    : eval(process.env.CODEIAL_ENVIRONMENT);

// We will be using Morgan as a middleware
// To save the logs in the file we will be using a middleware that will put those logs in the file but also that file can grow huge, to prevent in growing huge either we create a backup for weekly logs or we keep on deleting the older logs.
