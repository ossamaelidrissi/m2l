// Import des modules nécessaires
const express = require("express");
const config = require("./config");
const middleware = require("./middleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const commandeRoutes = require("./routes/commandeRoutes");
const articleRoutes = require("./routes/articleRoutes");

// Initialisation de l'application Express
const app = express();

// Configuration de l'application
config(app);

// Middleware de vérification de l'administrateur
app.use("/api/admin", middleware.isAdmin);

// Routes d'authentification
app.use("/api/auth", authRoutes);

// Routes utilisateur
app.use("/api/user", userRoutes);

// Routes produit
app.use("/api/produits", productRoutes);

// Routes admin
app.use("/api/admin", adminRoutes);

// Routes commande

app.use("/api/commandes", commandeRoutes);

// Routes article

app.use("/api/articles", articleRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});