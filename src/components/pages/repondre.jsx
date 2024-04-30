import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useLocation, Link } from "react-router-dom";
import backButtonIcon from "../Photo/retour.png"; // Importez votre image de bouton de retour
import "../css/Repondre.css";


const Repondre = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const reclamationId = searchParams.get("id");
  const [reclamationDetails, setReclamationDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchReclamationDetails();
  }, [reclamationId]);

  const fetchReclamationDetails = async () => {
    try {
      const { data: reclamationData, error: reclamationError } = await supabase
        .from("recla")
        .select("id, tickets, email, answer") // Ajoutez d'autres champs si nécessaire
        .eq("id", reclamationId)
        .single();

      if (reclamationError) {
        throw reclamationError;
      }

      setReclamationDetails(reclamationData);

      // Maintenant, récupérez les données de l'utilisateur avec le même email
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("email", reclamationData.email)
        .single();

      if (userError) {
        throw userError;
      }

      setUserDetails(userData);

      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la réclamation:", error.message);
      setError("Une erreur est survenue lors de la récupération des détails de la réclamation.");
      setLoading(false);
    }
  };

  const handleResponseChange = (e) => {
    setResponseText(e.target.value);
  };

  const handleResponseSubmit = async () => {
    try {
      const currentDate = new Date(); // Obtenir la date actuelle
      const formattedDate = currentDate.toISOString(); // Formater la date au format ISO
  
      // Mettre à jour la réponse dans la table "recla" et inclure la date actuelle
      await supabase.from("recla").update({ 
        answer: responseText,
        date_a: formattedDate // Insérer la date actuelle dans le champ date_a
      }).eq("id", reclamationId);
  
      // Mise à jour réussie, rechargez la page pour afficher les modifications
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réponse:", error.message);
      // Gérer l'erreur de mise à jour ici
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="return-button">
        <Link to="/Reclamation">
          <img src={backButtonIcon} alt="Retour" />
        </Link>
      </div>
      <div className="container">
        <h2>Détails de la réclamation</h2>

        {userDetails && (
          <div>
            <p><strong>Nom:</strong> {userDetails.username}</p>
            <p><strong>Téléphone:</strong> {userDetails.phone}</p>
            {/* Ajoutez d'autres champs utilisateur ici si nécessaire */}
          </div>
        )}

        {reclamationDetails && (
          <div>
            <p><strong>Email:</strong> {reclamationDetails.email}</p>
            <p><strong>Tickets:</strong> {reclamationDetails.tickets}</p>
            {/* Ajoutez d'autres champs de réclamation ici si nécessaire */}
          </div>
        )}
      </div>
      <div className="container">,
      {reclamationDetails && (
            <p><strong>Réponse:</strong>{reclamationDetails.answer}</p>
        )}
        </div>
        
      <div className="response-edit-box">
          <h3>ajoute un réponse</h3>
          <textarea value={responseText} onChange={handleResponseChange}></textarea>
          <button onClick={handleResponseSubmit}>Enregistrer</button>
     </div>
    </div>
  );
};

export default Repondre;
