/**
 * ================================================================
 * Government Job Updates - job-updates.js
 * Apply Pannu Bro | Professional Recruitment Portal
 * ================================================================
 *
 * Features:
 *  - Reads jobs from global window.jobsData (set in jobs.js)
 *  - Renders job rows with proper categories, locations, salaries
 *  - Disables apply button automatically if Status is 'Closed'
 *  - Search by keyword (title, company, category)
 *  - Filter by category (Government, Private, IT, WFH)
 *  - Sort by newest (posted date) or last date
 *  - Active filter pills
 *  - Statistics update dynamically
 *  - Toast notifications on apply click
 *  - Column header click-to-sort
 *  - Copyright year auto-fill
 * ================================================================
 */

/* ----------------------------------------------------------------
   STATE — holds all jobs and current filter state
   ---------------------------------------------------------------- */
const state = {
  allJobs: [],       // master data from window.jobsData
  filteredJobs: [],  // after filters applied
  searchTerm: '',
  categoryFilter: '',
  sortOrder: 'newest',
  sortCol: null,     // 'date' | null
  sortDir: 'asc'     // 'asc' | 'desc'
};

/* ----------------------------------------------------------------
   DOM ELEMENT REFERENCES
   ---------------------------------------------------------------- */
const DOM = {
  tableBody: () => document.getElementById('jobsTableBody'),
  searchInput: () => document.getElementById('searchInput'),
  clearSearch: () => document.getElementById('clearSearch'),
  categoryFilter: () => document.getElementById('categoryFilter'),
  sortJobs: () => document.getElementById('sortJobs'),
  resetBtn: () => document.getElementById('resetFilters'),
  resultsCount: () => document.getElementById('resultsCount'),
  noResults: () => document.getElementById('noResults'),
  tableWrapper: () => document.getElementById('tableWrapper'),
  activeFilters: () => document.getElementById('activeFilters'),
  totalCount: () => document.getElementById('totalJobsCount'),
  statTotal: () => document.getElementById('statTotal'),
  statVacancies: () => document.getElementById('statVacancies'), // Will represent Active Jobs now
  statUrgent: () => document.getElementById('statUrgent'), // Will represent Govt Jobs
  statNew: () => document.getElementById('statNew'), // Will represent Private Jobs
  toastContainer: () => document.getElementById('toastContainer'),
  copyrightYear: () => document.getElementById('copyrightYear')
};

/* ================================================================
   INITIALISATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Set copyright year
  const yr = DOM.copyrightYear();
  if (yr) yr.textContent = new Date().getFullYear();

  // Load data from global variable
  if (window.jobsData && Array.isArray(window.jobsData)) {
    state.allJobs = window.jobsData;
  } else {
    state.allJobs = [];
    console.warn('[JobUpdates] window.jobsData not found or invalid.');
  }

  // Pre-process dates for easier sorting
  state.allJobs.forEach((job, idx) => {
    job.id = idx + 1;
    // Attempt to parse dates for sorting. If invalid, they will be handled gracefully.
    job._parsedPostedDate = job.postedDate ? new Date(job.postedDate).getTime() : 0;
  });

  state.filteredJobs = [...state.allJobs];
  
  wireFilters();
  wireSortableHeaders();
  
  // Set default select values according to state
  const sortEl = DOM.sortJobs();
  if (sortEl) sortEl.value = state.sortOrder;

  // Initial render
  applyFilters();
});


/* ================================================================
   TABLE RENDERING
   ================================================================ */
/**
 * Renders job rows into the table body.
 * @param {Array} jobs - array of job objects to display
 */
function renderTable(jobs) {
  const tbody = DOM.tableBody();
  if (!tbody) return;

  // Show/hide no-results panel
  const noResults = DOM.noResults();
  const wrapper = DOM.tableWrapper();
  if (jobs.length === 0) {
    tbody.innerHTML = '';
    if (noResults) noResults.removeAttribute('hidden');
    if (wrapper) wrapper.style.display = 'none';
    return;
  }
  if (noResults) noResults.setAttribute('hidden', '');
  if (wrapper) wrapper.style.display = '';

  // Build HTML for all rows
  const html = jobs.map((job, index) => buildRow(job, index)).join('');
  tbody.innerHTML = html;

  // Update results count
  updateResultsCount(jobs.length);
}

/**
 * Builds a single table row HTML string for a job.
 * @param {Object} job
 * @param {number} index - row index (for stagger animation delay)
 * @returns {string} HTML string
 */
function buildRow(job, index) {
  const isClosed = job.status && job.status.toLowerCase() === 'closed';

  // Badge logic (New vs Closed vs Active)
  let badgeHtml = '';
  if (isClosed) {
    badgeHtml = `<span class="badge badge-expired">CLOSED</span>`;
  } else {
    // If posted within last 7 days, mark as NEW
    const daysSincePosted = (new Date().getTime() - job._parsedPostedDate) / (1000 * 3600 * 24);
    if (daysSincePosted <= 7 && job._parsedPostedDate > 0) {
      badgeHtml = `<span class="badge badge-new">NEW</span>`;
    } else {
      badgeHtml = `<span class="badge badge-today">ACTIVE</span>`;
    }
  }

  // Apply button
  const applyBtn = isClosed
    ? `<span class="btn-apply expired" aria-disabled="true">
         <i class="fa-solid fa-ban" aria-hidden="true"></i> Closed
       </span>`
    : `<a href="${escapeHtml(job.applyLink)}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-apply"
          id="apply-btn-${job.id}"
          aria-label="Apply for ${escapeHtml(job.title)}"
          onclick="handleApplyClick('${escapeHtml(job.title)}')">
         <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
         APPLY NOW
       </a>`;

  return `
    <tr role="row" data-id="${job.id}" style="animation-delay: ${index * 40}ms" class="${isClosed ? 'row-closed' : ''}">
      <!-- Job Details -->
      <td>
        <div class="td-org-wrap">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
            <span class="td-org-name" style="font-size: 1.1rem; color: var(--primary-color);">${escapeHtml(job.title)}</span>
            ${badgeHtml}
          </div>
          <span class="td-org-category"><strong>${escapeHtml(job.company)}</strong> • ${escapeHtml(job.category)}</span>
        </div>
      </td>
      
      <!-- Location & Salary -->
      <td>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <span style="font-weight:600;"><i class="fa-solid fa-location-dot" style="color:var(--text-secondary);width:16px;"></i> ${escapeHtml(job.location)}</span>
          <span style="font-size:0.9rem; color:var(--text-secondary);"><i class="fa-solid fa-indian-rupee-sign" style="width:16px;"></i> ${escapeHtml(job.salary || 'Not Specified')}</span>
        </div>
      </td>
      
      <!-- Qualification -->
      <td>
        <div style="display:flex; flex-direction:column; gap:4px;">
           <span style="font-weight:600; color:var(--text-primary);">${escapeHtml(job.qualification)}</span>
           <span style="font-size:0.9rem; color:var(--text-secondary);">Exp: ${escapeHtml(job.experience || 'Not Specified')}</span>
        </div>
      </td>
      
      <!-- Last Date -->
      <td>
        <div class="td-date-wrap">
          <span class="td-date-val">${escapeHtml(job.lastDate)}</span>
        </div>
      </td>
      
      <!-- Apply -->
      <td>${applyBtn}</td>
    </tr>
  `;
}


/* ================================================================
   FILTER ENGINE
   ================================================================ */
/**
 * Applies all active filters and sort to state.allJobs,
 * updates state.filteredJobs, re-renders table.
 */
function applyFilters() {
  let jobs = [...state.allJobs];

  // 1. Keyword search
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    jobs = jobs.filter(j =>
      (j.title || '').toLowerCase().includes(term) ||
      (j.company || '').toLowerCase().includes(term) ||
      (j.qualification || '').toLowerCase().includes(term) ||
      (j.location || '').toLowerCase().includes(term)
    );
  }

  // 2. Category filter
  if (state.categoryFilter) {
    const cat = state.categoryFilter.toLowerCase();
    jobs = jobs.filter(j =>
      (j.category || '').toLowerCase() === cat
    );
  }

  // 3. Sort
  const sortVal = state.sortOrder;
  if (sortVal === 'newest') {
    jobs.sort((a, b) => b._parsedPostedDate - a._parsedPostedDate);
  } else if (sortVal === 'date-near') {
    // Basic string sort for dates if not properly formatted.
    jobs.sort((a, b) => (a.lastDate || '').localeCompare(b.lastDate || ''));
  }

  // 4. Column header sort (overrides select-based sort)
  if (state.sortCol) {
    const dir = state.sortDir === 'asc' ? 1 : -1;
    if (state.sortCol === 'date') {
      jobs.sort((a, b) => (a.lastDate || '').localeCompare(b.lastDate || '') * dir);
    }
  }

  state.filteredJobs = jobs;
  renderTable(jobs);
  updateStats(jobs);
  renderActivePills();
  updateTotalCount(state.allJobs.length);
}

/* ================================================================
   FILTER WIRING
   ================================================================ */
/**
 * Attaches event listeners to all filter inputs.
 */
function wireFilters() {
  const searchEl = DOM.searchInput();
  const clearEl = DOM.clearSearch();
  const catEl = DOM.categoryFilter();
  const sortEl = DOM.sortJobs();
  const resetEl = DOM.resetBtn();

  // Search input - live filter with debounce
  if (searchEl) {
    searchEl.addEventListener('input', debounce(() => {
      state.searchTerm = searchEl.value.trim();
      // Show/hide clear button
      if (clearEl) {
        clearEl.classList.toggle('visible', state.searchTerm.length > 0);
      }
      applyFilters();
    }, 250));
  }

  // Clear search button
  if (clearEl) {
    clearEl.addEventListener('click', () => {
      if (searchEl) {
        searchEl.value = '';
        clearEl.classList.remove('visible');
      }
      state.searchTerm = '';
      applyFilters();
    });
  }

  // Category filter
  if (catEl) {
    catEl.addEventListener('change', () => {
      state.categoryFilter = catEl.value;
      applyFilters();
    });
  }

  // Sort select
  if (sortEl) {
    sortEl.addEventListener('change', () => {
      state.sortOrder = sortEl.value;
      state.sortCol = null; // clear column sort
      clearSortArrows();
      applyFilters();
    });
  }

  // Reset all filters
  if (resetEl) {
    resetEl.addEventListener('click', resetAllFilters);
  }
}

/**
 * Resets all filter state and UI inputs.
 */
function resetAllFilters() {
  state.searchTerm = '';
  state.categoryFilter = '';
  state.sortOrder = 'newest';
  state.sortCol = null;
  state.sortDir = 'asc';

  // Reset UI elements
  const searchEl = DOM.searchInput();
  const clearEl = DOM.clearSearch();
  const catEl = DOM.categoryFilter();
  const sortEl = DOM.sortJobs();

  if (searchEl) searchEl.value = '';
  if (clearEl) clearEl.classList.remove('visible');
  if (catEl) catEl.value = '';
  if (sortEl) sortEl.value = 'newest';

  clearSortArrows();
  applyFilters();
  showToast('Filters cleared', 'success');
}

/* ================================================================
   SORTABLE COLUMN HEADERS
   ================================================================ */
/**
 * Adds click handlers to sortable <th> elements.
 */
function wireSortableHeaders() {
  const ths = document.querySelectorAll('.jobs-table th.sortable');
  ths.forEach(th => {
    th.addEventListener('click', () => handleHeaderSort(th));
    th.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleHeaderSort(th);
      }
    });
  });
}

/**
 * Toggles sort direction when a header is clicked.
 * @param {HTMLElement} th - the clicked th element
 */
function handleHeaderSort(th) {
  const col = th.dataset.sort; // 'date'

  if (state.sortCol === col) {
    // Same column - toggle direction
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    // New column - start ascending
    state.sortCol = col;
    state.sortDir = 'asc';
  }

  // Clear the select-based sort
  state.sortOrder = '';
  const sortEl = DOM.sortJobs();
  if (sortEl) sortEl.value = '';

  // Update ARIA + visual arrows
  clearSortArrows();
  th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
  th.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending');

  applyFilters();
}

/**
 * Clears sort-related classes and ARIA from all sortable headers.
 */
function clearSortArrows() {
  document.querySelectorAll('.jobs-table th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    th.setAttribute('aria-sort', 'none');
  });
}

/* ================================================================
   ACTIVE FILTER PILLS RENDERING
   ================================================================ */
/**
 * Renders coloured filter pills above the table showing active filters.
 */
function renderActivePills() {
  const container = DOM.activeFilters();
  if (!container) return;

  const pills = [];

  if (state.searchTerm) {
    pills.push({
      label: `Search: "${state.searchTerm}"`,
      clear: () => {
        state.searchTerm = '';
        const s = DOM.searchInput();
        const c = DOM.clearSearch();
        if (s) s.value = '';
        if (c) c.classList.remove('visible');
        applyFilters();
      }
    });
  }

  if (state.categoryFilter) {
    pills.push({
      label: `Category: ${state.categoryFilter}`,
      clear: () => {
        state.categoryFilter = '';
        const el = DOM.categoryFilter();
        if (el) el.value = '';
        applyFilters();
      }
    });
  }

  if ((state.sortOrder && state.sortOrder !== 'newest') || state.sortCol) {
    const sortLabel = getSortLabel();
    if (sortLabel) {
      pills.push({
        label: `Sort: ${sortLabel}`,
        clear: () => {
          state.sortOrder = 'newest';
          state.sortCol = null;
          state.sortDir = 'asc';
          const el = DOM.sortJobs();
          if (el) el.value = 'newest';
          clearSortArrows();
          applyFilters();
        }
      });
    }
  }

  container.innerHTML = pills.map((pill, i) => `
    <span class="filter-pill">
      ${escapeHtml(pill.label)}
      <button aria-label="Remove filter" data-pill="${i}" title="Remove">✕</button>
    </span>
  `).join('');

  // Wire up pill remove buttons
  container.querySelectorAll('.filter-pill button').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.pill);
      pills[idx].clear();
    });
  });
}

/**
 * Returns human-readable sort label.
 * @returns {string}
 */
function getSortLabel() {
  if (state.sortCol === 'date') return `Last Date (${state.sortDir === 'asc' ? 'Nearest' : 'Farthest'})`;
  const map = {
    'newest': 'Newest First',
    'date-near': 'Date: Nearest first'
  };
  return map[state.sortOrder] || '';
}

/* ================================================================
   STATS UPDATE
   ================================================================ */
/**
 * Updates the stat cards below the table with computed values.
 * @param {Array} jobs - current filtered set
 */
function updateStats(jobs) {
  const activeJobs = jobs.filter(j => j.status !== 'Closed').length;
  const govtJobs = jobs.filter(j => j.category === 'Government Jobs').length;
  const pvtJobs = jobs.filter(j => j.category === 'Private Jobs' || j.category === 'IT Jobs').length;

  animateCount(DOM.statTotal(), jobs.length);
  
  // Repurposed Stat Cards:
  // We'll update the labels directly in JS if they don't match the new data well,
  // but for now we'll just populate them logically.
  
  // statVacancies element will be "Active Jobs"
  const statVacanciesLabel = DOM.statVacancies()?.nextElementSibling;
  if (statVacanciesLabel) statVacanciesLabel.textContent = 'Active Jobs';
  animateCount(DOM.statVacancies(), activeJobs);
  
  // statUrgent element will be "Govt Jobs"
  const statUrgentLabel = DOM.statUrgent()?.nextElementSibling;
  if (statUrgentLabel) statUrgentLabel.textContent = 'Govt Jobs';
  animateCount(DOM.statUrgent(), govtJobs);
  
  // statNew element will be "Private / IT Jobs"
  const statNewLabel = DOM.statNew()?.nextElementSibling;
  if (statNewLabel) statNewLabel.textContent = 'Private / IT Jobs';
  animateCount(DOM.statNew(), pvtJobs);
}

/**
 * Updates the header total job count span.
 * @param {number} count
 */
function updateTotalCount(count) {
  const el = DOM.totalCount();
  if (el) el.textContent = `${count} Jobs Listed`;
}

/**
 * Updates the "Showing X jobs" results bar text.
 * @param {number} count
 */
function updateResultsCount(count) {
  const el = DOM.resultsCount();
  if (el) {
    el.innerHTML = `Showing <strong>${count}</strong> job${count !== 1 ? 's' : ''}`;
  }
}

/* ================================================================
   APPLY BUTTON HANDLER
   ================================================================ */
/**
 * Called when a CLICK TO APPLY button is clicked.
 * Shows a confirmation toast.
 * @param {string} title - job title for the toast
 */
function handleApplyClick(title) {
  showToast(`Opening official application for ${title} 🚀`, 'success');
}

// Make globally accessible (called via inline onclick)
window.handleApplyClick = handleApplyClick;

/* ================================================================
   TOAST NOTIFICATION SYSTEM
   ================================================================ */
/**
 * Displays a temporary toast notification.
 * @param {string} message
 * @param {'success'|'error'} type
 * @param {number} duration - milliseconds to display
 */
function showToast(message, type = 'success', duration = 3000) {
  const container = DOM.toastContainer();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}" style="margin-right:8px;"></i>
    ${escapeHtml(message)}
  `;

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ================================================================
   COUNT-UP ANIMATION FOR STAT NUMBERS
   ================================================================ */
/**
 * Animates a number from its current value to a new target.
 * @param {HTMLElement|null} el - the element to update
 * @param {number} target - the target number
 */
function animateCount(el, target) {
  if (!el) return;
  const current = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  if (current === target) return;

  const duration = 600; // ms
  const steps = 30;
  const step = (target - current) / steps;
  let count = current;
  let i = 0;

  const timer = setInterval(() => {
    count += step;
    i++;
    el.textContent = Math.round(count).toLocaleString('en-IN');
    if (i >= steps) {
      clearInterval(timer);
      el.textContent = target.toLocaleString('en-IN');
    }
  }, duration / steps);
}

/* ================================================================
   UTILITY FUNCTIONS
   ================================================================ */

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Creates a debounced version of a function.
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
