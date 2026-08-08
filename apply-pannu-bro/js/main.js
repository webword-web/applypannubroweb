// Initialize Firebase (Placeholder Configuration - Replace with your own!)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Only initialize if firebase is available (to prevent errors on pages without SDK)
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();
  
  // Listen for real-time updates to the services node
  window.servicesData = [];
  db.ref('services').on('value', (snapshot) => {
    const data = snapshot.val();
    window.servicesData = data ? Object.values(data) : [];
    
    // If the frontend render function is available, trigger it
    if (typeof window._triggerRender === 'function') {
      window._triggerRender();
    }
    
    // If the admin render function is available, trigger it
    if (typeof window.renderAdminServices === 'function') {
      window.renderAdminServices();
      if (typeof window.refreshDashboard === 'function') {
        window.refreshDashboard();
      }
    }
  });
} else {
  // Fallback if Firebase SDK is not included (e.g. static pages)
  window.servicesData = [];
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
    if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Theme';
  } else if (currentTheme == 'light') {
    document.body.setAttribute('data-theme', 'light');
    if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Theme';
  } else if (prefersDarkScheme.matches) {
    document.body.setAttribute('data-theme', 'dark');
    if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Theme';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let theme = document.body.getAttribute('data-theme');
      if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Theme';
        localStorage.setItem('theme', 'light');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Theme';
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.add('active');
    });
  }
  
  if (closeMenuBtn && mobileNav) {
    closeMenuBtn.addEventListener('click', () => {
      mobileNav.classList.remove('active');
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileNav && mobileNav.classList.contains('active')) {
      if (!mobileNav.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
        mobileNav.classList.remove('active');
      }
    }
  });

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

  // Static FAQ Accordion
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


  // Escaping helper
  function escapeMainHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Floating Contact FAB
  const fabMain = document.getElementById('fab-main');
  const fabWrapper = document.getElementById('fab-wrapper');

  if (fabMain && fabWrapper) {
    fabMain.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = fabWrapper.classList.toggle('open');
      fabMain.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!fabWrapper.contains(e.target)) {
        fabWrapper.classList.remove('open');
        fabMain.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
