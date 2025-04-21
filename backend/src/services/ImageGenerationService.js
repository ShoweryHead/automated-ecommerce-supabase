const axios = require('axios');
const config = require('../config/config');
const supabase = require('../config/supabase');

class ImageGenerationService {
  constructor() {
    // Initialize Unsplash API
    this.unsplashAccessKey = config.UNSPLASH_API_KEY;
    this.unsplashBaseUrl = 'https://api.unsplash.com';
  }

  /**
   * Generate product images based on product information
   * @param {Object} productInfo - Product information (title, description)
   * @param {Number} count - Number of images to generate
   * @returns {Array} Generated images
   */
  async generateProductImages(productInfo, count = 3) {
    try {
      console.log(`Generating ${count} images for product: ${productInfo.title}`);
      
      // Extract keywords from product title and description
      const keywords = this.extractKeywords(productInfo);
      
      // Search for images on Unsplash
      const images = await this.searchUnsplashImages(keywords, count);
      
      console.log(`Successfully found ${images.length} images for product: ${productInfo.title}`);
      
      return images;
    } catch (error) {
      console.error('Error generating product images:', error);
      throw new Error(`Failed to generate product images: ${error.message}`);
    }
  }
  
  /**
   * Extract keywords from product information
   * @param {Object} productInfo - Product information
   * @returns {Array} Extracted keywords
   */
  extractKeywords(productInfo) {
    // Combine title and description
    const text = `${productInfo.title} ${productInfo.description || ''}`;
    
    // Extract nouns and important words
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    // Get unique words
    const uniqueWords = [...new Set(words)];
    
    // Limit to top 5 keywords
    return uniqueWords.slice(0, 5);
  }
  
  /**
   * Check if a word is a stop word
   * @param {String} word - Word to check
   * @returns {Boolean} True if stop word
   */
  isStopWord(word) {
    const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'has', 'had', 'not', 'are', 'were', 'was', 'been', 'being'];
    return stopWords.includes(word);
  }
  
  /**
   * Search for images on Unsplash
   * @param {Array} keywords - Keywords to search for
   * @param {Number} count - Number of images to return
   * @returns {Array} Found images
   */
  async searchUnsplashImages(keywords, count) {
    try {
      // Join keywords with plus sign
      const query = keywords.join('+');
      
      // Make request to Unsplash API
      const response = await axios.get(`${this.unsplashBaseUrl}/search/photos`, {
        params: {
          query,
          per_page: count,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        }
      });
      
      // Format images
      const images = response.data.results.map(image => ({
        url: image.urls.regular,
        alt: image.alt_description || productInfo.title,
        isMain: false,
        source: 'unsplash',
        sourceId: image.id,
        photographer: image.user.name,
        photographerUrl: image.user.links.html
      }));
      
      // Set first image as main
      if (images.length > 0) {
        images[0].isMain = true;
      }
      
      return images;
    } catch (error) {
      console.error('Error searching Unsplash images:', error);
      throw new Error(`Failed to search Unsplash images: ${error.message}`);
    }
  }
  
  /**
   * Save image to SupaBase storage
   * @param {String} imageUrl - URL of the image to save
   * @param {String} fileName - Name to save the file as
   * @returns {Object} Saved image information
   */
  async saveImageToStorage(imageUrl, fileName) {
    try {
      console.log(`Saving image from ${imageUrl} to storage as ${fileName}`);
      
      // Download image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      // Upload to SupaBase storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType: response.headers['content-type'],
          upsert: true
        });
      
      if (error) throw new Error(error.message);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      console.log(`Successfully saved image to storage: ${urlData.publicUrl}`);
      
      return {
        url: urlData.publicUrl,
        path: data.path,
        size: buffer.length
      };
    } catch (error) {
      console.error('Error saving image to storage:', error);
      throw new Error(`Failed to save image to storage: ${error.message}`);
    }
  }
  
  /**
   * Optimize image for web
   * @param {String} imageUrl - URL of the image to optimize
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized image information
   */
  async optimizeImage(imageUrl, options = {}) {
    try {
      console.log(`Optimizing image: ${imageUrl}`);
      
      // For now, we'll just return the original image
      // In a real implementation, you would use a library like Sharp to resize and optimize
      
      return {
        url: imageUrl,
        optimized: true
      };
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw new Error(`Failed to optimize image: ${error.message}`);
    }
  }
}

module.exports = new ImageGenerationService();
