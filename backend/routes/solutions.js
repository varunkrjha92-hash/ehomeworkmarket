const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Solution = require('../models/Solution');
const authMiddleware = require('../middleware/auth');
const { uploadFile, getDownloadUrl, deleteFile } = require('../utils/r2');

// Multer in-memory storage — file lives in RAM during request, then we push to R2
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max per solution file
});

// Allow only specific file types
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.ms-powerpoint', // ppt
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel' // xls
];

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// ── PUBLIC ROUTES ─────────────────────────────────────────────

// GET /api/solutions — list + search (public)
// Query params: q (search text), subject, page, limit
router.get('/', async (req, res) => {
  try {
    const { q, subject, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (q && q.trim()) filter.$text = { $search: q.trim() };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const solutions = await Solution.find(filter, { fileKey: 0 }) // hide fileKey from public
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Solution.countDocuments(filter);

    res.json({ solutions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching solutions' });
  }
});

// GET /api/solutions/:id — single solution detail (public, no file URL)
router.get('/:id', async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id, { fileKey: 0 });
    if (!solution) return res.status(404).json({ message: 'Solution not found' });
    res.json(solution);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching solution' });
  }
});

// ── ADMIN ROUTES ──────────────────────────────────────────────

// POST /api/solutions — admin uploads new solution
router.post('/', authMiddleware, isAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, classCode, week, description, keywords, price } = req.body;

    if (!title || !subject || !description || !price) {
      return res.status(400).json({ message: 'Title, subject, description, and price are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }
    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'File type not allowed. Use PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX.' });
    }

    // Generate unique R2 key: solutions/<timestamp><ext>
    const ext = path.extname(req.file.originalname);
    const fileKey = `solutions/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;

    // Upload to R2
    await uploadFile(req.file.buffer, fileKey, req.file.mimetype);

    // Save metadata to MongoDB
    const keywordsArr = keywords
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    const solution = await Solution.create({
      title,
      subject,
      classCode: classCode || null,
      week: week || null,
      description,
      keywords: keywordsArr,
      price: parseFloat(price),
      fileKey,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });

    res.json({ success: true, solution });
  } catch (err) {
    console.error('Solution upload error:', err);
    res.status(500).json({ message: 'Error uploading solution' });
  }
});

// GET /api/solutions/:id/download — get signed download URL (admin for now; later: paid users)
router.get('/:id/download', authMiddleware, isAdmin, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    const url = await getDownloadUrl(solution.fileKey, 3600); // 1 hour
    res.json({ url, fileName: solution.fileName });
  } catch (err) {
    console.error('Download URL error:', err);
    res.status(500).json({ message: 'Error generating download URL' });
  }
});

// DELETE /api/solutions/:id — admin deletes a solution
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    // Delete file from R2 first (best-effort)
    try { await deleteFile(solution.fileKey); } catch (e) { console.error('R2 delete failed:', e); }

    // Then delete from MongoDB
    await Solution.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting solution' });
  }
});

module.exports = router;