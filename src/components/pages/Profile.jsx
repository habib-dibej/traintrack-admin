import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import "../css/profile.css";

const Profile = ({ email, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try { 
        const { data, error } = await supabase
          .from('user')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          throw error;
        }

        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  return (
    <div className="profile-container">
      <h2> Profile</h2>
      {loading ? (
        <p>Loading user data...</p>
      ) : (
        userData ? (
          <div>
            <p><strong>Matricule:</strong> {userData.id}</p>
            <p><strong>Name:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>phone:</strong> {userData.phone}</p>
            <button onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <p>No user data found.</p>
        )
      )}
    </div>
  );
};

export default Profile;
