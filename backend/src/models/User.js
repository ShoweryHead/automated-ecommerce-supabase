const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class User {
  // Create a new user
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user in SupaBase
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user',
          password: hashedPassword,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw new Error(error.message);
      
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Find all users
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Update user
  static async update(id, updateData) {
    try {
      // If password is being updated, hash it
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw new Error(error.message);
      
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Delete user
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Match password
  static async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
  
  // Generate JWT token
  static getSignedJwtToken(userId) {
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });
  }
}

module.exports = User;
