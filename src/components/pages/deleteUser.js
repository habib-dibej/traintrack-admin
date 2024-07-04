const { supabaseAdmin } = require('../../supabaseClient');

// Function to delete a user by ID using Supabase Admin SDK
const deleteUser = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Error deleting user:', error.message);
      return { error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return { error: error.message };
  }
};

module.exports = { deleteUser };
