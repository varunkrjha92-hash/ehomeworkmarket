const router = require('express').Router();
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth');

// Placeholder - PayPal will be added later
router.post('/create-order/:questionId', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question || question.status !== 'solved')
      return res.status(400).json({ message: 'No solution available yet' });
    res.json({ message: 'PayPal coming soon', price: question.price });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/capture-order', authMiddleware, async (req, res) => {
  res.json({ message: 'PayPal coming soon' });
});

module.exports = router;