const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commandeController");
const { verifyToken } = require("../middleware");

// Route for creating a new order
router.get("/", verifyToken ,commandeController.getUserOrders);


// Route for retrieving user orders
router.post("/commande", verifyToken ,commandeController.createOrder);


// Route for retrieving articles

module.exports = router;
