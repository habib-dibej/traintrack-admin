  import React, { useState, useEffect } from "react";
  import { Route, Routes, Navigate } from "react-router-dom";
  import "./components/css/App.css";
  import { Navbar } from "./components/Navbar";
  import { Profile, Horairesms, Horairessm, Login,Reclamation,Repondre } from "./components/pages";

  function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null); 

    useEffect(() => {
      const loggedInUser = localStorage.getItem("isLoggedIn");
      const userEmailFromStorage = localStorage.getItem("userEmail");
      if (loggedInUser && userEmailFromStorage) {
        setIsLoggedIn(true);
        setUserEmail(userEmailFromStorage);
      }
    }, []);

    const handleLogin = (email) => {
      setIsLoggedIn(true);
      setUserEmail(email); 
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("userEmail", email);
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      setUserEmail(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
    };

    return (
      <div className="App">
        {isLoggedIn ? (
          <>
            <Navbar />
            <Routes>
              <Route path="/Profile" element={<Profile email={userEmail} onLogout={handleLogout} />} />
              <Route path="/Horairesms" element={<Horairesms />} />
              <Route path="/Horairessm" element={<Horairessm />} />
              <Route path="/Reclamation" element={<Reclamation/>} />
              <Route path="/Repondre" element={<Repondre/>} />
              <Route path="*" element={<Navigate to="/Profile" />} />
            </Routes>
          </>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    );
  }

  export default App;
