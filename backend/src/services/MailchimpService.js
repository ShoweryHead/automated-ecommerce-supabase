const mailchimp = require('@mailchimp/mailchimp_marketing');
const config = require('../config/config');
const supabase = require('../config/supabase');

/**
 * Service for managing email marketing automation with Mailchimp
 */
class MailchimpService {
  /**
   * Initialize the Mailchimp service
   */
  constructor() {
    // Initialize Mailchimp client
    mailchimp.setConfig({
      apiKey: config.MAILCHIMP_API_KEY,
      server: config.MAILCHIMP_SERVER_PREFIX // e.g., 'us11'
    });
    
    this.defaultListId = config.MAILCHIMP_LIST_ID;
  }

  /**
   * Test the Mailchimp connection
   * @returns {Object} Mailchimp API response
   */
  async testConnection() {
    try {
      const response = await mailchimp.ping.get();
      console.log('Mailchimp connection successful:', response);
      return { success: true, message: 'Mailchimp connection successful', data: response };
    } catch (error) {
      console.error('Mailchimp connection failed:', error);
      return { success: false, message: 'Mailchimp connection failed', error };
    }
  }

  /**
   * Sync a subscriber to Mailchimp
   * @param {Object} subscriber - Subscriber object
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async syncSubscriber(subscriber, listId = this.defaultListId) {
    try {
      console.log(`Syncing subscriber ${subscriber.email} to Mailchimp list ${listId}`);

      // Prepare subscriber data for Mailchimp
      const subscriberData = {
        email_address: subscriber.email,
        status: subscriber.status === 'pending' ? 'pending' : 'subscribed',
        merge_fields: {
          FNAME: subscriber.firstName || '',
          LNAME: subscriber.lastName || '',
          COMPANY: subscriber.company || '',
          PHONE: subscriber.phone || ''
        },
        tags: []
      };

      // Add tags based on subscriber data
      if (subscriber.customerStatus) {
        subscriberData.tags.push(subscriber.customerStatus);
      }

      if (subscriber.interests && subscriber.interests.length > 0) {
        subscriberData.tags = [...subscriberData.tags, ...subscriber.interests];
      }

      if (subscriber.region) {
        subscriberData.tags.push(`region:${subscriber.region}`);
      }

      if (subscriber.engagementLevel) {
        subscriberData.tags.push(`engagement:${subscriber.engagementLevel}`);
      }

      // Check if subscriber already exists in Mailchimp
      if (subscriber.mailchimpId) {
        // Update existing subscriber
        const response = await mailchimp.lists.updateListMember(
          listId,
          subscriber.mailchimpId,
          subscriberData
        );

        console.log(`Subscriber ${subscriber.email} updated in Mailchimp`);
        return { success: true, message: 'Subscriber updated in Mailchimp', data: response };
      } else {
        // Create new subscriber
        const response = await mailchimp.lists.addListMember(
          listId,
          subscriberData
        );

        // Update subscriber in SupaBase with Mailchimp ID
        const { error } = await supabase
          .from('email_subscribers')
          .update({
            mailchimp_id: response.id,
            mailchimp_list_id: listId,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriber.id);

        if (error) {
          console.error(`Error updating subscriber in SupaBase: ${error.message}`);
        }

        console.log(`Subscriber ${subscriber.email} added to Mailchimp`);
        return { success: true, message: 'Subscriber added to Mailchimp', data: response };
      }
    } catch (error) {
      console.error(`Error syncing subscriber ${subscriber.email} to Mailchimp:`, error);
      return { success: false, message: 'Error syncing subscriber to Mailchimp', error };
    }
  }

  /**
   * Create a segment in Mailchimp
   * @param {String} name - Segment name
   * @param {Object} conditions - Segment conditions
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async createSegment(name, conditions, listId = this.defaultListId) {
    try {
      console.log(`Creating segment "${name}" in Mailchimp list ${listId}`);

      const response = await mailchimp.lists.createSegment(listId, {
        name,
        static_segment: [],
        options: {
          match: 'all',
          conditions
        }
      });

      console.log(`Segment "${name}" created in Mailchimp`);
      return { success: true, message: 'Segment created in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error creating segment "${name}" in Mailchimp:`, error);
      return { success: false, message: 'Error creating segment in Mailchimp', error };
    }
  }

  /**
   * Create a campaign in Mailchimp
   * @param {Object} campaign - Campaign object
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async createCampaign(campaign, listId = this.defaultListId) {
    try {
      console.log(`Creating campaign "${campaign.name}" in Mailchimp`);

      // Get the email template
      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', campaign.template_id)
        .single();

      if (error) {
        throw new Error(`Template not found with ID: ${campaign.template_id}`);
      }

      // Prepare segment options
      let segmentOpts = {};
      if (campaign.segment && Object.keys(campaign.segment).length > 0) {
        // Convert our segment format to Mailchimp's format
        const conditions = [];
        
        if (campaign.segment.customerStatus) {
          conditions.push({
            condition_type: 'Tag',
            op: 'is',
            field: 'tag',
            value: campaign.segment.customerStatus
          });
        }
        
        if (campaign.segment.interests && campaign.segment.interests.length > 0) {
          campaign.segment.interests.forEach(interest => {
            conditions.push({
              condition_type: 'Tag',
              op: 'is',
              field: 'tag',
              value: interest
            });
          });
        }
        
        if (campaign.segment.region) {
          conditions.push({
            condition_type: 'Tag',
            op: 'is',
            field: 'tag',
            value: `region:${campaign.segment.region}`
          });
        }
        
        if (campaign.segment.engagementLevel) {
          conditions.push({
            condition_type: 'Tag',
            op: 'is',
            field: 'tag',
            value: `engagement:${campaign.segment.engagementLevel}`
          });
        }
        
        segmentOpts = {
          match: 'all',
          conditions
        };
      }

      // Create campaign in Mailchimp
      const campaignResponse = await mailchimp.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: listId,
          segment_opts: segmentOpts
        },
        settings: {
          subject_line: template.subject,
          title: campaign.name,
          from_name: config.MAILCHIMP_FROM_NAME || 'Your Company',
          reply_to: config.MAILCHIMP_REPLY_TO || 'info@example.com',
          template_id: template.mailchimp_template_id
        }
      });

      // Set campaign content
      await mailchimp.campaigns.setContent(campaignResponse.id, {
        html: template.html_content
      });

      // Update campaign in SupaBase with Mailchimp ID
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          mailchimp_campaign_id: campaignResponse.id,
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      if (updateError) {
        console.error(`Error updating campaign in SupaBase: ${updateError.message}`);
      }

      console.log(`Campaign "${campaign.name}" created in Mailchimp with ID: ${campaignResponse.id}`);
      return { success: true, message: 'Campaign created in Mailchimp', data: campaignResponse };
    } catch (error) {
      console.error(`Error creating campaign "${campaign.name}" in Mailchimp:`, error);
      return { success: false, message: 'Error creating campaign in Mailchimp', error };
    }
  }

  /**
   * Schedule a campaign in Mailchimp
   * @param {String} campaignId - Mailchimp campaign ID
   * @param {Date} scheduledTime - Scheduled time
   * @returns {Object} Mailchimp API response
   */
  async scheduleCampaign(campaignId, scheduledTime) {
    try {
      console.log(`Scheduling campaign ${campaignId} in Mailchimp for ${scheduledTime}`);

      // Format date for Mailchimp (ISO 8601)
      const formattedDate = scheduledTime.toISOString();

      const response = await mailchimp.campaigns.schedule(campaignId, {
        schedule_time: formattedDate
      });

      console.log(`Campaign ${campaignId} scheduled in Mailchimp for ${scheduledTime}`);
      return { success: true, message: 'Campaign scheduled in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error scheduling campaign ${campaignId} in Mailchimp:`, error);
      return { success: false, message: 'Error scheduling campaign in Mailchimp', error };
    }
  }

  /**
   * Send a campaign immediately in Mailchimp
   * @param {String} campaignId - Mailchimp campaign ID
   * @returns {Object} Mailchimp API response
   */
  async sendCampaign(campaignId) {
    try {
      console.log(`Sending campaign ${campaignId} in Mailchimp`);

      const response = await mailchimp.campaigns.send(campaignId);

      console.log(`Campaign ${campaignId} sent in Mailchimp`);
      return { success: true, message: 'Campaign sent in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error sending campaign ${campaignId} in Mailchimp:`, error);
      return { success: false, message: 'Error sending campaign in Mailchimp', error };
    }
  }

  /**
   * Get campaign report from Mailchimp
   * @param {String} campaignId - Mailchimp campaign ID
   * @returns {Object} Mailchimp API response
   */
  async getCampaignReport(campaignId) {
    try {
      console.log(`Getting report for campaign ${campaignId} from Mailchimp`);

      const response = await mailchimp.reports.getCampaignReport(campaignId);

      console.log(`Got report for campaign ${campaignId} from Mailchimp`);
      return { success: true, message: 'Campaign report retrieved from Mailchimp', data: response };
    } catch (error) {
      console.error(`Error getting report for campaign ${campaignId} from Mailchimp:`, error);
      return { success: false, message: 'Error getting campaign report from Mailchimp', error };
    }
  }

  /**
   * Update campaign stats in SupaBase
   * @param {String} campaignId - SupaBase campaign ID
   * @returns {Object} Update result
   */
  async updateCampaignStats(campaignId) {
    try {
      console.log(`Updating stats for campaign ${campaignId}`);

      // Get campaign from SupaBase
      const { data: campaign, error: fetchError } = await supabase
        .from('email_campaigns')
        .select('mailchimp_campaign_id')
        .eq('id', campaignId)
        .single();

      if (fetchError) {
        throw new Error(`Campaign not found with ID: ${campaignId}`);
      }

      if (!campaign.mailchimp_campaign_id) {
        throw new Error('Campaign does not have a Mailchimp ID');
      }

      // Get report from Mailchimp
      const reportResult = await this.getCampaignReport(campaign.mailchimp_campaign_id);

      if (!reportResult.success) {
        throw new Error(reportResult.message);
      }

      // Format stats
      const stats = {
        opens: reportResult.data.opens.total,
        unique_opens: reportResult.data.opens.unique,
        clicks: reportResult.data.clicks.total,
        unique_clicks: reportResult.data.clicks.unique,
        subscribers: reportResult.data.emails_sent,
        unsubscribes: reportResult.data.unsubscribes,
        bounces: reportResult.data.bounces.hard_bounces + reportResult.data.bounces.soft_bounces,
        last_updated: new Date().toISOString()
      };

      // Update campaign in SupaBase
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          stats,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) {
        throw new Error(`Error updating campaign stats: ${updateError.message}`);
      }

      console.log(`Successfully updated stats for campaign ${campaignId}`);
      return { success: true, message: 'Campaign statistics updated', stats };
    } catch (error) {
      console.error(`Error updating campaign stats: ${error.message}`);
      return { success: false, message: `Error updating campaign stats: ${error.message}` };
    }
  }
}

module.exports = new MailchimpService();
