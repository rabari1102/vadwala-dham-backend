const { downloadLiveSiteMedia } = require("../services/liveSiteImporter");

downloadLiveSiteMedia()
  .then((assets) => {
    console.log(`Downloaded ${assets.length} live site assets.`);
    assets.forEach((asset) => console.log(`${asset.localUrl} <- ${asset.url}`));
  })
  .catch((err) => {
    console.error("Asset download failed:", err);
    process.exit(1);
  });
