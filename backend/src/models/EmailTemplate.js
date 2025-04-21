const supabase = require('../config/supabase');

class EmailTemplate {
  // Create a new email template
  static async create(templateData) {
    try {
      // Set timestamps
      const now = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        name: templateData.name,
        description: templateData.description,
        type: templateData.type,
        subject: templateData.subject,
        html_content: templateData.htmlContent,
        text_content: templateData.textContent,
        preview_image: templateData.previewImage,
        is_default: templateData.isDefault || false,
        mailchimp_template_id: templateData.mailchimpTemplateId,
        created_by: templateData.createdBy,
        created_at: now,
        updated_at: now
      };
      
      // If this is set as default, unset any existing default for this type
      if (formattedData.is_default) {
        await supabase
          .from('email_templates')
          .update({ is_default: false })
          .eq('type', formattedData.type)
          .eq('is_default', true);
      }
      
      // Insert into SupaBase
      const { data, error } = await supabase
        .from('email_templates')
        .insert([formattedData])
        .select();
      
      if (error) throw new Error(error.message);
      
      return this.formatTemplateResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Find template by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return this.formatTemplateResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find template by type and default status
  static async findByType(type, isDefault = true) {
    try {
      let query = supabase
        .from('email_templates')
        .select('*')
        .eq('type', type);
      
      if (isDefault) {
        query = query.eq('is_default', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
      
      if (error) throw new Error(error.message);
      
      return data.length > 0 ? this.formatTemplateResponse(data[0]) : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find all templates with optional filtering
  static async find(filter = {}) {
    try {
      let query = supabase
        .from('email_templates')
        .select('*');
      
      // Apply filters
      if (filter.type) {
        query = query.eq('type', filter.type);
      }
      
      if (filter.isDefault !== undefined) {
        query = query.eq('is_default', filter.isDefault);
      }
      
      // Get templates
      const { data, error } = await query.order('type').order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      return data.map(template => this.formatTemplateResponse(template));
    } catch (error) {
      throw error;
    }
  }
  
  // Update template
  static async update(id, updateData) {
    try {
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {};
      
      if (updateData.name) formattedData.name = updateData.name;
      if (updateData.description) formattedData.description = updateData.description;
      if (updateData.subject) formattedData.subject = updateData.subject;
      if (updateData.htmlContent) formattedData.html_content = updateData.htmlContent;
      if (updateData.textContent) formattedData.text_content = updateData.textContent;
      if (updateData.previewImage) formattedData.preview_image = updateData.previewImage;
      if (updateData.isDefault !== undefined) formattedData.is_default = updateData.isDefault;
      if (updateData.mailchimpTemplateId) formattedData.mailchimp_template_id = updateData.mailchimpTemplateId;
      if (updateData.updatedBy) formattedData.updated_by = updateData.updatedBy;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Get the current template to check if we need to update default status
      const { data: currentTemplate, error: fetchError } = await supabase
        .from('email_templates')
        .select('type, is_default')
        .eq('id', id)
        .single();
      
      if (fetchError) throw new Error(fetchError.message);
      
      // If this is being set as default, unset any existing default for this type
      if (formattedData.is_default && !currentTemplate.is_default) {
        await supabase
          .from('email_templates')
          .update({ is_default: false })
          .eq('type', currentTemplate.type)
          .eq('is_default', true);
      }
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('email_templates')
        .update(formattedData)
        .eq('id', id)
        .select();
      
      if (error) throw new Error(error.message);
      
      return this.formatTemplateResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Delete template
  static async delete(id) {
    try {
      // Check if template is in use by any campaigns
      const { count, error: countError } = await supabase
        .from('email_campaigns')
        .select('id', { count: 'exact' })
        .eq('template_id', id);
      
      if (countError) throw new Error(countError.message);
      
      if (count > 0) {
        throw new Error('Cannot delete template that is in use by campaigns');
      }
      
      // Delete template
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Helper method to format template response to match MongoDB format
  static formatTemplateResponse(template) {
    if (!template) return null;
    
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      subject: template.subject,
      htmlContent: template.html_content,
      textContent: template.text_content,
      previewImage: template.preview_image,
      isDefault: template.is_default,
      mailchimpTemplateId: template.mailchimp_template_id,
      createdBy: template.created_by,
      updatedBy: template.updated_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    };
  }
}

module.exports = EmailTemplate;
