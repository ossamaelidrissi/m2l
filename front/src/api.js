import axios from 'axios';

const api = {
  register(nom, prenom, email, password, confirm) {
    return axios.post('/api/auth/register', { nom, prenom, email, password, confirm });
  },

  uploadImage(formData) {
    return axios.post('/api/produits/upload', formData)
  },

  login(email, password) {
    return axios.post('/api/auth/login', { email, password });
  },

  logout() {
    return axios.get('/api/auth/logout');
  },

  getUser(token) {
    return axios.get('/api/user' , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  updateUser(nom, prenom, email) {
    return axios.post('/api/user', { nom, prenom, email });
  },

  updatePassword(oldPassword, password, confirm) {
    return axios.post('/api/user/password', { oldPassword, password, confirm });
  },

  getCommandes(token) {
    return axios.get('/api/commandes' , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  postUsers(data , token) {
    return axios.post('/api/admin/users', data, {
      headers : {
        Authorization : 'Bearer '+token
      }
    })
  },

  newCommande(produits , token) {
    return axios.post('/api/commandes/commande', { produits } , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  getEquipes() {
    return axios.get('/api/equipes');
  },

  getProduits() {
    return axios.get('/api/produits');
  },

  updateProduit(id , details , token) {
    return axios.put('/api/admin/produits/' + id , details , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  getUsers(token) {
    return axios.get('/api/admin/getAllUsers' , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  getAllCommandes(token) {
    return axios.get('/api/admin/getAllCommandes', {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  updateUsers(id , details , token) {
    return axios.put('/api/admin/users/'+id , details , {
      headers : {
        Authorization : 'Bearer '+token
      }
    })
  },

  deleteUser(id , token) {
    return axios.delete('/api/admin/users/'+id , {
      headers : {
        Authorization : 'Bearer '+token
      }
    })
  },

  deleteCommande(id , token) {
    return axios.delete('/api/admin/commandes/'+id , {
      headers : {
        Authorization : 'Bearer '+token
      }
    })
  },

  getArticles() {
    return axios.get('/api/articles/');
  },

  deleteProduit(id , token) {
    return axios.delete('/api/admin/produits/' + id , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },

  postProduit(data , token) {
    return axios.post('/api/produits', data , {
      headers : {
        Authorization : 'Bearer '+token
      }
    });
  },
};

export default api;
