const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// @desc    Dashboard
// @route   GET /
router.get("/", isLoggedIn, (req, res) => {
  res.render("dashboard");
});

router.get("/dashboard", isLoggedIn, (req,res)=>{
  res.render("dashboard_test");
})

// @desc  Register Page
// @route GET /register
router.get("/register", (req, res) => {
  if (req.isAuthenticated()) 
    return res.render("dashboard");
  res.render("auth/register");
});

// @desc  Register Logic
// @route POST /register
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);
    req.login(newUser, function (err) {
      if (err) {
        req.flash("error", "Registration Successful but Login Failed");
        res.redirect("/login");
      }
      req.flash("success", "Successfully registered a user!");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// @desc    Login Page
// @route   GET /login
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) 
    return res.render("dashboard");
  res.render("auth/login");
});

// @desc    Login Logic
// @route   POST /login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "login",
    failureFlash: true,
  }),
  (req, res) => {
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo
    req.flash("success", `Welcome back ${req.user.username}`);
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Goodbye!");
  res.redirect("/login");
});

module.exports = router;
