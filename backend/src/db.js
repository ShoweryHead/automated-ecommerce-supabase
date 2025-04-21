// This file replaces the MongoDB connection with SupaBase
const supabase = require('./config/supabase');
const config = require('./config/config');

const connectDB = async () => {
  try {
    // Test SupaBase connection
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error(`Error connecting to SupaBase: ${error.message}`);
      // Create health_check table if it doesn't exist
      const { error: createError } = await supabase
        .from('health_check')
        .insert([{ status: 'ok', timestamp: new Date().toISOString() }]);
      
      if (createError && createError.code !== '23505') { // Ignore unique constraint violations
        console.error(`Error creating health_check table: ${createError.message}`);
        process.exit(1);
      }
    }
    
    console.log(`SupaBase Connected: ${config.SUPABASE_URL}`);
    return supabase;
  } catch (error) {
    console.error(`Error connecting to SupaBase: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
