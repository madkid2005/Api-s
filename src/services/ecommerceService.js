const axios = require('axios');
const cheerio = require('cheerio');

class EcommerceService {
  constructor() {
    // Mock product database
    this.products = [];
    this.initializeMockProducts();
  }

  initializeMockProducts() {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Amazon', 'Google'];
    
    for (let i = 1; i <= 50; i++) {
      const price = Math.floor(Math.random() * 1000) + 10;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      this.products.push({
        id: i,
        name: `${brand} Product ${i}`,
        description: `High-quality ${category} product from ${brand}`,
        price: price,
        category: category,
        brand: brand,
        rating: (Math.random() * 4 + 1).toFixed(1),
        stock: Math.floor(Math.random() * 1000),
        images: [
          `https://picsum.photos/seed/${i}/400/400`
        ],
        created: new Date(Date.now() - i * 86400000).toISOString()
      });
    }
  }

  async getProducts(filter = {}) {
    let results = [...this.products];
    
    if (filter.category) {
      results = results.filter(p => p.category.toLowerCase() === filter.category.toLowerCase());
    }
    
    if (filter.brand) {
      results = results.filter(p => p.brand.toLowerCase() === filter.brand.toLowerCase());
    }
    
    if (filter.minPrice) {
      results = results.filter(p => p.price >= parseFloat(filter.minPrice));
    }
    
    if (filter.maxPrice) {
      results = results.filter(p => p.price <= parseFloat(filter.maxPrice));
    }
    
    if (filter.sort) {
      switch (filter.sort) {
        case 'price_asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          results.sort((a, b) => new Date(b.created) - new Date(a.created));
          break;
      }
    }
    
    const limit = parseInt(filter.limit) || 20;
    const page = parseInt(filter.page) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      products: results.slice(start, end),
      total: results.length,
      page,
      limit,
      totalPages: Math.ceil(results.length / limit)
    };
  }

  async getProduct(id) {
    const product = this.products.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async searchProducts(query) {
    const results = this.products.filter(p => {
      const searchText = `${p.name} ${p.description} ${p.category} ${p.brand}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
    
    return {
      query,
      count: results.length,
      products: results.slice(0, 20)
    };
  }

  // Fetch from real ecommerce API (example)
  async fetchFromAmazon(query) {
    try {
      // This is a placeholder - in production use actual Amazon API
      return {
        source: 'amazon',
        query,
        products: this.products.slice(0, 5).map(p => ({
          ...p,
          source: 'amazon'
        }))
      };
    } catch (error) {
      throw new Error('Failed to fetch from Amazon');
    }
  }
}

module.exports = new EcommerceService();