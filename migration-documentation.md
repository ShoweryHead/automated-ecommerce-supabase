# MongoDB to SupaBase Migration Documentation

## Overview

This document provides a comprehensive overview of the migration from MongoDB to SupaBase in the automated e-commerce platform. The migration includes replacing MongoDB with SupaBase for data storage and integrating the required APIs (OpenAI, Unsplash, and Mailchimp) to ensure full functionality.

## Table of Contents

1. [Migration Summary](#migration-summary)
2. [SupaBase Integration](#supabase-integration)
3. [API Integrations](#api-integrations)
4. [Database Schema](#database-schema)
5. [Model Changes](#model-changes)
6. [Testing](#testing)
7. [Deployment Instructions](#deployment-instructions)
8. [Known Issues and Limitations](#known-issues-and-limitations)

## Migration Summary

The migration involved the following key steps:

1. **Analysis of MongoDB Integration Points**: Identified all MongoDB models and database interactions in the codebase.
2. **SupaBase Configuration**: Set up SupaBase connection and configuration files.
3. **Schema Migration**: Created SQL schema for SupaBase tables based on MongoDB models.
4. **Model Migration**: Converted MongoDB/Mongoose models to SupaBase-compatible models.
5. **API Integration**: Updated API integrations (OpenAI, Unsplash, Mailchimp) to work with SupaBase.
6. **Testing**: Created test scripts to verify functionality.

## SupaBase Integration

### Configuration

The SupaBase integration is configured in the following files:

- `/backend/src/config/config.js`: Contains SupaBase URL and API key.
- `/backend/src/config/supabase.js`: Initializes the SupaBase client.
- `/backend/src/db.js`: Replaces MongoDB connection with SupaBase connection.
- `/backend/src/config/supabase-schema.js`: Contains SQL schema for SupaBase tables.
- `/backend/src/config/initialize-schema.js`: Script to initialize SupaBase schema.

### Connection Details

```javascript
// SupaBase connection details
const supabaseUrl = 'https://ckgtzotipvjloxgpnyks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZ3R6b3RpcHZqbG94Z3BueWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjAwNjEsImV4cCI6MjA2MDYzNjA2MX0.qWPLMRJ2nqY1nVgfq3WxaHRyThrAn-UPy9xEDWQVD3I';
```

## API Integrations

### OpenAI Integration

The OpenAI API is integrated in the `ContentGenerationService.js` file. It uses the OpenAI API to generate product content and blog posts.

```javascript
// OpenAI API key
openai_Api_Key = your_api_key_here
```

### Unsplash Integration

The Unsplash API is integrated in the `ImageGenerationService.js` file. It uses the Unsplash API to search for and retrieve images based on product keywords.

```javascript
// Unsplash API key
const unsplashApiKey = 'gFUGSJTR-6-lBOuNJutxyq8iGSo9rn6GfY0__i9bALY';
```

### Mailchimp Integration

The Mailchimp API is integrated in the `MailchimpService.js` file. It uses the Mailchimp API to manage email campaigns, subscribers, and templates.

```javascript
// Mailchimp API key
const mailchimpApiKey = '2566b38e6a913087a34be39acb63f444-us11';
const mailchimpServerPrefix = 'us11';
```

## Database Schema

The SupaBase database schema includes the following tables:

1. **users**: User accounts for admin access.
2. **categories**: Product categorization.
3. **products**: Product information, specifications, and metadata.
4. **inquiries**: Customer inquiries and associated products.
5. **email_templates**: Reusable email templates.
6. **email_campaigns**: Email campaign configuration and tracking.
7. **email_subscribers**: Email subscriber information.
8. **product_generation_queue**: Queue for automated product creation.
9. **seo_optimization_queue**: Queue for SEO optimization tasks.
10. **health_check**: System health monitoring.

Each table is designed to match the structure of the corresponding MongoDB collection, with appropriate adjustments for PostgreSQL's relational model.

## Model Changes

### MongoDB to SupaBase Model Mapping

| MongoDB Model | SupaBase Table | Key Changes |
|---------------|----------------|-------------|
| User | users | Converted to class-based model with static methods |
| Product | products | Converted embedded arrays to JSONB fields |
| Category | categories | Added explicit parent-child relationship |
| Inquiry | inquiries | Converted embedded arrays to JSONB fields |
| EmailTemplate | email_templates | Simplified with direct SupaBase queries |
| EmailCampaign | email_campaigns | Converted embedded objects to JSONB fields |
| ProductGenerationQueue | product_generation_queue | Converted result field to JSONB |
| SEOOptimizationQueue | seo_optimization_queue | Converted result field to JSONB |

### Model Implementation Approach

All models have been implemented using a class-based approach with static methods that interact with SupaBase. This approach maintains compatibility with the existing codebase while leveraging SupaBase's features.

Example model implementation:

```javascript
class User {
  // Create a new user
  static async create(userData) {
    // Implementation
  }
  
  // Find user by ID
  static async findById(id) {
    // Implementation
  }
  
  // Other methods...
}
```

## Testing

A comprehensive test script has been created to verify the functionality of the SupaBase integration and API integrations. The test script is located at `/backend/src/test/supabase-test.js`.

The test script includes tests for:

1. SupaBase connection
2. User model CRUD operations
3. Category and Product model CRUD operations
4. Inquiry model CRUD operations
5. Email models CRUD operations
6. Queue models CRUD operations
7. API integrations (OpenAI, Unsplash, Mailchimp)

To run the tests:

```bash
cd /backend
node src/test/supabase-test.js
```

## Deployment Instructions

### Prerequisites

1. Node.js 14.x or higher
2. npm 6.x or higher
3. SupaBase account with project created

### Installation Steps

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Set up environment variables:
   ```
   SUPABASE_URL=https://ckgtzotipvjloxgpnyks.supabase.co
   SUPABASE_KEY=your-supabase-key
   OPENAI_API_KEY=your-openai-key
   UNSPLASH_API_KEY=your-unsplash-key
   MAILCHIMP_API_KEY=your-mailchimp-key
   MAILCHIMP_SERVER_PREFIX=your-mailchimp-server-prefix
   ```
4. Initialize the SupaBase schema:
   ```bash
   node -e "require('./src/config/initialize-schema')()"
   ```
5. Start the server:
   ```bash
   npm start
   ```

### Deployment to Production

For production deployment, follow these additional steps:

1. Set up a production SupaBase project
2. Configure environment variables for production
3. Deploy the backend to your preferred hosting provider
4. Deploy the frontend to a static hosting service

## Known Issues and Limitations

1. **Schema Migration**: The schema migration script assumes admin privileges on the SupaBase database. If you encounter permission issues, you may need to manually create the tables using the SQL in `supabase-schema.js`.

2. **JSONB Fields**: PostgreSQL's JSONB fields are used for complex data structures that were embedded documents in MongoDB. This may impact query performance for complex filtering operations.

3. **Authentication**: The current implementation maintains the JWT-based authentication system. For a more integrated solution, consider migrating to SupaBase Auth in the future.

4. **Transactions**: The current implementation does not use PostgreSQL transactions. For operations that require atomicity, consider adding transaction support.

5. **Pagination**: The current implementation uses limit/offset pagination. For large datasets, consider implementing cursor-based pagination.

## Conclusion

The migration from MongoDB to SupaBase has been successfully completed. The application now uses SupaBase for data storage and has integrated the required APIs (OpenAI, Unsplash, and Mailchimp) to ensure full functionality.

The migration maintains compatibility with the existing codebase while leveraging SupaBase's features, providing a solid foundation for future development.
