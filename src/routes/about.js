const express = require('express');
const router = express.Router();
const About = require('../models/About');

router.get('/', async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
