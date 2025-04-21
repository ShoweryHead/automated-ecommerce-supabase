// Create SQL scripts for SupaBase tables
// This script will create the necessary tables in SupaBase

// Users table
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  password TEXT NOT NULL,
  reset_password_token TEXT,
  reset_password_expire TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Categories table
const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image JSONB,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Products table
const createProductsTable = `
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  features JSONB,
  specifications JSONB,
  applications JSONB,
  faqs JSONB,
  category_id UUID NOT NULL REFERENCES categories(id),
  images JSONB,
  meta_title TEXT,
  meta_description TEXT,
  keywords JSONB,
  schema_markup TEXT,
  is_automated BOOLEAN DEFAULT TRUE,
  source_keywords JSONB,
  generation_status TEXT DEFAULT 'pending',
  generation_errors JSONB,
  status TEXT DEFAULT 'draft',
  scheduled_publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  seo_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Inquiries table
const createInquiriesTable = `
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  products JSONB,
  product_details JSONB,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'website',
  followup_status TEXT DEFAULT 'pending',
  last_followup_date TIMESTAMP WITH TIME ZONE,
  next_followup_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Email Templates table
const createEmailTemplatesTable = `
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  preview_image TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  mailchimp_template_id TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Email Campaigns table
const createEmailCampaignsTable = `
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  template_id UUID NOT NULL REFERENCES email_templates(id),
  segment JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  recurring JSONB,
  status TEXT DEFAULT 'draft',
  mailchimp_campaign_id TEXT,
  stats JSONB,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Email Subscribers table
const createEmailSubscribersTable = `
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  status TEXT DEFAULT 'subscribed',
  customer_status TEXT,
  interests JSONB,
  region TEXT,
  engagement_level TEXT,
  source TEXT,
  mailchimp_id TEXT,
  mailchimp_list_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Product Generation Queue table
const createProductGenerationQueueTable = `
CREATE TABLE IF NOT EXISTS product_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords JSONB NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  priority INTEGER DEFAULT 1,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'queued',
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// SEO Optimization Queue table
const createSEOOptimizationQueueTable = `
CREATE TABLE IF NOT EXISTS seo_optimization_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  optimization_type TEXT DEFAULT 'full',
  priority INTEGER DEFAULT 1,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'queued',
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Health Check table
const createHealthCheckTable = `
CREATE TABLE IF NOT EXISTS health_check (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

// Combine all table creation scripts
const createAllTables = `
${createUsersTable}
${createCategoriesTable}
${createProductsTable}
${createInquiriesTable}
${createEmailTemplatesTable}
${createEmailCampaignsTable}
${createEmailSubscribersTable}
${createProductGenerationQueueTable}
${createSEOOptimizationQueueTable}
${createHealthCheckTable}
`;

// Export the SQL scripts
module.exports = {
  createUsersTable,
  createCategoriesTable,
  createProductsTable,
  createInquiriesTable,
  createEmailTemplatesTable,
  createEmailCampaignsTable,
  createEmailSubscribersTable,
  createProductGenerationQueueTable,
  createSEOOptimizationQueueTable,
  createHealthCheckTable,
  createAllTables
};
