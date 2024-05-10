import React, { useState, useEffect, useContext } from "react";
import "./accueil.css";

import Carrousel from "./carousel";
import Article from "./article/article";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Accueil(props) {
  

  return (
    <>
      <div className="firstblock">
        <h3>
          <span className="titre">Bienvenue sur notre site</span>
        </h3>
        <p>
          <span className="titre">Nous sommes heureux de vous accueillir</span>
        </p>
       
      </div>
      <div className="deproduits">
        <div>
          <h4>
            Découvrez notre <b>nouvelle gamme de produits</b> !
          </h4>
          <Link to="/boutique">
            Voir les produits <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <img src="src/assets/KAPPA.png" className="" alt="" />
      </div>
      <Carrousel equipes={props.equipes} />
      <Article articles={props.articles} />
    </>
  );
}

export default Accueil;
