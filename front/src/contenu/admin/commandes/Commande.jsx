import React, { useContext, useState } from 'react'
import { toast } from 'react-hot-toast';
import api from '../../../api';
import Modal from '../../../components/Modal';
import Moment from 'react-moment';
import { AuthContext } from '../../../context/AuthContext';

export default function Commande( { id, nom , prenom , email , date,  produits , setCommandes}) {

    const [details , setDetails] = useState({
        nom,
        prenom,
        email,
    })

    // const { token, loading } = useContext(AuthContext);

    const token = localStorage.getItem('token');

    const [showModal , setShowModal] = useState(false);

    const confirmDelete = () => {
        toast((t) => (
          <span>
            <p style={{ fontSize : '15px' }}>Voulez-vous supprimer ce commande ?</p>
            <button onClick = { () => { onDelete(id); toast.dismiss(t.id) } } className="btn btn-warning" style={ { right : 0 } }>
              Supprimer
            </button>
          </span>
        ), {
          style: {
            border: '1px solid #713200',
            padding: '16px',
            color: '#713200',
          },
          iconTheme: {
            primary: '#713200',
            secondary: '#FFFAEE',
          },
        });
    }
    
    const onDelete = async (id) => {

        const refreshingToast = toast.loading('Rafraîchissant ...');
    
        try {
          const res = await api.deleteCommande(id , token).then(res => {
            toast.success(res.data.message , {
              id : refreshingToast
            })
    
            api.getAllCommandes(token).then((response) => {
              if (response.data) {
                setCommandes(response.data.commandes);
              }
            });
          });
        } catch (error) {
            console.log("🚀 ~ onDelete ~ error:", error)
            toast.error(error.message , {
                id : refreshingToast
              })
        }
    }

  return (
    <tr key={id} >
        <td>
            <b>#{id}</b>
        </td>
        <td>
            <Moment fromNow>
                { date }
             </Moment>
        </td>
        <td>
            <p>{nom} {' '} {prenom}</p>
        </td>
        <td>
            <p>{nom} {' '} {prenom}</p>
        </td>
        
        <td className="actions items-center" >
        
            <a onClick={() => setShowModal(true)} className="edit cursor-pointer btn btn-primary mr-2">
                <i className="bi-eye"></i>
            </a>
            <a onClick={confirmDelete} className="trash btn btn-primary">
                <i className="bi-trash"></i>
            </a>

        </td>

        <Modal title={"Details De La Commande"} show={showModal} onClose={() => setShowModal(false)}>
       
      </Modal>
    </tr>
  )
}
