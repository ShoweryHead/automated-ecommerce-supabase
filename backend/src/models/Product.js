const supabase = require('../config/supabase');

class Product {
  // Create a new product
  static async create(productData) {
    try {
      // Handle slug creation if not provided
      if (!productData.slug && productData.title) {
        productData.slug = productData.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Set timestamps
      const now = new Date().toISOString();
      productData.created_at = now;
      productData.updated_at = now;
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        title: productData.title,
        slug: productData.slug,
        description: productData.description,
        short_description: productData.shortDescription,
        features: productData.features, // JSONB array
        specifications: productData.specifications, // JSONB
        applications: productData.applications, // JSONB array
        faqs: productData.faqs, // JSONB array
        category_id: productData.category,
        images: productData.images, // JSONB array
        meta_title: productData.metaTitle,
        meta_description: productData.metaDescription,
        keywords: productData.keywords, // JSONB array
        schema_markup: productData.schemaMarkup,
        is_automated: productData.isAutomated || true,
        source_keywords: productData.sourceKeywords, // JSONB array
        generation_status: productData.generationStatus || 'pending',
        generation_errors: productData.generationErrors, // JSONB array
        status: productData.status || 'draft',
        scheduled_publish_date: productData.scheduledPublishDate,
        created_at: productData.created_at,
        updated_at: productData.updated_at,
        published_at: productData.publishedAt,
        seo_last_updated: productData.seoLastUpdated || now
      };
      
      // Insert into SupaBase
      const { data, error } = await supabase
        .from('products')
        .insert([formattedData])
        .select();
      
      if (error) throw new Error(error.message);
      
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Find product by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      // Convert to MongoDB-style format for compatibility
      return this.formatProductResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find product by slug
  static async findBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw new Error(error.message);
      
      // Convert to MongoDB-style format for compatibility
      return this.formatProductResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find all products with optional filtering
  static async find(filter = {}, options = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `);
      
      // Apply filters
      if (filter.category) {
        query = query.eq('category_id', filter.category);
      }
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.isAutomated !== undefined) {
        query = query.eq('is_automated', filter.isAutomated);
      }
      
      // Apply sorting
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        const sortField = this.convertToSnakeCase(field);
        query = query.order(sortField, { ascending: direction !== 'desc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Convert to MongoDB-style format for compatibility
      return data.map(product => this.formatProductResponse(product));
    } catch (error) {
      throw error;
    }
  }
  
  // Update product
  static async update(id, updateData) {
    try {
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {};
      
      if (updateData.title) formattedData.title = updateData.title;
      if (updateData.slug) formattedData.slug = updateData.slug;
      if (updateData.description) formattedData.description = updateData.description;
      if (updateData.shortDescription) formattedData.short_description = updateData.shortDescription;
      if (updateData.features) formattedData.features = updateData.features;
      if (updateData.specifications) formattedData.specifications = updateData.specifications;
      if (updateData.applications) formattedData.applications = updateData.applications;
      if (updateData.faqs) formattedData.faqs = updateData.faqs;
      if (updateData.category) formattedData.category_id = updateData.category;
      if (updateData.images) formattedData.images = updateData.images;
      if (updateData.metaTitle) formattedData.meta_title = updateData.metaTitle;
      if (updateData.metaDescription) formattedData.meta_description = updateData.metaDescription;
      if (updateData.keywords) formattedData.keywords = updateData.keywords;
      if (updateData.schemaMarkup) formattedData.schema_markup = updateData.schemaMarkup;
      if (updateData.isAutomated !== undefined) formattedData.is_automated = updateData.isAutomated;
      if (updateData.sourceKeywords) formattedData.source_keywords = updateData.sourceKeywords;
      if (updateData.generationStatus) formattedData.generation_status = updateData.generationStatus;
      if (updateData.generationErrors) formattedData.generation_errors = updateData.generationErrors;
      if (updateData.status) formattedData.status = updateData.status;
      if (updateData.scheduledPublishDate) formattedData.scheduled_publish_date = updateData.scheduledPublishDate;
      if (updateData.publishedAt) formattedData.published_at = updateData.publishedAt;
      if (updateData.seoLastUpdated) formattedData.seo_last_updated = updateData.seoLastUpdated;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('products')
        .update(formattedData)
        .eq('id', id)
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `);
      
      if (error) throw new Error(error.message);
      
      // Convert to MongoDB-style format for compatibility
      return this.formatProductResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Delete product
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Count products with optional filtering
  static async count(filter = {}) {
    try {
      let query = supabase
        .from('products')
        .select('id', { count: 'exact' });
      
      // Apply filters
      if (filter.category) {
        query = query.eq('category_id', filter.category);
      }
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.isAutomated !== undefined) {
        query = query.eq('is_automated', filter.isAutomated);
      }
      
      const { count, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return count;
    } catch (error) {
      throw error;
    }
  }
  
  // Helper method to convert camelCase to snake_case
  static convertToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
  
  // Helper method to format product response to match MongoDB format
  static formatProductResponse(product) {
    if (!product) return null;
    
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      shortDescription: product.short_description,
      features: product.features,
      specifications: product.specifications,
      applications: product.applications,
      faqs: product.faqs,
      category: product.category,
      images: product.images,
      metaTitle: product.meta_title,
      metaDescription: product.meta_description,
      keywords: product.keywords,
      schemaMarkup: product.schema_markup,
      isAutomated: product.is_automated,
      sourceKeywords: product.source_keywords,
      generationStatus: product.generation_status,
      generationErrors: product.generation_errors,
      status: product.status,
      scheduledPublishDate: product.scheduled_publish_date,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      publishedAt: product.published_at,
      seoLastUpdated: product.seo_last_updated
    };
  }
}

module.exports = Product;
