document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('service-search');
  const suggestionsBox = document.getElementById('search-suggestions');

  if (!searchInput) return;

  function getLiveServices() {
    const stored = localStorage.getItem('apb_services');
    if (stored) return JSON.parse(stored);
    return window.servicesData || [];
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const allServices = getLiveServices();

    if (query.length < 2) {
      if (suggestionsBox) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
      }

      // Reset grid
      const servicesGrid = document.getElementById('dynamic-services-grid');
      if (servicesGrid && query.length === 0 && typeof window.renderServices === 'function') {
        const activeFilter = document.querySelector('.filter-btn.active');
        let filterCat = activeFilter ? activeFilter.getAttribute('data-filter') : 'All';
        let dataToRender = allServices;
        if (filterCat !== 'All') {
          dataToRender = dataToRender.filter(s => s.category === filterCat);
        }
        const isHomePage = document.getElementById('home-page-marker') !== null;
        if (isHomePage) dataToRender = dataToRender.slice(0, 12);
        window.renderServices(dataToRender);
      }
      return;
    }

    const matches = allServices.filter(s =>
      s.title.toLowerCase().includes(query) ||
      (s.desc && s.desc.toLowerCase().includes(query))
    );

    // Suggestions dropdown
    if (suggestionsBox) {
      suggestionsBox.innerHTML = '';
      if (matches.length > 0) {
        matches.slice(0, 5).forEach(match => {
          const div = document.createElement('div');
          div.style.cssText = 'padding:10px 20px;cursor:pointer;border-bottom:1px solid var(--border-color);';
          div.innerHTML = `<i class="${match.icon || 'fa-solid fa-cog'}" style="color:var(--primary-color);margin-right:10px;"></i> ${match.title}`;
          div.addEventListener('click', () => {
            window.location.href = `service-details.html?id=${match.id}`;
          });
          div.addEventListener('mouseenter', () => { div.style.background = 'rgba(37,99,235,0.05)'; });
          div.addEventListener('mouseleave', () => { div.style.background = 'transparent'; });
          suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
      } else {
        const div = document.createElement('div');
        div.style.cssText = 'padding:10px 20px;color:var(--text-secondary);';
        div.innerText = 'No services found';
        suggestionsBox.appendChild(div);
        suggestionsBox.style.display = 'block';
      }
    }

    // Filter grid
    const servicesGrid = document.getElementById('dynamic-services-grid');
    if (servicesGrid && typeof window.renderServices === 'function') {
      window.renderServices(matches);
    }
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (suggestionsBox && e.target !== searchInput) {
      suggestionsBox.style.display = 'none';
    }
  });
});
