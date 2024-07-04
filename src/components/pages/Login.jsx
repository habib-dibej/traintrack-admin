import React, { useState } from "react";
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for navigation
import "../css/Login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState(""); // State for Email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Authenticate user with email and password
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      console.log(data);
      const uuid = data.user.id;
      const {data: updateData , error: updateError} = await supabase.from('user').update({uuid: uuid}).eq('email', email);
      console.log(updateData);
      if (updateError) {
        setError(updateError.message);
      }
      
      if (authError) {
        setError(authError.message);
      } else if (data.user) {
        onLogin(data.user.email); // Pass email to onLogin function
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>Login</button>
      </form>
      <div className="signup-link">
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;
