const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const Question = require('../models/Question');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});

router.post('/submit', upload.single('file'), async (req, res) => {
  try {
    const { subject, description, budget, deadline, guestEmail } = req.body;
    const userId = req.headers.authorization ? (() => {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        return jwt.verify(token, process.env.JWT_SECRET).id;
      } catch { return null; }
    })() : null;

    const question = await Question.create({
      userId,
      guestEmail: userId ? null : guestEmail,
      subject,
      description,
      budget: budget || null,
      deadline: deadline || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Question: ${subject}`,
      html: `<h2>New assignment submitted</h2>
             <p><b>Subject:</b> ${subject}</p>
             <p><b>Description:</b> ${description}</p>
             <p><b>Budget:</b> $${budget || 'Open'}</p>
             <p><b>Deadline:</b> ${deadline || 'Not specified'}</p>
             <p><b>From:</b> ${guestEmail || 'Registered user'}</p>
             <p><a href="${process.env.CLIENT_URL}/admin">View in Admin Dashboard</a></p>`
    }).catch(() => {});

    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting question' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  const questions = await Question.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(questions);
});

router.get('/:id/messages', async (req, res) => {
  const messages = await Message.find({ questionId: req.params.id }).sort({ createdAt: 1 });
  res.json(messages);
});

router.post('/:id/message', async (req, res) => {
  try {
    const msg = await Message.create({
      questionId: req.params.id,
      sender: 'student',
      text: req.body.text
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New chat message from student',
      html: `<p>Student sent: <b>${req.body.text}</b></p>
             <p><a href="${process.env.CLIENT_URL}/admin">Reply in dashboard</a></p>`
    }).catch(() => {});

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router;