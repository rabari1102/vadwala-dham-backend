const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Types } = require('mongoose');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const Admin = require('../models/Admin');
const Festival = require('../models/Festival');
const Gallery = require('../models/Gallery');
const Donation = require('../models/Donation');
const ContactMessage = require('../models/ContactMessage');
const SiteContent = require('../models/SiteContent');
const HeroSlide = require('../models/Hero');
const Announcement = require('../models/Announcement');
const Service = require('../models/Service');
const About = require('../models/About');
const Acharya = require('../models/Acharya');
const DhajaChadava = require('../models/DhajaChadava');
const Contact = require('../models/Contact');
const Page = require('../models/Page');
const MediaAsset = require('../models/MediaAsset');
const { importLiveSiteContent } = require('../services/liveSiteImporter');

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET = JWT_SECRET || 'vadwala_dham_dev_secret_key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts. Try again in 15 minutes.' }, standardHeaders: true, legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: { error: 'Too many requests.' }, standardHeaders: true, legacyHeaders: false });

function isValidObjectId(id) { return Types.ObjectId.isValid(id); }

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'admin');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'media';
    cb(null, `${Date.now()}-${base}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  },
});

// POST /api/admin/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    let admin = await Admin.findOne({ username });
    if (admin) {
      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    } else {
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, SECRET, { expiresIn: '8h' });
    res.json({ token, username });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// HERO
router.post('/hero', adminLimiter, auth, async (req, res) => { try { const item = new HeroSlide(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/hero/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/hero/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await HeroSlide.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// ANNOUNCEMENTS
router.post('/announcements', adminLimiter, auth, async (req, res) => { try { const item = new Announcement(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/announcements/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/announcements/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await Announcement.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// EVENTS / FESTIVALS
router.post('/events', adminLimiter, auth, async (req, res) => { try { const item = new Festival(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/events/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await Festival.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/events/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await Festival.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// GALLERY
router.post('/gallery', adminLimiter, auth, async (req, res) => { try { const item = new Gallery(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/gallery/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/gallery/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// SERVICES
router.post('/services', adminLimiter, auth, async (req, res) => { try { const item = new Service(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/services/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/services/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// ABOUT
router.put('/about', adminLimiter, auth, async (req, res) => { try { const doc = await About.findOneAndUpdate({}, req.body, { new: true, upsert: true }); res.json(doc); } catch (e) { res.status(400).json({ error: e.message }); } });

// ACHARYAS
router.post('/acharyas', adminLimiter, auth, async (req, res) => { try { const item = new Acharya(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/acharyas/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await Acharya.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/acharyas/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await Acharya.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// DHAJA CHADAVA
router.post('/dhaja-chadava', adminLimiter, auth, async (req, res) => { try { const item = new DhajaChadava(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/dhaja-chadava/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await DhajaChadava.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/dhaja-chadava/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await DhajaChadava.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// DONATIONS
router.put('/donations', adminLimiter, auth, async (req, res) => { try { const doc = await Donation.findOneAndUpdate({}, req.body, { new: true, upsert: true }); res.json(doc); } catch (e) { res.status(400).json({ error: e.message }); } });

// CONTACT INFO
router.put('/contact', adminLimiter, auth, async (req, res) => { try { const doc = await Contact.findOneAndUpdate({}, req.body, { new: true, upsert: true }); res.json(doc); } catch (e) { res.status(400).json({ error: e.message }); } });

// SITE CONTENT
router.put('/content/:key', adminLimiter, auth, async (req, res) => { try { const { value, type, label } = req.body; const doc = await SiteContent.findOneAndUpdate({ key: req.params.key }, { value, type: type || 'text', label }, { new: true, upsert: true }); res.json(doc); } catch (e) { res.status(400).json({ error: e.message }); } });

// CONTACT MESSAGES
router.get('/contact-messages', adminLimiter, auth, async (req, res) => { try { const messages = await ContactMessage.find().sort({ createdAt: -1 }); res.json(messages); } catch (e) { res.status(500).json({ error: e.message }); } });
router.patch('/contact-messages/:id/read', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }); res.json(msg); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/contact-messages/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await ContactMessage.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// PAGES
router.get('/pages', adminLimiter, auth, async (_req, res) => { try { const pages = await Page.find().sort({ order: 1, createdAt: 1 }); res.json(pages); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/pages', adminLimiter, auth, async (req, res) => { try { const page = new Page(req.body); await page.save(); res.status(201).json(page); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/pages/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!page) return res.status(404).json({ error: 'Not found' }); res.json(page); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/pages/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await Page.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// MEDIA
router.get('/media', adminLimiter, auth, async (req, res) => { try { const filter = {}; if (req.query.category) filter.category = req.query.category; const media = await MediaAsset.find(filter).sort({ order: 1, createdAt: -1 }); res.json(media); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/media', adminLimiter, auth, async (req, res) => { try { const item = new MediaAsset(req.body); await item.save(); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.post('/media/upload', adminLimiter, auth, upload.single('image'), async (req, res) => { try { if (!req.file) return res.status(400).json({ error: 'Image file is required' }); const item = await MediaAsset.create({ title: req.body.title || req.file.originalname, alt: req.body.alt || req.body.title || req.file.originalname, localUrl: `/uploads/admin/${req.file.filename}`, fileName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size, category: req.body.category || 'general', order: Number(req.body.order) || 0, isActive: req.body.isActive !== 'false' }); res.status(201).json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/media/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { const item = await MediaAsset.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/media/:id', adminLimiter, auth, async (req, res) => { if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ID' }); try { await MediaAsset.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// LIVE SITE IMPORT
router.post('/import-live-site', adminLimiter, auth, async (req, res) => {
  try {
    const result = await importLiveSiteContent({
      baseUrl: `${req.protocol}://${req.get('host')}`,
      downloadImages: req.body.downloadImages !== false,
      reset: req.body.reset !== false,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
