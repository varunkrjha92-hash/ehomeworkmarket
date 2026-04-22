const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestEmail: { type: String, default: null },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String, default: null },
  budget: { type: Number, default: null },
  deadline: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'solved', 'paid'],
    default: 'pending'
  },
  solutionText: { type: String, default: null },
  solutionFile: { type: String, default: null },
  price: { type: Number, default: null },
  stripePaymentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);