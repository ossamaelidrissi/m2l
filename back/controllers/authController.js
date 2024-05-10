const bcrypt = require("bcrypt");
const express = require("express");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");


const configureApp = require('../config.js');
const pool = configureApp(express());

// Connexion d'un utilisateur
const loginUser = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Vérifier si tous les champs requis sont fournis
  if (!email || !password) {
    res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // Rechercher l'utilisateur correspondant à l'email spécifié dans la base de données
  pool.query(
    "SELECT * FROM utilisateur WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        res.status(500).json({ success: false, message: err });
      } else {
        if (rows.length > 0) {
          // Vérifier si le mot de passe correspond
          bcrypt.compare(password, rows[0].mdp, (err, result) => {
            if (err) {
              res.status(500).json({ success: false, message: err });
            } else {
              if (result) {
                const user = rows[0];
                // Créer une session utilisateur
                req.session.user = {
                  id: user.id,
                  nom: user.nom,
                  prenom: user.prenom,
                  email: user.email,
                  fonction: user.fonction,
                };

                const token = jwt.sign({ userId: user.id , fonction : user.fonction }, process.env.JWT_SECRET);

                res.status(200).json({ success: true, message: "Connexion réussie" , token });
              } else {
                res.status(401).json({ success: false, message: "Mot de passe incorrect" });
              }
            }
          });
        } else {
          res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }
      }
    }
  );
};

// Déconnexion d'un utilisateur
const logoutUser = (req, res) => {
  // Détruire la session utilisateur
  req.session.destroy();
  req.user = null;
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
};

// Enregistrement d'un nouvel utilisateur
const registerUser = (req, res) => {
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const password = req.body.password;

  // Vérifier si tous les champs requis sont fournis
  if (!nom || !prenom || !email || !password) {
    res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // Hasher le mot de passe avant de l'enregistrer dans la base de données
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      const id = uuid.v4();
      // Insérer le nouvel utilisateur dans la base de données
      pool.query(
        "INSERT INTO utilisateur (nom, prenom, email, mdp, fonction) VALUES (?, ?, ?, ?, ?)",
        [nom, prenom, email, hash, "joueur"],
        (err, result) => {
          if (err) {
            res.status(500).json({ success: false, message: err });
          } else {
            // Créer une session utilisateur

            const token = jwt.sign({ userId: id , fonction : 'joueur' }, process.env.JWT_SECRET);

            req.session.user = {
              id: id,
              nom: nom,
              prenom: prenom,
              email: email,
              fonction: "joueur",
            };
            res.status(201).json({ success: true, user : req.session.user, message: "Utilisateur enregistré avec succès" , token });
          }
        }
      );
    }
  });
};

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
};
