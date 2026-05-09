const fs = require("fs/promises");
const path = require("path");
const HeroSlide = require("../models/Hero");
const Gallery = require("../models/Gallery");
const Donation = require("../models/Donation");
const SiteContent = require("../models/SiteContent");
const About = require("../models/About");
const Contact = require("../models/Contact");
const Page = require("../models/Page");
const MediaAsset = require("../models/MediaAsset");

const source = "https://dudhrejvadwala.com";

const pageSources = [
  { slug: "home", path: "/", menuLabel: "Home", order: 1 },
  { slug: "history", path: "/history/", menuLabel: "History", order: 2 },
  { slug: "gallery", path: "/gallery/", menuLabel: "Gallery", order: 3 },
  { slug: "video", path: "/video/", menuLabel: "Video", order: 4 },
  { slug: "donate", path: "/donate/", menuLabel: "Donate", order: 5 },
  { slug: "contact", path: "/contact/", menuLabel: "Contact", order: 6 },
];

function absoluteUrl(value, pageUrl = source) {
  if (!value) return null;
  return new URL(value, pageUrl).toString();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " "));
}

function compactText(value) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleFromUrl(url) {
  const pathname = new URL(url).pathname;
  const name = path.basename(pathname, path.extname(pathname));
  return decodeURIComponent(name).replace(/[-_]+/g, " ").trim() || "media";
}

function categoryFromUrl(url, pageSlug) {
  const lower = url.toLowerCase();
  if (lower.includes("logo")) return "branding";
  if (lower.includes("qr")) return "donation";
  if (lower.includes("guru") || lower.includes("holi") || lower.includes("janmashtami") || lower.includes("dipavali")) return "festival";
  return pageSlug || "general";
}

function extensionFromUrl(url, contentType) {
  const parsedExt = path.extname(new URL(url).pathname);
  if (parsedExt) return parsedExt;
  if (contentType && contentType.includes("png")) return ".png";
  if (contentType && contentType.includes("webp")) return ".webp";
  if (contentType && contentType.includes("jpeg")) return ".jpeg";
  return ".jpg";
}

async function fetchHtml(pageUrl) {
  const response = await fetch(pageUrl);
  if (!response.ok) throw new Error(`Failed to fetch ${pageUrl}: ${response.status}`);
  return response.text();
}

function extractTitle(html, fallback) {
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (heading) return compactText(stripTags(heading[1]));

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return compactText(stripTags(title[1]).replace(/\s+[–-]\s+Dudhrej.*$/i, ""));

  return fallback;
}

function extractBodyText(html) {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const withoutNoise = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  return compactText(stripTags(withoutNoise));
}

function extractImageUrls(html, pageUrl) {
  const urls = new Set();
  const imgTagRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const uploadUrlRe = /https:\/\/dudhrejvadwala\.com\/wp-content\/uploads\/[^"'()<>\s]+/gi;

  for (const match of html.matchAll(imgTagRe)) {
    const url = absoluteUrl(match[1], pageUrl);
    if (url) urls.add(url);
  }

  for (const match of html.matchAll(uploadUrlRe)) {
    urls.add(match[0]);
  }

  return [...urls].filter((url) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url));
}

async function scrapePages() {
  const pages = [];
  const media = new Map();

  for (const page of pageSources) {
    const pageUrl = absoluteUrl(page.path);
    const html = await fetchHtml(pageUrl);
    const imageUrls = extractImageUrls(html, pageUrl);

    imageUrls.forEach((url) => {
      if (!media.has(url)) {
        media.set(url, {
          title: titleFromUrl(url),
          category: categoryFromUrl(url, page.slug),
          url,
        });
      }
    });

    pages.push({
      slug: page.slug,
      title: extractTitle(html, page.menuLabel),
      menuLabel: page.menuLabel,
      content: {
        sourceUrl: pageUrl,
        text: extractBodyText(html),
        imageSourceUrls: imageUrls,
      },
      sections: [],
      order: page.order,
      isPublished: true,
    });
  }

  return { pages, mediaSources: [...media.values()] };
}

async function downloadMedia(media, index) {
  const response = await fetch(media.url);
  if (!response.ok) throw new Error(`Failed to download ${media.url}: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const ext = extensionFromUrl(media.url, contentType);
  const fileName = `${String(index + 1).padStart(2, "0")}-${slugify(media.title)}${ext}`;
  const relativeUrl = `/uploads/live-site/${fileName}`;
  const outputDir = path.join(process.cwd(), "public", "uploads", "live-site");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, fileName), buffer);

  return {
    ...media,
    localUrl: relativeUrl,
    fileName,
    mimeType: contentType,
    size: buffer.length,
  };
}

async function downloadLiveSiteMedia() {
  const { mediaSources } = await scrapePages();
  const downloaded = [];

  for (let i = 0; i < mediaSources.length; i += 1) {
    downloaded.push(await downloadMedia(mediaSources[i], i));
  }

  return downloaded;
}

function localizePageImages(pages, mediaBySourceUrl) {
  return pages.map((page) => {
    const imageUrls = page.content.imageSourceUrls
      .map((sourceUrl) => mediaBySourceUrl.get(sourceUrl)?.localUrl || sourceUrl)
      .filter(Boolean);

    return {
      ...page,
      content: {
        ...page.content,
        imageUrls,
      },
    };
  });
}

function extractContact(pages) {
  const text = pages.map((page) => page.content.text).join("\n");
  return {
    address: "શ્રી વડવાળા મંદિર દુધરેજધામ દુધરેજ સુરેન્દ્રનગર (ગુજરાત) - 363040",
    phone: [...new Set(text.match(/\b\d{10}\b/g) || [])],
    email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0],
  };
}

async function importLiveSiteContent(options = {}) {
  const { downloadImages = true, reset = true } = options;
  const scraped = await scrapePages();
  const downloaded = [];

  for (let i = 0; i < scraped.mediaSources.length; i += 1) {
    downloaded.push(
      downloadImages
        ? await downloadMedia(scraped.mediaSources[i], i)
        : {
            ...scraped.mediaSources[i],
            localUrl: scraped.mediaSources[i].url,
            fileName: path.basename(new URL(scraped.mediaSources[i].url).pathname),
          },
    );
  }

  if (reset) {
    await Promise.all([
      HeroSlide.deleteMany({}),
      Gallery.deleteMany({}),
      Donation.deleteMany({}),
      Contact.deleteMany({}),
      SiteContent.deleteMany({}),
      About.deleteMany({}),
      Page.deleteMany({}),
      MediaAsset.deleteMany({}),
    ]);
  }

  const mediaDocs = await MediaAsset.insertMany(
    downloaded.map((item, index) => ({
      title: item.title,
      alt: item.title,
      sourceUrl: item.url,
      localUrl: item.localUrl,
      fileName: item.fileName,
      mimeType: item.mimeType,
      size: item.size,
      category: item.category,
      order: index + 1,
      isActive: true,
    })),
    { ordered: false },
  ).catch(async () => MediaAsset.find({}));

  const mediaBySourceUrl = new Map(downloaded.map((item) => [item.url, item]));
  const pages = localizePageImages(scraped.pages, mediaBySourceUrl);
  await Page.insertMany(pages);

  const galleryItems = downloaded
    .filter((item) => !["branding", "donation"].includes(item.category))
    .map((item, index) => ({
      imageUrl: item.localUrl,
      caption: item.title,
      category: item.category,
      order: index + 1,
      isActive: true,
    }));
  await Gallery.insertMany(galleryItems);

  const heroImages = galleryItems.slice(0, 3);
  await HeroSlide.insertMany(
    heroImages.map((item, index) => ({
      imageUrl: item.imageUrl,
      tagline: pages[index]?.title || pages[0]?.title || "Dudhrej Vadwala",
      order: index + 1,
      isActive: true,
    })),
  );

  const historyPage = pages.find((page) => page.slug === "history");
  if (historyPage) {
    await About.create({
      title: historyPage.title,
      description: historyPage.content.text,
      imageUrl: historyPage.content.imageUrls?.[0],
      highlights: [],
    });
  }

  const contact = extractContact(pages);
  await Contact.create(contact);

  const donationQr = downloaded.find((item) => item.category === "donation");
  await Donation.create({
    description: pages.find((page) => page.slug === "donate")?.content.text,
    upiId: "",
    schemes: [],
  });

  await SiteContent.insertMany([
    { key: "source_website", value: source, type: "text", label: "Original Website" },
    { key: "site_title", value: pages[0]?.title || "Dudhrej Vadwala", type: "text", label: "Site Title" },
    { key: "site_logo", value: downloaded.find((item) => item.category === "branding")?.localUrl, type: "text", label: "Site Logo" },
    { key: "donation_qr", value: donationQr?.localUrl, type: "text", label: "Donation QR" },
  ].filter((item) => item.value));

  return {
    success: true,
    reset,
    downloadedImages: downloaded.length,
    mediaAssets: Array.isArray(mediaDocs) ? mediaDocs.length : downloaded.length,
    pages: pages.length,
  };
}

module.exports = {
  importLiveSiteContent,
  downloadLiveSiteMedia,
};
