const pool = require("../config").pool;

// Récupérer tous les produits
const getAllProducts = (req, res) => {
  // Récupérer les produits depuis la base de données
  pool.query("SELECT * FROM stock", (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, message: err });
    } else {
      res.status(200).json({ success: true, products: rows });
    }
  });
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
        res.status(201).json({ success: true, message: "Produit ajouté avec succès" });
      }
    }
  );
};

module.exports = {
  getAllProducts,
  deleteProduct,
  addProduct,
};
