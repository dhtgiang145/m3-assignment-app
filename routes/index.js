const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const auth = require("http-auth");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const registration = mongoose.model("registration");

const basic = auth.basic({
  file: path.join(__dirname, "../users.htpasswd"),
});

router.get("/", function (req, res) {
  res.render("index", { title: "Simple Kitchen" });
});

router.get("/register", function (req, res) {
  res.render("form", { title: "Register Form" });
});

router.post(
  "/",
  [
    check("name").isLength({ min: 1 }).withMessage("Please enter a name"),
    check("email").isLength({ min: 1 }).withMessage("Please enter an email"),
    check("username")
      .isLength({ min: 1 })
      .withMessage("Please enter a username"),
    check("password")
      .isLength({ min: 1 })
      .withMessage("Please enter a password"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const regis = new registration(req.body);
      // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
      // set user password to hashed password
      regis.password = await bcrypt.hash(regis.password, salt);
      regis
        .save()
        .then(() => {
          res.render("thankyou", { title: "Thank You Page" });
        })
        .catch((err) => {
          console.log(err);
          res.send("Sorry! Something went wrong");
        });
    } else {
      res.render("form", {
        title: "Registration Form",
        errors: errors.array(),
        data: req.body,
      });
    }
  }
);

router.get(
  "/registrations",
  basic.check((req, res) => {
    registration
      .find()
      .then((registrations) => {
        res.render("registration", {
          title: "Listening registrations",
          registrations,
        });
      })
      .catch(() => {
        res.send("Sorry!Something went wrong");
      });
  })
);

module.exports = router;
