const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

router.get('/', async (req, res) => {
  try {
    const items = await Service.find({ isActive: true }).sort({ order: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
