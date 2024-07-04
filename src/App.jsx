import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./components/css/App.css";
import Navbar from "./components/Navbar";
import { Profile, Login, Cablage, Trad, Recherche, Admin, Signup } from "./components/pages";
import { supabase } from "./supabaseClient";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadUserSession = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const storedEmail = localStorage.getItem("userEmail");
      const storedRole = localStorage.getItem("userRole");
      
      if (loggedIn && storedEmail && storedRole) {
        setIsLoggedIn(true);
        setUserEmail(storedEmail);
        setUserRole(storedRole);
      }
    };

    loadUserSession();
  }, []);

  const handleLogin = async (email) => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("email, role")
        .eq("email", email)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setIsLoggedIn(true);
        setUserEmail(data.email);
        setUserRole(data.role);
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userRole", data.role);
      }
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserRole(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
  };

  // Function to determine if the current location is on the login or signup pages
  const isOnAuthPage = () => {
    return location.pathname === "/login" || location.pathname === "/signup";
  };

  return (
    <div className="App">
      {!isOnAuthPage() && (
        <Navbar isLoggedIn={isLoggedIn} isAdmin={userRole === "admin"} onLogout={handleLogout} />
      )}
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/profile" element={<Profile email={userEmail} onLogout={handleLogout} />} />
            <Route path="/cablage" element={<Cablage userEmail={userEmail} />} />
            <Route path="/trad" element={<Trad userEmail={userEmail} />} />
            <Route path="/recherche" element={<Recherche userEmail={userEmail} />} />
            {userRole === "admin" && <Route path="/admin" element={<Admin userEmail={userEmail}/>} />}
            <Route path="*" element={<Navigate to="/profile" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
