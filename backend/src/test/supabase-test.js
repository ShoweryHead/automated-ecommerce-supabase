// Test script for SupaBase integration
const supabase = require('../config/supabase');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const ProductGenerationQueue = require('../models/ProductGenerationQueue');
const SEOOptimizationQueue = require('../models/SEOOptimizationQueue');
const ContentGenerationService = require('../services/ContentGenerationService');
const ImageGenerationService = require('../services/ImageGenerationService');
const MailchimpService = require('../services/MailchimpService');

// Test SupaBase connection
async function testSupaBaseConnection() {
  try {
    console.log('Testing SupaBase connection...');
    
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('Error connecting to SupaBase:', error.message);
      
      // Try to create health_check table
      console.log('Attempting to create health_check table...');
      const { error: createError } = await supabase
        .from('health_check')
        .insert([{ status: 'ok', timestamp: new Date().toISOString() }]);
      
      if (createError) {
        console.error('Error creating health_check table:', createError.message);
        return false;
      }
      
      console.log('Successfully created health_check table');
    } else {
      console.log('Successfully connected to SupaBase');
    }
    
    return true;
  } catch (error) {
    console.error('Error testing SupaBase connection:', error.message);
    return false;
  }
}

// Test User model
async function testUserModel() {
  try {
    console.log('\nTesting User model...');
    
    // Create test user
    const testUser = {
      name: 'Test User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    };
    
    console.log('Creating test user...');
    const createdUser = await User.create(testUser);
    console.log('Created user:', createdUser.id);
    
    // Find user by ID
    console.log('Finding user by ID...');
    const foundUser = await User.findById(createdUser.id);
    console.log('Found user:', foundUser.id);
    
    // Update user
    console.log('Updating user...');
    const updatedUser = await User.update(createdUser.id, { name: 'Updated Test User' });
    console.log('Updated user:', updatedUser.name);
    
    // Delete user
    console.log('Deleting user...');
    await User.delete(createdUser.id);
    console.log('User deleted');
    
    return true;
  } catch (error) {
    console.error('Error testing User model:', error.message);
    return false;
  }
}

// Test Category and Product models
async function testCategoryAndProductModels() {
  try {
    console.log('\nTesting Category and Product models...');
    
    // Create test category
    const testCategory = {
      name: 'Test Category',
      description: 'Test category description'
    };
    
    console.log('Creating test category...');
    const createdCategory = await Category.create(testCategory);
    console.log('Created category:', createdCategory.id);
    
    // Create test product
    const testProduct = {
      title: 'Test Product',
      description: 'Test product description',
      shortDescription: 'Short description',
      features: [{ title: 'Features', items: ['Feature 1', 'Feature 2'] }],
      specifications: { spec1: 'value1', spec2: 'value2' },
      applications: ['Application 1', 'Application 2'],
      faqs: [{ question: 'Test question?', answer: 'Test answer' }],
      category: createdCategory.id,
      images: [{ url: 'https://example.com/image.jpg', alt: 'Test image', isMain: true }],
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test meta description',
      keywords: ['test', 'product'],
      status: 'draft'
    };
    
    console.log('Creating test product...');
    const createdProduct = await Product.create(testProduct);
    console.log('Created product:', createdProduct.id);
    
    // Find product by ID
    console.log('Finding product by ID...');
    const foundProduct = await Product.findById(createdProduct.id);
    console.log('Found product:', foundProduct.id);
    
    // Update product
    console.log('Updating product...');
    const updatedProduct = await Product.update(createdProduct.id, { title: 'Updated Test Product' });
    console.log('Updated product:', updatedProduct.title);
    
    // Delete product
    console.log('Deleting product...');
    await Product.delete(createdProduct.id);
    console.log('Product deleted');
    
    // Delete category
    console.log('Deleting category...');
    await Category.delete(createdCategory.id);
    console.log('Category deleted');
    
    return true;
  } catch (error) {
    console.error('Error testing Category and Product models:', error.message);
    return false;
  }
}

// Test Inquiry model
async function testInquiryModel() {
  try {
    console.log('\nTesting Inquiry model...');
    
    // Create test inquiry
    const testInquiry = {
      name: 'Test Customer',
      email: 'test.customer@example.com',
      phone: '123-456-7890',
      company: 'Test Company',
      message: 'I am interested in your products',
      products: [],
      status: 'new'
    };
    
    console.log('Creating test inquiry...');
    const createdInquiry = await Inquiry.create(testInquiry);
    console.log('Created inquiry:', createdInquiry.id);
    
    // Find inquiry by ID
    console.log('Finding inquiry by ID...');
    const foundInquiry = await Inquiry.findById(createdInquiry.id);
    console.log('Found inquiry:', foundInquiry.id);
    
    // Update inquiry
    console.log('Updating inquiry...');
    const updatedInquiry = await Inquiry.update(createdInquiry.id, { status: 'in-progress' });
    console.log('Updated inquiry:', updatedInquiry.status);
    
    // Delete inquiry
    console.log('Deleting inquiry...');
    await Inquiry.delete(createdInquiry.id);
    console.log('Inquiry deleted');
    
    return true;
  } catch (error) {
    console.error('Error testing Inquiry model:', error.message);
    return false;
  }
}

// Test Email models
async function testEmailModels() {
  try {
    console.log('\nTesting Email models...');
    
    // Create test email template
    const testTemplate = {
      name: 'Test Template',
      description: 'Test template description',
      type: 'welcome',
      subject: 'Welcome to our platform',
      htmlContent: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
      textContent: 'Welcome! Thank you for joining us.',
      isDefault: true
    };
    
    console.log('Creating test email template...');
    const createdTemplate = await EmailTemplate.create(testTemplate);
    console.log('Created template:', createdTemplate.id);
    
    // Create test email campaign
    const testCampaign = {
      name: 'Test Campaign',
      description: 'Test campaign description',
      type: 'welcome',
      template: createdTemplate.id,
      status: 'draft'
    };
    
    console.log('Creating test email campaign...');
    const createdCampaign = await EmailCampaign.create(testCampaign);
    console.log('Created campaign:', createdCampaign.id);
    
    // Delete campaign
    console.log('Deleting campaign...');
    await EmailCampaign.delete(createdCampaign.id);
    console.log('Campaign deleted');
    
    // Delete template
    console.log('Deleting template...');
    await EmailTemplate.delete(createdTemplate.id);
    console.log('Template deleted');
    
    return true;
  } catch (error) {
    console.error('Error testing Email models:', error.message);
    return false;
  }
}

// Test Queue models
async function testQueueModels() {
  try {
    console.log('\nTesting Queue models...');
    
    // Create test category for product generation
    const testCategory = {
      name: 'Test Queue Category',
      description: 'Test category for queue testing'
    };
    
    console.log('Creating test category...');
    const createdCategory = await Category.create(testCategory);
    console.log('Created category:', createdCategory.id);
    
    // Create test product generation queue item
    const testProductQueue = {
      keywords: ['test', 'product', 'generation'],
      category: createdCategory.id,
      priority: 1,
      status: 'queued'
    };
    
    console.log('Creating test product generation queue item...');
    const createdProductQueue = await ProductGenerationQueue.create(testProductQueue);
    console.log('Created product queue item:', createdProductQueue.id);
    
    // Create test product for SEO optimization
    const testProduct = {
      title: 'Test SEO Product',
      description: 'Test product for SEO optimization',
      shortDescription: 'Short description',
      category: createdCategory.id,
      status: 'draft'
    };
    
    console.log('Creating test product...');
    const createdProduct = await Product.create(testProduct);
    console.log('Created product:', createdProduct.id);
    
    // Create test SEO optimization queue item
    const testSEOQueue = {
      product: createdProduct.id,
      optimizationType: 'full',
      priority: 1,
      status: 'queued'
    };
    
    console.log('Creating test SEO optimization queue item...');
    const createdSEOQueue = await SEOOptimizationQueue.create(testSEOQueue);
    console.log('Created SEO queue item:', createdSEOQueue.id);
    
    // Delete queue items
    console.log('Deleting queue items...');
    await ProductGenerationQueue.delete(createdProductQueue.id);
    await SEOOptimizationQueue.delete(createdSEOQueue.id);
    console.log('Queue items deleted');
    
    // Delete product and category
    console.log('Deleting product and category...');
    await Product.delete(createdProduct.id);
    await Category.delete(createdCategory.id);
    console.log('Product and category deleted');
    
    return true;
  } catch (error) {
    console.error('Error testing Queue models:', error.message);
    return false;
  }
}

// Test API integrations
async function testAPIIntegrations() {
  try {
    console.log('\nTesting API integrations...');
    
    // Test OpenAI integration
    console.log('Testing OpenAI integration...');
    const productContent = await ContentGenerationService.generateProductContent(
      ['coating', 'machine', 'industrial'],
      'Machinery'
    );
    console.log('Generated product content title:', productContent.title);
    
    // Test Unsplash integration
    console.log('Testing Unsplash integration...');
    const productImages = await ImageGenerationService.generateProductImages(
      { title: 'Industrial Coating Machine', description: 'High-quality coating machine for industrial applications' },
      2
    );
    console.log('Generated product images count:', productImages.length);
    
    // Test Mailchimp integration
    console.log('Testing Mailchimp integration...');
    const mailchimpConnection = await MailchimpService.testConnection();
    console.log('Mailchimp connection result:', mailchimpConnection.success);
    
    return true;
  } catch (error) {
    console.error('Error testing API integrations:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== STARTING TESTS ===');
  
  // Test SupaBase connection
  const connectionResult = await testSupaBaseConnection();
  if (!connectionResult) {
    console.error('SupaBase connection test failed. Aborting further tests.');
    return;
  }
  
  // Run model tests
  await testUserModel();
  await testCategoryAndProductModels();
  await testInquiryModel();
  await testEmailModels();
  await testQueueModels();
  
  // Run API integration tests
  await testAPIIntegrations();
  
  console.log('\n=== TESTS COMPLETED ===');
}

// Run tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
});
