import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./css/Navbar.css";

export const Navbar = () => {
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
        Horaires
      </NavLink>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}></div>
      <ul className={menuOpen ? "open" : ""}>
        <li>
          <NavLink to="/Horairesms" activeClassName="active">
            Mahdia-Sousse
          </NavLink>
        </li>
        <li>
          <NavLink to="/horairessm" activeClassName="active">
            Sousse-Mahdia
          </NavLink>
        </li>
        <li>
          <NavLink to="/Reclamation" activeClassName="active">
            Réclamation
          </NavLink>
        </li>
        <li>
          <NavLink to="/Profile" activeClassName="active">
            Profile
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
