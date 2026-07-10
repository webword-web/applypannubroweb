/**
 * APPLY PANNU BRO - Admin Panel JavaScript (API-Driven)
 * Communicates with ASP.NET Core Web API + SignalR
 */

// ============================================================
// STATE
// ============================================================
let currentAdminRole = '';
let currentAdminUser = '';
let deleteTarget = null;  // { fn: async function }
let jobsCurrentPage = 1;
let jobsTotalPages = 1;
let currentFmFolder = 'general';
let signalRConnection = null;

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
  }, 3500);
}

// ============================================================
// LOADER UTILITY
// ============================================================
function setLoading(el, state) {
  if (!el) return;
  if (state) {
    el.disabled = true;
    el._origHtml = el.innerHTML;
    el.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...';
  } else {
    el.disabled = false;
    if (el._origHtml) el.innerHTML = el._origHtml;
  }
}

// ============================================================
// API HELPER
// ============================================================
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options
    });
    if (res.status === 401) {
      showLoginScreen();
      return null;
    }
    return res;
  } catch (e) {
    console.error('[Admin API] Request failed:', e.message);
    return null;
  }
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================
window.togglePwd = function () {
  const pwdInput = document.getElementById('admin-password');
  const eye = document.getElementById('pwd-eye');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eye.className = 'fa-solid fa-eye-slash';
  } else {
    pwdInput.type = 'password';
    eye.className = 'fa-solid fa-eye';
  }
};

// ============================================================
// AUTH
// ============================================================
function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'flex';
  initSignalR();
  loadDashboardStats();
}

async function checkSession() {
  const res = await apiFetch('/api/auth/me');
  if (!res || !res.ok) {
    showLoginScreen();
    return;
  }
  const data = await res.json();
  currentAdminRole = data.role;
  currentAdminUser = data.username;
  document.getElementById('welcome-username').textContent = `Welcome, ${data.username}`;
  applyRoleVisibility(data.role);
  showDashboard();
}

function applyRoleVisibility(role) {
  // Show super admin only items
  const superAdminEls = document.querySelectorAll('.super-admin-only');
  if (role === 'SuperAdmin') {
    superAdminEls.forEach(el => el.style.display = '');
    const smtpSec = document.getElementById('smtp-settings-sec');
    if (smtpSec) smtpSec.style.display = '';
  }
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function switchTab(tabId, title) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  const tab = document.getElementById(tabId);
  const link = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
  if (tab) tab.classList.add('active');
  if (link) link.classList.add('active');

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = title;

  // Load data for tab
  switch (tabId) {
    case 'dashboard-tab': loadDashboardStats(); break;
    case 'jobs-tab': loadJobs(); break;
    case 'services-tab': loadAdminServices(); break;
    case 'categories-tab': loadCategories(); break;
    case 'banners-tab': loadBanners(); break;
    case 'users-tab': loadUsers(); break;
    case 'contacts-tab': loadContacts(); break;
    case 'file-manager-tab': loadFiles(currentFmFolder); break;
    case 'settings-tab': loadSettings(); break;
    case 'backups-tab': loadBackups(); break;
    case 'logs-tab': loadLogs(); break;
  }
}

// ============================================================
// SIGNALR
// ============================================================
function initSignalR() {
  if (signalRConnection) return;
  signalRConnection = new signalR.HubConnectionBuilder()
    .withUrl('/liveUpdateHub')
    .withAutomaticReconnect()
    .build();

  signalRConnection.on('ReceiveUpdate', (entity) => {
    console.log('[SignalR] Live update for:', entity);
    const activeTab = document.querySelector('.admin-tab.active');
    if (!activeTab) return;

    const map = {
      'Jobs': 'jobs-tab',
      'Services': 'services-tab',
      'Categories': 'categories-tab',
      'Banners': 'banners-tab',
      'Settings': 'settings-tab',
    };
    if (map[entity] && activeTab.id === map[entity]) {
      switch (entity) {
        case 'Jobs': loadJobs(); break;
        case 'Services': loadAdminServices(); break;
        case 'Categories': loadCategories(); break;
        case 'Banners': loadBanners(); break;
      }
    }
  });

  signalRConnection.start().catch(e => console.warn('[SignalR] Connect failed:', e));
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboardStats() {
  const res = await apiFetch('/api/dashboard/stats');
  if (!res || !res.ok) return;
  const data = await res.json();

  setText('dash-users', data.totalUsers ?? 0);
  setText('dash-jobs', data.activeJobs ?? 0);
  setText('dash-services', data.totalServices ?? 0);
  setText('dash-visitors', (data.visitorCount ?? 0).toLocaleString());

  // Recent activities
  const actTable = document.querySelector('#dash-recent-activities tbody');
  if (actTable) {
    if (!data.recentActivities || !data.recentActivities.length) {
      actTable.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);">No recent activity.</td></tr>';
    } else {
      actTable.innerHTML = data.recentActivities.map(a => `
        <tr>
          <td><strong>${escHtml(a.username)}</strong></td>
          <td>${escHtml(a.action)}</td>
          <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(a.details || '-')}</td>
          <td style="white-space:nowrap;">${fmtDate(a.timestamp)}</td>
        </tr>
      `).join('');
    }
  }

  // Latest users
  const usrTable = document.querySelector('#dash-latest-users tbody');
  if (usrTable) {
    if (!data.latestUsers || !data.latestUsers.length) {
      usrTable.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-secondary);">No users.</td></tr>';
    } else {
      usrTable.innerHTML = data.latestUsers.map(u => `
        <tr>
          <td><strong>${escHtml(u.username)}</strong></td>
          <td>${roleBadge(u.role)}</td>
        </tr>
      `).join('');
    }
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function roleBadge(role) {
  const map = {
    SuperAdmin: '<span class="badge-role role-super">Super Admin</span>',
    Admin: '<span class="badge-role role-admin">Admin</span>',
    Staff: '<span class="badge-role role-staff">Staff</span>'
  };
  return map[role] || role;
}

// ============================================================
// JOBS MANAGEMENT
// ============================================================
async function loadJobs(page = 1) {
  jobsCurrentPage = page;
  const search = document.getElementById('job-search')?.value ?? '';
  const categoryFilter = document.getElementById('job-filter-category')?.value ?? '';
  const statusFilter = document.getElementById('job-filter-status')?.value ?? '';

  let url = `/api/jobs?adminMode=true&page=${page}&pageSize=10`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (categoryFilter) url += `&categoryId=${categoryFilter}`;
  if (statusFilter !== '') url += `&isActive=${statusFilter}`;

  const res = await apiFetch(url);
  if (!res || !res.ok) return;
  const data = await res.json();

  jobsTotalPages = data.totalPages || 1;
  document.getElementById('jobs-page-info').textContent = `Page ${page} of ${jobsTotalPages}`;
  document.getElementById('btn-jobs-prev').disabled = page <= 1;
  document.getElementById('btn-jobs-next').disabled = page >= jobsTotalPages;

  const tbody = document.getElementById('jobs-list');
  if (!tbody) return;

  if (!data.items || !data.items.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-secondary);">No jobs found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.items.map(job => {
    const lastDate = new Date(job.lastDate);
    const isExpired = lastDate < new Date();
    return `
      <tr id="job-row-${job.id}">
        <td>
          ${job.logoUrl ? `<img src="${escHtml(job.logoUrl)}" alt="logo" style="width:36px;height:36px;border-radius:6px;object-fit:contain;background:var(--surface-color);border:1px solid var(--border-color);">` : '<i class="fa-solid fa-building-columns" style="font-size:1.5rem;color:var(--primary-color);"></i>'}
        </td>
        <td>
          <strong>${escHtml(job.organization)}</strong><br>
          <span style="font-size:0.78rem;color:var(--text-secondary);">${escHtml(job.eligibility || '')}</span>
        </td>
        <td>${(job.vacancy || 0).toLocaleString()}</td>
        <td>${escHtml(job.category?.name ?? '')}</td>
        <td style="${isExpired ? 'color:#ef4444;' : 'color:#10b981;'};">${fmtDateShort(job.lastDate)}</td>
        <td>
          <button onclick="toggleJobFeatured(${job.id})" class="btn btn-sm ${job.isFeatured ? 'btn-warning' : 'btn-outline'}" title="${job.isFeatured ? 'Featured' : 'Not Featured'}">
            <i class="fa-solid fa-star"></i>
          </button>
        </td>
        <td>
          <button onclick="toggleJobActive(${job.id})" class="btn btn-sm ${job.isActive ? 'btn-success' : 'btn-outline'}" title="${job.isActive ? 'Active' : 'Inactive'}">
            ${job.isActive ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>'}
          </button>
        </td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button onclick="editJob(${job.id})" class="btn btn-sm btn-outline" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button onclick="confirmDeleteJob(${job.id}, '${escHtml(job.organization)}')" class="btn btn-sm btn-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
            ${job.pdfUrl ? `<a href="${escHtml(job.pdfUrl)}" target="_blank" class="btn btn-sm btn-outline" title="View PDF"><i class="fa-solid fa-file-pdf"></i></a>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function populateJobCategoryDropdown() {
  const res = await apiFetch('/api/categories');
  if (!res || !res.ok) return;
  const cats = await res.json();

  const filterSel = document.getElementById('job-filter-category');
  const modalSel = document.getElementById('job-category');
  const opts = cats.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');

  if (filterSel) filterSel.innerHTML = '<option value="">All Categories</option>' + opts;
  if (modalSel) modalSel.innerHTML = '<option value="">Select Category</option>' + opts;
}

function openJobModal(job = null) {
  const form = document.getElementById('job-form');
  form.reset();
  document.getElementById('job-id').value = '';
  document.getElementById('job-modal-title').textContent = job ? 'Edit Job' : 'Add New Job';

  if (job) {
    document.getElementById('job-id').value = job.id;
    document.getElementById('job-org').value = job.organization || '';
    document.getElementById('job-org-short').value = job.orgShort || '';
    document.getElementById('job-vacancy').value = job.vacancy || '';
    document.getElementById('job-category').value = job.categoryId || '';
    document.getElementById('job-eligibility').value = job.eligibility || '';
    document.getElementById('job-lastdate').value = job.lastDate ? job.lastDate.substring(0, 10) : '';
    document.getElementById('job-link').value = job.applyLink || '';
    document.getElementById('job-badge').value = job.badge || '';
    document.getElementById('job-salary').value = job.salary || '';
    document.getElementById('job-experience').value = job.experience || '';
    document.getElementById('job-type').value = job.jobType || '';
    document.getElementById('job-location').value = job.location || '';
    document.getElementById('job-skills').value = job.skills || '';
    document.getElementById('job-logo-url').value = job.logoUrl || '';
    document.getElementById('job-pdf-url').value = job.pdfUrl || '';
    document.getElementById('job-desc').value = job.description || '';
    document.getElementById('job-active').value = String(job.isActive);
    document.getElementById('job-featured').value = String(job.isFeatured);
  }

  document.getElementById('job-modal').style.display = 'flex';
}

window.closeJobModal = function () {
  document.getElementById('job-modal').style.display = 'none';
};

async function editJob(id) {
  const res = await apiFetch(`/api/jobs/${id}`);
  if (!res || !res.ok) return;
  const job = await res.json();
  openJobModal(job);
}

function confirmDeleteJob(id, name) {
  document.getElementById('delete-modal-title').textContent = `Delete Job: ${name}?`;
  document.getElementById('delete-modal-text').textContent = 'This action cannot be undone.';
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('Job deleted successfully.', 'success');
        loadJobs(jobsCurrentPage);
      } else {
        showToast('Failed to delete job.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

async function toggleJobActive(id) {
  const res = await apiFetch(`/api/jobs/${id}/toggle-active`, { method: 'PATCH' });
  if (res && res.ok) {
    showToast('Job status updated.', 'success');
    loadJobs(jobsCurrentPage);
  } else {
    showToast('Failed to update job status.', 'error');
  }
}

async function toggleJobFeatured(id) {
  const res = await apiFetch(`/api/jobs/${id}/toggle-featured`, { method: 'PATCH' });
  if (res && res.ok) {
    showToast('Job featured status updated.', 'success');
    loadJobs(jobsCurrentPage);
  } else {
    showToast('Failed to update featured status.', 'error');
  }
}

// ============================================================
// SERVICES MANAGEMENT
// ============================================================
let svcFilter = 'all';
let svcSearch = '';

async function loadAdminServices() {
  let url = '/api/services?adminMode=true';
  if (svcSearch) url += `&search=${encodeURIComponent(svcSearch)}`;
  if (svcFilter !== 'all') url += `&status=${svcFilter}`;

  const res = await apiFetch(url);
  if (!res || !res.ok) return;
  const services = await res.json();

  const grid = document.getElementById('admin-services-list');
  if (!grid) return;

  if (!services.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">No services found.</div>';
    return;
  }

  grid.innerHTML = services.map(s => `
    <div class="admin-service-card ${!s.isEnabled ? 'hidden-service' : ''}" id="admin-card-${s.id}">
      <div class="admin-card-header">
        <div class="admin-card-icon"><i class="${s.icon || 'fa-solid fa-cog'}"></i></div>
        <div>
          <h4>${escHtml(s.title)}</h4>
          <span style="font-size:0.8rem;color:var(--text-secondary);">${escHtml(s.category)}</span>
        </div>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin:10px 0;flex:1;">${escHtml((s.description || '').substring(0, 100))}...</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <strong style="color:var(--primary-color);">${escHtml(s.price || 'Free')}</strong>
        ${statusBadge(s.status)}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="editService(${s.id})" class="btn btn-sm btn-outline"><i class="fa-solid fa-pen"></i> Edit</button>
        <button onclick="toggleServiceEnabled(${s.id})" class="btn btn-sm ${s.isEnabled ? 'btn-success' : 'btn-outline'}">
          <i class="fa-solid ${s.isEnabled ? 'fa-eye' : 'fa-eye-slash'}"></i>
        </button>
        <button onclick="confirmDeleteService(${s.id}, '${escHtml(s.title)}')" class="btn btn-sm btn-danger">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function statusBadge(status) {
  const map = {
    'available': '<span class="status-badge badge-available"><i class="fa-solid fa-circle-check"></i> Available</span>',
    'coming-soon': '<span class="status-badge badge-coming-soon"><i class="fa-solid fa-clock"></i> Coming Soon</span>',
    'not-available': '<span class="status-badge badge-not-available"><i class="fa-solid fa-circle-xmark"></i> Not Available</span>'
  };
  return map[status] || map['available'];
}

function openServiceModal(svc = null) {
  const form = document.getElementById('svc-form');
  form.reset();
  document.getElementById('svc-id').value = '';
  document.getElementById('svc-modal-title').textContent = svc ? 'Edit Service' : 'Add New Service';

  if (svc) {
    document.getElementById('svc-id').value = svc.id;
    document.getElementById('svc-name').value = svc.title || '';
    document.getElementById('svc-category').value = svc.category || 'Government';
    document.getElementById('svc-desc').value = svc.description || '';
    document.getElementById('svc-price').value = svc.price || '';
    document.getElementById('svc-icon').value = svc.icon || '';
    document.getElementById('svc-image').value = svc.imageUrl || '';
    document.getElementById('svc-status').value = svc.status || 'available';
    document.getElementById('svc-enabled').value = String(svc.isEnabled !== false);
    document.getElementById('svc-order').value = svc.displayOrder || 0;
  }

  document.getElementById('service-modal').style.display = 'flex';
}

window.closeServiceModal = function () {
  document.getElementById('service-modal').style.display = 'none';
};

async function editService(id) {
  const res = await apiFetch(`/api/services/${id}`);
  if (!res || !res.ok) return;
  const svc = await res.json();
  openServiceModal(svc);
}

async function toggleServiceEnabled(id) {
  const res = await apiFetch(`/api/services/${id}/toggle-enabled`, { method: 'PATCH' });
  if (res && res.ok) {
    showToast('Service visibility updated.', 'success');
    loadAdminServices();
  } else {
    showToast('Failed to update service.', 'error');
  }
}

function confirmDeleteService(id, name) {
  document.getElementById('delete-modal-title').textContent = `Delete Service: ${name}?`;
  document.getElementById('delete-modal-text').textContent = 'This will permanently remove the service.';
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('Service deleted.', 'success');
        loadAdminServices();
      } else {
        showToast('Failed to delete service.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

// ============================================================
// CATEGORIES MANAGEMENT
// ============================================================
async function loadCategories() {
  const res = await apiFetch('/api/categories');
  if (!res || !res.ok) return;
  const cats = await res.json();

  const tbody = document.getElementById('categories-list');
  if (!tbody) return;

  if (!cats.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No categories.</td></tr>';
    return;
  }

  tbody.innerHTML = cats.map(c => `
    <tr>
      <td>${c.displayOrder}</td>
      <td><i class="${escHtml(c.icon)}" style="font-size:1.3rem;color:${escHtml(c.color)};"></i></td>
      <td><strong>${escHtml(c.name)}</strong></td>
      <td><span style="display:inline-block;width:26px;height:26px;border-radius:6px;background:${escHtml(c.color)};border:1px solid var(--border-color);"></span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button onclick="editCategory(${c.id})" class="btn btn-sm btn-outline"><i class="fa-solid fa-pen"></i></button>
          <button onclick="confirmDeleteCategory(${c.id}, '${escHtml(c.name)}')" class="btn btn-sm btn-danger"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function editCategory(id) {
  const res = await apiFetch(`/api/categories/${id}`);
  if (!res || !res.ok) return;
  const c = await res.json();

  document.getElementById('cat-id').value = c.id;
  document.getElementById('cat-name').value = c.name;
  document.getElementById('cat-icon').value = c.icon;
  document.getElementById('cat-color').value = c.color;
  document.getElementById('cat-order').value = c.displayOrder;
  document.getElementById('category-form-title').textContent = 'Edit Category';
  document.getElementById('cat-submit-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update';
}

window.resetCategoryForm = function () {
  document.getElementById('category-form').reset();
  document.getElementById('cat-id').value = '';
  document.getElementById('category-form-title').textContent = 'Create Category';
  document.getElementById('cat-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Save';
};

function confirmDeleteCategory(id, name) {
  document.getElementById('delete-modal-title').textContent = `Delete Category: ${name}?`;
  document.getElementById('delete-modal-text').textContent = 'Categories assigned to jobs cannot be deleted.';
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('Category deleted.', 'success');
        loadCategories();
      } else {
        const err = await res?.json();
        showToast(err?.message || 'Failed to delete category.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

// ============================================================
// BANNERS MANAGEMENT
// ============================================================
async function loadBanners() {
  const res = await apiFetch('/api/banners');
  if (!res || !res.ok) return;
  const banners = await res.json();

  const tbody = document.getElementById('banners-list');
  if (!tbody) return;

  if (!banners.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No banners found.</td></tr>';
    return;
  }

  tbody.innerHTML = banners.map(b => `
    <tr>
      <td>${b.displayOrder}</td>
      <td><span style="font-size:0.78rem;background:rgba(37,99,235,0.1);color:var(--primary-color);padding:3px 8px;border-radius:50px;">${escHtml(b.type)}</span></td>
      <td><strong>${escHtml(b.title)}</strong></td>
      <td>
        <button onclick="toggleBannerActive(${b.id})" class="btn btn-sm ${b.isActive ? 'btn-success' : 'btn-outline'}">
          ${b.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td>
        <div style="display:flex;gap:6px;">
          <button onclick="editBanner(${b.id})" class="btn btn-sm btn-outline"><i class="fa-solid fa-pen"></i></button>
          <button onclick="confirmDeleteBanner(${b.id}, '${escHtml(b.title)}')" class="btn btn-sm btn-danger"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function editBanner(id) {
  const res = await apiFetch(`/api/banners/${id}`);
  if (!res || !res.ok) return;
  const b = await res.json();

  document.getElementById('banner-id').value = b.id;
  document.getElementById('banner-title').value = b.title || '';
  document.getElementById('banner-type').value = b.type || 'SliderImage';
  document.getElementById('banner-image-url').value = b.imageUrl || '';
  document.getElementById('banner-link').value = b.linkUrl || '';
  document.getElementById('banner-content').value = b.content || '';
  document.getElementById('banner-order').value = b.displayOrder || 0;
  document.getElementById('banner-status').value = String(b.isActive);
  document.getElementById('banner-form-title').textContent = 'Edit Banner';
  document.getElementById('banner-submit-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Banner';
}

window.resetBannerForm = function () {
  document.getElementById('banner-form').reset();
  document.getElementById('banner-id').value = '';
  document.getElementById('banner-form-title').textContent = 'Manage Banner';
  document.getElementById('banner-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Save Banner';
};

async function toggleBannerActive(id) {
  const res = await apiFetch(`/api/banners/${id}/toggle-active`, { method: 'PATCH' });
  if (res && res.ok) {
    showToast('Banner status updated.', 'success');
    loadBanners();
  } else {
    showToast('Failed to update banner.', 'error');
  }
}

function confirmDeleteBanner(id, name) {
  document.getElementById('delete-modal-title').textContent = `Delete Banner: ${name}?`;
  document.getElementById('delete-modal-text').textContent = 'This will permanently remove the banner.';
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('Banner deleted.', 'success');
        loadBanners();
      } else {
        showToast('Failed to delete banner.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

// ============================================================
// USERS MANAGEMENT
// ============================================================
async function loadUsers() {
  const res = await apiFetch('/api/users');
  if (!res || !res.ok) return;
  const users = await res.json();

  const tbody = document.getElementById('users-list');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${escHtml(u.username)}</strong></td>
      <td>${roleBadge(u.role)}</td>
      <td>
        ${u.isBlocked
          ? '<span style="color:#ef4444;"><i class="fa-solid fa-lock"></i> Blocked</span>'
          : '<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Active</span>'
        }
      </td>
      <td>${u.lastLogin ? fmtDate(u.lastLogin) : '<span style="color:var(--text-secondary);">Never</span>'}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="resetUserPassword(${u.id}, '${escHtml(u.username)}')" class="btn btn-sm btn-warning" title="Reset Password">
            <i class="fa-solid fa-key"></i>
          </button>
          <button onclick="toggleUserBlock(${u.id})" class="btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-outline'}" title="${u.isBlocked ? 'Unblock' : 'Block'}">
            <i class="fa-solid ${u.isBlocked ? 'fa-lock-open' : 'fa-lock'}"></i>
          </button>
          ${u.username !== currentAdminUser ? `
            <button onclick="confirmDeleteUser(${u.id}, '${escHtml(u.username)}')" class="btn btn-sm btn-danger" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

async function toggleUserBlock(id) {
  const res = await apiFetch(`/api/users/${id}`, { method: 'GET' });
  if (!res || !res.ok) return;
  const user = await res.json();

  const updateRes = await apiFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ role: user.role, isBlocked: !user.isBlocked })
  });
  if (updateRes && updateRes.ok) {
    showToast('User status updated.', 'success');
    loadUsers();
  } else {
    showToast('Failed to update user.', 'error');
  }
}

async function resetUserPassword(id, username) {
  const newPwd = prompt(`Enter new password for user "${username}":`);
  if (!newPwd || newPwd.trim().length < 4) {
    showToast('Password must be at least 4 characters.', 'error');
    return;
  }
  const res = await apiFetch(`/api/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword: newPwd })
  });
  if (res && res.ok) {
    showToast(`Password for ${username} reset successfully.`, 'success');
  } else {
    showToast('Failed to reset password.', 'error');
  }
}

function confirmDeleteUser(id, name) {
  document.getElementById('delete-modal-title').textContent = `Delete User: ${name}?`;
  document.getElementById('delete-modal-text').textContent = 'This will permanently remove the user account.';
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('User deleted.', 'success');
        loadUsers();
      } else {
        showToast('Failed to delete user.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

// ============================================================
// CONTACTS MANAGEMENT
// ============================================================
async function loadContacts() {
  const res = await apiFetch('/api/contacts');
  if (!res || !res.ok) return;
  const msgs = await res.json();

  const tbody = document.getElementById('contacts-list');
  if (!tbody) return;

  if (!msgs.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No messages received.</td></tr>';
    return;
  }

  tbody.innerHTML = msgs.map(m => `
    <tr style="${!m.isCompleted ? 'font-weight:600;' : 'opacity:0.75;'}">
      <td style="white-space:nowrap;">${fmtDate(m.createdAt)}</td>
      <td>
        <strong>${escHtml(m.name)}</strong><br>
        <span style="font-size:0.8rem;color:var(--text-secondary);">${escHtml(m.email || '')}</span><br>
        <span style="font-size:0.8rem;color:var(--text-secondary);">${escHtml(m.phone || '')}</span>
      </td>
      <td style="max-width:250px;">
        <span style="font-size:0.78rem;">${escHtml((m.message || '').substring(0, 120))}${(m.message || '').length > 120 ? '...' : ''}</span>
        ${m.replyMessage ? `<br><span style="font-size:0.75rem;color:#10b981;margin-top:4px;display:block;"><i class="fa-solid fa-reply"></i> Replied by ${escHtml(m.repliedBy || 'Admin')}</span>` : ''}
      </td>
      <td>
        <button onclick="toggleMsgComplete(${m.id})" class="btn btn-sm ${m.isCompleted ? 'btn-success' : 'btn-outline'}">
          ${m.isCompleted ? '<i class="fa-solid fa-circle-check"></i> Done' : '<i class="fa-solid fa-circle"></i> Open'}
        </button>
      </td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="openReplyModal(${m.id}, '${escHtml(m.name)}', '${escAttr(m.message)}')" class="btn btn-sm btn-primary" title="Reply">
            <i class="fa-solid fa-reply"></i>
          </button>
          <button onclick="confirmDeleteMsg(${m.id})" class="btn btn-sm btn-danger" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function toggleMsgComplete(id) {
  const res = await apiFetch(`/api/contacts/${id}/complete`, { method: 'PATCH' });
  if (res && res.ok) {
    showToast('Message status updated.', 'success');
    loadContacts();
  } else {
    showToast('Failed to update message.', 'error');
  }
}

function openReplyModal(id, name, message) {
  document.getElementById('reply-msg-id').value = id;
  document.getElementById('reply-sender-name').value = name;
  document.getElementById('reply-user-message').textContent = decodeURIComponent(message);
  document.getElementById('reply-text').value = '';
  document.getElementById('reply-modal').style.display = 'flex';
}

window.closeReplyModal = function () {
  document.getElementById('reply-modal').style.display = 'none';
};

function confirmDeleteMsg(id) {
  document.getElementById('delete-modal-title').textContent = 'Delete Message?';
  document.getElementById('delete-modal-text').textContent = 'This will permanently remove the contact message.';
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('Message deleted.', 'success');
        loadContacts();
      } else {
        showToast('Failed to delete message.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

// ============================================================
// FILE MANAGER
// ============================================================
async function loadFiles(folder) {
  currentFmFolder = folder;
  document.querySelectorAll('#fm-folders .folder-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.folder === folder);
  });

  const res = await apiFetch(`/api/files?folder=${folder}`);
  if (!res || !res.ok) return;
  const files = await res.json();

  const grid = document.getElementById('fm-files-grid');
  if (!grid) return;

  if (!files.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);"><i class="fa-solid fa-folder-open" style="font-size:3rem;display:block;margin-bottom:15px;"></i>No files uploaded yet.</div>';
    return;
  }

  grid.innerHTML = files.map(url => {
    const filename = url.split('/').pop();
    const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
    return `
      <div class="file-card">
        <div class="file-preview">
          ${isImg
            ? `<img src="${escHtml(url)}" alt="${escHtml(filename)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`
            : `<i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i>`
          }
        </div>
        <div class="file-name" title="${escHtml(filename)}">${escHtml(filename)}</div>
        <div class="file-actions">
          <a href="${escHtml(url)}" target="_blank" class="btn btn-sm btn-outline" title="View"><i class="fa-solid fa-eye"></i></a>
          <button onclick="copyToClipboard('${escHtml(url)}')" class="btn btn-sm btn-outline" title="Copy URL"><i class="fa-solid fa-copy"></i></button>
          <button onclick="deleteFile('${escHtml(url)}')" class="btn btn-sm btn-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

async function deleteFile(url) {
  document.getElementById('delete-modal-title').textContent = 'Delete File?';
  document.getElementById('delete-modal-text').textContent = url.split('/').pop();
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch(`/api/files?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
      if (res && res.ok) {
        showToast('File deleted.', 'success');
        loadFiles(currentFmFolder);
      } else {
        showToast('Failed to delete file.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('URL copied to clipboard!', 'success');
  });
}

async function handleFileUpload(e) {
  e.preventDefault();
  const fileInput = document.getElementById('fm-file-input');
  if (!fileInput.files.length) { showToast('Please choose a file first.', 'error'); return; }

  const file = fileInput.files[0];
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', currentFmFolder);

  const isPdf = /\.pdf$/i.test(file.name);
  const endpoint = isPdf ? '/api/files/upload-pdf' : '/api/files/upload-image';

  try {
    const res = await fetch(endpoint, { method: 'POST', body: fd, credentials: 'include' });
    if (res.ok) {
      showToast('File uploaded successfully!', 'success');
      fileInput.value = '';
      loadFiles(currentFmFolder);
    } else {
      const err = await res.json();
      showToast(err.message || 'Upload failed.', 'error');
    }
  } catch (err) {
    showToast('Upload error: ' + err.message, 'error');
  }
}

// ============================================================
// SETTINGS
// ============================================================
async function loadSettings() {
  const res = await apiFetch('/api/settings');
  if (!res || !res.ok) return;
  const settings = await res.json();

  settings.forEach(s => {
    const el = document.getElementById(`set-${s.key}`);
    if (el) el.value = s.value || '';
  });
}

async function saveSettings(e) {
  e.preventDefault();
  const btn = e.submitter || document.querySelector('#settings-form button[type=submit]');
  setLoading(btn, true);

  const form = document.getElementById('settings-form');
  const inputs = form.querySelectorAll('input, textarea, select');
  const payload = {};

  inputs.forEach(input => {
    if (input.name) {
      payload[input.name] = input.value;
    }
  });

  const res = await apiFetch('/api/settings/save-multiple', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  setLoading(btn, false);
  if (res && res.ok) {
    showToast('Settings saved successfully! Changes will appear on the website.', 'success');
  } else {
    showToast('Failed to save settings.', 'error');
  }
}

// ============================================================
// BACKUPS
// ============================================================
async function loadBackups() {
  const res = await apiFetch('/api/backups');
  if (!res || !res.ok) return;
  const backups = await res.json();

  const tbody = document.getElementById('backups-list-tbody');
  if (!tbody) return;

  if (!backups.length) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-secondary);">No backups available.</td></tr>';
    return;
  }

  tbody.innerHTML = backups.map(f => `
    <tr>
      <td style="font-size:0.85rem;">${escHtml(f)}</td>
      <td>
        <button onclick="confirmRestore('${escHtml(f)}')" class="btn btn-sm btn-warning">
          <i class="fa-solid fa-rotate-left"></i> Restore
        </button>
      </td>
    </tr>
  `).join('');
}

function confirmRestore(filename) {
  document.getElementById('delete-modal-title').textContent = 'Restore Database?';
  document.getElementById('delete-modal-text').textContent = `This will OVERWRITE the current database with backup: "${filename}". This cannot be undone.`;
  deleteTarget = {
    fn: async () => {
      const res = await apiFetch('/api/backups/restore', {
        method: 'POST',
        body: JSON.stringify({ fileName: filename })
      });
      if (res && res.ok) {
        showToast('Database restored successfully.', 'success');
      } else {
        const err = await res?.json();
        showToast(err?.message || 'Restore failed.', 'error');
      }
    }
  };
  document.getElementById('delete-modal').style.display = 'flex';
}

// ============================================================
// SYSTEM LOGS
// ============================================================
async function loadLogs() {
  const actRes = await apiFetch('/api/users/activity-logs');
  if (actRes && actRes.ok) {
    const logs = await actRes.json();
    const tbody = document.querySelector('#logs-activity-table tbody');
    if (tbody) {
      if (!logs.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No activity logs.</td></tr>';
      } else {
        tbody.innerHTML = logs.map(l => `
          <tr>
            <td style="white-space:nowrap;">${fmtDate(l.timestamp)}</td>
            <td><strong>${escHtml(l.username)}</strong></td>
            <td>${escHtml(l.action)}</td>
            <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(l.details || '-')}</td>
            <td style="font-size:0.8rem;color:var(--text-secondary);">${escHtml(l.ipAddress || '')}</td>
          </tr>
        `).join('');
      }
    }
  }

  const auditRes = await apiFetch('/api/users/audit-logs');
  if (auditRes && auditRes.ok) {
    const audits = await auditRes.json();
    const tbody = document.querySelector('#logs-audit-table tbody');
    if (tbody) {
      if (!audits.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-secondary);">No audit logs.</td></tr>';
      } else {
        tbody.innerHTML = audits.map(a => `
          <tr>
            <td style="white-space:nowrap;">${fmtDate(a.changedAt)}</td>
            <td><strong>${escHtml(a.changedBy)}</strong></td>
            <td><span style="font-size:0.78rem;padding:3px 8px;border-radius:50px;background:rgba(37,99,235,0.1);color:var(--primary-color);">${escHtml(a.action)}</span></td>
            <td>${escHtml(a.entityName)}</td>
            <td>${a.entityId || '-'}</td>
            <td style="font-size:0.75rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;color:var(--text-secondary);">${escHtml((a.oldValues || '').substring(0, 80))}</td>
            <td style="font-size:0.75rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;color:var(--text-secondary);">${escHtml((a.newValues || '').substring(0, 80))}</td>
            <td style="font-size:0.8rem;">${escHtml(a.ipAddress || '')}</td>
          </tr>
        `).join('');
      }
    }
  }
}

// ============================================================
// DELETE MODAL
// ============================================================
window.closeDeleteModal = function () {
  document.getElementById('delete-modal').style.display = 'none';
  deleteTarget = null;
};

// ============================================================
// UTILS
// ============================================================
function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(str) {
  if (str == null) return '';
  return encodeURIComponent(String(str).substring(0, 300));
}

function fmtDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ============================================================
// DOMContentLoaded - WIRE UP EVERYTHING
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkSession();

  // --- Login Form ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('admin-username')?.value;
      const password = document.getElementById('admin-password')?.value;
      const errorEl = document.getElementById('login-error');
      const btn = loginForm.querySelector('button[type=submit]');

      setLoading(btn, true);
      errorEl.style.display = 'none';

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, rememberMe: true })
      });

      setLoading(btn, false);
      if (res.ok) {
        const data = await res.json();
        currentAdminRole = data.role;
        currentAdminUser = data.username;
        document.getElementById('welcome-username').textContent = `Welcome, ${data.username}`;
        applyRoleVisibility(data.role);
        showDashboard();
      } else {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Invalid username or password.';
      }
    });
  }

  // --- Logout ---
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      showLoginScreen();
    });
  }

  // --- Sidebar Navigation ---
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabMap = {
        'dashboard-tab': 'Dashboard',
        'jobs-tab': 'Job Management',
        'services-tab': 'Service Management',
        'categories-tab': 'Category Management',
        'banners-tab': 'Banners & Announcements',
        'users-tab': 'User Management',
        'contacts-tab': 'Contact Messages',
        'file-manager-tab': 'File Manager',
        'settings-tab': 'Settings',
        'backups-tab': 'Database & Backups',
        'logs-tab': 'System Audit Logs'
      };
      switchTab(link.dataset.tab, tabMap[link.dataset.tab] || 'Dashboard');
    });
  });

  // --- Sidebar Toggle ---
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('admin-sidebar');
      const mainArea = document.getElementById('admin-main-area');
      sidebar.classList.toggle('collapsed');
      mainArea.classList.toggle('expanded');
    });
  }

  // --- Dark/Light Theme Toggle ---
  const themeToggle = document.getElementById('admin-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isDark = !document.body.classList.contains('light-mode');
      themeToggle.innerHTML = isDark
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
      localStorage.setItem('apb-theme', isDark ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('apb-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  }

  // --- Jobs Tab Setup ---
  populateJobCategoryDropdown();

  const jobSearch = document.getElementById('job-search');
  if (jobSearch) {
    let searchTimer;
    jobSearch.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadJobs(1), 350);
    });
  }

  document.getElementById('job-filter-category')?.addEventListener('change', () => loadJobs(1));
  document.getElementById('job-filter-status')?.addEventListener('change', () => loadJobs(1));

  document.getElementById('btn-jobs-prev')?.addEventListener('click', () => {
    if (jobsCurrentPage > 1) loadJobs(jobsCurrentPage - 1);
  });
  document.getElementById('btn-jobs-next')?.addEventListener('click', () => {
    if (jobsCurrentPage < jobsTotalPages) loadJobs(jobsCurrentPage + 1);
  });

  // --- Job Form Submit ---
  const jobForm = document.getElementById('job-form');
  if (jobForm) {
    jobForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = jobForm.querySelector('button[type=submit]');
      const id = document.getElementById('job-id').value;
      setLoading(btn, true);

      const body = {
        id: id ? parseInt(id) : 0,
        organization: document.getElementById('job-org').value,
        orgShort: document.getElementById('job-org-short').value,
        vacancy: parseInt(document.getElementById('job-vacancy').value),
        categoryId: parseInt(document.getElementById('job-category').value),
        eligibility: document.getElementById('job-eligibility').value,
        lastDate: document.getElementById('job-lastdate').value,
        applyLink: document.getElementById('job-link').value,
        badge: document.getElementById('job-badge').value,
        salary: document.getElementById('job-salary').value,
        experience: document.getElementById('job-experience').value,
        jobType: document.getElementById('job-type').value,
        location: document.getElementById('job-location').value,
        skills: document.getElementById('job-skills').value,
        logoUrl: document.getElementById('job-logo-url').value,
        pdfUrl: document.getElementById('job-pdf-url').value,
        description: document.getElementById('job-desc').value,
        isActive: document.getElementById('job-active').value === 'true',
        isFeatured: document.getElementById('job-featured').value === 'true'
      };

      const isEdit = !!id;
      const res = await apiFetch(isEdit ? `/api/jobs/${id}` : '/api/jobs', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      setLoading(btn, false);
      if (res && (res.ok || res.status === 201)) {
        showToast(isEdit ? 'Job updated successfully!' : 'Job created successfully!', 'success');
        closeJobModal();
        loadJobs(isEdit ? jobsCurrentPage : 1);
      } else {
        showToast('Failed to save job. Check all required fields.', 'error');
      }
    });
  }

  // --- Service Filters ---
  document.querySelectorAll('.adm-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      svcFilter = btn.dataset.status;
      loadAdminServices();
    });
  });

  const svcSearch = document.getElementById('svc-search-input');
  if (svcSearch) {
    let svcTimer;
    svcSearch.addEventListener('input', () => {
      clearTimeout(svcTimer);
      svcTimer = setTimeout(() => {
        svcSearch_val = svcSearch.value;
        loadAdminServices();
      }, 350);
    });
  }

  // --- Service Form Submit ---
  const svcForm = document.getElementById('svc-form');
  if (svcForm) {
    svcForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = svcForm.querySelector('button[type=submit]');
      const id = document.getElementById('svc-id').value;
      setLoading(btn, true);

      const body = {
        id: id ? parseInt(id) : 0,
        title: document.getElementById('svc-name').value,
        category: document.getElementById('svc-category').value,
        description: document.getElementById('svc-desc').value,
        price: document.getElementById('svc-price').value,
        icon: document.getElementById('svc-icon').value,
        imageUrl: document.getElementById('svc-image').value,
        status: document.getElementById('svc-status').value,
        isEnabled: document.getElementById('svc-enabled').value === 'true',
        displayOrder: parseInt(document.getElementById('svc-order').value) || 0
      };

      const isEdit = !!id;
      const res = await apiFetch(isEdit ? `/api/services/${id}` : '/api/services', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      setLoading(btn, false);
      if (res && (res.ok || res.status === 201)) {
        showToast(isEdit ? 'Service updated!' : 'Service created!', 'success');
        closeServiceModal();
        loadAdminServices();
      } else {
        showToast('Failed to save service.', 'error');
      }
    });
  }

  // --- Category Form Submit ---
  const catForm = document.getElementById('category-form');
  if (catForm) {
    catForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = catForm.querySelector('button[type=submit]');
      const id = document.getElementById('cat-id').value;
      setLoading(btn, true);

      const body = {
        id: id ? parseInt(id) : 0,
        name: document.getElementById('cat-name').value,
        icon: document.getElementById('cat-icon').value,
        color: document.getElementById('cat-color').value,
        displayOrder: parseInt(document.getElementById('cat-order').value) || 0
      };

      const isEdit = !!id;
      const res = await apiFetch(isEdit ? `/api/categories/${id}` : '/api/categories', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      setLoading(btn, false);
      if (res && (res.ok || res.status === 201)) {
        showToast(isEdit ? 'Category updated!' : 'Category created!', 'success');
        resetCategoryForm();
        loadCategories();
      } else {
        showToast('Failed to save category.', 'error');
      }
    });
  }

  // --- Banner Form Submit ---
  const bannerForm = document.getElementById('banner-form');
  if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = bannerForm.querySelector('button[type=submit]');
      const id = document.getElementById('banner-id').value;
      setLoading(btn, true);

      const body = {
        id: id ? parseInt(id) : 0,
        title: document.getElementById('banner-title').value,
        type: document.getElementById('banner-type').value,
        imageUrl: document.getElementById('banner-image-url').value,
        linkUrl: document.getElementById('banner-link').value,
        content: document.getElementById('banner-content').value,
        displayOrder: parseInt(document.getElementById('banner-order').value) || 0,
        isActive: document.getElementById('banner-status').value === 'true'
      };

      const isEdit = !!id;
      const res = await apiFetch(isEdit ? `/api/banners/${id}` : '/api/banners', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      setLoading(btn, false);
      if (res && (res.ok || res.status === 201)) {
        showToast(isEdit ? 'Banner updated!' : 'Banner created!', 'success');
        resetBannerForm();
        loadBanners();
      } else {
        showToast('Failed to save banner.', 'error');
      }
    });
  }

  // --- User Form Submit ---
  const userForm = document.getElementById('user-form');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = userForm.querySelector('button[type=submit]');
      setLoading(btn, true);

      const body = {
        username: document.getElementById('usr-username').value,
        password: document.getElementById('usr-password').value,
        role: document.getElementById('usr-role').value
      };

      const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(body) });
      setLoading(btn, false);

      if (res && res.ok) {
        showToast('User created successfully.', 'success');
        userForm.reset();
        loadUsers();
      } else {
        const err = await res?.json();
        showToast(err?.message || 'Failed to create user.', 'error');
      }
    });
  }

  // --- Reply Form Submit ---
  const replyForm = document.getElementById('reply-form');
  if (replyForm) {
    replyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('reply-submit-btn');
      const id = document.getElementById('reply-msg-id').value;
      setLoading(btn, true);

      const res = await apiFetch(`/api/contacts/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyMessage: document.getElementById('reply-text').value })
      });

      setLoading(btn, false);
      if (res && res.ok) {
        showToast('Reply sent and message marked as completed!', 'success');
        closeReplyModal();
        loadContacts();
      } else {
        showToast('Failed to send reply.', 'error');
      }
    });
  }

  // --- Settings Form Submit ---
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', saveSettings);
  }

  // --- File Manager ---
  document.querySelectorAll('#fm-folders .folder-btn').forEach(btn => {
    btn.addEventListener('click', () => loadFiles(btn.dataset.folder));
  });

  const fmForm = document.getElementById('fm-upload-form');
  if (fmForm) {
    fmForm.addEventListener('submit', handleFileUpload);
  }

  // --- Backup Button ---
  document.getElementById('btn-create-backup')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-create-backup');
    setLoading(btn, true);
    const res = await apiFetch('/api/backups/backup', { method: 'POST' });
    setLoading(btn, false);
    if (res && res.ok) {
      const data = await res.json();
      showToast(`Backup created: ${data.file}`, 'success');
      loadBackups();
    } else {
      const err = await res?.json();
      showToast(err?.message || 'Backup failed. (LocalDB may not support BACKUP DATABASE command)', 'error');
    }
  });

  // --- Delete Confirm Modal Button ---
  document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    if (deleteTarget && typeof deleteTarget.fn === 'function') {
      await deleteTarget.fn();
    }
    closeDeleteModal();
  });

  // --- Close modals on overlay click ---
  ['job-modal', 'service-modal', 'reply-modal', 'delete-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          if (id === 'delete-modal') closeDeleteModal();
          else if (id === 'job-modal') closeJobModal();
          else if (id === 'service-modal') closeServiceModal();
          else if (id === 'reply-modal') closeReplyModal();
        }
      });
    }
  });
});
