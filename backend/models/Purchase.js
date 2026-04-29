const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  solutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Solution', required: true },
  paypalOrderId: { type: String, required: true, unique: true },
  paypalCaptureId: { type: String, default: null },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Compound index — fast lookup of "did this user buy this solution?"
purchaseSchema.index({ userId: 1, solutionId: 1, status: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);