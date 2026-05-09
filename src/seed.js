require("dotenv").config();
const mongoose = require("mongoose");
const { importLiveSiteContent } = require("./services/liveSiteImporter");

async function seed() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/vadwala_dham",
  );
  console.log("Connected to MongoDB");

  const result = await importLiveSiteContent({
    reset: true,
    downloadImages: true,
  });

  console.log("Seed data inserted successfully:", result);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
