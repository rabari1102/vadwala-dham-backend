const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');

router.get('/', async (req, res) => {
  try {
    const items = await SiteContent.find();
    const map = {};
    items.forEach(i => { map[i.key] = i.value; });
    res.json(map);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:key', async (req, res) => {
  try {
    const item = await SiteContent.findOne({ key: req.params.key });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
