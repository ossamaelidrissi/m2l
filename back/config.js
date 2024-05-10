const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const dotenv = require("dotenv");


function configureApp(app) {
  // Configuration des variables d'environnement
  dotenv.config();

  // Middleware pour parser les données JSON
  app.use(express.json());

  // Configuration de la session
  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false
    })
  );


  // Configuration de la base de données MySQL
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

  // Middleware pour vérifier la connexion à la base de données
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Erreur lors de la connexion à la base de données:", err);
    } else {
      console.log("Connexion à la base de données réussiee");
      connection.release(); // Libérer la connexion
      app.set("db", pool);

    }
  });

  return pool;

  // return pool;
  // Exposer la connexion à la base de données pour l'utiliser dans d'autres modules si nécessaire
}

module.exports = configureApp;
