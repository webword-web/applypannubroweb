// This file contains the configuration data for the website.
// Edit this file to update contacts, hero section, FAQs, testimonials, and other text elements without modifying HTML.

window.adminData = {
  // Global Contact Info
  contacts: {
    whatsappNumber: "918525041700", // Without +, just country code and number
    displayPhone: "8525041700",
    email: "applypannubro@gmail.com",
    workingHours: "24x7 Support Available",
    instagram: "https://www.instagram.com/applypannubro?igsh=MXg4M3Z2eHZqcTFlZQ==",
    facebook: "https://www.facebook.com/applypannubro"
  },

  // Hero Section
  hero: {
    title: "APPLY PANNU BRO",
    subtitle: "One Stop Solution For All Your Needs",
    searchPlaceholder: "Search services (e.g. PAN, Aadhaar)...",
    buttons: {
      servicesText: "அனைத்து சேவைகள்",
      whatsappText: "WhatsApp Now",
      callText: "Call Now",
      jobUpdatesText: "📢 Government & Private Job Updates" // New Button
    }
  },

  // Trust Badges
  trustBadges: [
    { icon: "fa-solid fa-shield-halved", text: "நம்பகமான சேவை" },
    { icon: "fa-solid fa-bolt", text: "வேகமான சேவை" },
    { icon: "fa-solid fa-user-tie", text: "நிபுணர் ஆதரவு" },
    { icon: "fa-solid fa-face-smile", text: "100% திருப்தி" }
  ],

  // Statistics
  stats: [
    { number: 60, label: "Services" },
    { number: 5000, label: "Happy Customers" },
    { number: 99, label: "Success Rate", suffix: "%" },
    { number: "24x7", label: "Support", isString: true } // isString prevents animation logic
  ],

  // Frequently Asked Questions
  faq: [
    {
      question: "PAN எப்படி Apply செய்வது?",
      answer: "உங்கள் ஆதார் அட்டை மற்றும் புகைப்படம் இருந்தால் போதும். நாங்கள் ஆன்லைனில் விண்ணப்பித்து தருவோம்."
    },
    {
      question: "Aadhaar Update எவ்வளவு நேரம்?",
      answer: "விண்ணப்பித்த 3 முதல் 7 நாட்களுக்குள் மாற்றம் செய்யப்படும்."
    },
    {
      question: "WhatsApp மூலம் சேவை பெற முடியுமா?",
      answer: "ஆம், உங்கள் ஆவணங்களை WhatsApp மூலம் அனுப்பி சேவைகளை பெற்றுக்கொள்ளலாம்."
    }
  ],

  // Footer Section
  footer: {
    description: "உங்கள் அனைத்து ஆன்லைன் அரசு மற்றும் தனியார் சேவைகளுக்கும் ஒரே தீர்வு.",
    copyrightYear: new Date().getFullYear(),
    companyName: "APPLY PANNU BRO"
  }
};
