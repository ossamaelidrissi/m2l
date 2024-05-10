import './App.css';
import Navbar from './layout/Navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import api from './api';
import Contenu from './contenu';
import { Toaster } from 'react-hot-toast'
import { AuthContext, AuthProvider } from './context/AuthContext';

function App() {
  
  const [user, setUser] = useState();

  const token = localStorage.getItem("token");

  const [equipes, setEquipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [useAlternateNavbar, setUseAlternateNavbar] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(true);


  useEffect(() => {
   
    api.getEquipes().then((res) => {
      if (res.data.success) {
        setEquipes(res.data.equipes);
        console.log(res.data.equipes);
      }
    });

    api.getArticles().then((res) => {
      if (res.data.success) {
        setArticles(res.data.articles);
        console.log(res.data.articles);
      }
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className='d-flex'>
          <Toaster position="top-center" reverseOrder={false} />
          <label className="hamburger">
            <input type="checkbox" checked={navbarOpen} onChange={() => setNavbarOpen(!navbarOpen)} />
            <svg viewBox="0 0 32 32">
              <path className="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
              <path className="line" d="M7 16 27 16"></path>
            </svg>
          </label>
          <Navbar token = {token} user={user} setUser={setUser} navbarOpen={navbarOpen} useAlternateNavbar={useAlternateNavbar} setUseAlternateNavbar={setUseAlternateNavbar} />
          <Contenu token = {token} user={user} setUser={setUser} equipes={equipes} articles={articles} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
