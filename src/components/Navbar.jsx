import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./css/Navbar.css";

const Navbar = ({ isAdmin }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    // Perform any logout actions here
    // For example, clearing user data, logging out from the server, etc.
    // Then, reload the page
    window.location.reload();
  };

  return (
    <nav>
      <NavLink to="/" className="title">
        Controle Qualite
      </NavLink>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}></div>
      <ul className={menuOpen ? "open" : ""}>
        <li>
          <NavLink to="/Profile" activeClassName="active">
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/Cablage">Cablage</NavLink>
        </li>
        <li>
          <NavLink to="/Trad">Trad</NavLink>
        </li>
        <li>
          <NavLink to="/Recherche">Recherche</NavLink>
        </li>
        {isAdmin && ( // Afficher uniquement si l'utilisateur est admin
          <li>
            <NavLink to="/Admin">Admin</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
