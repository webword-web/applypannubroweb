document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('service-search');
  const suggestionsBox = document.getElementById('search-suggestions');
  
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      if (suggestionsBox) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
      }
      
      // If empty and on services page, reset grid
      const servicesGrid = document.getElementById('dynamic-services-grid');
      const activeFilter = document.querySelector('.filter-btn.active');
      if (servicesGrid && query.length === 0) {
        let filterCat = activeFilter ? activeFilter.getAttribute('data-filter') : 'All';
        let dataToRender = window.servicesData;
        if (filterCat !== 'All') {
          dataToRender = dataToRender.filter(s => s.category === filterCat);
        }
        
        const isHomePage = document.getElementById('home-page-marker') !== null;
        if (isHomePage) dataToRender = dataToRender.slice(0, 12);
        
        window.renderServices(dataToRender);
      }
      return;
    }
    
    // Filter services based on query (title or tamil desc) and hidden status
    const matches = window.servicesData.filter(s => 
      !s.isHidden && (
        s.title.toLowerCase().includes(query) || 
        s.desc.toLowerCase().includes(query)
      )
    );
    
    // Show suggestions dropdown
    if (suggestionsBox) {
      suggestionsBox.innerHTML = '';
      if (matches.length > 0) {
        matches.slice(0, 5).forEach(match => {
          const div = document.createElement('div');
          div.style.padding = '10px 20px';
          div.style.cursor = 'pointer';
          div.style.borderBottom = '1px solid var(--border-color)';
          div.innerHTML = `<i class="${match.icon}" style="color: var(--primary-color); margin-right: 10px;"></i> ${match.title}`;
          
          div.addEventListener('click', () => {
            window.location.href = `service-details.html?id=${match.id}`;
          });
          
          // Hover effect
          div.addEventListener('mouseenter', () => { div.style.background = 'rgba(37, 99, 235, 0.05)'; });
          div.addEventListener('mouseleave', () => { div.style.background = 'transparent'; });
          
          suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
      } else {
        const div = document.createElement('div');
        div.style.padding = '10px 20px';
        div.innerText = 'No services found';
        suggestionsBox.appendChild(div);
        suggestionsBox.style.display = 'block';
      }
    }

    // Also filter the grid if we are on a page with it
    const servicesGrid = document.getElementById('dynamic-services-grid');
    if (servicesGrid && typeof window.renderServices === 'function') {
      window.renderServices(matches);
      
      // Update filter UI
      const activeFilter = document.querySelector('.filter-btn.active');
      if (activeFilter) activeFilter.classList.remove('active');
      const allFilter = document.querySelector('.filter-btn[data-filter="All"]');
      if (allFilter) allFilter.classList.add('active');
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (suggestionsBox && e.target !== searchInput && e.target !== suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });
});
