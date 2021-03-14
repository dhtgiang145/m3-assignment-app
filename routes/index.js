const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const auth = require("http-auth");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const registration = mongoose.model("registration");

const basic = auth.basic({
  file: path.join(__dirname, "../users.htpasswd"),
});

router.get("/", function (req, res) {
  res.render("form", { title: "Registration form" });
});

router.post(
  "/",
  [
    check("name").isLength({ min: 1 }).withMessage("Please enter a name"),
    check("email").isLength({ min: 1 }).withMessage("Please enter an email"),
  ],
  function (req, res) {
    // console.log(req.body);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const regis = new registration(req.body);
      regis
        .save()
        .then(() => {
          res.send("Thank you for your registration!");
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
        res.render("index", { title: "Listening registrations", registrations });
      })
      .catch(() => {
        res.send("Sorry!Something went wrong");
      });
  })
);

module.exports = router;
