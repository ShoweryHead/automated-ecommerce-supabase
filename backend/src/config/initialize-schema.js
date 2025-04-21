// Script to initialize SupaBase schema
const supabase = require('./supabase');
const schema = require('./supabase-schema');

async function initializeSchema() {
  try {
    console.log('Initializing SupaBase schema...');
    
    // Execute SQL to create tables
    const { error } = await supabase.rpc('exec_sql', { sql: schema.createAllTables });
    
    if (error) {
      console.error('Error creating tables:', error.message);
      
      // Try creating tables one by one
      console.log('Attempting to create tables individually...');
      
      // Create users table
      await createTable('users', schema.createUsersTable);
      
      // Create categories table
      await createTable('categories', schema.createCategoriesTable);
      
      // Create products table
      await createTable('products', schema.createProductsTable);
      
      // Create inquiries table
      await createTable('inquiries', schema.createInquiriesTable);
      
      // Create email_templates table
      await createTable('email_templates', schema.createEmailTemplatesTable);
      
      // Create email_campaigns table
      await createTable('email_campaigns', schema.createEmailCampaignsTable);
      
      // Create email_subscribers table
      await createTable('email_subscribers', schema.createEmailSubscribersTable);
      
      // Create product_generation_queue table
      await createTable('product_generation_queue', schema.createProductGenerationQueueTable);
      
      // Create seo_optimization_queue table
      await createTable('seo_optimization_queue', schema.createSEOOptimizationQueueTable);
      
      // Create health_check table
      await createTable('health_check', schema.createHealthCheckTable);
    } else {
      console.log('All tables created successfully');
    }
    
    // Insert health check record
    const { error: insertError } = await supabase
      .from('health_check')
      .insert([{ status: 'ok', timestamp: new Date().toISOString() }]);
    
    if (insertError) {
      console.error('Error inserting health check record:', insertError.message);
    } else {
      console.log('Health check record inserted successfully');
    }
    
    console.log('SupaBase schema initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing SupaBase schema:', error.message);
    return false;
  }
}

async function createTable(tableName, sql) {
  try {
    console.log(`Creating ${tableName} table...`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error creating ${tableName} table:`, error.message);
      return false;
    }
    
    console.log(`${tableName} table created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating ${tableName} table:`, error.message);
    return false;
  }
}

module.exports = initializeSchema;
