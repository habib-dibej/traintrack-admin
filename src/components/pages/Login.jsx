import React, { useState } from "react";
import { supabase } from '../supabaseClient';
import "../css/Login.css";


const Login = ({ onLogin }) => {
  const [id, setId] = useState(""); // State for ID
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch user data based on ID
      const { data: user, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError("User does not exist.");
        setLoading(false);
        return;
      }

      // Authenticate user with email and password
      const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password });

      if (authError) {
        setError(authError.message);
      } else {
        onLogin(user.email); // Pass email to onLogin function
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
          <label>Matricule:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
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
    </div>
  );
};

export default Login;
