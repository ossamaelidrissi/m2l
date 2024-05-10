import { useContext, useEffect, useState } from "react";
import Accueil from "./accueil";
import Boutique from "./boutique";
import "./partiedroite.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Compte from "./compte";
import Matchs from "./matchs";
import ArticleUrl from "./accueil/articleUrl/articleurl";
import Produits from "./admin/produits";
import Utilisateurs from "./admin/utilisateurs";
import Commandes from "./admin/commandes";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function Contenu(props) {

  const [panier, setPanier] = useState([]);

  useEffect(() => {
    api.getUser(props.token).then((res) => {
      if (res.data.success) {
        props.setUser(res.data.user);
        return;
      }
      props.setUser(null);
    });
  },[])

  return (
    <div className="contenu">
      <Routes>
        <Route path="/" element={<Accueil user={props.user} equipes={props.equipes} articles={props.articles} />} />
        <Route path="/boutique" element={<Boutique user={props.user} panier={panier} setPanier={setPanier} />} />
        <Route path="/produits" element={<Produits token = {props.token} user={props.user} panier={panier} setPanier={setPanier} />} />
        <Route path="/utilisateurs" element={<Utilisateurs token = {props.token} user={props.user} panier={panier} setPanier={setPanier} />} />
        <Route path="/commandes" element={<Commandes token = {props.token} user={props.user} panier={panier} setPanier={setPanier} />} />
        <Route path="/compte" element={props.user ? <Compte user={props.user} panier={panier} setPanier={setPanier} /> : (props.user === null ? <Navigate to="/" /> : <></>)} />
        <Route path="/matchs" element={<Matchs equipes={props.equipes} />} />
        <Route path="/article/:id" element={<ArticleUrl articles={props.articles}/>} />
      </Routes>
    </div>
  );
}

export default Contenu;