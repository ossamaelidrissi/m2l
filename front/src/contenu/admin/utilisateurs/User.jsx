import React, { useContext, useState } from 'react'
import { toast } from 'react-hot-toast';
import api from '../../../api';
import Modal from '../../../components/Modal';
import { AuthContext } from '../../../context/AuthContext';

export default function User( { id, nom , prenom , email , fonction , setUsers}) {

    const [details , setDetails] = useState({
        nom,
        prenom,
        email,
        fonction
    })

    const token = localStorage.getItem("token")

    const [editModal , setEditModal] = useState(false);

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

    const confirmDelete = () => {
        toast((t) => (
          <span>
            <p style={{ fontSize : '15px' }}>Voulez-vous supprimer ce utilisateur ?</p>
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
          const res = await api.deleteUser(id , token).then(res => {
            toast.success(res.data.message , {
              id : refreshingToast
            })
    
            api.getUsers(token).then((response) => {
              if (response.data) {
                setUsers(response.data.users);
              }
            });
    
            setEditModal(false);
    
          });
        } catch (error) {
            toast.error(error.message , {
                id : refreshingToast
              })
        }
    }

    const handleChange = (e) => {
        let { name , value } = e.target;
    
        setDetails( prevState => ({
          ...prevState,
          [name] : value
         }));
    
        console.log(name , value , details.nom)
    }

    const onEdit = async (e) => {

        e.preventDefault();
    
        const refreshingToast = toast.loading('Rafraîchissant ...');

        try {
          const res = await api.updateUsers(id , details , token).then(res => {
            toast.success(res.data.message, {
              id : refreshingToast
            })
    
            api.getUsers(token).then((response) => {
              if(response.data) {
                setUsers(response.data.users)
              }
            });
    
            toast.success(res.data.message , {
              id : refreshingToast
            })
    
            setEditModal(false)
          })
        } catch (error) {
          console.log("Error", error);
          toast.error("Something Wrong !" , {
            id : refreshingToast
          })
        }
    }
  return (
    <tr>
        <td>
            <p>{nom} {' '} {prenom}</p>
        </td>
        <td>
            <p>{email}</p>
        </td>
        <td>
            <p>{fonction}</p>
        </td>
        
        <td className="actions items-center" >
        
            <a onClick={() => setEditModal(true)} className="edit cursor-pointer btn btn-primary mr-2">
                <i className="bi-pencil-square"></i>
            </a>
            <a onClick={confirmDelete} className="trash btn btn-primary">
                <i className="bi-trash"  ></i>
            </a>

        </td>

        <Modal title="Mettre À Jour L'utilisateur" show={editModal} onClose={() => setEditModal(false)}>
        <form action="POST" encType="multipart/form-data">
          <div style={{ width : '100%' }} >
            <label htmlFor="nom">Nom</label>
            <input id="nom" value={details.nom} name="nom" onChange={handleChange} type="text" placeholder="Entrez le nom" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="prenom">Prenom</label>
            <input id="prenom" value={details.prenom} name="prenom" onChange={handleChange} type="text" placeholder="Entrez le prenom" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="email">Email</label>
            <input id="email" value={details.email} name="email" onChange={handleChange} type="text" placeholder="Entrez le email" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
            <label htmlFor="fonction">Fonction</label>
            <select className='form-control' name="fonction" onChange={handleChange} id="fonction">
                {
                    fonctions.map(f => (
                        <option key={f.id} selected = { f.value == fonction } value={f.value} >{ f.label }</option>
                    ))
                }
            </select>
          </div>
          
          <button onClick={onEdit} type="submit" className="btn btn-primary">Changer Maintenat</button>
        </form>
      </Modal>
    </tr>
  )
}
