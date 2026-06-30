const router = require('express').Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../middleware/auth');

// Admin-only middleware (same pattern as solutions.js)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// Slugify helper
function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── PUBLIC ROUTES ─────────────────────────────────────────────

// GET /api/blog — list published posts (public), newest first
// Query params: q (search), category, page, limit
router.get('/', async (req, res) => {
  try {
    const { q, category, page = 1, limit = 12 } = req.query;
    const filter = { published: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);
    const posts = await Blog.find(filter)
      .select('-content') // list view doesn't need full body
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(filter);
    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('Blog list error:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// GET /api/blog/recent — latest N posts for homepage (public)
router.get('/recent', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 3;
    const posts = await Blog.find({ published: true })
      .select('-content')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(posts);
  } catch (err) {
    console.error('Blog recent error:', err);
    res.status(500).json({ message: 'Failed to fetch recent posts' });
  }
});

// GET /api/blog/:slug — single post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Blog get error:', err);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// ── ADMIN ROUTES ──────────────────────────────────────────────

// GET /api/blog/admin/all — list ALL posts incl unpublished (admin)
router.get('/admin/all', authMiddleware, isAdmin, async (req, res) => {
  try {
    const posts = await Blog.find().select('-content').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// POST /api/blog — create post (admin)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, metaTitle, metaDesc, keywords, published } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });

    let slug = slugify(title);
    // Ensure unique slug
    const existing = await Blog.findOne({ slug });
    if (existing) slug = slug + '-' + Date.now().toString().slice(-5);

    const post = await Blog.create({
      title, slug, content,
      excerpt: excerpt || content.replace(/<[^>]*>/g, '').slice(0, 160),
      coverImage: coverImage || '',
      category: category || 'General',
      metaTitle: metaTitle || title,
      metaDesc: metaDesc || excerpt || '',
      keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()) : []),
      published: published !== false
    });
    res.status(201).json(post);
  } catch (err) {
    console.error('Blog create error:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// PUT /api/blog/:id — update post (admin)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, metaTitle, metaDesc, keywords, published } = req.body;
    const update = { updatedAt: Date.now() };
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (excerpt !== undefined) update.excerpt = excerpt;
    if (coverImage !== undefined) update.coverImage = coverImage;
    if (category !== undefined) update.category = category;
    if (metaTitle !== undefined) update.metaTitle = metaTitle;
    if (metaDesc !== undefined) update.metaDesc = metaDesc;
    if (published !== undefined) update.published = published;
    if (keywords !== undefined) {
      update.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    }
    const post = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Blog update error:', err);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// DELETE /api/blog/:id — delete post (admin)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Blog delete error:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

module.exports = router;
