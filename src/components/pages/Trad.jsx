import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "../css/Cablage_trad.css";

function Trad({ userEmail }) {
  const initialFormData = {
    username: "",
    of: "",
    code: "",
    designation: "",
    department: "", // Nouveau champ d'entrée pour le département
  };

  const [formData, setFormData] = useState(initialFormData);
  const [tradList, setTradList] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchTradList();
    fetchUsername(); // Fetch username when component mounts

    // Fetch user role every second
    const roleCheckInterval = setInterval(() => {
      fetchUserRole();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(roleCheckInterval);
  }, []);

  const fetchUsername = async () => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("username")
        .eq("email", userEmail)
        .single(); // Assuming userEmail is unique and will return a single row
      if (error) {
        throw error;
      }

      if (data) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          username: data.username,
        }));
      }
    } catch (error) {
      console.error("Error fetching username:", error.message);
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("role")
        .eq("email", userEmail)
        .single();
      if (error) {
        throw error;
      }

      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error.message);
    }
  };

  const fetchTradList = async () => {
    try {
      const { data, error } = await supabase
        .from("list_trad")
        .select("code, designation");

      if (error) {
        throw error;
      }

      if (data) {
        setTradList(data);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de list_trad :",
        error.message
      );
    }
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedTradList = [...tradList];

    if (type === "checkbox") {
      updatedTradList[index][name] = checked;
    } else if (name === "tot_defaux") {
      updatedTradList[index][name] = value === "" ? null : parseInt(value);
    } else {
      updatedTradList[index][name] = value;
    }

    setTradList(updatedTradList);
  };

  const handleAddEntry = async () => {
    if (userRole !== "admin" && userRole !== "responsable") {
      alert(
        "Vous n'avez pas les permissions nécessaires pour ajouter une nouvelle entrée."
      );
      return;
    }

    const newEntry = {
      code: formData.code,
      designation: formData.designation,
    };

    try {
      const { data, error } = await supabase
        .from("list_trad")
        .insert([newEntry]);

      if (error) {
        throw error;
      }

      console.log("Nouvelle entrée insérée avec succès :", data);
      setTradList([...tradList, newEntry]);
      setFormData(initialFormData); // Effacer les entrées du formulaire
    } catch (error) {
      console.error(
        "Erreur lors de l'insertion de la nouvelle entrée :",
        error.message
      );
    }
  };

  const handleDeleteEntry = async (codeToDelete) => {
    if (userRole !== "admin" && userRole !== "responsable") {
      alert(
        "Vous n'avez pas les permissions nécessaires pour supprimer cette entrée."
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from("list_trad")
        .delete()
        .eq("code", codeToDelete);

      if (error) {
        throw error;
      }

      console.log("Entrée supprimée avec succès :", data);
      // Mettre à jour tradList après la suppression
      const updatedList = tradList.filter((item) => item.code !== codeToDelete);
      setTradList(updatedList);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entrée :", error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if user role is admin
      if (userRole !== "admin" && userRole !== "responsable") {
        throw new Error(
          "Vous n'avez pas les permissions nécessaires pour effectuer cette action."
        );
      }

      // Loop through tradList to check for validation errors
      for (let i = 0; i < tradList.length; i++) {
        const item = tradList[i];

        // Check if both qt_defaux and tot_defaux are either both filled or both empty
        if (
          (item.qt_defaux && !item.tot_defaux) ||
          (!item.qt_defaux && item.tot_defaux)
        ) {
          alert(
            `Veuillez remplir Qt Defaux et Tot Defaux pour ${item.code} de manière cohérente.`
          );
          return; // Exit the function if there's an error
        }
      }

      const currentDateTime = new Date().toISOString(); // Get current date and time

      const insertData = tradList.map((item) => ({
        ...item,
        username: formData.username,
        of: formData.of,
        date: currentDateTime, // Include current date and time
      }));

      const { data, error } = await supabase.from("trad").insert(insertData);

      if (error) {
        throw error;
      }

      alert("Données insérées avec succès !");
      setFormData({ ...initialFormData, username: formData.username }); // Reset all fields except username
      setTradList([]); // Clear the list after insertion
      fetchTradList(); // Refresh the list after insertion
    } catch (error) {
      console.error("Erreur lors de l'insertion des données :", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="of">OF :</label>
          <input
            type="text"
            id="of"
            name="of"
            value={formData.of}
            onChange={(e) => setFormData({ ...formData, of: e.target.value })}
            required
          />
          <input
            type="hidden"
            name="username"
            value={formData.username}
          />

          <button type="submit">Soumettre Tout</button>
        </form>
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Désignation</th>
            <th>Qt Defaux :</th>
            <th>Tot Defaux</th>
            <th>Observation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tradList.map((item, index) => (
            <tr key={index}>
              <td>{item.code}</td>
              <td>{item.designation}</td>
              <td>
                <input
                  type="checkbox"
                  name="qt_defaux"
                  checked={item.qt_defaux}
                  onChange={(e) => handleChange(e, index)}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="tot_defaux"
                  value={item.tot_defaux}
                  onChange={(e) => handleChange(e, index)}
                />
              </td>
              <td>{item.observation}</td>
              <td>
                {(userRole === "admin" || userRole === "responsable") && (
                  <button
                    onClick={() => handleDeleteEntry(item.code)}
                    className="delete-button"
                  >
                    &#10005;
                  </button>
                )}
              </td>
            </tr>
          ))}
          {(userRole === "admin" || userRole === "responsable") && (
            <tr>
              <td>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Entrer le Code"
                />
              </td>
              <td>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="Entrer la Désignation"
                />
              </td>
              <td>
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="add-button"
                >
                  +
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Trad;
