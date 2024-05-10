const pool = require("../config").pool;
const bcrypt = require("bcrypt");
const uuid = require("uuid");

// Supprimer un utilisateur
const deleteUser = (req, res) => {
  const id = req.params.id;
  // Supprimer l'utilisateur correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM utilisateur WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès" });
    }
  });
};

// Enregistrer un nouvel utilisateur
const registerUser = (req, res) => {
  const { nom, prenom, email, password } = req.body;

  // Hasher le mot de passe avant de l'enregistrer dans la base de données
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      const id = uuid.v4();
      // Insérer le nouvel utilisateur dans la base de données
      pool.query(
        "INSERT INTO utilisateur (id, nom, prenom, email, mdp) VALUES (?, ?, ?, ?, ?)",
        [id, nom, prenom, email, hash],
        (err, result) => {
          if (err) {
            res.status(500).json({ success: false, message: err });
          } else {
            res.status(201).json({ success: true, message: "Utilisateur enregistré avec succès" });
          }
        }
      );
    }
  });
};

module.exports = {
  deleteUser,
  registerUser,
};
