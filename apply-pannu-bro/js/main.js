import { db } from './firebase-config.js';
import { collection, onSnapshot, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Global data objects
window.servicesData = [];
window.homepageData = {};

// Hardcoded seed data just in case Firestore is empty
const defaultServicesSeed = [
  { id: 1, title: 'PAN Card Apply', category: 'Government', icon: 'fa-solid fa-id-card', desc: 'புதிய பான் கார்டு விண்ணப்பிக்க', price: '₹200', status: 'Available', isHidden: false },
  { id: 2, title: 'Aadhaar Update', category: 'Government', icon: 'fa-solid fa-fingerprint', desc: 'ஆதார் விபரங்கள் மாற்ற', price: '₹100', status: 'Available', isHidden: false },
  // ... Truncated for seed, real data is added in admin if needed
];

document.addEventListener('DOMContentLoaded', () => {
  // Hide Loading Spinner initially, will show during DB load if needed
  const loader = document.getElementById('loader');

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.body.setAttribute('data-theme', currentTheme);
  if(themeToggle) themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', theme);
      themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      localStorage.setItem('theme', theme);
    });
  }

  // Real-time Firestore Sync for Services
  try {
    const servicesRef = collection(db, 'services');
    onSnapshot(servicesRef, (snapshot) => {
      const services = [];
      snapshot.forEach(doc => {
        services.push({ id: doc.id, ...doc.data() });
      });

      // If empty, seed database (for first time setup only)
      if (services.length === 0) {
        console.warn("Firestore 'services' collection is empty. Please use Admin Panel to add services.");
        // We do not auto-seed here to avoid permission errors for normal users. Admins will seed.
        window.servicesData = defaultServicesSeed;
      } else {
        window.servicesData = services;
      }

      // Trigger re-render in filter.js / search.js
      window.dispatchEvent(new Event('servicesUpdated'));
      
      if (loader) loader.classList.add('hidden');
    }, (error) => {
      console.error("Error fetching services real-time:", error);
      // Fallback
      window.servicesData = defaultServicesSeed;
      window.dispatchEvent(new Event('servicesUpdated'));
      if (loader) loader.classList.add('hidden');
    });

    // Real-time Firestore Sync for Homepage Config
    const homepageRef = collection(db, 'homepage');
    onSnapshot(homepageRef, (snapshot) => {
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (docSnap.id === 'contact') {
          // Update all contact numbers dynamically
          document.querySelectorAll('.dynamic-whatsapp').forEach(el => {
            el.href = `https://wa.me/91${data.whatsapp}`;
            el.innerHTML = `<i class="fa-brands fa-whatsapp"></i> ${data.whatsapp}`;
          });
          document.querySelectorAll('.dynamic-phone').forEach(el => el.textContent = data.phone);
          document.querySelectorAll('.dynamic-email').forEach(el => el.textContent = data.email);
        }
      });
    });

  } catch (error) {
    console.warn("Firebase not configured correctly yet. Using fallback data.", error);
    window.servicesData = defaultServicesSeed;
    window.dispatchEvent(new Event('servicesUpdated'));
    if (loader) loader.classList.add('hidden');
  }

  // Basic DOM interactions (Mobile menu, sticky header, etc)
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => mobileNav.classList.toggle('active'));
  }

  const scrollBtn = document.getElementById('scroll-top-btn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) scrollBtn?.classList.add('show');
    else scrollBtn?.classList.remove('show');
  });
  scrollBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
