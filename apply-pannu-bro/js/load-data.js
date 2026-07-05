// Script to dynamically load data from admin-data.js into the website DOM

document.addEventListener('DOMContentLoaded', () => {
  if (!window.adminData) return;
  const data = window.adminData;

  // 1. Hero Section
  const heroTitle = document.querySelector('.dynamic-hero-title');
  if (heroTitle && data.hero.title) heroTitle.textContent = data.hero.title;

  const heroSubtitle = document.querySelector('.dynamic-hero-subtitle');
  if (heroSubtitle && data.hero.subtitle) heroSubtitle.textContent = data.hero.subtitle;

  const searchInput = document.getElementById('service-search');
  if (searchInput && data.hero.searchPlaceholder) searchInput.placeholder = data.hero.searchPlaceholder;

  // Buttons in Hero
  const servicesBtn = document.querySelector('.btn-hero-main');
  if (servicesBtn && data.hero.buttons.servicesText) {
    // Preserve the icon inside the button
    servicesBtn.innerHTML = \`\${data.hero.buttons.servicesText} <i class="fa-solid fa-arrow-right"></i>\`;
  }
  
  // 2. Global Contacts Replacement
  // WhatsApp Links and Texts
  const waLinks = document.querySelectorAll('.dynamic-whatsapp-link');
  waLinks.forEach(link => {
    link.href = \`https://wa.me/\${data.contacts.whatsappNumber}\`;
  });
  const waTexts = document.querySelectorAll('.dynamic-whatsapp-text');
  waTexts.forEach(text => {
    text.textContent = data.contacts.displayPhone;
  });

  // Phone Links and Texts
  const phoneLinks = document.querySelectorAll('.dynamic-phone-link');
  phoneLinks.forEach(link => {
    link.href = \`tel:+\${data.contacts.whatsappNumber}\`; // Assuming same as WA for now or add explicit phone if needed
  });
  const phoneTexts = document.querySelectorAll('.dynamic-phone-text');
  phoneTexts.forEach(text => {
    text.textContent = data.contacts.displayPhone;
  });

  // Email Links and Texts
  const emailLinks = document.querySelectorAll('.dynamic-email-link');
  emailLinks.forEach(link => {
    link.href = \`mailto:\${data.contacts.email}\`;
  });
  const emailTexts = document.querySelectorAll('.dynamic-email-text');
  emailTexts.forEach(text => {
    text.textContent = data.contacts.email;
  });

  const workingHours = document.querySelectorAll('.dynamic-working-hours-text');
  workingHours.forEach(text => {
    text.textContent = data.contacts.workingHours;
  });
  
  // Social Links
  const fbLinks = document.querySelectorAll('.fab-item-fb, .social-links a:nth-child(1)');
  fbLinks.forEach(link => { if(data.contacts.facebook) link.href = data.contacts.facebook; });
  
  const igLinks = document.querySelectorAll('.fab-item-ig, .social-links a:nth-child(2)');
  igLinks.forEach(link => { if(data.contacts.instagram) link.href = data.contacts.instagram; });

  // 3. Trust Badges
  const trustSection = document.querySelector('.trust-badges');
  if (trustSection && data.trustBadges) {
    let badgesHtml = '';
    data.trustBadges.forEach((badge, index) => {
      badgesHtml += \`
        <div class="trust-badge">
          <i class="\${badge.icon}"></i>
          <span>\${badge.text}</span>
        </div>
      \`;
      if (index < data.trustBadges.length - 1) {
        badgesHtml += \`<div class="badge-separator">•</div>\`;
      }
    });
    trustSection.innerHTML = badgesHtml;
  }

  // 4. Stats
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid && data.stats) {
    let statsHtml = '';
    data.stats.forEach(stat => {
      if (stat.isString) {
        statsHtml += \`
          <div class="stat-item">
            <h3>\${stat.number}</h3>
            <p>\${stat.label}</p>
          </div>
        \`;
      } else {
        statsHtml += \`
          <div class="stat-item">
            <h3><span class="counter" data-target="\${stat.number}">0</span>\${stat.suffix || ''}</h3>
            <p>\${stat.label}</p>
          </div>
        \`;
      }
    });
    statsGrid.innerHTML = statsHtml;
  }

  // 5. FAQ
  const faqList = document.querySelector('.faq-list');
  if (faqList && data.faq) {
    let faqHtml = '';
    data.faq.forEach(item => {
      faqHtml += \`
        <div class="faq-item">
          <div class="faq-question">\${item.question} <i class="fa-solid fa-chevron-down"></i></div>
          <div class="faq-answer">
            <p>\${item.answer}</p>
          </div>
        </div>
      \`;
    });
    faqList.innerHTML = faqHtml;
    
    // Reattach event listeners for newly added FAQ items
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(f => f.classList.remove('active'));
          if (!isActive) item.classList.add('active');
        });
      }
    });
  }

  // 6. Footer
  const footerDesc = document.querySelector('footer p');
  const footerColP = document.querySelector('.footer-col:first-child p');
  if (footerDesc && footerColP && data.footer.description) {
    footerColP.textContent = data.footer.description;
  }
  
  const currentYear = document.getElementById('current-year');
  if (currentYear && data.footer.copyrightYear) {
    currentYear.textContent = data.footer.copyrightYear;
  }
});
