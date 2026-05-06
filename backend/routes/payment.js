const router = require('express').Router();
const paypal = require('@paypal/checkout-server-sdk');
const nodemailer = require('nodemailer');
const Solution = require('../models/Solution');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});

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

      // Send confirmation emails (best-effort; don't fail the request if email fails)
      try {
        const solution = await Solution.findById(purchase.solutionId);
        const buyer = await User.findById(req.user.id);
        const downloadLink = `${process.env.CLIENT_URL || 'https://ehomeworkmarket.vercel.app'}/library/${solution._id}`;

        // Email to student
        if (buyer?.email) {
          await transporter.sendMail({
            from: `"eHomeworkMarket" <${process.env.GMAIL_USER}>`,
            to: buyer.email,
            subject: `Purchase Confirmation: ${solution.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: #1a3a5c; padding: 20px; text-align: center;">
                  <h1 style="color: #f5c842; margin: 0; font-family: Georgia, serif;">eHomeworkMarket</h1>
                </div>
                <div style="padding: 24px; background: #fafafa;">
                  <h2 style="color: #1a3a5c;">Thank you for your purchase!</h2>
                  <p>Hi ${buyer.name || 'there'},</p>
                  <p>Your payment has been received and your solution is ready to download.</p>
                  <div style="background: #fff; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #f5c842;">
                    <p style="margin: 0 0 6px 0;"><strong>Solution:</strong> ${solution.title}</p>
                    ${solution.classCode ? `<p style="margin: 0 0 6px 0;"><strong>Class:</strong> ${solution.classCode}</p>` : ''}
                    <p style="margin: 0 0 6px 0;"><strong>Amount:</strong> $${purchase.amount} ${purchase.currency}</p>
                    <p style="margin: 0;"><strong>Order ID:</strong> ${purchase.paypalOrderId}</p>
                  </div>
                  <p style="text-align: center; margin: 24px 0;">
                    <a href="${downloadLink}" style="background: #1a3a5c; color: #f5c842; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Now →</a>
                  </p>
                  <p style="font-size: 13px; color: #666;">You can also re-download anytime from "My Purchases" in your account.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #888;">Questions? Reply to this email or contact ${process.env.GMAIL_USER}.</p>
                </div>
              </div>
            `
          });
        }

        // Email to admin (sale notification)
        await transporter.sendMail({
          from: `"eHomeworkMarket" <${process.env.GMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
          subject: `💰 New Sale: ${solution.title} ($${purchase.amount})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #1a3a5c;">New Sale Notification</h2>
              <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 6px 0;"><strong>Buyer:</strong></td><td>${buyer?.name || 'Unknown'} (${buyer?.email || 'no email'})</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Solution:</strong></td><td>${solution.title}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Class Code:</strong></td><td>${solution.classCode || '-'}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Subject:</strong></td><td>${solution.subject}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Amount:</strong></td><td>$${purchase.amount} ${purchase.currency}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>PayPal Order:</strong></td><td>${purchase.paypalOrderId}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Capture ID:</strong></td><td>${purchase.paypalCaptureId}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Date:</strong></td><td>${purchase.completedAt.toISOString()}</td></tr>
              </table>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Email sending failed (purchase still recorded):', emailErr);
      }

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

// GET /api/payment/admin/sales-summary — admin only
// Returns total revenue, count, and recent purchases with buyer info
router.get('/admin/sales-summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const completed = await Purchase.find({ status: 'completed' })
      .populate('userId', 'name email')
      .populate('solutionId', 'title subject classCode')
      .sort({ completedAt: -1 });

    const totalRevenue = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalSales = completed.length;

    const byMonth = {};
    completed.forEach(p => {
      if (!p.completedAt) return;
      const m = p.completedAt.toISOString().slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { count: 0, revenue: 0 };
      byMonth[m].count += 1;
      byMonth[m].revenue += p.amount || 0;
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalSales,
      byMonth,
      recent: completed.slice(0, 50)
    });
  } catch (err) {
    console.error('Sales summary error:', err);
    res.status(500).json({ message: 'Error fetching sales summary' });
  }
});

module.exports = router;