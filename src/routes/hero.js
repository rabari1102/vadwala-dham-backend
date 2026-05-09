const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/Hero');

router.get('/', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    res.json(slides);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Not found' });
    res.json(slide);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
