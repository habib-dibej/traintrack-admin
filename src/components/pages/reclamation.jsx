import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
    import "../css/reclamation.css";

    const Reclamation = () => {
        const [reclamations, setReclamations] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
      
        useEffect(() => {
          fetchReclamations();
        }, []);
      
        const fetchReclamations = async () => {
          try {
            const { data: reclamationsData, error: reclamationError } = await supabase
              .from("recla")
              .select("id, tickets, email, date_t")
              .order("date_t", { ascending: false });
      
            if (reclamationError) {
              throw reclamationError;
            }
      
            const emailSet = new Set(
              reclamationsData.map((reclamation) => reclamation.email)
            );
      
            const { data: users, error: userError } = await supabase
              .from("user")
              .select("email, username, phone")
              .in("email", [...emailSet]);
      
            if (userError) {
              throw userError;
            }
      
            const reclamationsWithUserData = reclamationsData.map((reclamation) => {
              const user = users.find((user) => user.email === reclamation.email);
              return {
                ...reclamation,
                username: user.username,
                phone: user.phone,
              };
            });
      
            setReclamations(reclamationsWithUserData || []);
            setLoading(false);
            setError(null);
          } catch (error) {
            console.error("Erreur lors de la récupération des réclamations:", error.message);
            setError("Une erreur est survenue lors de la récupération des réclamations.");
            setLoading(false);
          }
        };
      
        const formatDate = (dateTimeString) => {
          const date = new Date(dateTimeString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
      
          return `${year}/${month}/${day} ${hours}:${minutes}`;
        };
      
        if (loading) {
          return <div>Loading...</div>;
        }
      
        if (error) {
          return <div>Error: {error}</div>;
        }
      
        return (
          <div className="reclamation-container">
            <h2>Liste des réclamations</h2>
            {reclamations.length === 0 ? (
              <p>Aucune réclamation à afficher.</p>
            ) : (
              <ul className="reclamation-list">
                {reclamations.map((reclamation) => (
                  <li key={reclamation.id} className="reclamation-item">
                    <div className="container">
                    <div className="right-content">
                    <strong>Date: </strong> {formatDate(reclamation.date_t)}
                    </div>
                      <strong>{reclamation.username}</strong>
                      <br />
                      <strong>"</strong> {reclamation.tickets}<strong>"</strong>
                      <br />
                      <strong>Email: </strong> {reclamation.email}
                      <br />
                      <strong>Téléphone: </strong> {reclamation.phone}
                      <br />
                      <br />
                      <Link to={`/Repondre?id=${reclamation.id}`}>Repondre</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      };
      
      

export default Reclamation;
