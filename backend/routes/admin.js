const router = require('express').Router();
const multer = require('multer');
const { Resend } = require('resend');
const Question = require('../models/Question');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, 'sol_' + Date.now() + require('path').extname(file.originalname))
});
const upload = multer({ storage });

const resend = new Resend(process.env.RESEND_API_KEY);

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

router.get('/questions', authMiddleware, isAdmin, async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 }).populate('userId', 'name email');
  res.json(questions);
});

router.post('/questions/:id/solve', authMiddleware, isAdmin, upload.single('file'), async (req, res) => {
  try {
    const { solutionText, price } = req.body;
    const question = await Question.findByIdAndUpdate(req.params.id, {
      solutionText,
      solutionFile: req.file ? `/uploads/${req.file.filename}` : null,
      price: parseFloat(price),
      status: 'solved'
    }, { new: true }).populate('userId', 'email name');

    const studentEmail = question.userId?.email || question.guestEmail;
    if (studentEmail) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: studentEmail,
        subject: 'Your assignment has been solved — eHomeworkMarket',
        html: `<h2>Your assignment is ready!</h2>
               <p>Subject: <b>${question.subject}</b></p>
               <p>Our expert has solved your assignment.</p>
               <p><b>Price: $${price}</b></p>
               <p>Please log in to review and complete payment.</p>
               <p><a href="${process.env.CLIENT_URL}/dashboard">View Solution & Pay</a></p>
               <br><p>— eHomeworkMarket Team</p>`
      }).catch(() => {});
    }

    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ message: 'Error posting solution' });
  }
});

router.post('/questions/:id/message', authMiddleware, isAdmin, async (req, res) => {
  try {
    const msg = await Message.create({
      questionId: req.params.id,
      sender: 'admin',
      text: req.body.text
    });

    const question = await Question.findById(req.params.id).populate('userId', 'email');
    const studentEmail = question?.userId?.email || question?.guestEmail;

    if (studentEmail) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: studentEmail,
        subject: 'New reply on your assignment — eHomeworkMarket',
        html: `<p>Expert replied: <b>${req.body.text}</b></p>
               <p><a href="${process.env.CLIENT_URL}/dashboard">View conversation</a></p>`
      }).catch(() => {});
    }

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  const total = await Question.countDocuments();
  const pending = await Question.countDocuments({ status: 'pending' });
  const solved = await Question.countDocuments({ status: 'solved' });
  const paid = await Question.countDocuments({ status: 'paid' });
  const users = await User.countDocuments({ role: 'student' });
  res.json({ total, pending, solved, paid, users });
});

module.exports = router;