const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

class NewsService {
  constructor() {
    this.sources = {
      'tech': 'https://feeds.feedburner.com/TechCrunch',
      'world': 'http://feeds.bbci.co.uk/news/world/rss.xml',
      'business': 'https://feeds.bloomberg.com/markets/news.rss',
      'science': 'https://www.sciencedaily.com/rss/all.xml'
    };
  }

  async fetchNews(category = 'tech', limit = 10) {
    try {
      const feedUrl = this.sources[category] || this.sources.tech;
      const feed = await parser.parseURL(feedUrl);
      
      const articles = feed.items.slice(0, limit).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        description: item.description || item.contentSnippet || '',
        source: feed.title || category
      }));
      
      return {
        category,
        count: articles.length,
        articles
      };
    } catch (error) {
      throw new Error(`Failed to fetch news: ${error.message}`);
    }
  }

  async searchNews(keyword, limit = 10) {
    // Search across all sources
    const results = [];
    const categories = Object.keys(this.sources);
    
    for (const category of categories) {
      try {
        const feed = await parser.parseURL(this.sources[category]);
        const matches = feed.items
          .filter(item => {
            const searchText = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
            return searchText.includes(keyword.toLowerCase());
          })
          .slice(0, 5)
          .map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            description: item.contentSnippet || '',
            source: feed.title || category
          }));
        
        results.push(...matches);
      } catch (error) {
        console.error(`Error searching ${category}:`, error.message);
      }
    }
    
    // Sort by date and limit
    results.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    return {
      keyword,
      count: Math.min(results.length, limit),
      articles: results.slice(0, limit)
    };
  }

  getCategories() {
    return Object.keys(this.sources);
  }
}

module.exports = new NewsService();