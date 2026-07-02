document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('login-modal');
  const dashboard = document.getElementById('admin-dashboard');
  const loginBtn = document.getElementById('login-btn');
  const userIn = document.getElementById('admin-user');
  const passIn = document.getElementById('admin-pass');
  const errText = document.getElementById('login-err');
  const logoutBtn = document.getElementById('logout-btn');

  // Check login state
  if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
    loginModal.style.display = 'none';
    dashboard.style.display = 'block';
    renderAdminTable();
  }

  // Login handler
  loginBtn.addEventListener('click', () => {
    if (userIn.value === 'admin' && passIn.value === 'admin123') {
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      loginModal.style.display = 'none';
      dashboard.style.display = 'block';
      renderAdminTable();
    } else {
      errText.style.display = 'block';
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
  });

  // Render Table
  const tbody = document.getElementById('admin-tbody');
  
  function renderAdminTable(searchQuery = '') {
    tbody.innerHTML = '';
    const query = searchQuery.toLowerCase();
    
    window.servicesData.forEach(service => {
      if (query && !service.title.toLowerCase().includes(query) && !service.category.toLowerCase().includes(query)) return;

      let statusColor = '#10b981';
      if (service.status === 'Coming Soon') statusColor = '#fbbf24';
      if (service.status === 'Not Available') statusColor = '#ef4444';

      const tr = document.createElement('tr');
      tr.style.opacity = service.isHidden ? '0.5' : '1';
      
      tr.innerHTML = `
        <td><i class="${service.icon}" style="font-size: 1.5rem; color: var(--primary-color);"></i></td>
        <td style="font-weight: 500;">${service.title}</td>
        <td>${service.category}</td>
        <td><span style="background: ${statusColor}20; color: ${statusColor}; padding: 3px 8px; border-radius: 5px; font-size: 0.8rem; font-weight: bold;">${service.status}</span></td>
        <td>${service.isHidden ? 'Hidden' : 'Visible'}</td>
        <td>
          <button class="action-btn btn-edit" onclick="editService(${service.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn btn-toggle" onclick="toggleService(${service.id})"><i class="fa-solid ${service.isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
          <button class="action-btn btn-delete" onclick="deleteService(${service.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Search logic
  const searchInput = document.getElementById('admin-search');
  searchInput.addEventListener('input', (e) => {
    renderAdminTable(e.target.value);
  });

  // Save changes to localStorage helper
  function persistData() {
    localStorage.setItem('applyPannuBroServices', JSON.stringify(window.servicesData));
    renderAdminTable(searchInput.value);
  }

  // Actions
  window.toggleService = (id) => {
    const s = window.servicesData.find(x => x.id === id);
    if (s) {
      s.isHidden = !s.isHidden;
      persistData();
    }
  };

  window.deleteService = (id) => {
    if (confirm('Are you sure you want to delete this service permanently?')) {
      window.servicesData = window.servicesData.filter(x => x.id !== id);
      persistData();
    }
  };

  // Modal Logic
  const serviceModal = document.getElementById('service-modal');
  const cancelBtn = document.getElementById('modal-cancel');
  const saveBtn = document.getElementById('modal-save');
  const addNewBtn = document.getElementById('add-new-btn');

  // Form Fields
  const fId = document.getElementById('form-id');
  const fTitle = document.getElementById('form-title');
  const fCategory = document.getElementById('form-category');
  const fPrice = document.getElementById('form-price');
  const fStatus = document.getElementById('form-status');
  const fIcon = document.getElementById('form-icon');
  const fDesc = document.getElementById('form-desc');

  addNewBtn.addEventListener('click', () => {
    document.getElementById('modal-title').innerText = 'Add New Service';
    fId.value = '';
    fTitle.value = '';
    fCategory.value = 'Government';
    fPrice.value = '';
    fStatus.value = 'Available';
    fIcon.value = 'fa-solid fa-file';
    fDesc.value = '';
    serviceModal.classList.remove('hidden');
  });

  window.editService = (id) => {
    const s = window.servicesData.find(x => x.id === id);
    if (s) {
      document.getElementById('modal-title').innerText = 'Edit Service';
      fId.value = s.id;
      fTitle.value = s.title;
      fCategory.value = s.category;
      fPrice.value = s.price || '';
      fStatus.value = s.status || 'Available';
      fIcon.value = s.icon;
      fDesc.value = s.desc;
      serviceModal.classList.remove('hidden');
    }
  };

  cancelBtn.addEventListener('click', () => {
    serviceModal.classList.add('hidden');
  });

  saveBtn.addEventListener('click', () => {
    if (!fTitle.value || !fIcon.value) {
      alert('Please fill in Name and Icon fields!');
      return;
    }

    if (fId.value) {
      // Edit existing
      const s = window.servicesData.find(x => x.id == fId.value);
      if (s) {
        s.title = fTitle.value;
        s.category = fCategory.value;
        s.price = fPrice.value;
        s.status = fStatus.value;
        s.icon = fIcon.value;
        s.desc = fDesc.value;
      }
    } else {
      // Add new
      const newId = window.servicesData.length > 0 ? Math.max(...window.servicesData.map(s => s.id)) + 1 : 1;
      window.servicesData.push({
        id: newId,
        title: fTitle.value,
        category: fCategory.value,
        price: fPrice.value,
        status: fStatus.value,
        icon: fIcon.value,
        desc: fDesc.value,
        isHidden: false
      });
    }

    persistData();
    serviceModal.classList.add('hidden');
  });
});
