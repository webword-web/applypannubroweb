// Global Service Data based on User Request
const defaultServicesSeed = [
  // Government Services (1-20)
  { id: 1, title: 'PAN Card Apply', category: 'Government', icon: 'fa-solid fa-id-card', desc: 'புதிய பான் கார்டு விண்ணப்பிக்க', price: '₹200' },
  { id: 2, title: 'PAN Card Correction', category: 'Government', icon: 'fa-solid fa-pen-to-square', desc: 'பான் கார்டு திருத்தம் செய்ய', price: '₹200' },
  { id: 3, title: 'Aadhaar Update', category: 'Government', icon: 'fa-solid fa-fingerprint', desc: 'ஆதார் விபரங்கள் மாற்ற', price: '₹100' },
  { id: 4, title: 'Voter ID Apply', category: 'Government', icon: 'fa-solid fa-person-booth', desc: 'புதிய வாக்காளர் அட்டை', price: '₹50' },
  { id: 5, title: 'Voter ID Correction', category: 'Government', icon: 'fa-solid fa-user-edit', desc: 'வாக்காளர் அட்டை திருத்தம்', price: '₹50' },
  { id: 6, title: 'Passport Apply', category: 'Government', icon: 'fa-solid fa-passport', desc: 'புதிய பாஸ்போர்ட் விண்ணப்பிக்க', price: '₹1800' },
  { id: 7, title: 'Passport Renewal', category: 'Government', icon: 'fa-solid fa-plane-departure', desc: 'பாஸ்போர்ட் புதுப்பிக்க', price: '₹1800' },
  { id: 8, title: 'Driving Licence Services', category: 'Government', icon: 'fa-solid fa-car', desc: 'ஓட்டுநர் உரிமம் சேவைகள்', price: '₹1500' },
  { id: 9, title: 'Learner Licence', category: 'Government', icon: 'fa-solid fa-motorcycle', desc: 'LLR விண்ணப்பிக்க', price: '₹800' },
  { id: 10, title: 'Vehicle RC Services', category: 'Government', icon: 'fa-solid fa-file-contract', desc: 'வாகன RC சேவைகள்', price: '₹500' },
  { id: 11, title: 'Birth Certificate', category: 'Government', icon: 'fa-solid fa-baby', desc: 'பிறப்பு சான்றிதழ் பெற', price: '₹100' },
  { id: 12, title: 'Death Certificate', category: 'Government', icon: 'fa-solid fa-bed', desc: 'இறப்பு சான்றிதழ் பெற', price: '₹100' },
  { id: 13, title: 'Community Certificate', category: 'Government', icon: 'fa-solid fa-users', desc: 'ஜாதி சான்றிதழ் விண்ணப்பிக்க', price: '₹60' },
  { id: 14, title: 'Income Certificate', category: 'Government', icon: 'fa-solid fa-money-bill-wave', desc: 'வருமான சான்றிதழ் விண்ணப்பிக்க', price: '₹60' },
  { id: 15, title: 'Nativity Certificate', category: 'Government', icon: 'fa-solid fa-map-location-dot', desc: 'இருப்பிட சான்றிதழ் விண்ணப்பிக்க', price: '₹60' },
  { id: 16, title: 'Legal Heir Certificate', category: 'Government', icon: 'fa-solid fa-scale-balanced', desc: 'வாரிசு சான்றிதழ் விண்ணப்பிக்க', price: '₹60' },
  { id: 17, title: 'First Graduate Certificate', category: 'Government', icon: 'fa-solid fa-user-graduate', desc: 'முதல் பட்டதாரி சான்றிதழ்', price: '₹60' },
  { id: 18, title: 'Patta & Chitta', category: 'Government', icon: 'fa-solid fa-file-invoice', desc: 'பட்டா, சிட்டா பெற', price: '₹60' },
  { id: 19, title: 'e-Sevai Services', category: 'Government', icon: 'fa-solid fa-desktop', desc: 'அனைத்து இ-சேவை சேவைகள்', price: '₹60' },
  { id: 20, title: 'CSC Services', category: 'Government', icon: 'fa-solid fa-laptop-house', desc: 'பொது சேவை மைய சேவைகள்', price: '₹60' },

  // Education Services (21-28)
  { id: 21, title: 'Scholarship Apply', category: 'Education', icon: 'fa-solid fa-graduation-cap', desc: 'கல்வி உதவித்தொகை விண்ணப்பிக்க', price: '₹100' },
  { id: 22, title: 'College Admission', category: 'Education', icon: 'fa-solid fa-university', desc: 'கல்லூரி சேர்க்கை வழிகாட்டுதல்', price: '₹200' },
  { id: 23, title: 'School Admission', category: 'Education', icon: 'fa-solid fa-school', desc: 'பள்ளி சேர்க்கை வழிகாட்டுதல்', price: '₹100' },
  { id: 24, title: 'Government Exam Apply', category: 'Education', icon: 'fa-solid fa-file-signature', desc: 'அரசு தேர்வு விண்ணப்பிக்க', price: '₹150' },
  { id: 25, title: 'Private Job Apply', category: 'Education', icon: 'fa-solid fa-briefcase', desc: 'தனியார் வேலை விண்ணப்பிக்க', price: '₹100' },
  { id: 26, title: 'Government Job Apply', category: 'Education', icon: 'fa-solid fa-building-columns', desc: 'அரசு வேலை விண்ணப்பிக்க', price: '₹150' },
  { id: 27, title: 'Online Form Filling', category: 'Education', icon: 'fa-solid fa-keyboard', desc: 'ஆன்லைன் படிவம் நிரப்ப', price: '₹50' },
  { id: 28, title: 'Resume Preparation', category: 'Education', icon: 'fa-solid fa-file-lines', desc: 'ரெஸ்யூம் தயார் செய்ய', price: '₹100' },

  // Business Services (29-40)
  { id: 29, title: 'GST Registration', category: 'Business', icon: 'fa-solid fa-file-invoice-dollar', desc: 'ஜிஎஸ்டி பதிவு செய்ய', price: '₹1500' },
  { id: 30, title: 'MSME Registration', category: 'Business', icon: 'fa-solid fa-industry', desc: 'MSME பதிவு செய்ய', price: '₹500' },
  { id: 31, title: 'UDYAM Registration', category: 'Business', icon: 'fa-solid fa-id-badge', desc: 'உதயம் பதிவு செய்ய', price: '₹500' },
  { id: 32, title: 'FSSAI Registration', category: 'Business', icon: 'fa-solid fa-utensils', desc: 'உணவு பாதுகாப்பு பதிவு', price: '₹1000' },
  { id: 33, title: 'Digital Signature (DSC)', category: 'Business', icon: 'fa-solid fa-signature', desc: 'டிஜிட்டல் கையொப்பம் பெற', price: '₹2000' },
  { id: 34, title: 'Income Tax Filing', category: 'Business', icon: 'fa-solid fa-calculator', desc: 'வருமான வரி தாக்கல் செய்ய', price: '₹1000' },
  { id: 35, title: 'Insurance Services', category: 'Business', icon: 'fa-solid fa-shield-heart', desc: 'காப்பீடு சேவைகள்', price: 'Custom' },
  { id: 36, title: 'AEPS Banking', category: 'Business', icon: 'fa-solid fa-money-check-dollar', desc: 'ஆதார் மூலம் பணம் எடுக்க', price: 'Free' },
  { id: 37, title: 'Money Transfer', category: 'Business', icon: 'fa-solid fa-money-bill-transfer', desc: 'பணப்பரிமாற்றம் செய்ய', price: 'Standard' },
  { id: 38, title: 'Mobile Recharge', category: 'Business', icon: 'fa-solid fa-mobile-screen', desc: 'மொபைல் ரீசார்ஜ் செய்ய', price: 'Free' },
  { id: 39, title: 'DTH Recharge', category: 'Business', icon: 'fa-solid fa-satellite-dish', desc: 'DTH ரீசார்ஜ் செய்ய', price: 'Free' },
  { id: 40, title: 'FASTag Recharge', category: 'Business', icon: 'fa-solid fa-car-side', desc: 'ஃபாஸ்டாக் ரீசார்ஜ் செய்ய', price: 'Free' },

  // Payment & Booking Services (41-60)
  { id: 41, title: 'Electricity Bill Payment', category: 'Payment', icon: 'fa-solid fa-lightbulb', desc: 'மின்சார கட்டணம் செலுத்த', price: 'Free' },
  { id: 42, title: 'Water Bill Payment', category: 'Payment', icon: 'fa-solid fa-faucet-drip', desc: 'தண்ணீர் கட்டணம் செலுத்த', price: 'Free' },
  { id: 43, title: 'Property Tax Payment', category: 'Payment', icon: 'fa-solid fa-house-chimney', desc: 'சொத்து வரி செலுத்த', price: 'Free' },
  { id: 44, title: 'Train Ticket Booking', category: 'Booking', icon: 'fa-solid fa-train', desc: 'ரயில் டிக்கெட் பதிவு செய்ய', price: 'Custom' },
  { id: 45, title: 'Bus Ticket Booking', category: 'Booking', icon: 'fa-solid fa-bus', desc: 'பேருந்து டிக்கெட் பதிவு செய்ய', price: 'Custom' },
  { id: 46, title: 'Flight Ticket Booking', category: 'Booking', icon: 'fa-solid fa-plane', desc: 'விமான டிக்கெட் பதிவு செய்ய', price: 'Custom' },
  { id: 47, title: 'Hotel Booking', category: 'Booking', icon: 'fa-solid fa-hotel', desc: 'ஹோட்டல் பதிவு செய்ய', price: 'Custom' },
  { id: 48, title: 'Visa Assistance', category: 'Travel', icon: 'fa-solid fa-passport', desc: 'விசா வழிகாட்டுதல்', price: 'Custom' },
  { id: 49, title: 'Travel Insurance', category: 'Travel', icon: 'fa-solid fa-suitcase-medical', desc: 'பயண காப்பீடு', price: 'Custom' },
  { id: 50, title: 'Digital Payment Services', category: 'Payment', icon: 'fa-brands fa-google-pay', desc: 'டிஜிட்டல் பணப்பரிவர்த்தனை', price: 'Free' },
  { id: 51, title: 'Income Tax Filing', category: 'Payment', icon: 'fa-solid fa-file-invoice-dollar', desc: 'ITR Filing', price: '₹1000' },
  { id: 52, title: 'Banking Services (AEPS)', category: 'Payment', icon: 'fa-solid fa-building-columns', desc: 'AEPS சேவைகள்', price: 'Free' },
  { id: 53, title: 'Mobile Recharge', category: 'Recharge', icon: 'fa-solid fa-mobile-retro', desc: 'மொபைல் ரீசார்ஜ்', price: 'Free' },
  { id: 54, title: 'DTH Recharge', category: 'Recharge', icon: 'fa-solid fa-tv', desc: 'DTH ரீசார்ஜ்', price: 'Free' },
  { id: 55, title: 'FASTag Recharge', category: 'Recharge', icon: 'fa-solid fa-car', desc: 'FASTag ரீசார்ஜ்', price: 'Free' },
  { id: 56, title: 'Train Ticket Booking', category: 'Booking', icon: 'fa-solid fa-train-subway', desc: 'ரயில் டிக்கெட்', price: 'Custom' },
  { id: 57, title: 'Bus Ticket Booking', category: 'Booking', icon: 'fa-solid fa-bus-simple', desc: 'பேருந்து டிக்கெட்', price: 'Custom' },
  { id: 58, title: 'Flight Ticket Booking', category: 'Booking', icon: 'fa-solid fa-plane-up', desc: 'விமான டிக்கெட்', price: 'Custom' },
  { id: 59, title: 'Hotel Booking', category: 'Booking', icon: 'fa-solid fa-bed', desc: 'ஹோட்டல் டிக்கெட்', price: 'Custom' },
  { id: 60, title: 'Visa Assistance', category: 'Travel', icon: 'fa-solid fa-earth-americas', desc: 'விசா உதவி', price: 'Custom' }
];

// Add default properties and check LocalStorage
const defaultServices = defaultServicesSeed.map(s => ({
  ...s,
  status: 'Available',
  isHidden: false
}));

const localData = localStorage.getItem('applyPannuBroServices');
if (localData) {
  window.servicesData = JSON.parse(localData);
} else {
  window.servicesData = defaultServices;
  localStorage.setItem('applyPannuBroServices', JSON.stringify(window.servicesData));
}

document.addEventListener('DOMContentLoaded', () => {
  // Hide Loading Spinner
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 500);
  }

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check local storage for theme
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme == 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else if (currentTheme == 'light') {
    document.body.setAttribute('data-theme', 'light');
    if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
  } else if (prefersDarkScheme.matches) {
    document.body.setAttribute('data-theme', 'dark');
    if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let theme = document.body.getAttribute('data-theme');
      if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (mobileNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  }

  // Sticky Header & Scroll to Top
  const header = document.querySelector('header');
  const scrollBtn = document.getElementById('scroll-top-btn');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      if(header) header.style.boxShadow = 'var(--shadow-sm)';
    } else {
      if(header) header.style.boxShadow = 'none';
    }
    
    if (window.scrollY > 500) {
      if(scrollBtn) scrollBtn.classList.add('show');
    } else {
      if(scrollBtn) scrollBtn.classList.remove('show');
    }
  });

  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Animated Counters
  const counters = document.querySelectorAll('.counter');
  const speed = 200; // The lower the slower

  const animateCounters = () => {
    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;

        if (count < target) {
          counter.innerText = Math.ceil(count + inc);
          setTimeout(updateCount, 10);
        } else {
          counter.innerText = target;
        }
      };

      // Check if element is in viewport
      const rect = counter.getBoundingClientRect();
      if (rect.top < window.innerHeight && counter.innerText === '0') {
        updateCount();
      }
    });
  };

  window.addEventListener('scroll', animateCounters);
  animateCounters(); // run once on load

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(f => f.classList.remove('active'));
        // Open clicked if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
