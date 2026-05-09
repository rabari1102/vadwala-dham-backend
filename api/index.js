require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// MongoDB connection with caching for serverless
let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vadwala_dham';
  await mongoose.connect(uri);
  cachedDb = mongoose.connection;
  console.log('✅ MongoDB connected');
  return cachedDb;
}

// Connect on every request (cached after first)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/hero', require('../src/routes/hero'));
app.use('/api/announcements', require('../src/routes/announcements'));
app.use('/api/about', require('../src/routes/about'));
app.use('/api/acharyas', require('../src/routes/acharyas'));
app.use('/api/services', require('../src/routes/services'));
app.use('/api/festivals', require('../src/routes/festivals'));
app.use('/api/events', require('../src/routes/festivals'));
app.use('/api/gallery', require('../src/routes/gallery'));
app.use('/api/dhaja-chadava', require('../src/routes/dhajaChadava'));
app.use('/api/contact', require('../src/routes/contact'));
app.use('/api/donation', require('../src/routes/donation'));
app.use('/api/donations', require('../src/routes/donation'));
app.use('/api/content', require('../src/routes/content'));
app.use('/api/admin', require('../src/routes/admin'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.get('/', (_, res) => res.json({ message: 'Vadwala Dham API is running', version: '1.0.0' }));

// ── SEED ENDPOINT ──────────────────────────────────────────────────────────────
// GET /api/seed?secret=YOUR_SEED_SECRET  →  populates DB with initial data
// Remove or disable after first use!
app.get('/api/seed', async (req, res) => {
  const secret = process.env.SEED_SECRET || 'vadwala2025';
  if (req.query.secret !== secret) {
    return res.status(403).json({ error: 'Forbidden – wrong secret' });
  }
  try {
    const HeroSlide    = require('../src/models/Hero');
    const Festival     = require('../src/models/Festival');
    const Gallery      = require('../src/models/Gallery');
    const Donation     = require('../src/models/Donation');
    const SiteContent  = require('../src/models/SiteContent');
    const Announcement = require('../src/models/Announcement');
    const Service      = require('../src/models/Service');
    const About        = require('../src/models/About');
    const Contact      = require('../src/models/Contact');

    await HeroSlide.deleteMany();
    await HeroSlide.insertMany([
      { imageUrl: 'https://images.unsplash.com/photo-1545156521-8f3caad6c45d?w=1200', tagline: 'શ્રી વડ વાળા ધામ - દૂધરેજ', taglineEn: 'Shri Vadwala Dham - Dudhrej', order: 1, isActive: true },
      { imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200', tagline: 'જય શ્રી ક્રૃષ્ણ', taglineEn: 'Jai Shri Krishna', order: 2, isActive: true },
      { imageUrl: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200', tagline: 'અન્નક્ષેત્ર - ૨૪ × ૭ ભોજન સેવા', taglineEn: 'Annakshetra - 24x7 Free Food Service', order: 3, isActive: true },
    ]);

    await Announcement.deleteMany();
    await Announcement.insertMany([
      { text: 'જન્માષ્ટમી ઉત્સવ - ભાદ્રો સુદ ૮', textEn: 'Janmashtami Festival - Bhadra Sud 8', isActive: true, order: 1 },
      { text: 'અન્નક્ષેત્રમાં દરરોજ ૨૪ × ૭ ભોજન પ્રસાદ', textEn: 'Free food prasad 24x7 at Annakshetra', isActive: true, order: 2 },
      { text: 'ધ્વજ ચઢાવ સેવા માટે સંપર્ક કરો', textEn: 'Contact for Dhwaj Chadav Seva', isActive: true, order: 3 },
    ]);

    await Festival.deleteMany();
    await Festival.insertMany([
      { name: 'જન્માષ્ટમી', nameEn: 'Janmashtami', tithi: 'ભાદ્રો સુદ ૮', description: 'ભગવાન શ્રી કૃષ્ણના જન્મોત્સવ - ભવ્ય ઉજવણી', isUpcoming: true, order: 1 },
      { name: 'દિવાળી ઉત્સવ', nameEn: 'Diwali Festival', tithi: 'કારતક સુદ ૧૫', description: 'દીપોત્સવ - ૫ દિવસ ભવ્ય ઉજવણી', isUpcoming: true, order: 2 },
      { name: 'હોળી - ધૂળેટી', nameEn: 'Holi - Dhuleti', tithi: 'ફાગણ સુદ ૧૫', description: 'રંગોત્સવ - ભવ્ય ઉજવણી', isUpcoming: true, order: 3 },
      { name: 'ગુરુ પૂર્ણિમા', nameEn: 'Guru Purnima', tithi: 'અષાઢ સુદ ૧૫', description: 'ગુરુ પૂજા ઉત્સવ', isUpcoming: false, order: 4 },
      { name: 'રામ નવમી', nameEn: 'Ram Navami', tithi: 'ચૈત્ર સુદ ૯', description: 'ભગવાન રામ જન્મ ઉત્સવ', isUpcoming: false, order: 5 },
      { name: 'મહા શિવરાત્રી', nameEn: 'Maha Shivratri', tithi: 'ફાગણ વદ ૧૩', description: 'ભગવાન શિવ ઉત્સવ', isUpcoming: false, order: 6 },
    ]);

    await Service.deleteMany();
    await Service.insertMany([
      { title: 'અન્નક્ષેત્ર', titleEn: 'Annakshetra', description: '૨૪ × ૭ નિઃ શુલ્ક ભોજન સેવા. દરરોજ હજારો ભક્તોને ભોજન પ્રસાદ. ૧ જૂન ૧૯૭૮ થી અવિરત ચાલુ.', descriptionEn: '24x7 free food service. Thousands of devotees fed daily. Running since 1 June 1978.', icon: '🍱', order: 1, isActive: true },
      { title: 'ગૌ-ભક્તિ / ગૌ-સેવા', titleEn: 'Gau Seva / Cow Protection', description: 'ગૌ માતાની સેવા અને સંરક્ષણ. ૨૦૦ થી વધુ ગાયો. ગૌ-ભક્તિ ૧ મહિના ₹5100.', descriptionEn: 'Cow protection and care. 200+ cows. Monthly gau-bhakti ₹5100.', icon: '🐄', order: 2, isActive: true },
      { title: 'ધ્વજ ચઢાવ સેવા', titleEn: 'Dhwaj Chadav Seva', description: 'ધ્વજ ચઢાવ સેવા - વ્યક્તિ/પરિવાર/ગ્રુપ માટે ₹2100.', descriptionEn: 'Flag hoisting seva for individuals, families and groups. ₹2100.', icon: '🚩', order: 3, isActive: true },
      { title: 'શૈક્ષણિક સેવા', titleEn: 'Education Seva', description: 'છાત્રાલય, વિદ્યાર્થી ભોજન, ગ્રામ-શ્રેણી. ગ્રામ-વિસ્તારોમાં શિક્ષણ.', descriptionEn: 'Hostel, student meals, village-level education programs.', icon: '📚', order: 4, isActive: true },
      { title: 'ધર્મશાળા', titleEn: 'Dharamshala', description: 'ભક્તો માટે નિઃ શુલ્ક આવાસ સુવિધા. ગ્રામ, ચર-ધામ, મહા-કુંભ.', descriptionEn: 'Free accommodation for devotees at dham, char-dham and Kumbh Mela.', icon: '🏠', order: 5, isActive: true },
      { title: 'ઔષધ / દવા સેવા', titleEn: 'Medical Seva', description: 'ગ્રામ-વિસ્તારોમાં ઔષધ વિતરણ. આકસ્મિક આર્થિક સહાય.', descriptionEn: 'Medicine distribution and emergency financial aid in rural areas.', icon: '💊', order: 6, isActive: true },
    ]);

    await About.deleteMany();
    await About.create({
      title: 'શ્રી વડ વાળા ધામ - દૂધરેજ',
      titleEn: 'Shri Vadwala Dham - Dudhrej',
      description: 'ગુજરાત રાજ્યના સૌરાષ્ટ્ર વિભાગમાં આવેલ દૂધરેજ ધામ ભારતના પ્રસિદ્ધ ધાર્મિક સ્થળોમાં ગણાય છે. અહીં ભગવાન શ્રી કૃષ્ણ અને ગૌ-ભક્તિ ની અદ્ભુત સેવા ૧ જૂન ૧૯૭૮ થી અવિરત ચાલે છે. સ્વામી ભક્તિ-પ્રિયદાસજીના માર્ગદર્શનમાં દૂધરેજ ધામ ગ્રામ, રાષ્ટ્ર અને સેવા ના ત્રણ સ્તંભ ઉપર ઊભું છે.',
      descriptionEn: 'Dudhrej Dham, located in the Saurashtra region of Gujarat, is one of the famous religious sites of India. Under the guidance of Swami Bhakti-Priyadasji, wonderful seva of Lord Krishna and cow devotion has been running continuously since 1 June 1978. The dham stands on three pillars: Village, Nation and Seva.',
      highlights: ['૨૪×૭ અન્નક્ષેત્ર (૧૯૭૮ થી)', '૨૦૦+ ગૌ-ભક્તિ', 'ધ્વજ ચઢાવ સેવા', 'ધર્મશાળા - ચાર-ધામ', 'શૈક્ષણિક સેવા', 'ઔષધ વિતરણ'],
    });

    await Gallery.deleteMany();
    await Gallery.insertMany([
      { title: 'મુખ્ય મંદિર', titleEn: 'Main Temple', imageUrl: 'https://images.unsplash.com/photo-1545156521-8f3caad6c45d?w=800', category: 'temple', order: 1, isActive: true },
      { title: 'અન્નક્ષેત્ર', titleEn: 'Annakshetra', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', category: 'seva', order: 2, isActive: true },
      { title: 'ગૌ-સેવા', titleEn: 'Gau Seva', imageUrl: 'https://images.unsplash.com/photo-1602144779775-74723e50a880?w=800', category: 'gaushala', order: 3, isActive: true },
      { title: 'ધ્વજ ચઢાવ', titleEn: 'Dhwaj Chadav', imageUrl: 'https://images.unsplash.com/photo-1610289982320-1a4a2b5bdf68?w=800', category: 'festival', order: 4, isActive: true },
      { title: 'જન્માષ્ટમી ઉત્સવ', titleEn: 'Janmashtami Festival', imageUrl: 'https://images.unsplash.com/photo-1609942072337-c3370e820005?w=800', category: 'festival', order: 5, isActive: true },
      { title: 'ભક્ત-દર્શન', titleEn: 'Devotee Gathering', imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800', category: 'devotees', order: 6, isActive: true },
    ]);

    await Donation.deleteMany();
    await Donation.create({
      bankName: 'State Bank of India',
      accountName: 'Shri Vadwala Dham Trust',
      accountNumber: '00000000000000',
      ifscCode: 'SBIN0000000',
      upiId: 'vadwaladham@sbi',
      description: 'આપના દાનથી અન્નક્ષેત્ર, ગૌ-સેવા, શૈક્ષણિક અને સ્વાસ્થ્ય કાર્ય ચાલે છે. દાન ૮૦G હેઠળ આવકવેરા મુક્તિ.',
      descriptionEn: 'Your donation runs Annakshetra, Gau-Seva, education and health programs. Donations exempt under 80G.',
      schemes: [
        { name: 'અન્નક્ષેત્ર સ્પોન્સર', amount: 1100, description: 'એક દિવસ અન્નક્ષેત્ર સ્પોન્સર - ₹1100' },
        { name: 'ગૌ-ભક્તિ (૧ મહિના)', amount: 5100, description: 'એક ગૌ-ભક્તિ ૧ મહિના - ₹5100' },
        { name: 'ધ્વજ ચઢાવ', amount: 2100, description: 'ધ્વજ ચઢાવ સેવા - ₹2100' },
        { name: 'વિશેષ સહયોગ', amount: 11000, description: 'ઉત્સવ / ધર્મ કાર્ય વિશેષ સહયોગ - ₹11000' },
      ],
    });

    await Contact.deleteMany();
    await Contact.create({
      address: 'શ્રી વડ વાળા ધામ, દૂધરેજ, જિ. સુરેન્દ્રનગર, ગુજરાત - ૩૬૩૦૪૦',
      addressEn: 'Shri Vadwala Dham, Dudhrej, Dist. Surendranagar, Gujarat - 363040',
      phone: ['+91 98765 43210', '+91 98765 43211'],
      email: 'info@dudhrejvadwala.com',
      timings: 'સવારે ૫:૦૦ - રાત્રે ૧૦:૦૦',
    });

    await SiteContent.deleteMany();
    await SiteContent.insertMany([
      { key: 'site_title', value: 'શ્રી વડ વાળા ધામ - દૂધરેજ', type: 'text', label: 'Site Title (Gujarati)' },
      { key: 'site_title_en', value: 'Shri Vadwala Dham - Dudhrej', type: 'text', label: 'Site Title (English)' },
      { key: 'hero_subtitle', value: 'દૂધરેજ, જિ. સુરેન્દ્રનગર, ગુજરાત', type: 'text', label: 'Hero Subtitle' },
      { key: 'annakshetra_text', value: '૧ જૂન ૧૯૭૮ થી ૨૪ × ૭ નિઃ શુલ્ક ભોજન સેવા', type: 'text', label: 'Annakshetra Text' },
      { key: 'footer_text', value: '© 2025 શ્રી વડ વાળા ધામ ટ્રસ્ટ, દૂધરેજ. સર્વ હક્ક સુરક્ષિત.', type: 'text', label: 'Footer Text' },
      { key: 'welcome_msg', value: 'જય શ્રી ક્રૃષ્ણ ! આપનું સ્વાગત છે', type: 'text', label: 'Welcome Message' },
      { key: 'kumbh_anna', value: 'મહા-કુંભ અને ચર-ધામ ક્ષેત્રોમાં અન્નક્ષેત્ર સેવા', type: 'text', label: 'Kumbh Annakshetra' },
      { key: 'emergency_help', value: 'આકસ્મિક / કુદરતી આફત સમયે આર્થિક સહાય', type: 'text', label: 'Emergency Help' },
    ]);

    res.json({
      success: true,
      message: '✅ Database seeded successfully with all Vadwala Dham content!',
      collections: ['HeroSlide (3)', 'Announcement (3)', 'Festival (6)', 'Service (6)', 'About (1)', 'Gallery (6)', 'Donation (1)', 'Contact (1)', 'SiteContent (8)']
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});
// ── END SEED ENDPOINT ──────────────────────────────────────────────────────────

// For local dev only
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
