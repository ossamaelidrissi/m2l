import React, { useContext, useEffect, useState } from 'react'
import api from '../../../api';
import User from './User';
import { Navigate } from 'react-router-dom';
import Modal from '../../../components/Modal';
import { useForm } from "react-hook-form"
import { toast } from 'react-hot-toast';

export default function Utilisateurs({ user }) {

  if(!user) return <Navigate to = "/" />

  if (Array.isArray(user) && user[0]?.fonction == 'joueur') {
    return <Navigate to="/" />;
  }
  
  if (user?.fonction == 'joueur') {
    return <Navigate to="/" />;
  }

  const [ users , setUsers ] = useState([]);

  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const [openInsertion, setOpenInsertion] = React.useState(false);

  

    useEffect(() => {
      api.getUsers(token).then((response) => {
        if (response.data) {
          setUsers(response.data.users);
        }
      });
    }, []);

  const onSubmit = (data) => {

    console.log(data)

    const refreshingToast = toast.loading('Rafraîchissant ...');

    try {
      api.postUsers(data , token).then((res) => {
        toast.success(res.data.message, {
          id : refreshingToast
        })
        api.getUsers(token).then((response) => {
          if (response.data) {
            setUsers(response.data.users);
           
            setOpenInsertion(false)
          }
        });
      });
    } catch (error) {
      
        toast.error('Un autre utilisateur avec ce email', {
          id : refreshingToast
        })
    }
  }

  const handleChange = (e) => {

  }

  let fonctions = [
    {
        id : 1,
        value : 'admin',
        label : "Administrateur"
    },
    {
        id : 2,
        value : 'joueur',
        label : "Joueur "
    },
]

  return (
    <div>
      <div className="matchs">
      <div className="firstblock">
        <h3>
        Utilisateurs
        </h3>
        <button className="px-2 py-2 rounded duration-300 border-none btn btn-primary" onClick={() => setOpenInsertion(true)} >Ajouter un utilisateur</button>
       
      </div>
      <table className="table table-striped overflow-hidden rounded-4">
        <thead>
          <tr>
            <th>Nom Complet</th>
            <th>Email</th>
            <th>Fonction</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {
            users?.map(({ id, nom , prenom , email , fonction}) => {
              return (
               <User key={id} id = {id} nom = {nom} prenom={prenom} email={email} fonction={fonction} setUsers = {setUsers} />
              )
            })
          }
        </tbody>
      </table>
    </div>

    <Modal title="Ajouter un utilisateur" show={openInsertion} onClose={() => setOpenInsertion(false)}>
      <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ width : '100%' }} >
            <label htmlFor="nom">Nom</label>
            <input id="nom" {...register("nom", { required: true })} name="nom" type="text" placeholder="Entrez le nom" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="prenom">Prenom</label>
            <input id="prenom" {...register("prenom", { required: true })}  name="prenom" type="text" placeholder="Entrez le prenom" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="email">Email</label>
            <input id="email" {...register("email", { required: true })}  name="email" type="email" placeholder="Entrez le email" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="mdp">Mot de pass</label>
            <input id="mdp" {...register("mdp", { required: true })}  name="mdp" type="text" placeholder="Entrez le mot de passe" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="fonction">Fonction</label>
            <select {...register("fonction", { required: true })} className='form-control' name="fonction" id="fonction">
                {
                    fonctions.map(f => (
                        <option key={f.id} value={f.value} >{ f.label }</option>
                    ))
                }
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary">Changer Maintenat</button>
        </form>
    </Modal>
    </div>
  )
}
