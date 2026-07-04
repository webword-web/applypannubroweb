// Global Service Data based on User Request
window.servicesData = [
  // Government Services (1-20)
  { id: 1, title: 'PAN Card Apply', category: 'Government', icon: 'fa-solid fa-id-card', desc: 'α«¬α»üα«ñα«┐α«» α«¬α«╛α«⌐α»ì α«òα«╛α«░α»ìα«ƒα»ü α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣200' },
  { id: 2, title: 'PAN Card Correction', category: 'Government', icon: 'fa-solid fa-pen-to-square', desc: 'α«¬α«╛α«⌐α»ì α«òα«╛α«░α»ìα«ƒα»ü α«ñα«┐α«░α»üα«ñα»ìα«ñα««α»ì α«Üα»åα«»α»ìα«»', price: 'Γé╣200' },
  { id: 3, title: 'Aadhaar Update', category: 'Government', icon: 'fa-solid fa-fingerprint', desc: 'α«åα«ñα«╛α«░α»ì α«╡α«┐α«¬α«░α«Öα»ìα«òα«│α»ì α««α«╛α«▒α»ìα«▒', price: 'Γé╣100' },
  { id: 4, title: 'Voter ID Apply', category: 'Government', icon: 'fa-solid fa-person-booth', desc: 'α«¬α»üα«ñα«┐α«» α«╡α«╛α«òα»ìα«òα«╛α«│α«░α»ì α«àα«ƒα»ìα«ƒα»ê', price: 'Γé╣50' },
  { id: 5, title: 'Voter ID Correction', category: 'Government', icon: 'fa-solid fa-user-edit', desc: 'α«╡α«╛α«òα»ìα«òα«╛α«│α«░α»ì α«àα«ƒα»ìα«ƒα»ê α«ñα«┐α«░α»üα«ñα»ìα«ñα««α»ì', price: 'Γé╣50' },
  { id: 6, title: 'Passport Apply', category: 'Government', icon: 'fa-solid fa-passport', desc: 'α«¬α»üα«ñα«┐α«» α«¬α«╛α«╕α»ìα«¬α»ïα«░α»ìα«ƒα»ì α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣1800' },
  { id: 7, title: 'Passport Renewal', category: 'Government', icon: 'fa-solid fa-plane-departure', desc: 'α«¬α«╛α«╕α»ìα«¬α»ïα«░α»ìα«ƒα»ì α«¬α»üα«ñα»üα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣1800' },
  { id: 8, title: 'Driving Licence Services', category: 'Government', icon: 'fa-solid fa-car', desc: 'α«ôα«ƒα»ìα«ƒα»üα«¿α«░α»ì α«ëα«░α«┐α««α««α»ì α«Üα»çα«╡α»êα«òα«│α»ì', price: 'Γé╣1500' },
  { id: 9, title: 'Learner Licence', category: 'Government', icon: 'fa-solid fa-motorcycle', desc: 'LLR α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣800' },
  { id: 10, title: 'Vehicle RC Services', category: 'Government', icon: 'fa-solid fa-file-contract', desc: 'α«╡α«╛α«òα«⌐ RC α«Üα»çα«╡α»êα«òα«│α»ì', price: 'Γé╣500' },
  { id: 11, title: 'Birth Certificate', category: 'Government', icon: 'fa-solid fa-baby', desc: 'α«¬α«┐α«▒α«¬α»ìα«¬α»ü α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì α«¬α»åα«▒', price: 'Γé╣100' },
  { id: 12, title: 'Death Certificate', category: 'Government', icon: 'fa-solid fa-bed', desc: 'α«çα«▒α«¬α»ìα«¬α»ü α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì α«¬α»åα«▒', price: 'Γé╣100' },
  { id: 13, title: 'Community Certificate', category: 'Government', icon: 'fa-solid fa-users', desc: 'α«£α«╛α«ñα«┐ α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣60' },
  { id: 14, title: 'Income Certificate', category: 'Government', icon: 'fa-solid fa-money-bill-wave', desc: 'α«╡α«░α»üα««α«╛α«⌐ α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣60' },
  { id: 15, title: 'Nativity Certificate', category: 'Government', icon: 'fa-solid fa-map-location-dot', desc: 'α«çα«░α»üα«¬α»ìα«¬α«┐α«ƒ α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣60' },
  { id: 16, title: 'Legal Heir Certificate', category: 'Government', icon: 'fa-solid fa-scale-balanced', desc: 'α«╡α«╛α«░α«┐α«Üα»ü α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣60' },
  { id: 17, title: 'First Graduate Certificate', category: 'Government', icon: 'fa-solid fa-user-graduate', desc: 'α««α»üα«ñα«▓α»ì α«¬α«ƒα»ìα«ƒα«ñα«╛α«░α«┐ α«Üα«╛α«⌐α»ìα«▒α«┐α«ñα«┤α»ì', price: 'Γé╣60' },
  { id: 18, title: 'Patta & Chitta', category: 'Government', icon: 'fa-solid fa-file-invoice', desc: 'α«¬α«ƒα»ìα«ƒα«╛, α«Üα«┐α«ƒα»ìα«ƒα«╛ α«¬α»åα«▒', price: 'Γé╣60' },
  { id: 19, title: 'e-Sevai Services', category: 'Government', icon: 'fa-solid fa-desktop', desc: 'α«àα«⌐α»êα«ñα»ìα«ñα»ü α«ç-α«Üα»çα«╡α»ê α«Üα»çα«╡α»êα«òα«│α»ì', price: 'Γé╣60' },
  { id: 20, title: 'CSC Services', category: 'Government', icon: 'fa-solid fa-laptop-house', desc: 'α«¬α»èα«ñα»ü α«Üα»çα«╡α»ê α««α»êα«» α«Üα»çα«╡α»êα«òα«│α»ì', price: 'Γé╣60' },

  // Education Services (21-28)
  { id: 21, title: 'Scholarship Apply', category: 'Education', icon: 'fa-solid fa-graduation-cap', desc: 'α«òα«▓α»ìα«╡α«┐ α«ëα«ñα«╡α«┐α«ñα»ìα«ñα»èα«òα»ê α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣100' },
  { id: 22, title: 'College Admission', category: 'Education', icon: 'fa-solid fa-university', desc: 'α«òα«▓α»ìα«▓α»éα«░α«┐ α«Üα»çα«░α»ìα«òα»ìα«òα»ê α«╡α«┤α«┐α«òα«╛α«ƒα»ìα«ƒα»üα«ñα«▓α»ì', price: 'Γé╣200' },
  { id: 23, title: 'School Admission', category: 'Education', icon: 'fa-solid fa-school', desc: 'α«¬α«│α»ìα«│α«┐ α«Üα»çα«░α»ìα«òα»ìα«òα»ê α«╡α«┤α«┐α«òα«╛α«ƒα»ìα«ƒα»üα«ñα«▓α»ì', price: 'Γé╣100' },
  { id: 24, title: 'Government Exam Apply', category: 'Education', icon: 'fa-solid fa-file-signature', desc: 'α«àα«░α«Üα»ü α«ñα»çα«░α»ìα«╡α»ü α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣150' },
  { id: 25, title: 'Private Job Apply', category: 'Education', icon: 'fa-solid fa-briefcase', desc: 'α«ñα«⌐α«┐α«»α«╛α«░α»ì α«╡α»çα«▓α»ê α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣100' },
  { id: 26, title: 'Government Job Apply', category: 'Education', icon: 'fa-solid fa-building-columns', desc: 'α«àα«░α«Üα»ü α«╡α»çα«▓α»ê α«╡α«┐α«úα»ìα«úα«¬α»ìα«¬α«┐α«òα»ìα«ò', price: 'Γé╣150' },
  { id: 27, title: 'Online Form Filling', category: 'Education', icon: 'fa-solid fa-keyboard', desc: 'α«åα«⌐α»ìα«▓α»êα«⌐α»ì α«¬α«ƒα«┐α«╡α««α»ì α«¿α«┐α«░α«¬α»ìα«¬', price: 'Γé╣50' },
  { id: 28, title: 'Resume Preparation', category: 'Education', icon: 'fa-solid fa-file-lines', desc: 'α«░α»åα«╕α»ìα«»α»éα««α»ì α«ñα«»α«╛α«░α»ì α«Üα»åα«»α»ìα«»', price: 'Γé╣100' },

  // Business Services (29-40)
  { id: 29, title: 'GST Registration', category: 'Business', icon: 'fa-solid fa-file-invoice-dollar', desc: 'α«£α«┐α«Äα«╕α»ìα«ƒα«┐ α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Γé╣1500' },
  { id: 30, title: 'MSME Registration', category: 'Business', icon: 'fa-solid fa-industry', desc: 'MSME α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Γé╣500' },
  { id: 31, title: 'UDYAM Registration', category: 'Business', icon: 'fa-solid fa-id-badge', desc: 'α«ëα«ñα«»α««α»ì α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Γé╣500' },
  { id: 32, title: 'FSSAI Registration', category: 'Business', icon: 'fa-solid fa-utensils', desc: 'α«ëα«úα«╡α»ü α«¬α«╛α«ñα»üα«òα«╛α«¬α»ìα«¬α»ü α«¬α«ñα«┐α«╡α»ü', price: 'Γé╣1000' },
  { id: 33, title: 'Digital Signature (DSC)', category: 'Business', icon: 'fa-solid fa-signature', desc: 'α«ƒα«┐α«£α«┐α«ƒα»ìα«ƒα«▓α»ì α«òα»êα«»α»èα«¬α»ìα«¬α««α»ì α«¬α»åα«▒', price: 'Γé╣2000' },
  { id: 34, title: 'Income Tax Filing', category: 'Business', icon: 'fa-solid fa-calculator', desc: 'α«╡α«░α»üα««α«╛α«⌐ α«╡α«░α«┐ α«ñα«╛α«òα»ìα«òα«▓α»ì α«Üα»åα«»α»ìα«»', price: 'Γé╣1000' },
  { id: 35, title: 'Insurance Services', category: 'Business', icon: 'fa-solid fa-shield-heart', desc: 'α«òα«╛α«¬α»ìα«¬α»Çα«ƒα»ü α«Üα»çα«╡α»êα«òα«│α»ì', price: 'Custom' },
  { id: 36, title: 'AEPS Banking', category: 'Business', icon: 'fa-solid fa-money-check-dollar', desc: 'α«åα«ñα«╛α«░α»ì α««α»éα«▓α««α»ì α«¬α«úα««α»ì α«Äα«ƒα»üα«òα»ìα«ò', price: 'Free' },
  { id: 37, title: 'Money Transfer', category: 'Business', icon: 'fa-solid fa-money-bill-transfer', desc: 'α«¬α«úα«¬α»ìα«¬α«░α«┐α««α«╛α«▒α»ìα«▒α««α»ì α«Üα»åα«»α»ìα«»', price: 'Standard' },
  { id: 38, title: 'Mobile Recharge', category: 'Business', icon: 'fa-solid fa-mobile-screen', desc: 'α««α»èα«¬α»êα«▓α»ì α«░α»Çα«Üα«╛α«░α»ìα«£α»ì α«Üα»åα«»α»ìα«»', price: 'Free' },
  { id: 39, title: 'DTH Recharge', category: 'Business', icon: 'fa-solid fa-satellite-dish', desc: 'DTH α«░α»Çα«Üα«╛α«░α»ìα«£α»ì α«Üα»åα«»α»ìα«»', price: 'Free' },
  { id: 40, title: 'FASTag Recharge', category: 'Business', icon: 'fa-solid fa-car-side', desc: 'α«âα«¬α«╛α«╕α»ìα«ƒα«╛α«òα»ì α«░α»Çα«Üα«╛α«░α»ìα«£α»ì α«Üα»åα«»α»ìα«»', price: 'Free' },

  // Payment & Booking Services (41-60)
  { id: 41, title: 'Electricity Bill Payment', category: 'Payment', icon: 'fa-solid fa-lightbulb', desc: 'α««α«┐α«⌐α»ìα«Üα«╛α«░ α«òα«ƒα»ìα«ƒα«úα««α»ì α«Üα»åα«▓α»üα«ñα»ìα«ñ', price: 'Free' },
  { id: 42, title: 'Water Bill Payment', category: 'Payment', icon: 'fa-solid fa-faucet-drip', desc: 'α«ñα«úα»ìα«úα»Çα«░α»ì α«òα«ƒα»ìα«ƒα«úα««α»ì α«Üα»åα«▓α»üα«ñα»ìα«ñ', price: 'Free' },
  { id: 43, title: 'Property Tax Payment', category: 'Payment', icon: 'fa-solid fa-house-chimney', desc: 'α«Üα»èα«ñα»ìα«ñα»ü α«╡α«░α«┐ α«Üα»åα«▓α»üα«ñα»ìα«ñ', price: 'Free' },
  { id: 44, title: 'Train Ticket Booking', category: 'Booking', icon: 'fa-solid fa-train', desc: 'α«░α«»α«┐α«▓α»ì α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Custom' },
  { id: 45, title: 'Bus Ticket Booking', category: 'Booking', icon: 'fa-solid fa-bus', desc: 'α«¬α»çα«░α»üα«¿α»ìα«ñα»ü α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Custom' },
  { id: 46, title: 'Flight Ticket Booking', category: 'Booking', icon: 'fa-solid fa-plane', desc: 'α«╡α«┐α««α«╛α«⌐ α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Custom' },
  { id: 47, title: 'Hotel Booking', category: 'Booking', icon: 'fa-solid fa-hotel', desc: 'α«╣α»ïα«ƒα»ìα«ƒα«▓α»ì α«¬α«ñα«┐α«╡α»ü α«Üα»åα«»α»ìα«»', price: 'Custom' },
  { id: 48, title: 'Visa Assistance', category: 'Travel', icon: 'fa-solid fa-passport', desc: 'α«╡α«┐α«Üα«╛ α«╡α«┤α«┐α«òα«╛α«ƒα»ìα«ƒα»üα«ñα«▓α»ì', price: 'Custom' },
  { id: 49, title: 'Travel Insurance', category: 'Travel', icon: 'fa-solid fa-suitcase-medical', desc: 'α«¬α«»α«ú α«òα«╛α«¬α»ìα«¬α»Çα«ƒα»ü', price: 'Custom' },
  { id: 50, title: 'Digital Payment Services', category: 'Payment', icon: 'fa-brands fa-google-pay', desc: 'α«ƒα«┐α«£α«┐α«ƒα»ìα«ƒα«▓α»ì α«¬α«úα«¬α»ìα«¬α«░α«┐α«╡α«░α»ìα«ñα»ìα«ñα«⌐α»ê', price: 'Free' },
  { id: 51, title: 'Income Tax Filing', category: 'Payment', icon: 'fa-solid fa-file-invoice-dollar', desc: 'ITR Filing', price: 'Γé╣1000' },
  { id: 52, title: 'Banking Services (AEPS)', category: 'Payment', icon: 'fa-solid fa-building-columns', desc: 'AEPS α«Üα»çα«╡α»êα«òα«│α»ì', price: 'Free' },
  { id: 53, title: 'Mobile Recharge', category: 'Recharge', icon: 'fa-solid fa-mobile-retro', desc: 'α««α»èα«¬α»êα«▓α»ì α«░α»Çα«Üα«╛α«░α»ìα«£α»ì', price: 'Free' },
  { id: 54, title: 'DTH Recharge', category: 'Recharge', icon: 'fa-solid fa-tv', desc: 'DTH α«░α»Çα«Üα«╛α«░α»ìα«£α»ì', price: 'Free' },
  { id: 55, title: 'FASTag Recharge', category: 'Recharge', icon: 'fa-solid fa-car', desc: 'FASTag α«░α»Çα«Üα«╛α«░α»ìα«£α»ì', price: 'Free' },
  { id: 56, title: 'Train Ticket Booking', category: 'Booking', icon: 'fa-solid fa-train-subway', desc: 'α«░α«»α«┐α«▓α»ì α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì', price: 'Custom' },
  { id: 57, title: 'Bus Ticket Booking', category: 'Booking', icon: 'fa-solid fa-bus-simple', desc: 'α«¬α»çα«░α»üα«¿α»ìα«ñα»ü α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì', price: 'Custom' },
  { id: 58, title: 'Flight Ticket Booking', category: 'Booking', icon: 'fa-solid fa-plane-up', desc: 'α«╡α«┐α««α«╛α«⌐ α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì', price: 'Custom' },
  { id: 59, title: 'Hotel Booking', category: 'Booking', icon: 'fa-solid fa-bed', desc: 'α«╣α»ïα«ƒα»ìα«ƒα«▓α»ì α«ƒα«┐α«òα»ìα«òα»åα«ƒα»ì', price: 'Custom' },
  { id: 60, title: 'Visa Assistance', category: 'Travel', icon: 'fa-solid fa-earth-americas', desc: 'α«╡α«┐α«Üα«╛ α«ëα«ñα«╡α«┐', price: 'Custom' }
];

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
