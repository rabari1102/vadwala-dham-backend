const express = require('express');
const router = express.Router();
const Festival = require('../models/Festival');

router.get('/', async (req, res) => {
  try {
    const items = await Festival.find().sort({ order: 1, date: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/upcoming', async (req, res) => {
  try {
    const items = await Festival.find({ isUpcoming: true }).sort({ date: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Festival.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
