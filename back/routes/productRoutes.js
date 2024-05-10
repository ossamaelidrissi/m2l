const express = require("express");
const router = express.Router();
// const pool = require("../config").pool;
const { isAdmin } = require("../middleware");

const configureApp = require('../config.js');
const pool = configureApp(express());
const multer  = require('multer')
const path = require('path')
const fs = require('fs'); // Import the Node.js file system module
const uuid = require("uuid");
const dotenv = require("dotenv");


dotenv.config();

// Define the storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationDir = `public/images/produits`;
    // Check if the destination directory exists, if not, create it
    console.log("🚀 ~ destinationDir:", destinationDir)
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true }); // Create the directory recursively
    }
    cb(null, destinationDir); // Specify the destination folder for storing the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Specify the file name
  }
});

const upload = multer({ storage });

// Route pour récupérer les produits

router.get("/", (req, res) => {
  // Récupérer les produits depuis la base de données (limité à 20)
  pool.query("SELECT * FROM stock", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.status(200).json(rows.slice(0, 20));
    }
  });
});

// Route pour supprimer un produit
router.delete("/:id", isAdmin, (req, res) => {
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

// Route pour ajouter un produit
router.post("/", isAdmin, (req, res) => {

  const { nom, quantite, prix, image , description } = req.body;

  pool.query("SELECT * FROM stock where nom = ?", nom , (err,rows) => {
    console.log("🚀 ~ pool.query ~ rows:", rows)
    if (err) {
      res.status(500).json({ sucess: false , message: err })
    } else if(rows.length > 0) {
      res.status(500).json({ success : false , message  : " Changez le nom "})
    } else {
      
      // Insérer le nouveau produit dans la base de données
      pool.query(
        "INSERT INTO stock (nom, image , quantite, prix, description) VALUES (?, ?, ?, ?, ?)",
        [nom,`${process.env.URL}/public/images/produits/${image}` , quantite, prix, description],
        (err, rows) => {
          if (err) {
            res.status(500).json({ success: false, message: err });
          } else {
            res.status(200).json({ success: true, message: "Produit ajouté avec succès" });
          }
        }
      );
    }
  })

});


// Define a POST route to handle file uploads
router.post('/upload', upload.single('image'), (req, res) => {
  // Access the uploaded file using req.file
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  
  // The file has been uploaded successfully
  return res.json({
    message: 'File uploaded successfully',
    image: req.file.filename
  });
});

// Route pour mettre à jour un produit
router.put("/:id", isAdmin, (req, res) => {
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

module.exports = router;
