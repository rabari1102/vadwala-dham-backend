const mongoose = require("mongoose");

const pageSectionSchema = new mongoose.Schema(
  {
    key: { type: String },
    title: { type: String },
    titleEn: { type: String },
    body: { type: mongoose.Schema.Types.Mixed },
    imageUrls: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleEn: { type: String },
    menuLabel: { type: String },
    menuLabelEn: { type: String },
    content: { type: mongoose.Schema.Types.Mixed },
    sections: [pageSectionSchema],
    seo: {
      title: { type: String },
      description: { type: String },
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Page", pageSchema);
