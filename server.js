// ===== Load environment variables ======
require("dotenv").config();

// ===== Packages ======
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const dbConnection = require("./db"); // loads our connection to the mongo database 
const passport = require("./passport");
const app = express();
const PORT = process.env.PORT || 3001;

// ===== Middleware ======
app.use(morgan("dev"));

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

//JSON via body parser
app.use(bodyParser.json());

//Set up session
app.use(
  session({
    secret: process.env.APP_SECRET || "this is a default passphrase you should have your own",
    store: new MongoStore({ mongooseConnection: dbConnection }),
    resave: false,
    saveUninitialized: false
  })
);

//Set up headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// ===== Passport ======
app.use(passport.initialize());
app.use(passport.session()); // will call the deserializeUser

// ====== Routing ======
const routes = require("./routes");
app.use(routes);

// ====== Error handler ======
app.use(function(err, req, res, next) {
  ("====== ERROR =======");
  console.error(err.stack);
  //(TO-DO) log the error
  res.status(500);
});

app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});

