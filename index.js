if (process.env.NODE_ENV !== "production")
  require("dotenv").config({ path: "./config/config.env" });

const express = require("express");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const path = require("path");
const connectDB = require("./config/db");
const passport = require("passport");
const localStrategy = require("passport-local");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");

// Requiring routes
const mainRoutes = require("./routes/index");

const app = express();

connectDB();

// EJS
// Install ejs package as express will require it in this file automatically
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));

// Middleware

// Static folder
// We use this builtin middleware func (express.static) to serve our static assets in the public directory.
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse urlencoded data
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secrettobereplaced",
    resave: false,
    saveUninitialized: false,
  })
);

// Flash middleware
app.use(flash());

// Passport middleware:
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  
  if(!['/login','/register','/logout'].includes(req.originalUrl))
    req.session.returnTo = req.originalUrl;
  else
    req.session.returnTo = '';
  res.locals.currUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.use("/", mainRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode and listening on port ${PORT}`
  );
});