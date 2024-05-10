const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const authController = require("../controllers/authController")



// Route pour la connexion d'un utilisateur
router.post("/login", authController.loginUser);

// Route pour la déconnexion d'un utilisateur
router.get("/logout", authController.logoutUser);

router.post("/register", authController.registerUser);

module.exports = router;
