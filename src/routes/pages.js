const express = require("express");
const router = express.Router();
const Page = require("../models/Page");

router.get("/", async (req, res) => {
  try {
    const filter = { isPublished: true };
    const pages = await Page.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(pages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug,
      isPublished: true,
    });
    if (!page) return res.status(404).json({ error: "Not found" });
    res.json(page);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
