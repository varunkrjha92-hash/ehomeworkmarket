const router = require('express').Router();
const paypal = require('@paypal/checkout-server-sdk');
const Solution = require('../models/Solution');
const Purchase = require('../models/Purchase');
const authMiddleware = require('../middleware/auth');

// PayPal client setup
function paypalClient() {
  const env = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
  return new paypal.core.PayPalHttpClient(env);
}

// POST /api/payment/create-order/:solutionId
// Student initiates purchase → backend creates PayPal order → returns order ID to frontend
router.post('/create-order/:solutionId', authMiddleware, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    // Check if user already purchased
    const existing = await Purchase.findOne({ userId: req.user.id, solutionId: solution._id, status: 'completed' });
    if (existing) return res.status(400).json({ message: 'You already own this solution', alreadyOwned: true });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: solution._id.toString(),
        description: `Solution: ${solution.title}`.slice(0, 127),
        amount: {
          currency_code: 'USD',
          value: solution.price.toFixed(2)
        }
      }]
    });

    const client = paypalClient();
    const order = await client.execute(request);

    // Save pending purchase record
    await Purchase.create({
      userId: req.user.id,
      solutionId: solution._id,
      paypalOrderId: order.result.id,
      amount: solution.price,
      status: 'pending'
    });

    res.json({ orderId: order.result.id });
  } catch (err) {
    console.error('PayPal create order error:', err);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// POST /api/payment/capture-order/:orderId
// After student approves payment in PayPal popup → frontend calls this → backend captures funds
router.post('/capture-order/:orderId', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const purchase = await Purchase.findOne({ paypalOrderId: orderId, userId: req.user.id });
    if (!purchase) return res.status(404).json({ message: 'Purchase record not found' });

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const client = paypalClient();
    const capture = await client.execute(request);

    if (capture.result.status === 'COMPLETED') {
      purchase.status = 'completed';
      purchase.paypalCaptureId = capture.result.purchase_units[0].payments.captures[0].id;
      purchase.completedAt = new Date();
      await purchase.save();
      res.json({ success: true, purchaseId: purchase._id });
    } else {
      purchase.status = 'failed';
      await purchase.save();
      res.status(400).json({ message: 'Payment not completed', status: capture.result.status });
    }
  } catch (err) {
    console.error('PayPal capture error:', err);
    res.status(500).json({ message: 'Error capturing payment' });
  }
});

// GET /api/payment/my-purchases
// List solutions the current user has purchased
router.get('/my-purchases', authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.id, status: 'completed' })
      .populate('solutionId', 'title subject classCode week price fileName')
      .sort({ completedAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching purchases' });
  }
});

// GET /api/payment/check/:solutionId
// Check if current user has purchased a specific solution (used by frontend to show "Download" button)
router.get('/check/:solutionId', authMiddleware, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      userId: req.user.id,
      solutionId: req.params.solutionId,
      status: 'completed'
    });
    res.json({ owned: !!purchase });
  } catch (err) {
    res.status(500).json({ message: 'Error checking purchase' });
  }
});

module.exports = router;