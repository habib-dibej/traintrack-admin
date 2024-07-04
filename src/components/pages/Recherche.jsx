import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "../css/recheche.css";

function AffichagePage({ userEmail }) {
  const [dataList, setDataList] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDateTimeGroup, setCurrentDateTimeGroup] = useState([]);
  const [dateTimeKeys, setDateTimeKeys] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [selectedTable, setSelecteddepartment] = useState("cablage");
  const [username, setUsername] = useState(""); // State to hold username
  const [userRole, setUserRole] = useState(""); // State to hold user role

  useEffect(() => {
    fetchDataList();
    fetchUserRole(); // Fetch user role when component mounts or userEmail changes
    fetchUsername(); // Fetch username when component mounts or userEmail changes
  }, [filterDate, filterDepartment, selectedTable, userEmail]);

  useEffect(() => {
    groupByDateTime();
  }, [dataList]);

  useEffect(() => {
    if (dateTimeKeys.length > 0) {
      setCurrentDateTimeGroup(groupedData[dateTimeKeys[currentPage - 1]] || []);
    }
  }, [currentPage, dateTimeKeys, groupedData]);

  const fetchDataList = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("username, role")
        .eq("email", userEmail)
        .single();

      if (userError) {
        throw userError;
      }

      if (userData) {
        setUsername(userData.username);
        setUserRole(userData.role);

        const { data, error } = await supabase
          .from(selectedTable)
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          let filteredData = data;
          if (userData.role !== "admin") {
            filteredData = data.filter(
              (item) =>
                (!filterDate || item.date.startsWith(filterDate)) &&
                (!filterDepartment || item.department === filterDepartment) &&
                item.username === userData.username // Filter data by username from user table
            );
          }
          setDataList(filteredData);
        }
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des données de ${selectedTable} :`,
        error.message
      );
    }
  };

  const groupByDateTime = () => {
    const grouped = dataList.reduce((acc, item) => {
      const dateTime = item.date || "unknown";
      if (!acc[dateTime]) acc[dateTime] = [];
      acc[dateTime].push(item);
      return acc;
    }, {});

    setGroupedData(grouped);
    setDateTimeKeys(Object.keys(grouped));
    setCurrentPage(1); // Reset to first page when grouping
  };

  const totalPages = dateTimeKeys.length;

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const totalTotDefaux = currentDateTimeGroup.reduce(
    (sum, item) => sum + (item.tot_defaux || 0),
    0
  );

  const currentGroupData = currentDateTimeGroup[0] || {};

  const fetchUsername = async () => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("username")
        .eq("email", userEmail)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
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

  return (
    <div className="container">
      <div className="filters">
        <div className="filter">
          <label htmlFor="selected-table">Sélectionner la table:</label>
          <select
            id="filter-department"
            name="filter-department"
            value={selectedTable}
            onChange={(e) => setSelecteddepartment(e.target.value)}
          >
            <option value="cablage">Cablage</option>
            <option value="trad">Trad</option>
          </select>
        </div>
        <div className="filter">
          <label htmlFor="filter-date">Filtrer par date:</label>
          <input
            type="date"
            id="filter-date"
            name="filter-date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="header">
        <div className="info">
          <h2>OF: {currentGroupData.of}</h2>
          {userRole === "admin" || userRole === "responsable" ? (
            <h2>Username: {currentGroupData.username}</h2>
          ) : (
            <h2>Username: {username}</h2>
          )}
          <h2>Département: {selectedTable}</h2>
        </div>
      </div>

      <div className="content">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Désignation</th>
              <th>Qt Defaux</th>
              <th>Tot Defaux</th>
              <th>Observation</th>
            </tr>
          </thead>
          <tbody>
            {currentDateTimeGroup.map((item, index) => (
              <tr key={index}>
                <td>{item.code}</td>
                <td>{item.designation}</td>
                <td style={{ textAlign: "center" }}>
                  {item.qt_defaux ? "✔" : ""}
                </td>
                <td style={{ textAlign: "center" }}>{item.tot_defaux}</td>
                <td>{item.observation}</td>
              </tr>
            ))}

            <tr>
              <td colSpan="3"></td>
              <td>
                <strong>Total:</strong> {totalTotDefaux}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            Précédent
          </button>
          <span>
            Page {currentPage} de {totalPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

export default AffichagePage;
