var express = require("express");
var router = express.Router();
const { creatTokens, validateToken } = require("./JWT");
const { json } = require("body-parser");

/* GET home page. */
module.exports = function (db) {
  router.get("/", function (req, res, next) {
    res.render("login", { title: "Express" });
  });

  router.post("/", async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      console.log(email, password);

      const { rows: emails } = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (emails.length == 0) {
        return res.redirect("/");
      }

      if (password != emails[0].password) {
        return res.redirect("/");
      }

      const accessToken = creatTokens(emails);

      res.cookie("access-token", accessToken, {
        maxAge: 60 * 60 * 24 * 30 * 1000,
      });

      res.redirect("/barang");
    } catch (err) {
      return res.redirect("/");
    }
  });
  return router;
};
