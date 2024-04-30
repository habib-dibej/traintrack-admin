import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import "../css/horaires.css";

function Home() {
  const [tableData, setTableData] = useState([]);
  const [selectedMetro, setSelectedMetro] = useState("");

  useEffect(() => {
    async function fetchTableData() {
      try {
        // Fetch data from the "horaires" table
        const { data, error } = await supabase.from("horaires(s-m)").select("*");
        console.log(data);
        if (error) {
          throw error;
        }

        setTableData(data);
      } catch (error) {
        console.error("Error fetching table data:", error.message);
      }
    }

    fetchTableData();
  }, []);

  const handleCellChange = async (newValue, rowIndex, columnIndex) => {
    try {
      const columnName = Object.keys(tableData[rowIndex])[columnIndex];
      const rowId = tableData[rowIndex].id; // Assuming there's an 'id' field in your table
      const { error } = await supabase
        .from("horaires(s-m)")
        .update({ [columnName]: newValue })
        .eq("id", rowId);
      if (error) {
        throw error;
      }
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex][columnName] = newValue;
      setTableData(updatedTableData);
    } catch (error) {
      console.error("Error updating cell value:", error.message);
    }
  };

  return (
    <div>
      <table className="styled-table">
        <thead>
          <tr>
            {tableData.length > 0 &&
              Object.keys(tableData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.entries(row).map(([key, value], columnIndex) => (
                <td key={columnIndex}>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCellChange(e.target.value, rowIndex, columnIndex)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home;
