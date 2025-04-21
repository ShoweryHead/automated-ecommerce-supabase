const supabase = require('../config/supabase');

class ProductGenerationQueue {
  // Create a new queue item
  static async create(queueData) {
    try {
      // Set timestamps
      const now = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        keywords: queueData.keywords, // JSONB array
        category_id: queueData.category,
        priority: queueData.priority || 1,
        scheduled_for: queueData.scheduledFor || now,
        status: queueData.status || 'queued',
        queued_at: now,
        processing_started_at: queueData.processingStartedAt,
        completed_at: queueData.completedAt,
        result: queueData.result || {}, // JSONB
        created_at: now,
        updated_at: now
      };
      
      // Insert into SupaBase
      const { data, error } = await supabase
        .from('product_generation_queue')
        .insert([formattedData])
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `);
      
      if (error) throw new Error(error.message);
      
      return this.formatQueueItemResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Find queue item by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('product_generation_queue')
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
      
      // If there's a product ID in the result, get the product details
      if (data.result && data.result.productId) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', data.result.productId)
          .single();
        
        if (!productError) {
          data.result.product = productData;
        }
      }
      
      return this.formatQueueItemResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find all queue items with optional filtering
  static async find(filter = {}) {
    try {
      let query = supabase
        .from('product_generation_queue')
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `);
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.category) {
        query = query.eq('category_id', filter.category);
      }
      
      // Get queue items
      const { data, error } = await query.order('status').order('priority', { ascending: false }).order('queued_at');
      
      if (error) throw new Error(error.message);
      
      return data.map(item => this.formatQueueItemResponse(item));
    } catch (error) {
      throw error;
    }
  }
  
  // Find the next queue item to process
  static async findNextToProcess() {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('product_generation_queue')
        .select(`
          *,
          category:category_id (
            id,
            name,
            slug
          )
        `)
        .eq('status', 'queued')
        .lte('scheduled_for', now)
        .order('priority', { ascending: false })
        .order('queued_at')
        .limit(1);
      
      if (error) throw new Error(error.message);
      
      return data.length > 0 ? this.formatQueueItemResponse(data[0]) : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Update queue item
  static async update(id, updateData) {
    try {
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {};
      
      if (updateData.keywords) formattedData.keywords = updateData.keywords;
      if (updateData.category) formattedData.category_id = updateData.category;
      if (updateData.priority) formattedData.priority = updateData.priority;
      if (updateData.scheduledFor) formattedData.scheduled_for = updateData.scheduledFor;
      if (updateData.status) formattedData.status = updateData.status;
      if (updateData.processingStartedAt) formattedData.processing_started_at = updateData.processingStartedAt;
      if (updateData.completedAt) formattedData.completed_at = updateData.completedAt;
      if (updateData.result) formattedData.result = updateData.result;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('product_generation_queue')
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
      
      return this.formatQueueItemResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Delete queue item
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('product_generation_queue')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Helper method to format queue item response to match MongoDB format
  static formatQueueItemResponse(item) {
    if (!item) return null;
    
    return {
      id: item.id,
      keywords: item.keywords,
      category: item.category,
      priority: item.priority,
      scheduledFor: item.scheduled_for,
      status: item.status,
      queuedAt: item.queued_at,
      processingStartedAt: item.processing_started_at,
      completedAt: item.completed_at,
      result: item.result,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  }
}

module.exports = ProductGenerationQueue;
