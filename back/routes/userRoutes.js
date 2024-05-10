const express = require("express");
const configureApp = require('../config.js');
const pool = configureApp(express());
const router = express.Router();
const bcrypt = require("bcrypt");
const { isAdmin, verifyToken } = require("../middleware");

router.get("/", verifyToken , (req, res) => {
  // Vérifier si un utilisateur est connecté en utilisant la session

  pool.query('SELECT * FROM utilisateur WHERE id = ?' , [req.user.userId] , (err , user) => {
    if(err) {
      console.error("Erreur :", err);
      return res.status(500).json({ success: false, message: "Une erreur" });
    } else {
      res.send({ success: true, user});
    }
  })

  // if (req.session.user) {
  //   res.send({ success: true, user: req.session.user });
  // } else {
  //   res.send({ success: false, message: "Non connecté" });
  // }
});

// Route pour mettre à jour les informations de l'utilisateur
router.post("/", (req, res) => {
  // Vérifier si un utilisateur est connecté
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: "Non connecté" });
  }

  const { nom, prenom, email } = req.body;

  // Vérifier si tous les champs requis sont fournis
  if (!nom || !prenom || !email) {
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
  }

  // Vérifier si l'email est valide
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ success: false, message: "Email invalide" });
  }

  const id = req.session.user.id;

  // Mettre à jour les informations de l'utilisateur dans la base de données
  pool.query(
    'UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id = ?',
    [nom, prenom, email, id],
    (err, rows) => {
      if (err) {
        console.error("Erreur lors de la mise à jour des informations de l'utilisateur :", err);
        return res.status(500).json({ success: false, message: "Une erreur s'est produite lors de la mise à jour des informations de l'utilisateur" });
      } else {
        req.session.user.nom = nom;
        req.session.user.prenom = prenom;
        req.session.user.email = email;
        return res.status(200).json({ success: true, message: "Informations de l'utilisateur mises à jour avec succès" });
      }
    }
  );
});

// Route pour mettre à jour le mot de passe de l'utilisateur
router.post("/password", (req, res) => {
  // Vérifier si un utilisateur est connecté
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: "Non connecté" });
  }

  const { oldPassword, password, confirm } = req.body;

  // Vérifier si tous les champs requis sont fournis
  if (!oldPassword || !password || !confirm) {
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
  }

  // Vérifier si le nouveau mot de passe a une longueur suffisante
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Mot de passe trop court" });
  }

  // Vérifier si les mots de passe correspondent
  if (password !== confirm) {
    return res.status(400).json({ success: false, message: "Les mots de passe ne correspondent pas" });
  }

  const id = req.session.user.id;

  // Récupérer le hash du mot de passe actuel de l'utilisateur depuis la base de données
  pool.query('SELECT * FROM utilisateur WHERE id = ?', [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    }

    bcrypt.compare(oldPassword, rows[0].mdp, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      }

      if (result) {
        // Hasher le nouveau mot de passe et le mettre à jour dans la base de données
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ success: false, message: err });
          }

          pool.query(
            'UPDATE utilisateur SET mdp = ? WHERE id = ?',
            [hash, id],
            (err, rows) => {
              if (err) {
                return res.status(500).json({ success: false, message: err });
              }
              return res.json({ success: true, message: "Mot de passe mis à jour avec succès" });
            }
          );
        });
      } else {
        return res.status(400).json({ success: false, message: "Mot de passe incorrect" });
      }
    });
  });
});

module.exports = router;
