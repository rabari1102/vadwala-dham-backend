const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

router.get('/', async (req, res) => {
  try {
    const donation = await Donation.findOne();
    res.json(donation || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
