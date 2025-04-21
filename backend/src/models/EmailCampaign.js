const supabase = require('../config/supabase');

class EmailCampaign {
  // Create a new email campaign
  static async create(campaignData) {
    try {
      // Set timestamps
      const now = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {
        name: campaignData.name,
        description: campaignData.description,
        type: campaignData.type,
        template_id: campaignData.template,
        segment: campaignData.segment || {}, // JSONB
        scheduled_for: campaignData.scheduledFor,
        recurring: campaignData.recurring || { enabled: false }, // JSONB
        status: campaignData.status || 'draft',
        mailchimp_campaign_id: campaignData.mailchimpCampaignId,
        stats: campaignData.stats || {}, // JSONB
        created_by: campaignData.createdBy,
        created_at: now,
        updated_at: now
      };
      
      // Insert into SupaBase
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([formattedData])
        .select(`
          *,
          template:template_id (
            id,
            name,
            type
          )
        `);
      
      if (error) throw new Error(error.message);
      
      return this.formatCampaignResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Find campaign by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          template:template_id (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return this.formatCampaignResponse(data);
    } catch (error) {
      throw error;
    }
  }
  
  // Find all campaigns with optional filtering
  static async find(filter = {}) {
    try {
      let query = supabase
        .from('email_campaigns')
        .select(`
          *,
          template:template_id (
            id,
            name,
            type
          )
        `);
      
      // Apply filters
      if (filter.type) {
        query = query.eq('type', filter.type);
      }
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      // Get campaigns
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      return data.map(campaign => this.formatCampaignResponse(campaign));
    } catch (error) {
      throw error;
    }
  }
  
  // Update campaign
  static async update(id, updateData) {
    try {
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString();
      
      // Convert MongoDB-style fields to PostgreSQL style
      const formattedData = {};
      
      if (updateData.name) formattedData.name = updateData.name;
      if (updateData.description) formattedData.description = updateData.description;
      if (updateData.template) formattedData.template_id = updateData.template;
      if (updateData.segment) formattedData.segment = updateData.segment;
      if (updateData.scheduledFor) formattedData.scheduled_for = updateData.scheduledFor;
      if (updateData.recurring) formattedData.recurring = updateData.recurring;
      if (updateData.status) formattedData.status = updateData.status;
      if (updateData.mailchimpCampaignId) formattedData.mailchimp_campaign_id = updateData.mailchimpCampaignId;
      if (updateData.stats) formattedData.stats = updateData.stats;
      if (updateData.updatedBy) formattedData.updated_by = updateData.updatedBy;
      if (updateData.updated_at) formattedData.updated_at = updateData.updated_at;
      
      // Update in SupaBase
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(formattedData)
        .eq('id', id)
        .select(`
          *,
          template:template_id (
            id,
            name,
            type
          )
        `);
      
      if (error) throw new Error(error.message);
      
      return this.formatCampaignResponse(data[0]);
    } catch (error) {
      throw error;
    }
  }
  
  // Delete campaign
  static async delete(id) {
    try {
      // Check if campaign has been sent
      const { data: campaign, error: fetchError } = await supabase
        .from('email_campaigns')
        .select('status')
        .eq('id', id)
        .single();
      
      if (fetchError) throw new Error(fetchError.message);
      
      if (campaign.status === 'sent') {
        throw new Error('Cannot delete a sent campaign');
      }
      
      // Delete campaign
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Helper method to format campaign response to match MongoDB format
  static formatCampaignResponse(campaign) {
    if (!campaign) return null;
    
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      template: campaign.template,
      segment: campaign.segment,
      scheduledFor: campaign.scheduled_for,
      recurring: campaign.recurring,
      status: campaign.status,
      mailchimpCampaignId: campaign.mailchimp_campaign_id,
      stats: campaign.stats,
      createdBy: campaign.created_by,
      updatedBy: campaign.updated_by,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    };
  }
}

module.exports = EmailCampaign;
