const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController.js");

// Route for retrieving articles
router.get("/", articleController.getArticles);

module.exports = router;
