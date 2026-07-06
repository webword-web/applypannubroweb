/**
 * ================================================================
 * Government Job Updates - job-updates.js
 * Apply Pannu Bro | Professional Recruitment Portal
 * ================================================================
 *
 * Features:
 *  - Loads jobs from jobs.json via fetch (or falls back to inline data)
 *  - Renders job rows with badges, eligibility tags, days-left calculation
 *  - Search by keyword (org name, eligibility, category)
 *  - Filter by qualification and organisation category
 *  - Sort by vacancy count or last date
 *  - Active filter pills
 *  - Statistics update dynamically
 *  - Toast notifications on apply click
 *  - Column header click-to-sort
 *  - Copyright year auto-fill
 * ================================================================
 */

/* ----------------------------------------------------------------
   INLINE FALLBACK DATA
   (Used if jobs.json fails to load — e.g., opened via file:// protocol)
   ---------------------------------------------------------------- */
const FALLBACK_JOBS = [
  {
    id: 1,
    organization: "RRB Technician",
    orgShort: "RRB",
    vacancy: 6565,
    eligibility: "ITI, Diploma, B.E/B.Tech",
    lastDate: "29.07.2026",
    lastDateISO: "2026-07-29",
    applyLink: "https://indianrailways.gov.in/",
    category: "Railway",
    badge: "NEW"
  },
  {
    id: 2,
    organization: "RRB",
    orgShort: "RRB",
    vacancy: 119,
    eligibility: "Any Degree",
    lastDate: "14.08.2026",
    lastDateISO: "2026-08-14",
    applyLink: "https://indianrailways.gov.in/",
    category: "Railway",
    badge: "NEW"
  },
  {
    id: 3,
    organization: "IBPS PO/MT",
    orgShort: "IBPS",
    vacancy: 6715,
    eligibility: "Any Degree",
    lastDate: "21.07.2026",
    lastDateISO: "2026-07-21",
    applyLink: "https://www.ibps.in/",
    category: "Bank",
    badge: "NEW"
  },
  {
    id: 4,
    organization: "IBPS SO",
    orgShort: "IBPS",
    vacancy: 745,
    eligibility: "Any Degree",
    lastDate: "21.07.2026",
    lastDateISO: "2026-07-21",
    applyLink: "https://www.ibps.in/",
    category: "Bank",
    badge: "NEW"
  },
  {
    id: 5,
    organization: "Bank of India",
    orgShort: "BOI",
    vacancy: 779,
    eligibility: "Any Degree, MBA, CA",
    lastDate: "20.07.2026",
    lastDateISO: "2026-07-20",
    applyLink: "https://www.bankofindia.co.in/",
    category: "Bank",
    badge: "TODAY"
  },
  {
    id: 6,
    organization: "IOCL",
    orgShort: "IOCL",
    vacancy: 1626,
    eligibility: "12th, ITI, Diploma, B.Sc",
    lastDate: "28.07.2026",
    lastDateISO: "2026-07-28",
    applyLink: "https://iocl.com/",
    category: "PSU",
    badge: "NEW"
  },
  {
    id: 7,
    organization: "UPSC",
    orgShort: "UPSC",
    vacancy: 450,
    eligibility: "B.E, Any Degree, B.Pharm",
    lastDate: "17.07.2026",
    lastDateISO: "2026-07-17",
    applyLink: "https://upsc.gov.in/",
    category: "Central Govt",
    badge: "LAST DATE"
  },
  {
    id: 8,
    organization: "Indian Navy",
    orgShort: "Navy",
    vacancy: 275,
    eligibility: "B.E/B.Tech, M.Sc, MBA",
    lastDate: "27.07.2026",
    lastDateISO: "2026-07-27",
    applyLink: "https://joinindiannavy.gov.in/",
    category: "Defence",
    badge: "NEW"
  },
  {
    id: 9,
    organization: "CCRUM",
    orgShort: "CCRUM",
    vacancy: 179,
    eligibility: "10th, ITI, Any Degree",
    lastDate: "31.07.2026",
    lastDateISO: "2026-07-31",
    applyLink: "https://ccrum.res.in/",
    category: "Central Govt",
    badge: "NEW"
  },
  {
    id: 10,
    organization: "HPCL",
    orgShort: "HPCL",
    vacancy: 116,
    eligibility: "Diploma, B.E/B.Tech, MBA",
    lastDate: "20.07.2026",
    lastDateISO: "2026-07-20",
    applyLink: "https://hindustanpetroleum.com/",
    category: "PSU",
    badge: "TODAY"
  },
  {
    id: 11,
    organization: "TNPSC Group 1",
    orgShort: "TNPSC",
    vacancy: 26,
    eligibility: "Any Degree",
    lastDate: "29.07.2026",
    lastDateISO: "2026-07-29",
    applyLink: "https://www.tnpsc.gov.in/",
    category: "State Govt",
    badge: "NEW"
  },
  {
    id: 12,
    organization: "Cochin Shipyard",
    orgShort: "CSL",
    vacancy: 60,
    eligibility: "10th, 12th",
    lastDate: "22.07.2026",
    lastDateISO: "2026-07-22",
    applyLink: "https://cochinshipyard.in/",
    category: "PSU",
    badge: "NEW"
  },
  {
    id: 13,
    organization: "RRI",
    orgShort: "RRI",
    vacancy: 22,
    eligibility: "ITI, Diploma, M.Sc, M.Tech",
    lastDate: "31.07.2026",
    lastDateISO: "2026-07-31",
    applyLink: "https://rri.res.in/",
    category: "Research",
    badge: "NEW"
  },
  {
    id: 14,
    organization: "ISRO ISTRAC",
    orgShort: "ISRO",
    vacancy: 27,
    eligibility: "ITI, Diploma, B.Sc, MLIS",
    lastDate: "20.07.2026",
    lastDateISO: "2026-07-20",
    applyLink: "https://www.isro.gov.in/",
    category: "Central Govt",
    badge: "TODAY"
  },
  {
    id: 15,
    organization: "RCFL",
    orgShort: "RCFL",
    vacancy: 32,
    eligibility: "Diploma, B.E/B.Tech, MBBS",
    lastDate: "13.07.2026",
    lastDateISO: "2026-07-13",
    applyLink: "https://rcfltd.com/",
    category: "PSU",
    badge: "LAST DATE"
  },
  {
    id: 16,
    organization: "NIN",
    orgShort: "NIN",
    vacancy: 279,
    eligibility: "10th, Diploma, Any Degree",
    lastDate: "27.07.2026",
    lastDateISO: "2026-07-27",
    applyLink: "https://ninindia.org/",
    category: "Research",
    badge: "NEW"
  },
  {
    id: 17,
    organization: "CMERI",
    orgShort: "CMERI",
    vacancy: 27,
    eligibility: "10th, ITI",
    lastDate: "03.08.2026",
    lastDateISO: "2026-08-03",
    applyLink: "https://www.cmeri.res.in/",
    category: "Research",
    badge: "NEW"
  }
];

/* ----------------------------------------------------------------
   STATE — holds all jobs and current filter state
   ---------------------------------------------------------------- */
const state = {
  allJobs:     [],       // master data
  filteredJobs:[],       // after filters applied
  searchTerm:  '',
  qualFilter:  '',
  orgFilter:   '',
  sortOrder:   '',
  sortCol:     null,     // 'vacancy' | 'date' | null
  sortDir:     'asc'     // 'asc' | 'desc'
};

/* ----------------------------------------------------------------
   DOM ELEMENT REFERENCES
   ---------------------------------------------------------------- */
const DOM = {
  tableBody:     () => document.getElementById('jobsTableBody'),
  searchInput:   () => document.getElementById('searchInput'),
  clearSearch:   () => document.getElementById('clearSearch'),
  qualFilter:    () => document.getElementById('qualFilter'),
  orgFilter:     () => document.getElementById('orgFilter'),
  sortVacancy:   () => document.getElementById('sortVacancy'),
  resetBtn:      () => document.getElementById('resetFilters'),
  resultsCount:  () => document.getElementById('resultsCount'),
  noResults:     () => document.getElementById('noResults'),
  tableWrapper:  () => document.getElementById('tableWrapper'),
  activeFilters: () => document.getElementById('activeFilters'),
  totalCount:    () => document.getElementById('totalJobsCount'),
  statTotal:     () => document.getElementById('statTotal'),
  statVacancies: () => document.getElementById('statVacancies'),
  statUrgent:    () => document.getElementById('statUrgent'),
  statNew:       () => document.getElementById('statNew'),
  toastContainer:() => document.getElementById('toastContainer'),
  copyrightYear: () => document.getElementById('copyrightYear')
};

/* ================================================================
   INITIALISATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Set copyright year
  const yr = DOM.copyrightYear();
  if (yr) yr.textContent = new Date().getFullYear();

  // Load data then wire up UI
  loadJobsData()
    .then(jobs => {
      state.allJobs     = jobs;
      state.filteredJobs= [...jobs];
      renderTable(jobs);
      updateStats(jobs);
      updateTotalCount(jobs.length);
      wireFilters();
      wireSortableHeaders();
    })
    .catch(err => {
      console.error('[JobUpdates] Failed to load jobs:', err);
      showToast('Could not load jobs. Showing cached data.', 'error');
      // Use fallback data
      state.allJobs     = FALLBACK_JOBS;
      state.filteredJobs= [...FALLBACK_JOBS];
      renderTable(FALLBACK_JOBS);
      updateStats(FALLBACK_JOBS);
      updateTotalCount(FALLBACK_JOBS.length);
      wireFilters();
      wireSortableHeaders();
    });
});

/* ================================================================
   DATA LOADING
   ================================================================ */
/**
 * Attempts to load jobs.json via fetch.
 * Falls back to inline FALLBACK_JOBS if fetch fails.
 * @returns {Promise<Array>}
 */
async function loadJobsData() {
  try {
    const response = await fetch('jobs.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : FALLBACK_JOBS;
  } catch (e) {
    console.warn('[JobUpdates] Fetch failed, using fallback data.', e.message);
    return FALLBACK_JOBS;
  }
}

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
  const wrapper   = DOM.tableWrapper();
  if (jobs.length === 0) {
    tbody.innerHTML = '';
    if (noResults) noResults.removeAttribute('hidden');
    if (wrapper)   wrapper.style.display = 'none';
    return;
  }
  if (noResults) noResults.setAttribute('hidden', '');
  if (wrapper)   wrapper.style.display = '';

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
  const badge     = resolveBadge(job);
  const daysLeft  = getDaysLeft(job.lastDateISO);
  const isExpired = daysLeft < 0;
  const isUrgent  = daysLeft >= 0 && daysLeft <= 3;
  const isToday   = daysLeft === 0;

  // Eligibility split into tags
  const eligTags = job.eligibility
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .map(e => `<span class="elig-tag">${escapeHtml(e)}</span>`)
    .join('');

  // Days-left label
  let daysLabel = '';
  let daysClass = '';
  if (isExpired) {
    daysLabel = 'Expired';
    daysClass = 'td-days-left urgent';
  } else if (isToday) {
    daysLabel = 'Today is Last Day!';
    daysClass = 'td-days-left today';
  } else if (isUrgent) {
    daysLabel = `⚠ ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
    daysClass = 'td-days-left urgent';
  } else {
    daysLabel = `${daysLeft} days left`;
    daysClass = 'td-days-left';
  }

  // Apply button
  const applyBtn = isExpired
    ? `<span class="btn-apply expired" aria-disabled="true">
         <i class="fa-solid fa-ban" aria-hidden="true"></i> Expired
       </span>`
    : `<a href="${escapeHtml(job.applyLink)}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-apply"
          id="apply-btn-${job.id}"
          aria-label="Apply for ${escapeHtml(job.organization)}"
          onclick="handleApplyClick('${escapeHtml(job.organization)}')">
         <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
         CLICK TO APPLY
       </a>`;

  // Badge HTML
  const badgeHtml = badge
    ? `<span class="badge badge-${badge.toLowerCase().replace(' ', '')}">${badge}</span>`
    : '';

  return `
    <tr role="row" data-id="${job.id}" style="animation-delay: ${index * 40}ms">
      <td>
        <div class="td-org-wrap">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="td-org-name">${escapeHtml(job.organization)}</span>
            ${badgeHtml}
          </div>
          <span class="td-org-category">${escapeHtml(job.category)}</span>
        </div>
      </td>
      <td>
        <span class="td-vacancy-num">${job.vacancy.toLocaleString('en-IN')}</span>
        <span class="vacancy-label">Vacancies</span>
      </td>
      <td>
        <div class="eligibility-tags">${eligTags}</div>
      </td>
      <td>
        <div class="td-date-wrap">
          <span class="td-date-val">${escapeHtml(job.lastDate)}</span>
          <span class="${daysClass}">${daysLabel}</span>
        </div>
      </td>
      <td>${applyBtn}</td>
    </tr>
  `;
}

/* ================================================================
   BADGE RESOLUTION
   ================================================================ */
/**
 * Determines the correct badge for a job based on its date and
 * the badge field, auto-upgrading to EXPIRED if past the last date.
 * @param {Object} job
 * @returns {string} badge string
 */
function resolveBadge(job) {
  const daysLeft = getDaysLeft(job.lastDateISO);
  if (daysLeft < 0)           return 'EXPIRED';
  if (daysLeft === 0)         return 'TODAY';
  if (daysLeft <= 3)          return 'LAST DATE';
  return job.badge || 'NEW';
}

/* ================================================================
   DATE UTILITIES
   ================================================================ */
/**
 * Calculates days remaining until a given ISO date string.
 * @param {string} isoDateStr - e.g. "2026-07-29"
 * @returns {number} days left (negative if expired)
 */
function getDaysLeft(isoDateStr) {
  if (!isoDateStr) return 999;
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate  = new Date(isoDateStr);
  lastDate.setHours(0, 0, 0, 0);
  return Math.round((lastDate - today) / (1000 * 60 * 60 * 24));
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

  // 1. Keyword search (org name, eligibility, category)
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    jobs = jobs.filter(j =>
      j.organization.toLowerCase().includes(term) ||
      j.eligibility.toLowerCase().includes(term)  ||
      j.category.toLowerCase().includes(term)
    );
  }

  // 2. Qualification filter
  if (state.qualFilter) {
    const q = state.qualFilter.toLowerCase();
    jobs = jobs.filter(j =>
      j.eligibility.toLowerCase().includes(q)
    );
  }

  // 3. Organisation category filter
  if (state.orgFilter) {
    jobs = jobs.filter(j =>
      j.category.toLowerCase() === state.orgFilter.toLowerCase()
    );
  }

  // 4. Sort
  const sortVal = state.sortOrder;
  if (sortVal === 'vacancy-high') {
    jobs.sort((a, b) => b.vacancy - a.vacancy);
  } else if (sortVal === 'vacancy-low') {
    jobs.sort((a, b) => a.vacancy - b.vacancy);
  } else if (sortVal === 'date-near') {
    jobs.sort((a, b) => new Date(a.lastDateISO) - new Date(b.lastDateISO));
  } else if (sortVal === 'date-far') {
    jobs.sort((a, b) => new Date(b.lastDateISO) - new Date(a.lastDateISO));
  }

  // 5. Column header sort (overrides select-based sort)
  if (state.sortCol) {
    const dir = state.sortDir === 'asc' ? 1 : -1;
    if (state.sortCol === 'vacancy') {
      jobs.sort((a, b) => (a.vacancy - b.vacancy) * dir);
    } else if (state.sortCol === 'date') {
      jobs.sort((a, b) => (new Date(a.lastDateISO) - new Date(b.lastDateISO)) * dir);
    }
  }

  state.filteredJobs = jobs;
  renderTable(jobs);
  updateStats(jobs);
  renderActivePills();
}

/* ================================================================
   FILTER WIRING
   ================================================================ */
/**
 * Attaches event listeners to all filter inputs.
 */
function wireFilters() {
  const searchEl  = DOM.searchInput();
  const clearEl   = DOM.clearSearch();
  const qualEl    = DOM.qualFilter();
  const orgEl     = DOM.orgFilter();
  const sortEl    = DOM.sortVacancy();
  const resetEl   = DOM.resetBtn();

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

  // Qualification filter
  if (qualEl) {
    qualEl.addEventListener('change', () => {
      state.qualFilter = qualEl.value;
      applyFilters();
    });
  }

  // Organisation filter
  if (orgEl) {
    orgEl.addEventListener('change', () => {
      state.orgFilter = orgEl.value;
      applyFilters();
    });
  }

  // Sort select
  if (sortEl) {
    sortEl.addEventListener('change', () => {
      state.sortOrder = sortEl.value;
      state.sortCol   = null; // clear column sort
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
  state.qualFilter = '';
  state.orgFilter  = '';
  state.sortOrder  = '';
  state.sortCol    = null;
  state.sortDir    = 'asc';

  // Reset UI elements
  const searchEl = DOM.searchInput();
  const clearEl  = DOM.clearSearch();
  const qualEl   = DOM.qualFilter();
  const orgEl    = DOM.orgFilter();
  const sortEl   = DOM.sortVacancy();

  if (searchEl) searchEl.value = '';
  if (clearEl)  clearEl.classList.remove('visible');
  if (qualEl)   qualEl.value   = '';
  if (orgEl)    orgEl.value    = '';
  if (sortEl)   sortEl.value   = '';

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
  const col = th.dataset.sort; // 'vacancy' | 'date'

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
  const sortEl = DOM.sortVacancy();
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

  if (state.qualFilter) {
    pills.push({
      label: `Qualification: ${state.qualFilter}`,
      clear: () => {
        state.qualFilter = '';
        const el = DOM.qualFilter();
        if (el) el.value = '';
        applyFilters();
      }
    });
  }

  if (state.orgFilter) {
    pills.push({
      label: `Category: ${state.orgFilter}`,
      clear: () => {
        state.orgFilter = '';
        const el = DOM.orgFilter();
        if (el) el.value = '';
        applyFilters();
      }
    });
  }

  if (state.sortOrder || state.sortCol) {
    const sortLabel = getSortLabel();
    pills.push({
      label: `Sort: ${sortLabel}`,
      clear: () => {
        state.sortOrder = '';
        state.sortCol   = null;
        state.sortDir   = 'asc';
        const el = DOM.sortVacancy();
        if (el) el.value = '';
        clearSortArrows();
        applyFilters();
      }
    });
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
  if (state.sortCol === 'vacancy') return `Vacancy (${state.sortDir === 'asc' ? 'Low→High' : 'High→Low'})`;
  if (state.sortCol === 'date')    return `Last Date (${state.sortDir === 'asc' ? 'Nearest' : 'Farthest'})`;
  const map = {
    'vacancy-high': 'Vacancy: High→Low',
    'vacancy-low':  'Vacancy: Low→High',
    'date-near':    'Date: Nearest first',
    'date-far':     'Date: Farthest first'
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
  const totalVacancies = jobs.reduce((sum, j) => sum + j.vacancy, 0);
  const urgentCount    = jobs.filter(j => {
    const d = getDaysLeft(j.lastDateISO);
    return d >= 0 && d <= 5;
  }).length;
  const newCount       = jobs.filter(j => {
    const b = resolveBadge(j);
    return b === 'NEW' || b === 'TODAY';
  }).length;

  animateCount(DOM.statTotal(),     jobs.length);
  animateCount(DOM.statVacancies(), totalVacancies);
  animateCount(DOM.statUrgent(),    urgentCount);
  animateCount(DOM.statNew(),       newCount);
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
 * @param {string} orgName - organisation name for the toast
 */
function handleApplyClick(orgName) {
  showToast(`Opening official application for ${orgName} 🚀`, 'success');
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
  const steps    = 30;
  const step     = (target - current) / steps;
  let   count    = current;
  let   i        = 0;

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
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
