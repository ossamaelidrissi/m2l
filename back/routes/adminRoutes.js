const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { isAdmin } = require("../middleware");
const uuid = require("uuid");

const configureApp = require('../config.js');
const pool = configureApp(express());

// Route pour ajouter un produit (accessible uniquement par l'admin)
router.post("/produits", isAdmin, (req, res) => {
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
});

// Route pour ajouter un produit (accessible uniquement par l'admin)
router.post("/users", isAdmin, (req, res) => {
  const { nom, prenom, mdp ,  email, fonction } = req.body;
  // Insérer le nouveau produit dans la base de données

    // Vérifier si tous les champs requis sont fournis
    if (!nom || !prenom || !email || !mdp) {
      res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
      return;
    }

    bcrypt.hash(mdp, 10, (err, hash) => {
      if (err) {
        res.status(500).json({ success: false, message: err });
      } else {
        pool.query(
          "INSERT INTO utilisateur (nom, prenom, email, mdp , fonction) VALUES (?, ?, ?, ?, ?)",
          [nom, prenom, email, hash, fonction],
          (err, rows) => {
            if (err) {
              res.status(500).json({ success: false, message: err });
            } else {
              res.status(200).json({ success: true, message: "Utilisateur ajouté avec succès" });
            }
          }
        );
      }
    })
});

// Route pour supprimer un produit (accessible uniquement par l'admin)
router.delete("/produits/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  // Supprimer le produit correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM stock WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, message: "Produit supprimé avec succès" });
    }
  });
});

// Route pour mettre à jour un produit (accessible uniquement par l'admin)
router.put("/produits/:id", isAdmin, (req, res) => {
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
});


router.delete("/commandes/:id", isAdmin , (req,res) => {

  const id = req.params.id;

  pool.query("DELETE FROM commande WHERE id = ?" , [id] , (err , rows) => {
    if(err) {
      res.status(500).json({ success: false , message : err })
    } else {
      res.status(200).json({ success: true, message: "Commande supprimé avec succès" });
    }
  })
})

// Autres routes pour la gestion des administrateurs
router.get("/getAllUsers" , isAdmin , (req,res) => {
  // Récupérer les utilisateurs depuis la base de données
  pool.query("SELECT * FROM utilisateur", (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, users: rows });
    }
  });

});

// Autres routes pour la gestion des administrateurs
router.get("/getAllCommandes" , isAdmin , (req,res) => {
  // Récupérer les utilisateurs depuis la base de données
  pool.query(`SELECT c.*, u.nom , u.prenom, u.email FROM commande c
  INNER JOIN utilisateur u ON c.id_utilisateur = u.id
  
  ;
`, (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, commandes: rows });
    }
  });

});

router.delete('/users/:id' , isAdmin , (req,res) => {
  const id = req.params.id;
  // Supprimer l'utilisateur correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM utilisateur WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès" });
    }
  });
})

// Route pour mettre à jour les informations de l'utilisateur
router.put("/users/:id", isAdmin, (req, res) => {

  // Vérifier si un utilisateur est connecté
  // if (!req.session.user) {
  //   return res.status(403).json({ success: false, message: "Non connecté" });
  // }

  const { nom, prenom, email , fonction } = req.body;

  const { id } = req.params

  // Vérifier si tous les champs requis sont fournis
  if (!nom || !prenom || !email) {
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
  }

  // Vérifier si l'email est valide
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ success: false, message: "Email invalide" });
  }
  // Mettre à jour les informations de l'utilisateur dans la base de données
  pool.query(
    'UPDATE utilisateur SET nom = ?, prenom = ?, email = ? , fonction = ? WHERE id = ?',
    [nom, prenom, email , fonction , id],
    (err, rows) => {
      if (err) {
        console.error("Erreur lors de la mise à jour des informations de l'utilisateur :", err);
        return res.status(500).json({ success: false, message: "Une erreur s'est produite lors de la mise à jour des informations de l'utilisateur" });
      } else {
        return res.status(200).json({ success: true, message: "Informations de l'utilisateur mises à jour avec succès" });
      }
    }
  );
});

module.exports = router;
