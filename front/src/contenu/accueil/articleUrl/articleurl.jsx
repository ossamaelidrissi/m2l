import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './articleurl.css';

function ArticleUrl(props) {
  const { id } = useParams(); // Récupérer l'ID de l'URL
  const article = props.articles.find(a => a.id.toString() === id); // Trouver l'article par ID

    console.log(id)
  if (!article) return <div>Aucun article sélectionné</div>;

  return (
    <div className='containerArticleUrl'>
      <h5><Link to='/'><i className="bi bi-arrow-left"></i> Retour aux actualités</Link></h5>
      <img className='imageArticleUrl' src={article.image} alt={`Article titled: ${article.titre}`} />
      <h2 className='titreArticleUrl'>{article.titre}</h2>
      <p>{article.texte}</p>
      {/* autres détails de l'article */}
    </div>
  );
}

export default ArticleUrl;