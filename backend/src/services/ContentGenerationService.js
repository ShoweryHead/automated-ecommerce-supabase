const { Configuration, OpenAIApi } = require('openai');
const config = require('../config/config');

class ContentGenerationService {
  constructor() {
    // Initialize OpenAI configuration
    this.configuration = new Configuration({
      apiKey: config.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  /**
   * Generate product content based on keywords and category
   * @param {Array} keywords - Keywords for product generation
   * @param {String} categoryName - Category name
   * @returns {Object} Generated content
   */
  async generateProductContent(keywords, categoryName) {
    try {
      console.log(`Generating product content for keywords: ${keywords.join(', ')} in category: ${categoryName}`);
      
      // Create a detailed prompt for the AI
      const prompt = this.createProductContentPrompt(keywords, categoryName);
      
      // Call OpenAI API
      const response = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert product content creator for industrial machinery and equipment. Create detailed, professional, and SEO-optimized product descriptions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      });
      
      // Parse the response
      const content = this.parseProductContentResponse(response.data.choices[0].message.content);
      
      console.log(`Successfully generated product content for: ${content.title}`);
      
      return content;
    } catch (error) {
      console.error('Error generating product content:', error);
      throw new Error(`Failed to generate product content: ${error.message}`);
    }
  }
  
  /**
   * Create a prompt for product content generation
   * @param {Array} keywords - Keywords for product generation
   * @param {String} categoryName - Category name
   * @returns {String} Prompt for OpenAI
   */
  createProductContentPrompt(keywords, categoryName) {
    return `
      Create detailed content for an industrial product based on the following keywords: ${keywords.join(', ')}. 
      The product belongs to the category: ${categoryName}.
      
      Please provide the following information in a structured JSON format:
      
      1. title: A concise, descriptive product title (max 100 characters)
      2. shortDescription: A brief overview of the product (max 500 characters)
      3. description: A comprehensive description of the product, its uses, and benefits (at least 500 words)
      4. features: An array of feature sections, each with a title and an array of bullet points
      5. specifications: A map of technical specifications (key-value pairs)
      6. applications: An array of potential applications or use cases
      7. faqs: An array of frequently asked questions with answers
      8. metaTitle: SEO-optimized meta title (max 70 characters)
      9. metaDescription: SEO-optimized meta description (max 160 characters)
      10. schemaMarkup: JSON-LD schema markup for the product
      
      Format the response as valid JSON that can be parsed directly.
    `;
  }
  
  /**
   * Parse the OpenAI response into structured content
   * @param {String} responseText - Raw response from OpenAI
   * @returns {Object} Structured content
   */
  parseProductContentResponse(responseText) {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
      
      let jsonContent;
      if (jsonMatch) {
        jsonContent = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      } else {
        jsonContent = responseText;
      }
      
      // Parse the JSON
      const content = JSON.parse(jsonContent);
      
      // Ensure all required fields are present
      const defaultContent = {
        title: 'Product Title',
        shortDescription: 'Short product description',
        description: 'Detailed product description',
        features: [{ title: 'Features', items: ['Feature 1', 'Feature 2'] }],
        specifications: {},
        applications: ['Application 1'],
        faqs: [{ question: 'FAQ Question?', answer: 'FAQ Answer' }],
        metaTitle: 'Product Meta Title',
        metaDescription: 'Product Meta Description',
        schemaMarkup: '{}'
      };
      
      // Merge with defaults for any missing fields
      return { ...defaultContent, ...content };
    } catch (error) {
      console.error('Error parsing product content response:', error);
      throw new Error(`Failed to parse product content: ${error.message}`);
    }
  }
  
  /**
   * Generate blog content based on topic
   * @param {String} topic - Blog topic
   * @param {Object} options - Additional options
   * @returns {Object} Generated blog content
   */
  async generateBlogContent(topic, options = {}) {
    try {
      console.log(`Generating blog content for topic: ${topic}`);
      
      // Create a detailed prompt for the AI
      const prompt = this.createBlogContentPrompt(topic, options);
      
      // Call OpenAI API
      const response = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert content writer specializing in industrial machinery and equipment. Create engaging, informative, and SEO-optimized blog posts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });
      
      // Parse the response
      const content = this.parseBlogContentResponse(response.data.choices[0].message.content);
      
      console.log(`Successfully generated blog content for: ${content.title}`);
      
      return content;
    } catch (error) {
      console.error('Error generating blog content:', error);
      throw new Error(`Failed to generate blog content: ${error.message}`);
    }
  }
  
  /**
   * Create a prompt for blog content generation
   * @param {String} topic - Blog topic
   * @param {Object} options - Additional options
   * @returns {String} Prompt for OpenAI
   */
  createBlogContentPrompt(topic, options) {
    const { keywords = [], wordCount = 1500, tone = 'professional' } = options;
    
    return `
      Create a detailed blog post about: ${topic}
      
      Target keywords: ${keywords.join(', ')}
      Target word count: ${wordCount}
      Tone: ${tone}
      
      Please provide the following information in a structured JSON format:
      
      1. title: An engaging, SEO-optimized blog title
      2. metaTitle: SEO-optimized meta title (max 70 characters)
      3. metaDescription: SEO-optimized meta description (max 160 characters)
      4. introduction: An engaging introduction to the topic
      5. sections: An array of sections, each with a heading and content
      6. conclusion: A conclusion summarizing the key points
      7. callToAction: A call to action for readers
      8. tags: An array of relevant tags for the blog post
      
      Format the response as valid JSON that can be parsed directly.
    `;
  }
  
  /**
   * Parse the OpenAI response into structured blog content
   * @param {String} responseText - Raw response from OpenAI
   * @returns {Object} Structured blog content
   */
  parseBlogContentResponse(responseText) {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
      
      let jsonContent;
      if (jsonMatch) {
        jsonContent = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      } else {
        jsonContent = responseText;
      }
      
      // Parse the JSON
      const content = JSON.parse(jsonContent);
      
      // Ensure all required fields are present
      const defaultContent = {
        title: 'Blog Title',
        metaTitle: 'Blog Meta Title',
        metaDescription: 'Blog Meta Description',
        introduction: 'Blog introduction',
        sections: [{ heading: 'Section Heading', content: 'Section content' }],
        conclusion: 'Blog conclusion',
        callToAction: 'Call to action',
        tags: ['tag1', 'tag2']
      };
      
      // Merge with defaults for any missing fields
      return { ...defaultContent, ...content };
    } catch (error) {
      console.error('Error parsing blog content response:', error);
      throw new Error(`Failed to parse blog content: ${error.message}`);
    }
  }
}

module.exports = new ContentGenerationService();
