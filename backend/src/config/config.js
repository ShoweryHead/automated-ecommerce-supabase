require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // SupaBase Configuration (replacing MongoDB)
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://ckgtzotipvjloxgpnyks.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'secret123456789',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // External API Keys
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX || 'us11',
  MAILCHIMP_LIST_ID: process.env.MAILCHIMP_LIST_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY,
  SEMRUSH_API_KEY: process.env.SEMRUSH_API_KEY,
  
  // Application URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};
