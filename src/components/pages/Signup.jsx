import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../css/signup.css";

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "utilisateur", // Default role for signup
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if email already exists
      const { data: existingUser, error: existingError } = await supabase
        .from("user")
        .select("*")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        throw new Error(`L'email ${formData.email} est déjà utilisé.`);
      }

      // Register user in authentication without sending verification email
      const { user, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      }, {
        // Options parameter to disable email confirmation
        redirectTo: '/',
        sendVerificationEmail: false
      });

      if (authError) {
        throw authError;
      }

      console.log("User registered in authentication:", user);

      // Register user in 'user' table
      const { data: userData, error: userError } = await supabase
        .from("user")
        .insert([
          {
            username: formData.username,
            email: formData.email,
            role: formData.role,
          },
        ]);

      if (userError) {
        throw userError;
      }

      console.log("User registered in 'user' table:", userData);

      // Reset form data after successful signup
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "utilisateur",
      });

      // Redirect to login page after successful signup
      window.location.href = "/login";

    } catch (error) {
      console.error("Error signing up:", error.message);
      setErrorMessage(error.message); // Set error message state
    }
  };

  return (
    <div className="container">
      <h1>Création de Compte</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Nom d'utilisateur:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Mot de passe:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </label>
        {/* Display error message if exists */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">S'inscrire</button>
      </form>

      {/* Button to navigate to Login page */}
      <div className="login-link">
        <p>Déjà un compte? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}

export default SignupPage;
