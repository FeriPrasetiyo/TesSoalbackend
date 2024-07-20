var express = require("express");
var router = express.Router();
// const { creatTokens, validateToken } = require("./JWT");
const path = require("path");
var fs = require("fs");

/* GET users listing. */
module.exports = function (db) {
  router.get("/", function (req, res, next) {
    res.render("beli");
  });

  router.get("/costomer", async (req, res) => {
    let params = [];

    if (req.query.search.value) {
      params.push(`nama ilike '%${req.query.search.value}%'`);
    }

    const limit = req.query.length;
    const offset = req.query.start;
    const sortBy = req.query.columns[req.query.order[0].column].data;
    const sortMode = req.query.order[0].dir;

    const total = await db.query(
      `select count(*) as total from costomer${
        params.length > 0 ? ` where ${params.join(" or ")}` : ""
      }`
    );

    const data = await db.query(
      `SELECT merchant.*, costomer.* FROM merchant LEFT JOIN costomer ON merchant.supplier = costomer.supplierid${
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
      const { nama_customer, nama_barang, harga_barang, ongkir } = req.body;

      const { rows: data } = await db.query(
        "INSERT INTO costomer (nama_customer, nama_barang, harga_barang, ongkir) VALUES ($1, $2, $3, $4)",
        [id_costomer, nama_customer, nama_barang, harga_barang, ongkir]
      );

      res.redirect("/barang");
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  });

  router.get("/delete/:id", async (req, res) => {
    try {
      const { rows } = await db.query(
        "DELETE FROM costomer WHERE id_costomer = $1",
        [id]
      );
      res.redirect("/barang");
    } catch (err) {
      res.send(err);
    }
  });

  router.get("/edit/:id_costomer", async (req, res) => {
    try {
      const { rows: resut } = await db.query("SELECT * FROM costomer");
      const { id_costomer } = req.params;

      const { rows: data } = await db.query(
        "SELECT * FROM costomer WHERE id_costomer = $1",
        [id_costomer]
      );
      res.render("edit", { item: data[0], units: resut });
    } catch (err) {
      res.send(err);
    }
  });

  router.post("/edit/:id_costomer", async (req, res) => {
    console.log("masuk edit");
    try {
      const { id_costomer } = req.params;
      const { nama_customer, nama_barang, harga_barang, ongkir } = req.body;

      await db.query(
        "UPDATE costomer SET nama=$1, sellingprice=$2, ongkir=$3, customer=$4 WHERE id_costomer=$5",
        [nama_customer, nama_barang, harga_barang, ongkir, id_costomer]
      );
      res.redirect("/barang");
    } catch (err) {
      res.send(err);
    }
  });

  return router;
};
