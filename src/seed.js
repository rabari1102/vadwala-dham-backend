require('dotenv').config();
const mongoose = require('mongoose');
const HeroSlide = require('./models/Hero');
const Festival = require('./models/Festival');
const Gallery = require('./models/Gallery');
const Donation = require('./models/Donation');
const SiteContent = require('./models/SiteContent');
const Announcement = require('./models/Announcement');
const Service = require('./models/Service');
const About = require('./models/About');
const Contact = require('./models/Contact');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vadwala_dham');
  console.log('✅ Connected to MongoDB');

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
    { name: 'જન્માષ્ટમી', nameEn: 'Janmashtami', tithi: 'ભાદ્રો સુદ ૮', description: 'ભગવાન શ્રી કૃષ્ણના જન્મોત્સવ', isUpcoming: true, order: 1 },
    { name: 'દિવાળી ઉત્સવ', nameEn: 'Diwali Festival', tithi: 'કારતક સુદ ૧૫', description: 'દીપોત્સવ - ૫ દિવસ', isUpcoming: true, order: 2 },
    { name: 'હોળી - ધૂળેટી', nameEn: 'Holi - Dhuleti', tithi: 'ફાગણ સુદ ૧૫', description: 'રંગોત્સવ', isUpcoming: true, order: 3 },
    { name: 'ગુરુ પૂર્ણિમા', nameEn: 'Guru Purnima', tithi: 'અષાઢ સુદ ૧૫', description: 'ગુરુ પૂજા ઉત્સવ', isUpcoming: false, order: 4 },
  ]);

  await Service.deleteMany();
  await Service.insertMany([
    { title: 'અન્નક્ષેત્ર', titleEn: 'Annakshetra', description: '૨૪ × ૭ નિઃ શુલ્ક ભોજન સેવા. દરરોજ હજારો ભક્તોને ભોજન પ્રસાદ.', descriptionEn: '24x7 free food service. Thousands of devotees fed daily.', icon: '🍱', order: 1, isActive: true },
    { title: 'ગૌ સેવા', titleEn: 'Gau Seva', description: 'ગૌ માતાની સેવા અને સંરક્ષણ. ૨૦૦ થી વધુ ગાયો.', descriptionEn: 'Cow protection and service. More than 200 cows.', icon: '🐄', order: 2, isActive: true },
    { title: 'ધ્વજ ચઢાવ', titleEn: 'Dhwaj Chadav', description: 'ધ્વજ ચઢાવ સેવા - વ્યક્તિ/પરિવાર માટે.', descriptionEn: 'Flag hoisting seva for individuals and families.', icon: '🚩', order: 3, isActive: true },
    { title: 'શૈક્ષણિક સેવા', titleEn: 'Education Service', description: 'છાત્રાલય, વિદ્યાર્થી ભોજન, ગ્રામ-શ્રેણી.', descriptionEn: 'Hostel, student meals, village-level education.', icon: '📚', order: 4, isActive: true },
    { title: 'ધર્મશાળા', titleEn: 'Dharamshala', description: 'ભક્તો માટે નિઃ શુલ્ક આવાસ સુવિધા.', descriptionEn: 'Free accommodation for devotees.', icon: '🏠', order: 5, isActive: true },
    { title: 'ઔષધ સેવા', titleEn: 'Medical Seva', description: 'ગ્રામ-વિસ્તારોમાં ઔષધ વિતરણ.', descriptionEn: 'Medicine distribution in rural areas.', icon: '💊', order: 6, isActive: true },
  ]);

  await About.deleteMany();
  await About.create({
    title: 'શ્રી વડ વાળા ધામ - દૂધરેજ',
    titleEn: 'Shri Vadwala Dham - Dudhrej',
    description: 'ગુજરાત રાજ્યના સૌરાષ્ટ્ર વિભાગમાં આવેલ દૂધરેજ ધામ ભારતના પ્રસિદ્ધ ધાર્મિક સ્થળોમાં ગણાય છે. અહીં ભગવાન શ્રી કૃષ્ણ અને ગૌ-ભક્તિ ની અદ્ભુત સેવા ચાલે છે.',
    descriptionEn: 'Dudhrej Dham, located in Saurashtra region of Gujarat, is one of the famous religious sites of India. Here, wonderful seva of Lord Krishna and cow devotion takes place.',
    highlights: ['૨૪×૭ અન્નક્ષેત્ર', '૨૦૦+ ગૌ-ભક્તિ', 'ધ્વજ ચઢાવ સેવા', 'ધર્મશાળા', 'શૈક્ષણિક સેવા'],
  });

  await Donation.deleteMany();
  await Donation.create({
    bankName: 'State Bank of India',
    accountName: 'Shri Vadwala Dham Trust',
    accountNumber: '00000000000000',
    ifscCode: 'SBIN0000000',
    upiId: 'vadwaladham@sbi',
    description: 'આપના દાનથી અન્નક્ષેત્ર, ગૌ-સેવા અને શૈક્ષણિક કાર્ય ચાલે છે.',
    schemes: [
      { name: 'અન્નક્ષેત્ર', amount: 1100, description: 'એક દિવસ અન્નક્ષેત્ર સ્પોન્સર' },
      { name: 'ગૌ-ભક્તિ', amount: 5100, description: 'ગૌ-ભક્તિ ૧ મહિના' },
      { name: 'ધ્વજ ચઢાવ', amount: 2100, description: 'ધ્વજ ચઢાવ સેવા' },
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
    { key: 'site_title', value: 'શ્રી વડ વાળા ધામ - દૂધરેજ', type: 'text', label: 'Site Title' },
    { key: 'site_title_en', value: 'Shri Vadwala Dham - Dudhrej', type: 'text', label: 'Site Title (English)' },
    { key: 'hero_subtitle', value: 'દૂધરેજ, ગુજરાત', type: 'text', label: 'Hero Subtitle' },
    { key: 'annakshetra_text', value: '૨૪ × ૭ નિઃ શુલ્ક ભોજન સેવા', type: 'text', label: 'Annakshetra Text' },
    { key: 'footer_text', value: '© 2025 શ્રી વડ વાળા ધામ ટ્રસ્ટ, દૂધરેજ. સર્વ હક્ક સુરક્ષિત.', type: 'text', label: 'Footer Text' },
  ]);

  console.log('✅ Seed data inserted successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
