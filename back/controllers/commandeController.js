const express = require("express");
const configureApp = require('../config.js');
const pool = configureApp(express());
const uuid = require("uuid");
// Controller function for creating a new order
exports.createOrder = (req, res) => {
  // Check if a user is logged in
  // if (!req.session.user) {
  //   return res.status(403).json({ success: false, message: "Non connecté" });
  // }

  const { produits } = req.body;
  const id = uuid.v4();
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Check if all required fields are provided
  if (!produits) {
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
  }

  // Insert the order into the database
  pool.query(
    'INSERT INTO commande (id, date, produits, id_utilisateur) VALUES (?, ?, ?, ?)',
    [id, date, produits, req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      } else {
        return res.json({ success: true, message: "Commande créée avec succès" });
      }
    }
  );
};

// Controller function for retrieving user orders
exports.getUserOrders = (req, res) => {
  // Check if a user is logged in
  // if (!req.session.user) {
  //   return res.status(403).json({ success: false, message: "Non connecté" });
  // }

  // Retrieve user orders from the database
  pool.query('SELECT * FROM commande WHERE id_utilisateur = ?', [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }

    const commands = rows;
    // Retrieve product details for each order
    pool.query('SELECT * FROM stock', (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      }

      const stock = rows;
      const commandsWithProducts = commands.map((command) => {
        const products = JSON.parse(command.produits);
        const productsWithDetails = products.map((product) => {
          const productDetails = stock.find((p) => p.id === product.id);
          console.log("🚀 ~ productsWithDetails ~ productDetails:", productDetails)
          return {
            ...product,
            nom: productDetails?.nom,
            prix: productDetails?.prix,
            image: productDetails?.image,
            description: productDetails?.description,
          };
        });

        return {
          ...command,
          produits: productsWithDetails,
        };
      });

      res.json({ success: true, commands: commandsWithProducts });
    });
  });
};

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
