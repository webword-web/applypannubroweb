/**
 * APPLY PANNU BRO - Dynamic Site Content Listener
 * Fetches site settings (contact numbers, email, addresses, announcement banner, hero text)
 * from Firestore in real-time and applies it across the entire site.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if firebase is loaded and config is active
  if (typeof window.db === 'undefined') {
    console.warn("Firestore database not initialized yet. Waiting for script load...");
    return;
  }

  // Set up real-time listener for site settings
  window.db.collection('settings').doc('site_content').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      updateDynamicElements(data);
    } else {
      console.log("No site settings found. Seeding defaults...");
      seedDefaultSettings();
    }
  }, (error) => {
    console.error("Error loading site settings: ", error);
  });
});

// Update DOM elements on snapshot receipt
function updateDynamicElements(data) {
  if (!data) return;

  // 1. Top Announcement Bar
  let annBar = document.getElementById('global-announcement-bar');
  if (data.announcementText && data.announcementVisible) {
    if (!annBar) {
      const header = document.querySelector('header');
      if (header) {
        annBar = document.createElement('div');
        annBar.id = 'global-announcement-bar';
        annBar.style.cssText = 'background: linear-gradient(90deg, #f59e0b, #ef4444); color: white; text-align: center; padding: 6px 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 100%;';
        header.prepend(annBar);
      }
    }
    if (annBar) {
      annBar.innerHTML = `<i class="fa-solid fa-bullhorn"></i> <span>${data.announcementText}</span>`;
      annBar.style.display = 'flex';
    }
  } else if (annBar) {
    annBar.style.display = 'none';
  }

  // 2. Hero Text (Title & Subtitle) & Background Image
  const heroTitle = document.querySelector('.dynamic-hero-title');
  if (heroTitle && data.heroTitle) {
    heroTitle.textContent = data.heroTitle;
  }
  
  const heroSubtitle = document.querySelector('.dynamic-hero-subtitle');
  if (heroSubtitle && data.heroSubtitle) {
    heroSubtitle.textContent = data.heroSubtitle;
  }

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    if (data.heroImage) {
      heroEl.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.82)), url('${data.heroImage}')`;
      heroEl.style.backgroundSize = 'cover';
      heroEl.style.backgroundPosition = 'center';
    } else {
      heroEl.style.backgroundImage = ''; // Reverts to CSS gradients
    }
  }

  // 3. Contact Info mappings
  
  // Phone mappings
  if (data.contactPhone) {
    // Update link hrefs
    document.querySelectorAll('.dynamic-phone-link').forEach(el => {
      if (el.tagName === 'A') {
        el.href = `tel:${data.contactPhone}`;
      }
    });
    // Update texts
    document.querySelectorAll('.dynamic-phone-text').forEach(el => {
      el.textContent = data.contactPhone;
    });
  }

  // WhatsApp mappings
  if (data.contactWhatsapp) {
    const rawNumber = data.contactWhatsapp.replace(/\D/g, ''); // Extract numbers only
    const cleanWA = rawNumber.startsWith('91') ? rawNumber : '91' + rawNumber; // Ensure country code
    
    // Update link hrefs
    document.querySelectorAll('.dynamic-whatsapp-link').forEach(el => {
      if (el.tagName === 'A') {
        let messageParam = '';
        const currentHref = el.getAttribute('href') || '';
        if (currentHref.includes('text=')) {
          const match = currentHref.match(/text=([^&]*)/);
          if (match) messageParam = `?text=${match[1]}`;
        }
        el.href = `https://wa.me/${cleanWA}${messageParam}`;
      }
    });
    // Update texts
    document.querySelectorAll('.dynamic-whatsapp-text').forEach(el => {
      el.textContent = data.contactWhatsapp;
    });
  }

  // Email mappings
  if (data.contactEmail) {
    // Update link hrefs
    document.querySelectorAll('.dynamic-email-link').forEach(el => {
      if (el.tagName === 'A') {
        el.href = `mailto:${data.contactEmail}`;
      }
    });
    // Update texts
    document.querySelectorAll('.dynamic-email-text').forEach(el => {
      el.textContent = data.contactEmail;
    });
  }

  // Address mappings
  if (data.contactAddress) {
    document.querySelectorAll('.dynamic-address-text').forEach(el => {
      el.innerHTML = data.contactAddress.replace(/\n/g, '<br>');
    });
  }

  // Working hours
  if (data.workingHours) {
    document.querySelectorAll('.dynamic-working-hours-text').forEach(el => {
      el.textContent = data.workingHours;
    });
  }
}

// Seed defaults if Firestore collection settings is empty
function seedDefaultSettings() {
  const defaults = {
    announcementText: "உங்களுக்கு தேவையான அனைத்து ஆன்லைன் சேவைகளும் ஒரே இடத்தில்! WhatsApp மூலம் தொடர்பு கொள்ளவும்.",
    announcementVisible: true,
    bannerText: "அனைத்து சேவைகள்",
    bannerSubtext: "Browse through our online services.",
    heroTitle: "APPLY PANNU BRO",
    heroSubtitle: "One Stop Solution For All Your Online Government, Education & Business Needs",
    heroImage: "",
    contactPhone: "8525041700",
    contactWhatsapp: "8525041700",
    contactEmail: "applypannubro@gmail.com",
    contactAddress: "Apply Pannu Bro Service Center,\nTamil Nadu, India",
    workingHours: "24x7 Support Available"
  };

  window.db.collection('settings').doc('site_content').set(defaults)
    .then(() => console.log("Default settings successfully seeded in Firestore."))
    .catch((error) => console.error("Error seeding default settings: ", error));
}
