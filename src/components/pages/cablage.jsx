import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "../css/Cablage_trad.css";

function Cablage({ userEmail }) {
  const [cablageList, setCablageList] = useState([]);
  const [formData, setFormData] = useState({
    of: "",
    code: "",
    designation: "",
    username: "", // Default username will be fetched and set here
  });
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchCablageList();
    fetchUsername(); // Fetch username when component mounts

    // Fetch user role every second
    const roleCheckInterval = setInterval(() => {
      fetchUserRole();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(roleCheckInterval);
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("role")
        .eq("email", userEmail)
        .single(); // Assuming userEmail is unique and will return a single row
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

  const fetchCablageList = async () => {
    try {
      const { data, error } = await supabase
        .from("list_cablage")
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        setCablageList(data);
      }
    } catch (error) {
      console.error("Error fetching list_cablage:", error.message);
    }
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedCablageList = [...cablageList];

    if (type === "checkbox") {
      updatedCablageList[index][name] = checked;
    } else if (name === "tot_defaux") {
      updatedCablageList[index][name] = value === "" ? null : parseInt(value);
    } else {
      updatedCablageList[index][name] = value;
    }

    setCablageList(updatedCablageList);
  };

  const handleAddEntry = async () => {
    const newEntry = {
      code: formData.code,
      designation: formData.designation,
      qt_defaux: false,
      tot_defaux: null,
      observation: "",
    };

    try {
      // Check if user has admin or responsable role
      if (userRole !== "admin" && userRole !== "responsable") {
        throw new Error("Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
      }

      const { data, error } = await supabase
        .from("list_cablage")
        .insert([newEntry]);

      if (error) {
        throw error;
      }

      console.log("New entry inserted successfully:", data);
      setCablageList([...cablageList, newEntry]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        code: "",
        designation: "",
      }));
    } catch (error) {
      console.error("Error inserting new entry:", error.message);
    }
  };

  const handleDeleteEntry = async (codeToDelete) => {
    try {
      // Check if user has admin or responsable role
      if (userRole !== "admin" && userRole !== "responsable") {
        throw new Error("Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
      }

      const { data, error } = await supabase
        .from("list_cablage")
        .delete()
        .eq("code", codeToDelete);

      if (error) {
        throw error;
      }

      console.log("Entry deleted successfully:", data);
      const updatedList = cablageList.filter((item) => item.code !== codeToDelete);
      setCablageList(updatedList);
    } catch (error) {
      console.error("Error deleting entry:", error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      for (let i = 0; i < cablageList.length; i++) {
        const item = cablageList[i];

        if ((item.qt_defaux && !item.tot_defaux) || (!item.qt_defaux && item.tot_defaux)) {
          alert(`Please fill Qt Defaux and Tot Defaux consistently for ${item.code}.`);
          return;
        }
      }

      const currentDateTime = new Date().toISOString();

      const insertData = cablageList.map((item) => ({
        ...item,
        username: formData.username,
        of: formData.of,
        date: currentDateTime,
      }));

      // Check if user has admin or responsable role
      if (userRole !== "admin" && userRole !== "responsable") {
        throw new Error("Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
      }

      const { data, error } = await supabase
        .from("cablage")
        .insert(insertData);

      if (error) {
        throw error;
      }

      alert("Data inserted successfully!");
      setFormData({
        of: "",
        code: "",
        designation: "",
        username: formData.username, // Keep the username for next entries
      });
      setCablageList([]);
      fetchCablageList();
    } catch (error) {
      console.error("Error inserting data:", error.message);
      alert("Error inserting data!");
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
            onChange={(e) => setFormData((prevFormData) => ({
              ...prevFormData,
              of: e.target.value
            }))}
            required
          />
          {/* No need to display username input in the form */}
          <input
            type="hidden"
            name="username"
            value={formData.username}
          />

          <button type="submit">Submit All</button>
        </form>
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Désignation</th>
            <th>Qt Defaux</th>
            <th>Tot Defaux</th>
            <th>Observation</th>
            {userRole === "admin" || userRole === "responsable" ? <th>Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {cablageList.map((item, index) => (
            <tr key={index} className={item.qt_defaux && !item.tot_defaux ? 'error-row' : ''}>
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
                  value={item.tot_defaux || ""}
                  onChange={(e) => handleChange(e, index)}
                  className={item.qt_defaux && !item.tot_defaux ? 'error-input' : ''}
                />
              </td>
              <td>{item.observation}</td>
              {userRole === "admin" || userRole === "responsable" ? (
                <td>
                  <button
                    onClick={() => handleDeleteEntry(item.code)}
                    className="delete-button"
                  >
                    &#10005;
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
          <tr>
            <td>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    code: e.target.value
                  }))
                }
                placeholder="Enter code"
              />
            </td>
            <td>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={(e) =>
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    designation: e.target.value
                  }))
                }
                placeholder="Enter designation"
              />
            </td>
            {userRole === "admin" || userRole === "responsable" ? (
              <td>
                <button type="button" onClick={handleAddEntry} className="add-button">
                  +
                </button>
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Cablage;
