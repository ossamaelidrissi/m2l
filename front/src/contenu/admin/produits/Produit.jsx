import React, { useContext, useState } from "react";
import "./produit.css";
import { toast } from "react-hot-toast";
import api from "../../../api";
import { useNavigate } from 'react-router-dom';
import Modal from "../../../components/Modal";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../../context/AuthContext";


function Produit({id, nom , prix , image , description , quantite , setProducts}) {

  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [ details , setDetails ] = useState({
    nom,
    prix,
    image,
    quantite,
    description
  })

  const [ editModal , setEditModal] = useState(false);

  const handleChange = (e) => {
    let { name , value } = e.target;

    setDetails( prevState => ({
      ...prevState,
      [name] : value
     }));
  }

  const confirmDelete = () => {
    toast((t) => (
      <span>
        <p>Voulez-vous supprimer ce produit ?</p>
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
      const res = await api.deleteProduit(id , token).then(res => {
        toast.success(res.data.message , {
          id : refreshingToast
        })

        api.getProduits().then((response) => {
          if (response.data) {
            setProducts(response.data);
          }
        });

        setOpenInsertion(false);

      });
    } catch (error) {
      
    }
  }

  const onEdit = async (e) => {

    e.preventDefault();

    const refreshingToast = toast.loading('Rafraîchissant ...');
    try {
      const res = await api.updateProduit(id , details , token).then(res => {
        toast.success(res.data.message, {
          id : refreshingToast
        })

        api.getProduits().then((response) => {
          if(response.data) {
            setProducts(response.data)
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
    <>
      <div key={id} className="card produit w-100">
        <img src={image} className="card-img-top" alt="..."></img>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{nom}</h5>
          <p className="card-text">
            {prix}€
          </p>
          {/* <a href="#" className="btn btn-primary w-100 mt-auto" onClick={() => props.ajoutPanier()}>
            Ajouter au panier
          </a> */}

          <div className="actions items-center justify-end" >
        
              <a onClick={() => setEditModal(true)} className="edit cursor-pointer btn btn-primary mr-2">
                  <i className="bi-pencil-square"></i>
              </a>

              <a onClick={confirmDelete} className="trash btn btn-primary">
                  <i className="bi-trash"  ></i>
              </a>

          </div>

        </div>
        
      </div>
      <Modal title="Modifier le Produit" show={editModal} onClose={() => setEditModal(false)}>
        <form action="POST" encType="multipart/form-data">
          <div style={{ width : '100%' }} >
            <label htmlFor="nom">Nom</label>
            <input id="nom" value={details.nom} name="nom" onChange={handleChange} type="text" placeholder="Entrez le nom" className="form-control" />
          </div>
          {/* <div style={{ width : '100%' }} >
            <label htmlFor="nom">Image</label>
            {
                imageSelected ? (
                    <div style={ { position : 'relative' } }>
                        <button onClick={() => { setImageSelected(null); setImage(null) }} style={{ position : 'absolute' , top : 0 ,right :0 }} >
                            <i className="bx bx-x text-2xl" />
                        </button>
                        <img src = {imageSelected} onClick = {() => { setImageSelected(null); setImage(null) }} style={{ height : '200px' , objectFit : 'contain' , cursor : 'pointer' }} />
                    </div>
                ) : (
                    <label htmlFor="dropzone-file" style={{ display : 'flex' , flexDirection : 'column' , alignItems : 'center' , width : '100%' , height : '5rem' , border : '2px dashed #DEE2E6 ' , borderRadius : '0.5rem' , cursor : 'pointer' }} className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 -:hover:bg-bray-800 -:bg-gray-700 hover:bg-gray-100 -:border-gray-600 -:hover:border-gray-500 -:hover:bg-gray-600">
                        <div style={{ display : 'flex' , alignItems : 'center' , justifyContent : 'center', paddingBottom : '0.5rem' }} className="flex flex-col items-center justify-center pt-4">
                            <svg aria-hidden="true" style={{ height : '2rem' , width : '2rem' , color : '' }} className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p style={{ marginBottom : '0.5rem' , fontSize : '0.7rem' , marginLeft : '5px' }} className="mb-2 text-sm text-gray-500 -:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                        </div>
                        <input name="image" onChange={onImageChange} id="dropzone-file" type="file" style={{ display : 'none' }} />
                    </label>
                )
                    }
          </div> */}
          <div style={{ width : '100%' , marginTop : '10px' }} >
            <label htmlFor="description">Description</label>
            <textarea id="description" value={details.description} onChange={handleChange} name="description" rows={5} placeholder="Entrez une Breve Description" className="form-control"  />
          </div>
          <div style={{ width : '100%' , marginTop : '10px' }} >
            <label htmlFor="prix">Prix</label>
            <input id="prix" min={1} value={details.prix} name="prix" onChange={handleChange} type="number" placeholder="Entrez le prix" className="form-control" />
          </div>
          <div style={{ width : '100%' , marginTop : '10px' }} >
            <label htmlFor="quantite">Quantite</label>
            <input id="quantite" min={0} value={details.quantite} name="quantite" onChange={handleChange} type="number" placeholder="Entrez la quantite" className="form-control" />
          </div>
          
          <button onClick={onEdit} type="submit" className="btn btn-primary">Changer Maintenat</button>
        </form>
      </Modal>
    </>
  );
}

export default Produit;
