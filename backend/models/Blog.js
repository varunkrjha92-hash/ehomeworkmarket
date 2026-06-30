const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, default: '' },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  category: { type: String, default: 'General' },
  metaTitle: { type: String, default: '' },
  metaDesc: { type: String, default: '' },
  keywords: { type: [String], default: [] },
  published: { type: Boolean, default: true },
  author: { type: String, default: 'eHomeworkMarket' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

blogSchema.index({
  title: 'text',
  excerpt: 'text',
  content: 'text',
  keywords: 'text',
  category: 'text'
});

module.exports = mongoose.model('Blog', blogSchema);
