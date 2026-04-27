const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  classCode: { type: String, default: null },
  week: { type: String, default: null },
  description: { type: String, required: true },
  keywords: { type: [String], default: [] },
  price: { type: Number, required: true },
  fileKey: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, default: null },
  fileSize: { type: Number, default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

// Index for fast keyword/text search
solutionSchema.index({
  title: 'text',
  description: 'text',
  keywords: 'text',
  classCode: 'text',
  subject: 'text'
});

module.exports = mongoose.model('Solution', solutionSchema);