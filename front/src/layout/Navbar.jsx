import * as React from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import api from "../api";
import { useEffect } from "react";


function Navbar(props) {

  const [openLogin, setOpenLogin] = React.useState(false);
  const [openRegister, setOpenRegister] = React.useState(false);

  const [nom, setNom] = React.useState("");
  const [prenom, setPrenom] = React.useState("")
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");

  const [error, setError] = React.useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    setNom("");
    setPrenom("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
  }, [openLogin, openRegister]);

  useEffect(() => {
    api.getUser(props.token).then((res) => {
      console.log(res.data)
      if (res.data.success) {
        props.setUser(res.data.user[0]);
        return;
      }
      props.setUser(null);
    });
  },[])

  const handleLogin = (e) => {
    e.preventDefault();
    api.login(email, password).then((res) => {
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        api.getUser(res.data.token).then((res) => {
          if (res.data.success) {
            props.setUser(res.data.user[0]);
            setOpenLogin(false);
          }
        })
      } else {
        setError(res.data.message);
      }
    });
  }

  const handleLogout = () => {
    api.logout().then((res) => {
      if (res.data.success) {
        props.setUser(null);
        localStorage.removeItem("token")
        navigate('/');
      }
    })
  }

  const handleRegister = (e) => {
    e.preventDefault();
    api.register(nom, prenom, email, password, passwordConfirm).then((res) => {
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        props.setUser(res.data.user);
            setOpenRegister(false);

        // api.getUser(res.data.token).then((res) => {
        //   if (res.data.success) {
        //     props.setUser(res.data.user);
        //   }
        // })
      } else {
        setError(res.data.message);
      }
    });
  }

  console.log(props.user)

  return (
    <>
      <Modal title="Connexion" show={openLogin} onClose={() => setOpenLogin(false)}>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" className="form-control" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn btn-primary">Connexion</button>
          {error && <div className="alert alert-danger w-100 mb-0">{error}</div>}
        </form>
      </Modal>

      <Modal title="Inscription" show={openRegister} onClose={() => setOpenRegister(false)}>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nom" className="form-control" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
          <input type="text" placeholder="Prénom" className="form-control" name="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          <input type="email" placeholder="Email" className="form-control" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirmer le mot de passe" className="form-control" name="confirm" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          <button type="submit" className="btn btn-primary">Inscription</button>
          {error && <div className="alert alert-danger w-100 mb-0">{error}</div>}
        </form>
      </Modal>

      <div class="overflow-hidden nav-wrapper" style={props.navbarOpen ? { maxWidth: "300px" } : { maxWidth: 0 }} >
        <nav>
            <div className="topnav">
              <img src="src/assets/Logo2.png" className="" alt="" />
              {
                ( !props.user || props.user?.fonction == 'joueur' || props.user[0]?.fonction == 'joueur') ? (
                  <>

                    <NavLink to="/">
                      <button className="btn">
                        <i className="bi bi-house-fill"></i>
                          Accueil
                      </button>
                    </NavLink>
                    <NavLink to="/boutique">
                      <button className="btn">
                        <i className="bi bi-cart-fill"></i>
                        Boutique
                      </button>
                    </NavLink>
                    <NavLink to="/matchs">
                      <button className="btn">
                        <i className="bi bi-calendar-fill"></i>
                        Matchs
                      </button>
                    </NavLink>
                  
                  </>
                ) : 
                <>
                  <NavLink to="/produits">
                    <button className="btn">
                      <i className="bi bi-shop"></i>
                      Produits
                    </button>
                  </NavLink>
                  <NavLink to="/utilisateurs">
                    <button className="btn">
                      <i className="bi bi-cart-fill"></i>
                      Utilisateurs
                    </button>
                  </NavLink>
                  <NavLink to="/commandes">
                    <button className="btn">
                      <i className="bi bi-bag-fill"></i>
                      Commandes
                    </button>
                  </NavLink>
                </>
              }
             
            </div>

            <div className="bottomnav">
              {props.user ?
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate("/compte")} >
                    <i className="bi bi-person-fill"></i>
                    Mon compte
                  </button>
                  <button type="button" className="btn btn-warning" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" color="white"></i>
                    Deconnexion
                  </button>
                </>
                :
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setOpenLogin(true)}>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Connexion
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setOpenRegister(true)}>
                    <i className="bi bi-person-plus-fill"></i>
                    Inscription
                  </button>
                </>
              }
            </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
