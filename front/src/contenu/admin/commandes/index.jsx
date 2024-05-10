import React, { useContext, useEffect, useState } from 'react'
import api from '../../../api'
import Commande from './Commande';
import { AuthContext } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Commandes({ user }) {

    if(!user) return <Navigate to = "/" />

    if (Array.isArray(user) && user[0]?.fonction == 'joueur') {
      return <Navigate to="/" />;
    }
    
    if (user?.fonction == 'joueur') {
      return <Navigate to="/" />;
    }

    const [ commandes , setCommandes ] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        api.getAllCommandes(token).then((response) => {
            if (response.data) {
                setCommandes(response.data.commandes);
              }
        })
    } , [])
  return (
    <div>
      <div className="matchs">
      <h3 class="mb-4">Commandes</h3>
      <table className="table table-striped overflow-hidden rounded-4">
        <thead>
          <tr>
            <th>Numero de Commande</th>
            <th>Date de Commande</th>
            <th>Nom Du Client</th>
            <th>Montant Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            commandes?.map(({ id , nom , prenom , email , produits , date}) => {
              return (
                <Commande key={id} id = {id} produits = {commandes} nom = {nom} prenom={prenom} email={email} date={date} setCommandes = {setCommandes} />
              )
            })
          }
        </tbody>
      </table>
    </div>
    </div>
  )
}
