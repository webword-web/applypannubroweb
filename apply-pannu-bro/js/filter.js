/**
 * APPLY PANNU BRO - Service Filter & Grid Renderer
 * Fetches services from Firestore in real-time and renders the grid.
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const servicesGrid = document.getElementById('dynamic-services-grid');

  if (!servicesGrid) return;

  // Global live services array, updated by Firestore snapshot
  window._liveServices = [];

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
  // Render services into grid
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
      const whatsappMsg = `வணக்கம், நான் ${service.title} சேவைக்கு விண்ணப்பிக்க விரும்புகிறேன். மேலும் விவரங்களை தெரிவிக்கவும்.\n\nHi, I want to apply for ${service.title}. Please provide more details.`;
      const whatsappUrl = `https://wa.me/918525041700?text=${encodeURIComponent(whatsappMsg)}`;

      const isUnavailable = service.status === 'not-available';

      const card = document.createElement('div');
      card.className = 'service-card fade-in-up';
      card.innerHTML = `
        <div class="service-icon"><i class="${service.icon || 'fa-solid fa-cog'}"></i></div>
        <h3 class="service-title">${escapeFilterHTML(service.title)}</h3>
        <p class="service-desc-ta">${escapeFilterHTML(service.desc || '')}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;gap:8px;flex-wrap:wrap;">
          <span style="font-size:0.8rem;background:var(--border-color);padding:3px 8px;border-radius:5px;">${escapeFilterHTML(service.category)}</span>
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
  // Firestore Real-time Listener
  // -------------------------------------------------------
  if (typeof window.db !== 'undefined') {
    // Show loading state
    servicesGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;margin-bottom:15px;display:block;color:var(--primary-color);"></i>Loading services...</div>';

    window.db.collection('services').orderBy('orderIndex').onSnapshot((snapshot) => {
      const services = [];
      snapshot.forEach(doc => {
        services.push({ id: doc.id, ...doc.data() });
      });

      window._liveServices = services;

      // Get current active filter
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'All';

      // Get current search query
      const searchInput = document.getElementById('service-search');
      const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

      let filtered = services;

      // Apply category filter
      if (activeCategory !== 'All') {
        filtered = filtered.filter(s => s.category === activeCategory || (s.category && s.category.includes(activeCategory)));
      }

      // Apply search filter
      if (searchQuery.length >= 2) {
        filtered = filtered.filter(s =>
          s.title.toLowerCase().includes(searchQuery) ||
          (s.desc && s.desc.toLowerCase().includes(searchQuery))
        );
      }

      // On homepage, show only first 12
      const isHomePage = document.getElementById('home-page-marker') !== null;
      if (isHomePage) filtered = filtered.slice(0, 12);

      window.renderServices(filtered);
    }, (error) => {
      console.error("Firestore services listener error: ", error);
      servicesGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">Failed to load services. Please refresh.</div>';
    });
  } else {
    // Fallback: no Firebase connection
    servicesGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">Database not connected.</div>';
  }

  // -------------------------------------------------------
  // Filter Button Click Logic
  // -------------------------------------------------------
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');
      let filtered = window._liveServices || [];

      if (category !== 'All') {
        filtered = filtered.filter(s => s.category === category || (s.category && s.category.includes(category)));
      }

      // Also apply active search query
      const searchInput = document.getElementById('service-search');
      const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
      if (searchQuery.length >= 2) {
        filtered = filtered.filter(s =>
          s.title.toLowerCase().includes(searchQuery) ||
          (s.desc && s.desc.toLowerCase().includes(searchQuery))
        );
      }

      const isHomePage = document.getElementById('home-page-marker') !== null;
      if (isHomePage) filtered = filtered.slice(0, 12);

      window.renderServices(filtered);
    });
  });
});

function escapeFilterHTML(str) {
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
