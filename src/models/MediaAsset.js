const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    title: { type: String },
    alt: { type: String },
    sourceUrl: { type: String },
    localUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    category: { type: String, default: "general" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ sourceUrl: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("MediaAsset", mediaAssetSchema);
