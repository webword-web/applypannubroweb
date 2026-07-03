/**
 * APPLY PANNU BRO - Admin Panel JavaScript
 * Integrated with real-time Firebase backend (Auth, Firestore, Cloud Storage)
 */

// ============================================================
// STATE & CONFIG
// ============================================================
let deleteTargetId = null;
let currentFilter = 'all';
let currentSearch = '';

// Local cache for real-time lists
let cachedServices = [];
let cachedFaqs = [];
let cachedTestimonials = [];

// ============================================================
// TOAST NOTIFICATIONS
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
// AUTHSTATE & INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.auth === 'undefined' || typeof window.db === 'undefined') {
    showToast("Firebase initialization failed. Please review firebase-config.js", "error");
    return;
  }

  // Auth Listener
  window.auth.onAuthStateChanged(async (user) => {
    if (user) {
      showDashboard();
      await seedServicesIfNeeded();
      startRealTimeListeners();
    } else {
      showLoginScreen();
    }
  });

  // Login Form Submission
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const errEl = document.getElementById('login-error');

    window.auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        errEl.style.display = 'none';
        showToast("Logged in successfully!", "success");
      })
      .catch((error) => {
        console.error(error);
        errEl.textContent = '❌ Invalid credentials: ' + error.message;
        errEl.style.display = 'block';
      });
  });

  // Logout Button
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.auth.signOut().then(() => {
      showToast("Logged out successfully.", "info");
    });
  });

  // Sidebar Tabs Navigation
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      const titles = {
        'dashboard-tab': 'Dashboard',
        'services-tab': 'Manage Services',
        'add-service-tab': 'Add New Service',
        'settings-tab': 'Website Configuration',
        'faqs-tab': 'Manage FAQs',
        'testimonials-tab': 'Client Testimonials'
      };
      switchTab(tabId, titles[tabId] || '');

      // Mobile drawer close
      if (window.innerWidth < 768) {
        document.getElementById('admin-sidebar').classList.remove('mobile-open');
      }
    });
  });

  // Sidebar Toggle
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

  // Search input inside Services Tab
  document.getElementById('admin-search').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderAdminServices();
  });

  // Filters inside Services Tab
  document.querySelectorAll('.adm-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status');
      renderAdminServices();
    });
  });

  // Add Service Form submit
  document.getElementById('service-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('svc-submit-btn');
    submitBtn.disabled = true;

    try {
      const serviceData = {
        title: document.getElementById('svc-name').value.trim(),
        category: document.getElementById('svc-category').value,
        desc: document.getElementById('svc-desc').value.trim(),
        price: document.getElementById('svc-price').value.trim() || '₹0',
        icon: document.getElementById('svc-icon').value.trim() || 'fa-solid fa-cog',
        status: document.getElementById('svc-status').value,
        visible: document.getElementById('svc-visible').value === 'true',
        orderIndex: cachedServices.length // Put at the end
      };

      await window.db.collection('services').add(serviceData);
      resetServiceForm();
      showToast('✅ Service added successfully!', 'success');
      switchTab('services-tab', 'Manage Services');
    } catch (err) {
      showToast('❌ Add failed: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Edit Service modal Form submit
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-edit-id').value;
    
    try {
      const updatedData = {
        title: document.getElementById('modal-svc-name').value.trim(),
        category: document.getElementById('modal-svc-category').value,
        desc: document.getElementById('modal-svc-desc').value.trim(),
        price: document.getElementById('modal-svc-price').value.trim(),
        icon: document.getElementById('modal-svc-icon').value.trim() || 'fa-solid fa-cog',
        status: document.getElementById('modal-svc-status').value,
        visible: document.getElementById('modal-svc-visible').value === 'true'
      };

      await window.db.collection('services').doc(id).update(updatedData);
      closeEditModal();
      showToast('✅ Service updated successfully!', 'success');
    } catch (err) {
      showToast('❌ Update failed: ' + err.message, 'error');
    }
  });

  // Delete Service Confirm Action
  document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (deleteTargetId !== null) {
      try {
        await window.db.collection('services').doc(deleteTargetId).delete();
        showToast('Service deleted!', 'error');
      } catch (err) {
        showToast('❌ Delete failed: ' + err.message, 'error');
      } finally {
        closeDeleteModal();
      }
    }
  });

  // Form submit for Homepage & Contacts settings
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('settings-submit-btn');
    submitBtn.disabled = true;

    try {
      const settings = {
        announcementText: document.getElementById('set-announcement-text').value.trim(),
        announcementVisible: document.getElementById('set-announcement-visible').value === 'true',
        heroTitle: document.getElementById('set-hero-title').value.trim(),
        heroSubtitle: document.getElementById('set-hero-subtitle').value.trim(),
        contactPhone: document.getElementById('set-contact-phone').value.trim(),
        contactWhatsapp: document.getElementById('set-contact-whatsapp').value.trim(),
        contactEmail: document.getElementById('set-contact-email').value.trim(),
        workingHours: document.getElementById('set-working-hours').value.trim(),
        contactAddress: document.getElementById('set-contact-address').value.trim(),
      };

      // Keep current image URL if preview is loaded
      const preview = document.getElementById('set-hero-preview');
      if (preview.style.display === 'block' && preview.src) {
        settings.heroImage = preview.src;
      }

      await window.db.collection('settings').doc('site_content').set(settings, { merge: true });
      showToast("✅ Settings updated successfully!", "success");
    } catch (err) {
      showToast("❌ Error saving settings: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Image Upload trigger for Hero Banner Background
  document.getElementById('upload-hero-btn').addEventListener('click', () => {
    const fileInput = document.getElementById('set-hero-file');
    const file = fileInput.files[0];
    if (!file) {
      showToast("Please select an image file to upload.", "warning");
      return;
    }

    const btn = document.getElementById('upload-hero-btn');
    const progressDiv = document.getElementById('hero-upload-progress');
    btn.disabled = true;
    progressDiv.style.display = 'block';
    progressDiv.textContent = "Uploading: 0%";

    const storageRef = window.storage.ref('banners/hero_bg_' + Date.now() + '_' + file.name);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        progressDiv.textContent = `Uploading: ${progress}%`;
      }, 
      (error) => {
        console.error(error);
        showToast("❌ Upload failed: " + error.message, "error");
        btn.disabled = false;
        progressDiv.style.display = 'none';
      }, 
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
          const preview = document.getElementById('set-hero-preview');
          preview.src = downloadURL;
          preview.style.display = 'block';

          // Save link directly in Firestore
          await window.db.collection('settings').doc('site_content').set({ heroImage: downloadURL }, { merge: true });
          showToast("✅ Banner image uploaded and saved!", "success");
          btn.disabled = false;
          progressDiv.style.display = 'none';
          fileInput.value = ''; // reset
        });
      }
    );
  });

  // FAQ Form submit
  document.getElementById('faq-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const faqId = document.getElementById('edit-faq-id').value;
    const submitBtn = document.getElementById('faq-submit-btn');
    submitBtn.disabled = true;

    try {
      const faqData = {
        question: document.getElementById('faq-question').value.trim(),
        answer: document.getElementById('faq-answer').value.trim()
      };

      if (faqId) {
        // Edit existing
        await window.db.collection('faqs').doc(faqId).update(faqData);
        showToast('✅ FAQ updated successfully!', 'success');
      } else {
        // Add new
        faqData.orderIndex = cachedFaqs.length;
        await window.db.collection('faqs').add(faqData);
        showToast('✅ FAQ added successfully!', 'success');
      }
      resetFaqForm();
    } catch (err) {
      showToast('❌ Action failed: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Testimonial Form submit
  document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const testimonialId = document.getElementById('edit-testimonial-id').value;
    const submitBtn = document.getElementById('testimonial-submit-btn');
    submitBtn.disabled = true;

    try {
      const testimonialData = {
        name: document.getElementById('testimonial-name').value.trim(),
        text: document.getElementById('testimonial-text').value.trim(),
        rating: parseInt(document.getElementById('testimonial-rating').value),
        source: document.getElementById('testimonial-source').value.trim() || 'Google Review'
      };

      if (testimonialId) {
        // Edit existing
        await window.db.collection('testimonials').doc(testimonialId).update(testimonialData);
        showToast('✅ Testimonial updated successfully!', 'success');
      } else {
        // Add new
        testimonialData.orderIndex = cachedTestimonials.length;
        await window.db.collection('testimonials').add(testimonialData);
        showToast('✅ Testimonial added successfully!', 'success');
      }
      resetTestimonialForm();
    } catch (err) {
      showToast('❌ Action failed: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Setup modals close on background overlay clicks
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) closeEditModal();
  });
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('delete-modal')) closeDeleteModal();
  });

  // Enable HTML5 drag and drop on lists
  setupDragAndDrop('admin-services-grid', updateServicesOrder);
  setupDragAndDrop('admin-faqs-list', updateFaqsOrder);
  setupDragAndDrop('admin-testimonials-list', updateTestimonialsOrder);
});

// ============================================================
// AUTH STATE SCREEN VISIBILITY
// ============================================================
function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'flex';
  switchTab('dashboard-tab', 'Dashboard');
}

// ============================================================
// TAB NAVIGATION SWAPPER
// ============================================================
function switchTab(tabId, title) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');
  
  const sidebarBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (sidebarBtn) sidebarBtn.classList.add('active');
  
  document.getElementById('page-title').textContent = title;
}

// ============================================================
// FIRESTORE REAL-TIME LISTENERS
// ============================================================
function startRealTimeListeners() {
  // Listen to services
  window.db.collection('services').orderBy('orderIndex').onSnapshot((snapshot) => {
    cachedServices = [];
    snapshot.forEach(doc => {
      cachedServices.push({ id: doc.id, ...doc.data() });
    });
    
    refreshDashboard();
    renderAdminServices();
  }, (err) => {
    console.error("Services fetch error: ", err);
    showToast("Error loading services", "error");
  });

  // Listen to FAQs
  window.db.collection('faqs').orderBy('orderIndex').onSnapshot((snapshot) => {
    cachedFaqs = [];
    snapshot.forEach(doc => {
      cachedFaqs.push({ id: doc.id, ...doc.data() });
    });
    renderAdminFaqs();
  }, (err) => {
    console.error("FAQs fetch error: ", err);
  });

  // Listen to Testimonials
  window.db.collection('testimonials').orderBy('orderIndex').onSnapshot((snapshot) => {
    cachedTestimonials = [];
    snapshot.forEach(doc => {
      cachedTestimonials.push({ id: doc.id, ...doc.data() });
    });
    renderAdminTestimonials();
  }, (err) => {
    console.error("Testimonials fetch error: ", err);
  });

  // Listen to settings
  window.db.collection('settings').doc('site_content').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('set-announcement-text').value = data.announcementText || '';
      document.getElementById('set-announcement-visible').value = String(data.announcementVisible !== false);
      document.getElementById('set-hero-title').value = data.heroTitle || '';
      document.getElementById('set-hero-subtitle').value = data.heroSubtitle || '';
      document.getElementById('set-contact-phone').value = data.contactPhone || '';
      document.getElementById('set-contact-whatsapp').value = data.contactWhatsapp || '';
      document.getElementById('set-contact-email').value = data.contactEmail || '';
      document.getElementById('set-working-hours').value = data.workingHours || '';
      document.getElementById('set-contact-address').value = data.contactAddress || '';
      
      const preview = document.getElementById('set-hero-preview');
      if (data.heroImage) {
        preview.src = data.heroImage;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    }
  });
}

// ============================================================
// DASHBOARD VIEW UPDATES
// ============================================================
function refreshDashboard() {
  document.getElementById('dash-total').textContent = cachedServices.length;
  document.getElementById('dash-available').textContent = cachedServices.filter(s => s.status === 'available').length;
  document.getElementById('dash-coming').textContent = cachedServices.filter(s => s.status === 'coming-soon').length;
  document.getElementById('dash-unavailable').textContent = cachedServices.filter(s => s.status === 'not-available').length;
  
  // Show recent services based on order index in reverse
  renderRecentTable(cachedServices.slice(-8).reverse());
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
            <td><strong>${escapeHTML(s.title)}</strong></td>
            <td>${escapeHTML(s.category)}</td>
            <td>${statusBadge(s.status)}</td>
            <td>${s.visible ? '<span style="color:#10b981;font-size:0.85rem;">👁 Visible</span>' : '<span style="color:#94a3b8;font-size:0.85rem;">🙈 Hidden</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function statusBadge(status) {
  const map = {
    'available': '<span class="status-badge badge-available"><i class="fa-solid fa-circle-check"></i> Available</span>',
    'coming-soon': '<span class="status-badge badge-coming-soon"><i class="fa-solid fa-clock"></i> Coming Soon</span>',
    'not-available': '<span class="status-badge badge-not-available"><i class="fa-solid fa-circle-xmark"></i> Not Available</span>'
  };
  return map[status] || map['available'];
}

// ============================================================
// SERVICES LIST RENDER
// ============================================================
function renderAdminServices() {
  let list = [...cachedServices];
  const grid = document.getElementById('admin-services-list');
  if (!grid) return;

  // Apply search query
  if (currentSearch) {
    list = list.filter(s =>
      s.title.toLowerCase().includes(currentSearch) ||
      (s.desc && s.desc.toLowerCase().includes(currentSearch))
    );
  }

  // Apply status filter
  if (currentFilter !== 'all') {
    list = list.filter(s => s.status === currentFilter);
  }

  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-secondary);">No services found.</div>';
    return;
  }

  grid.innerHTML = list.map(s => `
    <div class="admin-service-card ${!s.visible ? 'hidden-service' : ''}" draggable="true" data-id="${s.id}">
      <div class="admin-card-header">
        <div class="admin-card-icon"><i class="${s.icon || 'fa-solid fa-cog'}"></i></div>
        <div>
          <div class="admin-card-title">${escapeHTML(s.title)}</div>
          <div class="admin-card-cat">${escapeHTML(s.category)} ${s.price ? '· ' + escapeHTML(s.price) : ''}</div>
        </div>
      </div>
      <p class="admin-card-desc">${escapeHTML(s.desc) || 'No description provided.'}</p>
      <div class="admin-card-meta">
        <select class="status-select" data-id="${s.id}" onchange="quickUpdateStatus(this)">
          <option value="available" ${s.status === 'available' ? 'selected' : ''}>✅ Available</option>
          <option value="coming-soon" ${s.status === 'coming-soon' ? 'selected' : ''}>🟡 Coming Soon</option>
          <option value="not-available" ${s.status === 'not-available' ? 'selected' : ''}>🔴 Not Available</option>
        </select>
        ${statusBadge(s.status)}
      </div>
      <div class="admin-card-actions">
        <button class="admin-action-btn btn-edit" onclick="openEditModal('${s.id}')">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="admin-action-btn btn-toggle" onclick="toggleVisibility('${s.id}')">
          <i class="fa-solid fa-${s.visible ? 'eye-slash' : 'eye'}"></i> ${s.visible ? 'Hide' : 'Show'}
        </button>
        <button class="admin-action-btn btn-delete" onclick="confirmDelete('${s.id}')">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Quick status change from service card select
window.quickUpdateStatus = async function (select) {
  const id = select.dataset.id;
  try {
    await window.db.collection('services').doc(id).update({ status: select.value });
    showToast('Status updated!', 'success');
  } catch (err) {
    showToast('❌ Update failed: ' + err.message, 'error');
  }
};

// Toggle Visibility on Card
window.toggleVisibility = async function (id) {
  const service = cachedServices.find(s => s.id === id);
  if (!service) return;
  try {
    const nextVis = !service.visible;
    await window.db.collection('services').doc(id).update({ visible: nextVis });
    showToast(nextVis ? 'Service is now Visible' : 'Service is now Hidden', 'info');
  } catch (err) {
    showToast('❌ Update failed: ' + err.message, 'error');
  }
};

// Delete Service logic
window.confirmDelete = function (id) {
  deleteTargetId = id;
  document.getElementById('delete-modal').style.display = 'flex';
};

window.closeDeleteModal = function () {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
};

// Edit Service modal opening
window.openEditModal = function (id) {
  const s = cachedServices.find(sv => sv.id === id);
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

window.resetServiceForm = function () {
  document.getElementById('service-form').reset();
  document.getElementById('edit-service-id').value = '';
  document.getElementById('service-form-title').textContent = 'Add New Service';
  document.getElementById('svc-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Add Service';
};

// ============================================================
// FAQS ADMIN LIST & FORM CONTROL
// ============================================================
function renderAdminFaqs() {
  const container = document.getElementById('admin-faqs-list');
  if (!container) return;
  if (!cachedFaqs.length) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">No FAQs found. Add your first FAQ.</div>';
    return;
  }
  container.innerHTML = cachedFaqs.map(f => `
    <div class="reorderable-item" draggable="true" data-id="${f.id}">
      <div class="reorderable-handle"><i class="fa-solid fa-grip-lines"></i></div>
      <div class="reorderable-content">
        <h4>${escapeHTML(f.question)}</h4>
        <p>${escapeHTML(f.answer)}</p>
      </div>
      <div class="reorderable-actions">
        <button type="button" class="btn-edit" onclick="openEditFaq('${f.id}')" title="Edit FAQ">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button type="button" class="btn-delete" onclick="deleteFaq('${f.id}')" title="Delete FAQ">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.openEditFaq = function(id) {
  const f = cachedFaqs.find(faq => faq.id === id);
  if (!f) return;
  document.getElementById('edit-faq-id').value = f.id;
  document.getElementById('faq-question').value = f.question;
  document.getElementById('faq-answer').value = f.answer;
  document.getElementById('faq-form-title').textContent = 'Edit FAQ Entry';
  document.getElementById('faq-submit-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save FAQ';
};

window.resetFaqForm = function() {
  document.getElementById('faq-form').reset();
  document.getElementById('edit-faq-id').value = '';
  document.getElementById('faq-form-title').textContent = 'Add New FAQ Entry';
  document.getElementById('faq-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Add FAQ';
};

window.deleteFaq = async function(id) {
  if (confirm("Are you sure you want to delete this FAQ?")) {
    try {
      await window.db.collection('faqs').doc(id).delete();
      showToast("FAQ deleted", "error");
    } catch(err) {
      showToast("Delete failed: " + err.message, "error");
    }
  }
};

// ============================================================
// TESTIMONIALS ADMIN LIST & FORM CONTROL
// ============================================================
function renderAdminTestimonials() {
  const container = document.getElementById('admin-testimonials-list');
  if (!container) return;
  if (!cachedTestimonials.length) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">No testimonials found. Add your first testimonial.</div>';
    return;
  }
  container.innerHTML = cachedTestimonials.map(t => {
    const stars = '⭐'.repeat(t.rating || 5);
    return `
      <div class="reorderable-item" draggable="true" data-id="${t.id}">
        <div class="reorderable-handle"><i class="fa-solid fa-grip-lines"></i></div>
        <div class="reorderable-content">
          <h4>${escapeHTML(t.name)} (${escapeHTML(t.source)}) - ${stars}</h4>
          <p>"${escapeHTML(t.text)}"</p>
        </div>
        <div class="reorderable-actions">
          <button type="button" class="btn-edit" onclick="openEditTestimonial('${t.id}')" title="Edit Testimonial">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn-delete" onclick="deleteTestimonial('${t.id}')" title="Delete Testimonial">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.openEditTestimonial = function(id) {
  const t = cachedTestimonials.find(test => test.id === id);
  if (!t) return;
  document.getElementById('edit-testimonial-id').value = t.id;
  document.getElementById('testimonial-name').value = t.name;
  document.getElementById('testimonial-text').value = t.text;
  document.getElementById('testimonial-rating').value = String(t.rating || 5);
  document.getElementById('testimonial-source').value = t.source || 'Google Review';
  document.getElementById('testimonial-form-title').textContent = 'Edit Client Testimonial';
  document.getElementById('testimonial-submit-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Testimonial';
};

window.resetTestimonialForm = function() {
  document.getElementById('testimonial-form').reset();
  document.getElementById('edit-testimonial-id').value = '';
  document.getElementById('testimonial-form-title').textContent = 'Add Client Testimonial';
  document.getElementById('testimonial-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Add Testimonial';
};

window.deleteTestimonial = async function(id) {
  if (confirm("Are you sure you want to delete this testimonial?")) {
    try {
      await window.db.collection('testimonials').doc(id).delete();
      showToast("Testimonial deleted", "error");
    } catch(err) {
      showToast("Delete failed: " + err.message, "error");
    }
  }
};

// ============================================================
// DRAG AND DROP REORDER LISTENER ENGINE
// ============================================================
function setupDragAndDrop(containerId, updateOrderCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest('[draggable="true"]');
    if (!item) return;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  container.addEventListener('dragend', (e) => {
    const item = e.target.closest('[draggable="true"]');
    if (!item) return;
    item.classList.remove('dragging');
    updateOrderCallback(container);
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = container.querySelector('.dragging');
    if (!draggingItem) return;

    const siblings = [...container.querySelectorAll('[draggable="true"]:not(.dragging)')];
    
    const nextSibling = siblings.find(sibling => {
      const box = sibling.getBoundingClientRect();
      const isGrid = container.classList.contains('admin-services-grid');
      if (isGrid) {
        // Grid elements calculations
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        return mouseX < box.left + box.width / 2 && mouseY < box.top + box.height / 2;
      } else {
        // Simple lists (vertical y-axis only)
        const mouseY = e.clientY;
        return mouseY < box.top + box.height / 2;
      }
    });

    if (nextSibling) {
      container.insertBefore(draggingItem, nextSibling);
    } else {
      container.appendChild(draggingItem);
    }
  });
}

// Bulk updates to index counters in database on drag end
async function updateServicesOrder(container) {
  if (currentSearch || currentFilter !== 'all') {
    showToast("Reordering only allowed in 'All' view with no search queries.", "warning");
    renderAdminServices(); // Reverts DOM order
    return;
  }

  const cards = [...container.querySelectorAll('.admin-service-card')];
  const batch = window.db.batch();
  
  cards.forEach((card, idx) => {
    const id = card.dataset.id;
    const docRef = window.db.collection('services').doc(id);
    batch.update(docRef, { orderIndex: idx });
  });

  try {
    await batch.commit();
    showToast("Services reordered successfully!", "success");
  } catch (err) {
    showToast("Reordering failed: " + err.message, "error");
  }
}

async function updateFaqsOrder(container) {
  const items = [...container.querySelectorAll('.reorderable-item')];
  const batch = window.db.batch();

  items.forEach((item, idx) => {
    const id = item.dataset.id;
    const docRef = window.db.collection('faqs').doc(id);
    batch.update(docRef, { orderIndex: idx });
  });

  try {
    await batch.commit();
    showToast("FAQs reordered successfully!", "success");
  } catch (err) {
    showToast("Reordering failed: " + err.message, "error");
  }
}

async function updateTestimonialsOrder(container) {
  const items = [...container.querySelectorAll('.reorderable-item')];
  const batch = window.db.batch();

  items.forEach((item, idx) => {
    const id = item.dataset.id;
    const docRef = window.db.collection('testimonials').doc(id);
    batch.update(docRef, { orderIndex: idx });
  });

  try {
    await batch.commit();
    showToast("Testimonials reordered successfully!", "success");
  } catch (err) {
    showToast("Reordering failed: " + err.message, "error");
  }
}

// ============================================================
// DATA SEED UTILITY
// ============================================================
async function seedServicesIfNeeded() {
  try {
    const snap = await window.db.collection('services').limit(1).get();
    if (!snap.empty) {
      console.log("Services collection is ready.");
      return;
    }

    console.log("Seeding services collection with defaults...");
    const defaults = (window.servicesData || []).map((s, idx) => ({
      title: s.title,
      category: s.category,
      icon: s.icon || 'fa-solid fa-cog',
      desc: s.desc || '',
      price: s.price || '₹0',
      status: 'available',
      visible: true,
      orderIndex: idx
    }));

    // Firestore batch limit is 500. We have 60 items, so we can write in a single batch
    const batch = window.db.batch();
    defaults.forEach(service => {
      const docRef = window.db.collection('services').doc();
      batch.set(docRef, service);
    });

    await batch.commit();
    showToast("✅ Database seeded with default services!", "success");
    
    // Seed default FAQs
    const defaultFaqs = [
      { question: "PAN எப்படி Apply செய்வது?", answer: "உங்கள் ஆதார் அட்டை மற்றும் புகைப்படம் இருந்தால் போதும். நாங்கள் ஆன்லைனில் விண்ணப்பித்து தருவோம். நீங்கள் WhatsApp மூலம் ஆவணங்களை அனுப்பலாம்.", orderIndex: 0 },
      { question: "Aadhaar Update எவ்வளவு நேரம் ஆகும்?", answer: "விண்ணப்பித்த 3 முதல் 7 நாட்களுக்குள் உங்களுடைய ஆதார் விவரங்கள் மாற்றப்படும்.", orderIndex: 1 },
      { question: "Passport Apply Fees என்ன?", answer: "புதிய பாஸ்போர்ட் விண்ணப்பிக்க பொதுவாக ₹1500 அரசு கட்டணமாக செலுத்த வேண்டும், அதனுடன் எங்கள் சேவை கட்டணம் ₹300 சேர்த்து ₹1800 ஆகும்.", orderIndex: 2 }
    ];
    const faqBatch = window.db.batch();
    defaultFaqs.forEach(faq => {
      const ref = window.db.collection('faqs').doc();
      faqBatch.set(ref, faq);
    });
    await faqBatch.commit();

    // Seed default Testimonials
    const defaultTestimonials = [
      { name: "Karthik R.", text: "Apply Pannu Bro made my PAN card process so easy and fast! Very reliable service.", rating: 5, source: "Google Review", orderIndex: 0 },
      { name: "Priya M.", text: "Best service center for all government certificates. Transparent pricing and expert support.", rating: 5, source: "Google Review", orderIndex: 1 },
      { name: "Suresh K.", text: "Very quick response on WhatsApp. My FSSAI registration was done without any hassle.", rating: 5, source: "Google Review", orderIndex: 2 }
    ];
    const testBatch = window.db.batch();
    defaultTestimonials.forEach(t => {
      const ref = window.db.collection('testimonials').doc();
      testBatch.set(ref, t);
    });
    await testBatch.commit();

  } catch(e) {
    console.error("Seeding failed: ", e);
  }
}

// Password visual toggler
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

// HTML rendering escaping helper to avoid cross site script injections
function escapeHTML(str) {
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
