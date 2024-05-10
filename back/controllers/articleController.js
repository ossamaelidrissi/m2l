const express = require("express");
const configureApp = require('../config.js');
const pool = configureApp(express());
const uuid = require("uuid");

// Controller function for retrieving articles
exports.getArticles = (req, res) => {
    // Retrieve articles from the database
    pool.query('SELECT * FROM article', (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      } else {
        res.json({ success: true, articles: rows });
      }
    });
  };
