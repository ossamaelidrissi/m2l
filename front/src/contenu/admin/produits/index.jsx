import React, { useState, useRef, useEffect, useContext } from "react";
import "./produits.css";
import Produit from "./Produit";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../../api";
import Modal from "../../../components/Modal";
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast";

function Produits(props) {

  if(!props.user) return <Navigate to = "/" />


  if (Array.isArray(props.user) && props.user[0]?.fonction == 'joueur') {
    return <Navigate to="/" />;
  }
  
  if (props.user?.fonction == 'joueur') {
    return <Navigate to="/" />;
  }
  
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const navigate = useNavigate();

  const [openInsertion, setOpenInsertion] = React.useState(false);

  const [showCart, setShowCart] = useState(false);

  const [ imageUploaded , setImageUploaded ] = useState();

  const [filterSelection, setFilterSelection] = useState("all");
  const [filterText, setFilterText] = useState("");

  const [image , setImage] = useState(false);
  const [ imageSelected ,setImageSelected] = useState();


  const searchRef = useRef(null);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProduits(token).then((response) => {
      if (response.data) {
        setProducts(response.data);
      }
    });
  }, []);

  const ajoutPanier = (productToAdd) => {
    const existingProduct = props.panier.find((p) => p.id === productToAdd.id);

    if (existingProduct) {
      const newPanier = props.panier.map((p) =>
        p.id === productToAdd.id ? { ...p, quantity: p.quantity + 1 } : p
      );
      props.setPanier(newPanier);
    } else {
      props.setPanier([...props.panier, { ...productToAdd, quantity: 1 }]);
    }
  };

  const retirerPanier = (productToRemove) => {
    const existingProduct = props.panier.find(
      (p) => p.id === productToRemove.id
    );

    if (existingProduct) {
      if (existingProduct.quantity > 1) {
        const newPanier = props.panier.map((p) =>
          p.id === productToRemove.id ? { ...p, quantity: p.quantity - 1 } : p
        );
        props.setPanier(newPanier);
      } else {
        const newPanier = props.panier.filter(
          (p) => p.id !== productToRemove.id
        );
        props.setPanier(newPanier);
      }
    }
  };

  const commander = () => {
    api
      .newCommande(
        JSON.stringify(
          props.panier.map((p) => ({ id: p.id, quantity: p.quantity }))
        ),
        token
      )
      .then((response) => {
        if (response.data) {
          props.setPanier([]);
        }
      });
  };

  const sizePanier = props.panier.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  const prixTotal = props.panier.reduce(
    (acc, product) => acc + product.prix * product.quantity,
    0
  );

  const onImageChange = async (event) => {

    setImage(event.target.files[0]);

    const reader = new FileReader();
    reader.onload = () => {
        if(reader.readyState === 2) {
             setImageSelected(reader.result)
        }
     }
     reader.readAsDataURL(event.target.files[0]);

     var formData = new FormData();
     formData.append("image", event.target.files[0] );

    api.uploadImage(formData).then(res => setImageUploaded(res.data.image))

  }

  const onSubmit = async (data) => {
    const refreshingToast = toast.loading('Rafraîchissant ...');

    const { nom , description , prix , quantite } = data
    const details = {
      nom,
      description,
      prix,
      quantite,
      image : imageUploaded
    }

    try {
      const res = await api.postProduit(details , token).then(res => {
        toast.success('Produit ajouté avec succès' , {
          id : refreshingToast
        });

        api.getProduits().then((response) => {
          if (response.data) {
            setProducts(response.data);
          }
        });

        setOpenInsertion(false);

      })
    } catch (error) {
        toast.error('Un autre produit avec ce nom', {
          id : refreshingToast
        })
    }
  }

  return (
    <>
      <div className="firstblock">
        <h3>
          Produits
        </h3>
        <button className="px-2 py-2 rounded duration-300 border-none btn btn-primary" onClick={() => setOpenInsertion(true)} >Ajouter un produit</button>
       
      </div>
      <div
        className={`offcanvas-backdrop fade ${showCart ? "show" : "pe-none"}`}
      ></div>
      <div
        className={`offcanvas offcanvas-end ${
          showCart ? "show" : "hiding"
        } z-index-1`}
        tabindex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasExampleLabel">
            Panier
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={() => setShowCart(false)}
          ></button>
        </div>
        <div className="offcanvas-body">
          {props.panier.length === 0 ? (
            <div className="text-center">Votre panier est vide</div>
          ) : (
            <div>
              <ul className="list-group position-relative">
                {props.panier.map((product) => (
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <img
                      src={product.image}
                      alt={product.nom}
                      style={{ width: "24px", marginRight: "10px" }}
                    />
                    {product.nom}
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        className="btn"
                        onClick={() => retirerPanier(product)}
                      >
                        <i className="bi bi-dash-circle-fill"></i>
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => ajoutPanier(product)}
                      >
                        <i className="bi bi-plus-circle-fill"></i>
                      </button>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {product.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              {props.user ? (
                <div>
                  <div className="text-center mt-3">
                    Prix total : {prixTotal} €
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary mt-3 w-100"
                    onClick={() => commander()}
                  >
                    Commander
                  </button>
                </div>
              ) : (
                <div className="text-center mt-3">
                  Veuillez vous connecter pour commander
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div ref={searchRef}>
        <form>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un produit ..."
              aria-label="Search"
              aria-describedby="basic-addon1"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <select
              className="custom-select mr-sm-2 form-control"
              value={filterSelection}
              onChange={(e) => setFilterSelection(e.target.value)}
            >
              <option value="all" selected>
                Choose...
              </option>
              <option value="maillot">Maillots</option>
              <option value="équipement">Équipements</option>
              <option value="foot">Football</option>
            </select>
          </div>
        </form>
      </div>
      <div className="d-grid gap-3 produits">
        {products
          .filter((product) => {
            if (filterSelection === "all") {
              return true;
            } else {
              return (
                product.description
                  .toLowerCase()
                  .includes(filterSelection.toLowerCase()) ||
                product.nom
                  .toLowerCase()
                  .includes(filterSelection.toLowerCase())
              );
            }
          })
          .filter((product) => {
            return (
              product.nom.toLowerCase().includes(filterText.toLowerCase()) ||
              product.description
                .toLowerCase()
                .includes(filterText.toLowerCase())
            );
          })
          .map((product) => (
            <Produit
              key={product.id}
              nom={product.nom}
              description={product.description}
              quantite = {product.quantite}
              prix={product.prix}
              image={product.image}
              id={product.id}
              ajoutPanier={() => ajoutPanier(product)}
              setProducts={ setProducts}
            />
          ))}
      </div>

      <Modal title="Ajouter un produit" show={openInsertion} onClose={() => setOpenInsertion(false)}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ width : '100%' }} >
            <label htmlFor="nom">Nom</label>
            <input id="nom" {...register("nom", { required: true })} type="text" placeholder="Entrez le nom" className="form-control" />
          </div>
          <div style={{ width : '100%' }} >
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
          </div>
          <div style={{ width : '100%' , marginTop : '10px' }} >
            <label htmlFor="description">Description</label>
            <textarea id="description" {...register("description", { required: true })} rows={5} placeholder="Entrez une Breve Description" className="form-control"  />
          </div>
          <div style={{ width : '100%' , marginTop : '10px' }} >
            <label htmlFor="prix">Prix</label>
            <input id="prix" min={1} {...register("prix", { required: true })} type="number" placeholder="Entrez le prix" className="form-control" />
          </div>
          <div style={{ width : '100%' , marginTop : '10px' }} >
            <label htmlFor="quantite">Quantite</label>
            <input id="quantite" min={0} {...register("quantite", { required: true })} type="number" placeholder="Entrez la quantite" className="form-control" />
          </div>
          
          <button type="submit" className="btn btn-primary">Connexion</button>
        </form>
      </Modal>
    </>
  );
}

export default Produits;
