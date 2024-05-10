const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const dotenv = require("dotenv");
// const csrf = require('csurf');

// Configuration des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
app.use(express.json()); // Middleware pour parser les données JSON

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Création du pool de connexions à la base de données MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Middleware pour vérifier si l'utilisateur est un administrateur
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.fonction === 'admin') {
    return next();
  } else {
    return res.status(403).send({ success: false, message: "Accès non autorisé" });
  }
}

// Appliquer la protection CSRF à toutes les routes sauf celles spécifiquement exclues
// const csrfProtection = csrf({ httpOnly: true });
// app.use(csrfProtection);

// app.use((req, res, next) => {
//   res.cookie('XSRF-TOKEN', req.csrfToken())
//   next()
// })

// Middleware pour vérifier la connexion à la base de données
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Erreur lors de la connexion à la base de données:", err);
  } else {
    console.log("Connexion à la base de données réussie");
    connection.release(); // Libérer la connexion
  }
});

// Route pour vérifier le fonctionnement de l'API
app.get("/authent", (req, res) => {
  res.send("API is up");
});

// Route pour récupérer les informations de l'utilisateur actuellement connecté
app.get("/api/user", (req, res) => {
  // Vérifier si un utilisateur est connecté en utilisant la session
  if (req.session.user) {
    res.send({ success: true, user: req.session.user });
  } else {
    res.send({ success: false, message: "Non connecté" });
  }
});

// Route pour mettre à jour les informations de l'utilisateur
app.post("/api/user", (req, res) => {
  // Vérifier si un utilisateur est connecté
  if (!req.session.user) {
    // Si l'utilisateur n'est pas connecté, renvoyer une réponse indiquant qu'il n'est pas connecté
    return res.status(403).json({ success: false, message: "Non connecté", csrfToken: req.csrfToken() });
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
app.post("/api/password", (req, res) => {
  // Vérifier si un utilisateur est connecté
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: "Non connecté", csrfToken: req.csrfToken() });
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
      return res.status(500).json({ success: false, message: err, csrfToken: req.csrfToken() });
    }

    bcrypt.compare(oldPassword, rows[0].mdp, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: err, csrfToken: req.csrfToken() });
      }

      if (result) {
        // Hasher le nouveau mot de passe et le mettre à jour dans la base de données
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ success: false, message: err, csrfToken: req.csrfToken() });
          }

          pool.query(
            'UPDATE utilisateur SET mdp = ? WHERE id = ?',
            [hash, id],
            (err, rows) => {
              if (err) {
                return res.status(500).json({ success: false, message: err, csrfToken: req.csrfToken() });
              }
              return res.json({ success: true, message: "success" });
            }
          );
        });
      } else {
        return res.status(400).json({ success: false, message: "Mot de passe incorrect", csrfToken: req.csrfToken() });
      }
    });
  });
});

// Route pour passer une commande
app.post("/api/commande", (req, res) => {
  // Vérifier si un utilisateur est connecté
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: "Non connecté", csrfToken: req.csrfToken() });
  }

  const produits = req.body.produits;
  const id = uuid.v4();
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Vérifier si tous les champs requis sont fournis
  if (!produits) {
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs", csrfToken: req.csrfToken() });
  }

  const produitsParsed = JSON.parse(produits);

  // Insérer la commande dans la base de données
  pool.query(
    'INSERT INTO commande (id, date, produits, id_utilisateur) VALUES (?, ?, ?, ?)',
    [id, date, produits, req.session.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err, csrfToken: req.csrfToken() });
      } else {
        return res.json({ success: true, message: "success" });
      }
    }
  );
});

// Route pour récupérer les commandes de l'utilisateur
app.get("/api/commandes", (req, res) => {
  // Vérifier si un utilisateur est connecté
  if (!req.session.user) {
    res.send({ success: false, message: "Non connecté" });
    return;
  }

  // Récupérer les commandes de l'utilisateur depuis la base de données
  pool.query('SELECT * FROM commande WHERE id_utilisateur = ?', [req.session.user.id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    }

    const commands = rows;
    // Récupérer les détails des produits pour chaque commande
    pool.query('SELECT * FROM stock', (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      }

      const stock = rows;
      const commandsWithProducts = commands.map((command) => {
        const products = JSON.parse(command.produits);
        const productsWithDetails = products.map((product) => {
          const productDetails = stock.find((p) => p.id === product.id);
          return {
            ...product,
            nom: productDetails.nom,
            prix: productDetails.prix,
            image: productDetails.image,
            description: productDetails.description,
          };
        });

        return {
          ...command,
          produits: productsWithDetails,
        };
      });

      res.send({ success: true, commands: commandsWithProducts });
    });
  });
});

// Route pour récupérer les articles
app.get('/api/articles', (req, res) => {
  // Récupérer les articles depuis la base de données
  pool.query('SELECT * FROM article', (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, articles: rows });
    }
  });
});

// Route pour récupérer les produits
app.get("/api/produits",  (req, res) => {
  // Récupérer les produits depuis la base de données (limité à 20)
  pool.query("SELECT * FROM stock", (err, rows) => {
    if (err) {
      res.send({ error: err });
    } else {
      res.send(rows.slice(0, 20));
    }
  });
});

// Route pour supprimer un produit
app.delete("/api/produits/:id", (req, res) => {
  const id = req.params.id;
  // Supprimer le produit correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM produits WHERE id = ?", [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err });
    } else {
      return res.json({ success: true, message: "success" });
    }
  });
});

// Route pour ajouter un produit
app.post("/api/produits", (req, res) => {
  const nom = req.body.nom;
  const quantite = req.body.quantite;
  const prix = req.body.prix;
  const description = req.body.description;
  const id = uuid.v4();

  // Insérer le nouveau produit dans la base de données
  pool.query(
    "INSERT INTO produits (nom, quantite, prix, description, id) VALUES (?, ?, ?, ?, ?)",
    [nom, quantite, prix, description, id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      } else {
        return res.json({ success: true, message: "success" });
      }
    }
  );
});

// Données d'exemple pour les annonces
const annonces = [
  {
    id: "123",
    nom: "annonce 1",
    contenu: "description 1",
    auteur: "Auteur",
  },
];

// Route pour récupérer les annonces
app.get("/api/annonces", (req, res) => {
  res.send(annonces);
});

// Route pour la connexion d'un utilisateur
app.post("/api/login",(req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Vérifier si tous les champs requis sont fournis
  if (!email || !password) {
    res.send({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // Rechercher l'utilisateur correspondant à l'email spécifié dans la base de données
  pool.query(
    "SELECT * FROM utilisateur WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        res.send({ error: err });
      } else {
        if (rows.length > 0) {
          // Vérifier si le mot de passe correspond
          bcrypt.compare(password, rows[0].mdp, (err, result) => {
            console.log("🚀 ~ bcrypt.compare ~ result:", result)
            if (result) {
              const user = rows[0];
              console.log("🚀 ~ bcrypt.compare ~ user:", req.session)
              // Créer une session utilisateur

              if(user) {
                req.session.user = {
                  id: user?.id,
                  nom: user?.nom,
                  prenom: user?.prenom,
                  email: user?.email,
                  fonction: user?.fonction,
                };
                res.send({ success: true, message: "Connexion réussie" });

              }
              
            } else {
              res.send({
                success: false,
                message: "Mot de passe ou email incorrect",
              });
            }
          });
        } else {
          res.send({
            success: false,
            message: "Mot de passe ou email incorrect",
          });
        }
      }
    }
  );
});

// Route pour la déconnexion d'un utilisateur
app.get("/api/logout", (req, res) => {
  // Détruire la session utilisateur
  req.session.destroy();
  res.send({ success: true, message: "Déconnexion réussie" });
  return res.status(403).json({ success: false, message: "Non connecté", csrfToken: req.csrfToken() });
});

// Route pour l'enregistrement d'un nouvel utilisateur
app.post("/api/register", (req, res) => {
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const password = req.body.password;
  const confirm = req.body.confirm;

  // Vérifier si tous les champs requis sont fournis
  if (!nom || !prenom || !email || !password || !confirm) {
    res.send({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // Vérifier si l'email est valide avec une expression régulière
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    res.send({ success: false, message: "Email invalide" });
    return;
  }

  // Vérifier si le mot de passe a une longueur suffisante
  if (password.length < 8) {
    res.send({ success: false, message: "Mot de passe trop court" });
    return;
  }

  // Vérifier si les mots de passe correspondent
  if (password !== confirm) {
    res.send({
      success: false,
      message: "Les mots de passe ne correspondent pas",
    });
    return;
  }

  // Vérifier si l'utilisateur existe déjà dans la base de données
  pool.query(
    "SELECT * FROM utilisateur WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        if (rows.length > 0) {
          res.send({ success: false, message: "Cet email est déjà utilisé" });
        } else {
          // Hasher le mot de passe avant de l'enregistrer dans la base de données
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              res.send({ success: false, message: err });
            } else {
              // Insérer le nouvel utilisateur dans la base de données
              pool.query(
                "INSERT INTO utilisateur (nom, prenom, email, mdp, fonction) VALUES (?, ?, ?, ?, ?)",
                [nom, prenom, email, hash, "joueur"],
                (err, result) => {
                  if (err) {
                    res.send({ success: false, message: err });
                  } else {
                    // Créer une session utilisateur
                    req.session.user = {
                      id: result.insertId,
                      nom: nom,
                      prenom: prenom,
                      email: email,
                      fonction: "joueur",
                    };
                    res.send({
                      success: true,
                      message: "Utilisateur enregistré avec succès",
                    });
                  }
                }
              );
            }
          });
        }
      }
    }
  );
});

// Route pour ajouter un produit (accessible uniquement par l'admin)
app.post("/api/admin/produits", isAdmin, (req, res) => {
  const { nom, quantite, prix, description } = req.body;
  const id = uuid.v4();
  // Insérer le nouveau produit dans la base de données
  pool.query(
    "INSERT INTO stock (nom, quantite, prix, description, id) VALUES (?, ?, ?, ?, ?)",
    [nom, quantite, prix, description, id],
    (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, message: "Produit ajouté avec succès" });
      }
    }
  );
});

// Route pour supprimer un produit (accessible uniquement par l'admin)
app.delete("/api/admin/produits/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  // Supprimer le produit correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM stock WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, message: "Produit supprimé avec succès" });
    }
  });
});

// Route pour mettre à jour un produit (accessible uniquement par l'admin)
app.put("/api/admin/produits/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  const { nom, quantite, prix, description } = req.body;
  // Mettre à jour le produit correspondant à l'ID spécifié dans la base de données
  pool.query(
    "UPDATE stock SET nom = ?, quantite = ?, prix = ?, description = ? WHERE id = ?",
    [nom, quantite, prix, description, id],
    (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        res.send({ success: true, message: "Produit mis à jour avec succès" });
      }
    }
  );
});

// Route pour supprimer un utilisateur (accessible uniquement par l'admin)
app.delete("/api/admin/users/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  // Supprimer l'utilisateur correspondant à l'ID spécifié de la base de données
  pool.query("DELETE FROM utilisateur WHERE id = ?", [id], (err, rows) => {
    if (err) {
      res.send({ success: false, message: err });
    } else {
      res.send({ success: true, message: "Utilisateur supprimé avec succès" });
    }
  });
});

// Route pour ajouter un nouvel administrateur (accessible uniquement par l'admin)
app.post("/api/admin/register", isAdmin, (req, res) => {
  const { nom, prenom, email, password, confirm } = req.body;

  // Vérifier si tous les champs requis sont fournis
  if (!nom || !prenom || !email || !password || !confirm) {
    res.send({ success: false, message: "Veuillez remplir tous les champs" });
    return;
  }

  // Vérifier si l'email est valide avec une expression régulière
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    res.send({ success: false, message: "Email invalide" });
    return;
  }

  // Vérifier si le mot de passe a une longueur suffisante
  if (password.length < 8) {
    res.send({ success: false, message: "Mot de passe trop court" });
    return;
  }

  // Vérifier si les mots de passe correspondent
  if (password !== confirm) {
    res.send({
      success: false,
      message: "Les mots de passe ne correspondent pas",
    });
    return;
  }

  // Vérifier si l'utilisateur existe déjà dans la base de données
  pool.query(
    "SELECT * FROM utilisateur WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        res.send({ success: false, message: err });
      } else {
        if (rows.length > 0) {
          res.send({ success: false, message: "Cet email est déjà utilisé" });
        } else {
          // Hasher le mot de passe avant de l'enregistrer dans la base de données
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              res.send({ success: false, message: err });
            } else {
              // Insérer le nouvel administrateur dans la base de données
              pool.query(
                "INSERT INTO utilisateur (nom, prenom, email, mdp, fonction) VALUES (?, ?, ?, ?, ?)",
                [nom, prenom, email, hash, "admin"],
                (err, result) => {
                  if (err) {
                    res.send({ success: false, message: err });
                  } else {
                    // Créer une session utilisateur
                    req.session.user = {
                      id: result.insertId,
                      nom: nom,
                      prenom: prenom,
                      email: email,
                      fonction: "admin",
                    };
                    res.send({
                      success: true,
                      message: "Administrateur ajouté avec succès",
                    });
                  }
                }
              );
            }
          });
        }
      }
    }
  );
});

// Démarrer le serveur sur le port 3000
const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = server; // Exporter le serveur pour les tests



