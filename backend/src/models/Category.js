const supabase = require('../config/supabase');

class Category {
  // Create a new category
  static async create(categoryData) {
    try {
      // Handle slug creation if not provided
      if (!categoryData.slug && categoryData.name) {
        categoryData.slug = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Set timestamps
      const now = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        parent_id: categoryData.parent || null,
        image: categoryData.image,
        meta_title: categoryData.metaTitle,
        meta_description: categoryData.metaDescription,
        created_at: now,
        updated_at: now
      };
      
      // Insert into SupaBase
      const { data, error } = await supabase
        .from('categories')
        .insert([formattedData])
        .select();
      
      if (error) throw new Error(error.message);
      
      return this.formatCategoryResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Find category by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          parent:parent_id (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return this.formatCategoryResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find category by slug
  static async findBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          parent:parent_id (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw new Error(error.message);
      
      return this.formatCategoryResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find all categories with optional filtering
  static async find(filter = {}) {
    try {
      let query = supabase
        .from('categories')
        .select(`
          *,
          parent:parent_id (
            id,
            name,
            slug
          )
        `);
      
      // Apply filters
      if (filter.parent) {
        query = query.eq('parent_id', filter.parent);
      }
      
      // Get categories
      const { data, error } = await query.order('name');
      
      if (error) throw new Error(error.message);
      
      return data.map(category => this.formatCategoryResponse(category));
    } catch (error) {
      throw error;
    }
  }
  
  // Update category
  static async update(id, updateData) {
    try {
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {};
      
      if (updateData.name) formattedData.name = updateData.name;
      if (updateData.slug) formattedData.slug = updateData.slug;
      if (updateData.description) formattedData.description = updateData.description;
      if (updateData.parent) formattedData.parent_id = updateData.parent;
      if (updateData.image) formattedData.image = updateData.image;
      if (updateData.metaTitle) formattedData.meta_title = updateData.metaTitle;
      if (updateData.metaDescription) formattedData.meta_description = updateData.metaDescription;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('categories')
        .update(formattedData)
        .eq('id', id)
        .select(`
          *,
          parent:parent_id (
            id,
            name,
            slug
          )
        `);
      
      if (error) throw new Error(error.message);
      
      return this.formatCategoryResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Delete category
  static async delete(id) {
    try {
      // Check if category has products
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('category_id', id);
      
      if (countError) throw new Error(countError.message);
      
      if (count > 0) {
        throw new Error('Cannot delete category with associated products');
      }
      
      // Check if category has child categories
      const { count: childCount, error: childCountError } = await supabase
        .from('categories')
        .select('id', { count: 'exact' })
        .eq('parent_id', id);
      
      if (childCountError) throw new Error(childCountError.message);
      
      if (childCount > 0) {
        throw new Error('Cannot delete category with child categories');
      }
      
      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Helper method to format category response to match MongoDB format
  static formatCategoryResponse(category) {
    if (!category) return null;
    
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent: category.parent,
      image: category.image,
      metaTitle: category.meta_title,
      metaDescription: category.meta_description,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };
  }
}

module.exports = Category;
