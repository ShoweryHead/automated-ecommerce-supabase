const supabase = require('../config/supabase');

class Inquiry {
  // Create a new inquiry
  static async create(inquiryData) {
    try {
      // Set timestamps
      const now = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        company: inquiryData.company,
        message: inquiryData.message,
        products: inquiryData.products || [], // JSONB array of product IDs
        product_details: inquiryData.productDetails || [], // JSONB array
        status: inquiryData.status || 'new',
        source: inquiryData.source || 'website',
        followup_status: inquiryData.followupStatus || 'pending',
        last_followup_date: inquiryData.lastFollowupDate,
        next_followup_date: inquiryData.nextFollowupDate,
        notes: inquiryData.notes,
        created_at: now,
        updated_at: now
      };
      
      // Insert into SupaBase
      const { data, error } = await supabase
        .from('inquiries')
        .insert([formattedData])
        .select();
      
      if (error) throw new Error(error.message);
      
      return this.formatInquiryResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Find inquiry by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      // Get product details if needed
      if (data.products && data.products.length > 0) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id, title, slug, images')
          .in('id', data.products);
        
        if (!productError) {
          data.productDetails = productData;
        }
      }
      
      return this.formatInquiryResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find all inquiries with optional filtering
  static async find(filter = {}, options = {}) {
    try {
      let query = supabase
        .from('inquiries')
        .select('*');
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.followupStatus) {
        query = query.eq('followup_status', filter.followupStatus);
      }
      
      if (filter.email) {
        query = query.eq('email', filter.email);
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
      
      // Get product details if needed
      if (data.length > 0) {
        // Collect all product IDs
        const productIds = [];
        data.forEach(inquiry => {
          if (inquiry.products && inquiry.products.length > 0) {
            productIds.push(...inquiry.products);
          }
        });
        
        if (productIds.length > 0) {
          const uniqueProductIds = [...new Set(productIds)];
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, title, slug, images')
            .in('id', uniqueProductIds);
          
          if (!productError) {
            // Add product details to each inquiry
            data.forEach(inquiry => {
              if (inquiry.products && inquiry.products.length > 0) {
                inquiry.productDetails = productData.filter(product => 
                  inquiry.products.includes(product.id)
                );
              }
            });
          }
        }
      }
      
      return data.map(inquiry => this.formatInquiryResponse(inquiry));
    } catch (error) {
      throw error;
    }
  }
  
  // Update inquiry
  static async update(id, updateData) {
    try {
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {};
      
      if (updateData.name) formattedData.name = updateData.name;
      if (updateData.email) formattedData.email = updateData.email;
      if (updateData.phone) formattedData.phone = updateData.phone;
      if (updateData.company) formattedData.company = updateData.company;
      if (updateData.message) formattedData.message = updateData.message;
      if (updateData.products) formattedData.products = updateData.products;
      if (updateData.productDetails) formattedData.product_details = updateData.productDetails;
      if (updateData.status) formattedData.status = updateData.status;
      if (updateData.source) formattedData.source = updateData.source;
      if (updateData.followupStatus) formattedData.followup_status = updateData.followupStatus;
      if (updateData.lastFollowupDate) formattedData.last_followup_date = updateData.lastFollowupDate;
      if (updateData.nextFollowupDate) formattedData.next_followup_date = updateData.nextFollowupDate;
      if (updateData.notes) formattedData.notes = updateData.notes;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('inquiries')
        .update(formattedData)
        .eq('id', id)
        .select();
      
      if (error) throw new Error(error.message);
      
      return this.formatInquiryResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Delete inquiry
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Count inquiries with optional filtering
  static async count(filter = {}) {
    try {
      let query = supabase
        .from('inquiries')
        .select('id', { count: 'exact' });
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.followupStatus) {
        query = query.eq('followup_status', filter.followupStatus);
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
  
  // Helper method to format inquiry response to match MongoDB format
  static formatInquiryResponse(inquiry) {
    if (!inquiry) return null;
    
    return {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      company: inquiry.company,
      message: inquiry.message,
      products: inquiry.products,
      productDetails: inquiry.product_details || inquiry.productDetails,
      status: inquiry.status,
      source: inquiry.source,
      followupStatus: inquiry.followup_status,
      lastFollowupDate: inquiry.last_followup_date,
      nextFollowupDate: inquiry.next_followup_date,
      notes: inquiry.notes,
      createdAt: inquiry.created_at,
      updatedAt: inquiry.updated_at
    };
  }
}

module.exports = Inquiry;
