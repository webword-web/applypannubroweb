document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const servicesGrid = document.getElementById('dynamic-services-grid');

  if (!servicesGrid) return;

  // -------------------------------------------------------
  // Get services from LocalStorage (admin changes) or fall
  // back to the built-in window.servicesData
  // -------------------------------------------------------
  function getLiveServices() {
    const stored = localStorage.getItem('apb_services');
    if (stored) {
      return JSON.parse(stored);
    }
    // First visit: seed defaults with "available" status and visible=true
    const defaults = (window.servicesData || []).map(s => ({
      ...s,
      status: 'available',
      visible: true
    }));
    localStorage.setItem('apb_services', JSON.stringify(defaults));
    return defaults;
  }

  // -------------------------------------------------------
  // Status badge HTML
  // -------------------------------------------------------
  function statusBadgeHtml(status) {
    if (status === 'coming-soon') {
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;background:rgba(245,158,11,0.15);color:#f59e0b;"><i class="fa-solid fa-clock"></i> Coming Soon</span>';
    }
    if (status === 'not-available') {
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;background:rgba(239,68,68,0.15);color:#ef4444;"><i class="fa-solid fa-circle-xmark"></i> Not Available</span>';
    }
    // default: available
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;background:rgba(16,185,129,0.15);color:#10b981;"><i class="fa-solid fa-circle-check"></i> Available</span>';
  }

  // -------------------------------------------------------
  // Render services
  // -------------------------------------------------------
  window.renderServices = (services) => {
    servicesGrid.innerHTML = '';

    // Only show visible services on the public site
    const visible = services.filter(s => s.visible !== false);

    if (!visible.length) {
      servicesGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">No services found. Try another search.</div>';
      return;
    }

    visible.forEach(service => {
      const whatsappMsg = `Hi, I want to apply for ${service.title}. Please provide more details.`;
      const whatsappUrl = `https://wa.me/918525041700?text=${encodeURIComponent(whatsappMsg)}`;

      const isUnavailable = service.status === 'not-available';

      const card = document.createElement('div');
      card.className = 'service-card fade-in-up';
      card.innerHTML = `
        <div class="service-icon"><i class="${service.icon || 'fa-solid fa-cog'}"></i></div>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-desc-ta">${service.desc || ''}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;gap:8px;flex-wrap:wrap;">
          <span style="font-size:0.8rem;background:var(--border-color);padding:3px 8px;border-radius:5px;">${service.category}</span>
          ${statusBadgeHtml(service.status)}
        </div>
        <div style="display:flex;gap:8px;">
          <a href="service-details.html?id=${service.id}" class="service-btn" style="flex:1;text-align:center;border:1px solid var(--primary-color);background:transparent;padding:8px;">Details</a>
          ${!isUnavailable
            ? `<a href="${whatsappUrl}" target="_blank" class="service-btn" style="flex:1;text-align:center;background:#25D366;color:white;border:none;padding:8px;">Apply Now</a>`
            : `<span class="service-btn" style="flex:1;text-align:center;background:var(--border-color);color:var(--text-secondary);border:none;padding:8px;cursor:not-allowed;">Not Available</span>`
          }
        </div>
      `;
      servicesGrid.appendChild(card);
    });
  };

  // -------------------------------------------------------
  // Initial render
  // -------------------------------------------------------
  const allServices = getLiveServices();
  const isHomePage = document.getElementById('home-page-marker') !== null;
  window.renderServices(isHomePage ? allServices.slice(0, 12) : allServices);

  // -------------------------------------------------------
  // Filter Logic
  // -------------------------------------------------------
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');
      let filtered = getLiveServices();

      if (category !== 'All') {
        filtered = filtered.filter(s => s.category === category || s.category.includes(category));
      }

      window.renderServices(isHomePage ? filtered.slice(0, 12) : filtered);
    });
  });
});
