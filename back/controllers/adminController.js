const express = require("express");
const configureApp = require('../config.js');
const pool = configureApp(express());
const uuid = require("uuid");

// Ajouter un produit
const addProduct = (req, res) => {
  const { nom, quantite, prix, description } = req.body;
  const id = uuid.v4();
  // Insérer le nouveau produit dans la base de données
  pool.query(
    "INSERT INTO stock (nom, quantite, prix, description, id) VALUES (?, ?, ?, ?, ?)",
    [nom, quantite, prix, description, id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ success: false, message: err });
      } else {
        res.status(200).json({ success: true, message: "Produit ajouté avec succès" });
      }
    }
  );
};

// Supprimer un produit
const deleteProduct = (req, res) => {
  const id = req.params.id;
  // Supprimer le produit correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM stock WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, message: "Produit supprimé avec succès" });
    }
  });
};

// Mettre à jour un produit
const updateProduct = (req, res) => {
  const id = req.params.id;
  const { nom, quantite, prix, description } = req.body;
  // Mettre à jour le produit correspondant à l'ID spécifié dans la base de données
  pool.query(
    "UPDATE stock SET nom = ?, quantite = ?, prix = ?, description = ? WHERE id = ?",
    [nom, quantite, prix, description, id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ success: false, message: err });
      } else {
        res.status(200).json({ success: true, message: "Produit mis à jour avec succès" });
      }
    }
  );
};

// Autres fonctions pour la gestion des administrateurs

// Récupérer tous les utilisateurs
const getAllUsers = (req, res) => {
  // Récupérer les utilisateurs depuis la base de données
  pool.query("SELECT * FROM utilisateur", (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, users: rows });
    }
  });
};

module.exports = {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllUsers
};
