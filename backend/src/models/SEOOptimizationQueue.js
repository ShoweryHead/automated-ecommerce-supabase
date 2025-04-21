const supabase = require('../config/supabase');

class SEOOptimizationQueue {
  // Create a new queue item
  static async create(queueData) {
    try {
      // Set timestamps
      const now = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        product_id: queueData.product,
        optimization_type: queueData.optimizationType || 'full',
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
        .from('seo_optimization_queue')
        .insert([formattedData])
        .select(`
          *,
          product:product_id (
            id,
            title,
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
        .from('seo_optimization_queue')
        .select(`
          *,
          product:product_id (
            id,
            title,
            slug
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return this.formatQueueItemResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find all queue items with optional filtering
  static async find(filter = {}) {
    try {
      let query = supabase
        .from('seo_optimization_queue')
        .select(`
          *,
          product:product_id (
            id,
            title,
            slug
          )
        `);
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.product) {
        query = query.eq('product_id', filter.product);
      }
      
      if (filter.optimizationType) {
        query = query.eq('optimization_type', filter.optimizationType);
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
        .from('seo_optimization_queue')
        .select(`
          *,
          product:product_id (
            id,
            title,
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
      
      if (updateData.product) formattedData.product_id = updateData.product;
      if (updateData.optimizationType) formattedData.optimization_type = updateData.optimizationType;
      if (updateData.priority) formattedData.priority = updateData.priority;
      if (updateData.scheduledFor) formattedData.scheduled_for = updateData.scheduledFor;
      if (updateData.status) formattedData.status = updateData.status;
      if (updateData.processingStartedAt) formattedData.processing_started_at = updateData.processingStartedAt;
      if (updateData.completedAt) formattedData.completed_at = updateData.completedAt;
      if (updateData.result) formattedData.result = updateData.result;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('seo_optimization_queue')
        .update(formattedData)
        .eq('id', id)
        .select(`
          *,
          product:product_id (
            id,
            title,
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
        .from('seo_optimization_queue')
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
      product: item.product,
      optimizationType: item.optimization_type,
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

module.exports = SEOOptimizationQueue;
