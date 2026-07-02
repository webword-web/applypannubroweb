document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const servicesGrid = document.getElementById('dynamic-services-grid');
  
  if (!servicesGrid) return; // Not on a page with services grid

  // Function to render services
  window.renderServices = (services) => {
    servicesGrid.innerHTML = '';
    
    const visibleServices = services.filter(s => !s.isHidden);
    
    if (visibleServices.length === 0) {
      servicesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No services found. Try another search.</div>';
      return;
    }
    
    visibleServices.forEach(service => {
      // Create WhatsApp message string
      const whatsappMsg = `Hi, I want to apply for ${service.title}. Please provide more details.`;
      const whatsappUrl = `https://wa.me/918525041700?text=${encodeURIComponent(whatsappMsg)}`;
      
      let badgeColor = '#10b981'; // Green (Available)
      if (service.status === 'Coming Soon') badgeColor = '#fbbf24'; // Yellow
      if (service.status === 'Not Available') badgeColor = '#ef4444'; // Red
      
      const card = document.createElement('div');
      card.className = 'service-card fade-in-up';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div class="service-icon" style="margin-bottom: 0;"><i class="${service.icon}"></i></div>
          <span style="font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 50px; background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40;">${service.status}</span>
        </div>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-desc-ta">${service.desc}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 0.85rem; background: var(--border-color); padding: 3px 8px; border-radius: 5px;">${service.category}</span>
          <span style="font-size: 0.85rem; font-weight: 600;">${service.price}</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <a href="service-details.html?id=${service.id}" class="service-btn" style="flex: 1; background: transparent; border: 1px solid var(--primary-color);">Details</a>
          <a href="${whatsappUrl}" target="_blank" class="service-btn" style="flex: 1; background: #25D366; color: white; border: none;">Apply Now</a>
        </div>
      `;
      servicesGrid.appendChild(card);
    });
  };

  // Initial render (top 12 for home page, or all for services page)
  const isHomePage = document.getElementById('home-page-marker') !== null;
  const initialData = isHomePage ? window.servicesData.slice(0, 12) : window.servicesData;
  window.renderServices(initialData);

  // Filter Logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');
      
      const category = btn.getAttribute('data-filter');
      
      if (category === 'All') {
        window.renderServices(isHomePage ? window.servicesData.slice(0, 12) : window.servicesData);
      } else {
        const filtered = window.servicesData.filter(s => s.category === category || s.category.includes(category));
        window.renderServices(isHomePage ? filtered.slice(0, 12) : filtered);
      }
    });
  });
});
