/**
 * APPLY PANNU BRO - Admin Panel JavaScript
 * 100% Vanilla JS + LocalStorage — No backend required
 *
 * Default Credentials:
 *   Username: admin
 *   Password: apb@2025
 */

// ============================================================
// CONSTANTS & STATE
// ============================================================
const ADMIN_CREDENTIALS = { username: 'admin', password: 'apb@2025' };
const LS_KEY = 'apb_services';
let deleteTargetId = null;
let currentFilter = 'all';
let currentSearch = '';

// ============================================================
// SEED — Load default services into LocalStorage on first visit
// ============================================================
function seedServices() {
  if (localStorage.getItem(LS_KEY)) return; // Already seeded

  // Pull from main.js window.servicesData if available
  const source = (window.servicesData || []).map(s => ({
    ...s,
    status: 'available',
    visible: true
  }));

  localStorage.setItem(LS_KEY, JSON.stringify(source));
}

// ============================================================
// STORAGE HELPERS
// ============================================================
function getServices() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
}

function saveServices(services) {
  localStorage.setItem(LS_KEY, JSON.stringify(services));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'admin-toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'admin-toast';
  }, 3000);
}

// ============================================================
// AUTH
// ============================================================
function isLoggedIn() {
  return sessionStorage.getItem('apb_admin_auth') === 'true';
}

function login(username, password) {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

function logout() {
  sessionStorage.removeItem('apb_admin_auth');
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'flex';
  refreshDashboard();
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================
window.togglePwd = function () {
  const pwdInput = document.getElementById('admin-password');
  const eye = document.getElementById('pwd-eye');
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eye.className = 'fa-solid fa-eye-slash';
  } else {
    pwdInput.type = 'password';
    eye.className = 'fa-solid fa-eye';
  }
};

// ============================================================
// TAB NAVIGATION
// ============================================================
function switchTab(tabId, title) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById('page-title').textContent = title;
}

// ============================================================
// DASHBOARD STATS
// ============================================================
function refreshDashboard() {
  const services = getServices();
  document.getElementById('dash-total').textContent = services.length;
  document.getElementById('dash-available').textContent = services.filter(s => s.status === 'available').length;
  document.getElementById('dash-coming').textContent = services.filter(s => s.status === 'coming-soon').length;
  document.getElementById('dash-unavailable').textContent = services.filter(s => s.status === 'not-available').length;
  renderRecentTable(services.slice(-8).reverse());
}

function renderRecentTable(services) {
  const container = document.getElementById('recent-services-list');
  if (!services.length) {
    container.innerHTML = '<p style="color:var(--text-secondary);padding:20px;">No services yet.</p>';
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Icon</th>
          <th>Name</th>
          <th>Category</th>
          <th>Status</th>
          <th>Visible</th>
        </tr>
      </thead>
      <tbody>
        ${services.map(s => `
          <tr>
            <td><i class="${s.icon || 'fa-solid fa-cog'}" style="font-size:1.3rem;color:var(--primary-color);"></i></td>
            <td><strong>${s.title}</strong></td>
            <td>${s.category}</td>
            <td>${statusBadge(s.status)}</td>
            <td>${s.visible ? '<span style="color:#10b981;font-size:0.85rem;">👁 Visible</span>' : '<span style="color:#94a3b8;font-size:0.85rem;">🙈 Hidden</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

// ============================================================
// STATUS BADGE HTML
// ============================================================
function statusBadge(status) {
  const map = {
    'available': '<span class="status-badge badge-available"><i class="fa-solid fa-circle-check"></i> Available</span>',
    'coming-soon': '<span class="status-badge badge-coming-soon"><i class="fa-solid fa-clock"></i> Coming Soon</span>',
    'not-available': '<span class="status-badge badge-not-available"><i class="fa-solid fa-circle-xmark"></i> Not Available</span>'
  };
  return map[status] || map['available'];
}

// ============================================================
// RENDER ADMIN SERVICE CARDS
// ============================================================
function renderAdminServices() {
  let services = getServices();
  const grid = document.getElementById('admin-services-list');

  // Apply search
  if (currentSearch) {
    services = services.filter(s =>
      s.title.toLowerCase().includes(currentSearch) ||
      (s.desc && s.desc.toLowerCase().includes(currentSearch))
    );
  }

  // Apply filter
  if (currentFilter !== 'all') {
    services = services.filter(s => s.status === currentFilter);
  }

  if (!services.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">No services found.</div>';
    return;
  }

  grid.innerHTML = services.map(s => `
    <div class="admin-service-card ${!s.visible ? 'hidden-service' : ''}" id="admin-card-${s.id}">
      <div class="admin-card-header">
        <div class="admin-card-icon"><i class="${s.icon || 'fa-solid fa-cog'}"></i></div>
        <div>
          <div class="admin-card-title">${s.title}</div>
          <div class="admin-card-cat">${s.category} ${s.price ? '· ' + s.price : ''}</div>
        </div>
      </div>
      <p class="admin-card-desc">${s.desc || 'No description provided.'}</p>
      <div class="admin-card-meta">
        <select class="status-select" data-id="${s.id}" onchange="quickUpdateStatus(this)">
          <option value="available" ${s.status === 'available' ? 'selected' : ''}>✅ Available</option>
          <option value="coming-soon" ${s.status === 'coming-soon' ? 'selected' : ''}>🟡 Coming Soon</option>
          <option value="not-available" ${s.status === 'not-available' ? 'selected' : ''}>🔴 Not Available</option>
        </select>
        ${statusBadge(s.status)}
      </div>
      <div class="admin-card-actions">
        <button class="admin-action-btn btn-edit" onclick="openEditModal(${s.id})">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="admin-action-btn btn-toggle" onclick="toggleVisibility(${s.id})">
          <i class="fa-solid fa-${s.visible ? 'eye-slash' : 'eye'}"></i> ${s.visible ? 'Hide' : 'Show'}
        </button>
        <button class="admin-action-btn btn-delete" onclick="confirmDelete(${s.id})">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================================
// QUICK STATUS UPDATE (from card select)
// ============================================================
window.quickUpdateStatus = function (select) {
  const id = parseInt(select.dataset.id);
  const services = getServices();
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) return;
  services[idx].status = select.value;
  saveServices(services);
  renderAdminServices();
  refreshDashboard();
  showToast('Status updated!', 'success');
};

// ============================================================
// TOGGLE VISIBILITY
// ============================================================
window.toggleVisibility = function (id) {
  const services = getServices();
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) return;
  services[idx].visible = !services[idx].visible;
  saveServices(services);
  renderAdminServices();
  refreshDashboard();
  showToast(services[idx].visible ? 'Service is now Visible' : 'Service is now Hidden', 'info');
};

// ============================================================
// DELETE
// ============================================================
window.confirmDelete = function (id) {
  deleteTargetId = id;
  document.getElementById('delete-modal').style.display = 'flex';
};

window.closeDeleteModal = function () {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
};

function deleteService(id) {
  let services = getServices();
  services = services.filter(s => s.id !== id);
  saveServices(services);
  renderAdminServices();
  refreshDashboard();
  showToast('Service deleted!', 'error');
}

// ============================================================
// EDIT MODAL
// ============================================================
window.openEditModal = function (id) {
  const services = getServices();
  const s = services.find(sv => sv.id === id);
  if (!s) return;

  document.getElementById('modal-edit-id').value = s.id;
  document.getElementById('modal-svc-name').value = s.title;
  document.getElementById('modal-svc-category').value = s.category;
  document.getElementById('modal-svc-desc').value = s.desc || '';
  document.getElementById('modal-svc-price').value = s.price || '';
  document.getElementById('modal-svc-icon').value = s.icon || '';
  document.getElementById('modal-svc-status').value = s.status || 'available';
  document.getElementById('modal-svc-visible').value = s.visible ? 'true' : 'false';

  document.getElementById('edit-modal').style.display = 'flex';
};

window.closeEditModal = function () {
  document.getElementById('edit-modal').style.display = 'none';
};

// ============================================================
// ADD SERVICE FORM
// ============================================================
window.resetServiceForm = function () {
  document.getElementById('service-form').reset();
  document.getElementById('edit-service-id').value = '';
  document.getElementById('service-form-title').textContent = 'Add New Service';
  document.getElementById('svc-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Add Service';
};

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  seedServices();

  // Check auth state
  if (isLoggedIn()) {
    showDashboard();
  } else {
    showLoginScreen();
  }

  // ---- Login form ----
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;
    const errEl = document.getElementById('login-error');

    if (login(username, password)) {
      sessionStorage.setItem('apb_admin_auth', 'true');
      errEl.style.display = 'none';
      showDashboard();
    } else {
      errEl.textContent = '❌ Incorrect username or password. Please try again.';
      errEl.style.display = 'block';
    }
  });

  // ---- Logout ----
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // ---- Sidebar tab links ----
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      const titles = {
        'dashboard-tab': 'Dashboard',
        'services-tab': 'Manage Services',
        'add-service-tab': 'Add New Service'
      };
      switchTab(tabId, titles[tabId] || '');

      if (tabId === 'services-tab') renderAdminServices();
      if (tabId === 'dashboard-tab') refreshDashboard();

      // Close mobile sidebar
      if (window.innerWidth < 768) {
        document.getElementById('admin-sidebar').classList.remove('mobile-open');
      }
    });
  });

  // ---- Sidebar toggle ----
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('admin-sidebar');
    const main = document.querySelector('.admin-main');
    if (window.innerWidth < 768) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    }
  });

  // ---- Admin search ----
  document.getElementById('admin-search').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderAdminServices();
  });

  // ---- Admin filter buttons ----
  document.querySelectorAll('.adm-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status');
      renderAdminServices();
    });
  });

  // ---- Add Service Form ----
  document.getElementById('service-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const services = getServices();

    const newService = {
      id: generateId(),
      title: document.getElementById('svc-name').value.trim(),
      category: document.getElementById('svc-category').value,
      desc: document.getElementById('svc-desc').value.trim(),
      price: document.getElementById('svc-price').value.trim(),
      icon: document.getElementById('svc-icon').value.trim() || 'fa-solid fa-cog',
      status: document.getElementById('svc-status').value,
      visible: document.getElementById('svc-visible').value === 'true'
    };

    services.push(newService);
    saveServices(services);
    resetServiceForm();
    showToast('✅ New service added successfully!', 'success');
    refreshDashboard();
  });

  // ---- Edit Form Submit ----
  document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('modal-edit-id').value);
    const services = getServices();
    const idx = services.findIndex(s => s.id === id);
    if (idx === -1) return;

    services[idx].title    = document.getElementById('modal-svc-name').value.trim();
    services[idx].category = document.getElementById('modal-svc-category').value;
    services[idx].desc     = document.getElementById('modal-svc-desc').value.trim();
    services[idx].price    = document.getElementById('modal-svc-price').value.trim();
    services[idx].icon     = document.getElementById('modal-svc-icon').value.trim() || 'fa-solid fa-cog';
    services[idx].status   = document.getElementById('modal-svc-status').value;
    services[idx].visible  = document.getElementById('modal-svc-visible').value === 'true';

    saveServices(services);
    closeEditModal();
    renderAdminServices();
    refreshDashboard();
    showToast('✅ Service updated successfully!', 'success');
  });

  // ---- Delete Confirm ----
  document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (deleteTargetId !== null) {
      deleteService(deleteTargetId);
      closeDeleteModal();
    }
  });

  // ---- Close modals on overlay click ----
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) closeEditModal();
  });
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('delete-modal')) closeDeleteModal();
  });
});
