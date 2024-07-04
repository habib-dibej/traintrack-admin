import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios for HTTP requests
import { supabase } from '../../supabaseClient';
import "../css/admin.css"; // Import your CSS file
import { createClient } from '@supabase/supabase-js';

const AdminPage = ({ userEmail }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('user')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('user')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
    } else {
      fetchUsers(); // Refresh the user list
    }
  };
  const deleteUser = async (userId, email) => {

    const supabaseUrl ='https://hmmuuwerikzgmmfvmhgo.supabase.co';
    const supabase_ServiceKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXV1d2VyaWt6Z21tZnZtaGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTM2NDA0OSwiZXhwIjoyMDI0OTQwMDQ5fQ.lkwMxiEHCQCH_MaE6SdH8R8sgmB4WIV5Bd2qCrI_K7Y'
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabase_ServiceKey
    );
    // Check if the user to delete is the currently logged-in user
    if (email === userEmail) {
      console.error('Cannot delete yourself.');
      return;
    }
/*
    try {
      const response = await axios.delete(`/api/deleteUser/${userId}`);
      if (response.data.success) {
        console.log('User deleted successfully');
        fetchUsers(); // Refresh the user list
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
      */

    try{
      const {data: user, errorUser} = await supabase.from('user').select('*').eq('id', userId).single();
      if (errorUser) {
        console.error('Error fetching user:', errorUser.message);
      }
      const uuid = user.uuid;

      console.log('uuid:', uuid);

      const { error } = await supabase.from('user').delete().eq('id', userId);
      if (error) {
        console.error('Error deleting user:', error.message);
      }
      const { error: userDeleteAuth } = await supabaseAdmin.auth.admin.deleteUser(uuid);
      con
      if (userDeleteAuth) {
        console.error('Error deleting user from auth.users table:', userDeleteAuth.message);
      }

      fetchUsers(); 
    }
    catch (error) {
      console.error('Error deleting user:', error.message);
    }

  };

  const handleRoleChange = (event, userId) => {
    const newRole = event.target.value;
    updateUserRole(userId, newRole);
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="container">
      <h1>Gestion des utilisateurs</h1>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
{users.map((user, index) => (
  <tr key={user.id}>
    <td>{index + 1}</td>
    <td>{user.username}</td>
    <td>{user.email}</td>
    <td>
      <select
        value={user.role}
        onChange={(event) => handleRoleChange(event, user.id)}
        disabled={user.email === userEmail} // Désactive le select si l'email correspond à userEmail
      >
        <option value="user">Utilisateur</option>
        <option value="admin">Admin</option>
        <option value="responsable">Responsable</option>
      </select>
    </td>
    <td>
      {user.email !== userEmail && ( // Affiche le bouton Supprimer uniquement si l'email est différent de userEmail
        <button className="delete-button" onClick={() => deleteUser(user.id, user.email)}>
          Supprimer
        </button>
      )}
    </td>
  </tr>
))}

        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
