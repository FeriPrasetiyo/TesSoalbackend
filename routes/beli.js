var express = require("express");
var router = express.Router();
const { creatTokens, validateToken } = require("./JWT");
const path = require("path");
var fs = require("fs");

/* GET users listing. */
module.exports = function (db) {
  router.get("/", validateToken, function (req, res, next) {
    res.render("barang");
  });

  router.get("/datatable", async (req, res) => {
    let params = [];

    if (req.query.search.value) {
      params.push(`nama ilike '%${req.query.search.value}%'`);
    }

    const limit = req.query.length;
    const offset = req.query.start;
    const sortBy = req.query.columns[req.query.order[0].column].data;
    const sortMode = req.query.order[0].dir;

    const total = await db.query(
      `select count(*) as total from merchant${
        params.length > 0 ? ` where ${params.join(" or ")}` : ""
      }`
    );
    const data = await db.query(
      `select * from merchant${
        params.length > 0 ? ` where ${params.join(" or ")}` : ""
      } order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `
    );
    const response = {
      draw: Number(req.query.draw),
      recordsTotal: total.rows[0].total,
      recordsFiltered: total.rows[0].total,
      data: data.rows,
    };
    res.json(response);
  });

  router.post("/add", async (req, res) => {
    try {
      const { name, selling, ongkir, customer } = req.body;
      let sampleFile;
      let uploadPath;

      console.log(req.body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      sampleFile = req.files.sampleFile;
      const imagefiles = `${Date.now()}-${sampleFile.name}`;
      uploadPath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "upload",
        imagefiles
      );
      sampleFile.mv(uploadPath);
      const { rows: data } = await db.query(
        "INSERT INTO merchant (picture, nama, sellingprice, ongkir, customer) VALUES ($1, $2, $3, $4, $5)",
        [imagefiles, name, selling, ongkir, customer]
      );
      res.redirect("/barang");
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  });

  router.get("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // console.log(id, 'ini id')

      const { rows: resut } = await db.query(
        "SELECT * FROM merchant WHERE id = $1",
        [id]
      );
      const removeImg = resut[0].picture;
      const removePath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "upload",
        removeImg
      );
      console.log(removePath);

      fs.unlinkSync(removePath);
      const { rows } = await db.query("DELETE FROM merchant WHERE id = $1", [
        id,
      ]);
      res.redirect("/barang");
    } catch (err) {
      res.send(err);
    }
  });

  router.get("/edit/:id", async (req, res) => {
    try {
      const { rows: resut } = await db.query("SELECT * FROM merchant");
      const { id } = req.params;

      const { rows: data } = await db.query(
        "SELECT * FROM merchant WHERE id = $1",
        [id]
      );
      res.render("edit", { item: data[0], units: resut });
    } catch (err) {
      res.send(err);
    }
  });

  router.post("/edit/:id", async (req, res) => {
    console.log("masuk edit");
    try {
      const { id } = req.params;
      const { nama, selling, ongkir, stock } = req.body;
      console.log(req.body);

      let sampleFile;
      let uploadPath;

      if (!req.files || Object.keys(req.files).length === 0) {
        await db.query(
          "UPDATE merchant SET nama=$1, sellingprice=$2, ongkir=$3, customer=$4 WHERE id=$5",
          [nama, selling, ongkir, customer, id]
        );
      } else {
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = req.files.sampleFile;
        const imagefiles = `${Date.now()}-${sampleFile.name}`;
        uploadPath = path.join(
          __dirname,
          "..",
          "public",
          "images",
          "upload",
          imagefiles
        );
        sampleFile.mv(uploadPath);

        await db.query(
          "UPDATE merchant SET picture=$1, nama=$2, sellingprice=$3, ongkir=$4, customer=$5 WHERE id=$6",
          [imagefiles, nama, selling, ongkir, customer, id]
        );
      }
      res.redirect("/barang");
    } catch (err) {
      res.send(err);
    }
  });

  return router;
};
