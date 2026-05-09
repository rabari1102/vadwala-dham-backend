const express = require("express");
const router = express.Router();
const MediaAsset = require("../models/MediaAsset");

router.get("/", async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const media = await MediaAsset.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(media);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await MediaAsset.findById(req.params.id);
    if (!item || !item.isActive) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
