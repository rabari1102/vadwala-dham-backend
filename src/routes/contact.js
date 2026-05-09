const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const ContactMessage = require('../models/ContactMessage');

router.get('/', async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.json(contact || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/message', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Name and message are required' });
    const msg = new ContactMessage({ name, email, phone, message });
    await msg.save();
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
