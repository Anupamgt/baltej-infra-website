/**
 * Careers admin — UI mockup.
 *
 * Auth and storage are simulated in the browser so the screens can be reviewed
 * before any backend exists. Nothing here is a security boundary: anyone can
 * open this page. Real Google OAuth requires a server (see README notes).
 */

const SESSION_KEY = 'baltej_admin_session';
const JOBS_KEY = 'baltej_admin_jobs';
const APPS_KEY = 'baltej_admin_apps';

const MOCK_USER = {
  name: 'Mehul Bansal',
  email: 'mehul@baltejinfra.com',
  avatar:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23c4782a"/><text x="32" y="42" font-family="Arial" font-size="28" font-weight="bold" fill="%230c1218" text-anchor="middle">MB</text></svg>'
    ),
};

const SEED_JOBS = [
  {
    id: 'job-1',
    title: 'Site Engineer — Highways',
    team: 'engineering',
    status: 'published',
    location: 'Panchkula / Project sites',
    type: 'Full-time',
    experience: '3–6 yrs',
    summary:
      'Support execution of highway and protection works — quality checks, measurement, and coordination with subcontractors.',
    requirements: ['Diploma / B.Tech Civil preferred', 'Experience on NH / EPC packages a plus'],
    applicants: 4,
    updatedAt: '2026-08-10',
  },
  {
    id: 'job-2',
    title: 'Structural / Design Engineer',
    team: 'engineering',
    status: 'published',
    location: 'Jaipur',
    type: 'Full-time',
    experience: '4–8 yrs',
    summary: 'In-house structural detailing and drawings review with site coordination.',
    requirements: ['B.Tech / M.Tech Civil or Structural', 'AutoCAD / STAAD familiarity'],
    applicants: 2,
    updatedAt: '2026-08-09',
  },
  {
    id: 'job-3',
    title: 'Project Manager — Civil Works',
    team: 'site',
    status: 'published',
    location: 'Multi-site',
    type: 'Full-time',
    experience: '8+ yrs',
    summary: 'Own schedule, cost, and quality for assigned packages.',
    requirements: ['Delivery on highway or industrial civil projects', 'Strong client communication'],
    applicants: 3,
    updatedAt: '2026-08-08',
  },
  {
    id: 'job-4',
    title: 'QA / QC Engineer',
    team: 'site',
    status: 'draft',
    location: 'Himachal / Punjab corridors',
    type: 'Full-time',
    experience: '3–7 yrs',
    summary: 'ITP implementation, material testing coordination, and NCR closure.',
    requirements: ['Knowledge of MoRTH / IS codes'],
    applicants: 0,
    updatedAt: '2026-08-12',
  },
  {
    id: 'job-5',
    title: 'Office Assistant',
    team: 'corporate',
    status: 'closed',
    location: 'Panchkula',
    type: 'Full-time',
    experience: '1–2 yrs',
    summary: 'Day-to-day office support for the corporate team.',
    requirements: ['Secondary (10th pass)'],
    applicants: 6,
    updatedAt: '2026-07-28',
  },
];

const SEED_APPS = [
  {
    id: 'app-1',
    name: 'Rohit Verma',
    email: 'rohit.verma@example.com',
    phone: '+91 98••• •••21',
    role: 'Site Engineer — Highways',
    resume: 'rohit-verma-cv.pdf',
    status: 'new',
    appliedAt: '2026-08-12',
  },
  {
    id: 'app-2',
    name: 'Simran Kaur',
    email: 'simran.k@example.com',
    phone: '+91 99••• •••04',
    role: 'Site Engineer — Highways',
    resume: 'simran-kaur-resume.pdf',
    status: 'reviewing',
    appliedAt: '2026-08-11',
  },
  {
    id: 'app-3',
    name: 'Amit Sharma',
    email: 'amit.sharma@example.com',
    phone: '+91 97••• •••88',
    role: 'Project Manager — Civil Works',
    resume: 'amit-pm-profile.pdf',
    status: 'shortlisted',
    appliedAt: '2026-08-10',
  },
  {
    id: 'app-4',
    name: 'Neha Gupta',
    email: 'neha.g@example.com',
    phone: '+91 96••• •••17',
    role: 'Structural / Design Engineer',
    resume: 'neha-gupta-cv.pdf',
    status: 'new',
    appliedAt: '2026-08-10',
  },
  {
    id: 'app-5',
    name: 'Karan Singh',
    email: 'karan.singh@example.com',
    phone: '+91 95••• •••62',
    role: 'Project Manager — Civil Works',
    resume: 'karan-singh.pdf',
    status: 'rejected',
    appliedAt: '2026-08-06',
  },
];

const TEAM_LABELS = {
  engineering: 'Engineering',
  site: 'Site Operations',
  corporate: 'Corporate',
};

const APP_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected'];

let jobs = [];
let apps = [];
let jobFilter = 'all';
let appFilter = 'all';

/* ---------------- storage helpers ---------------- */

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch (_) {
    return structuredClone(fallback);
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    /* storage unavailable — mockup still works in memory */
  }
}

/* ---------------- auth (simulated) ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  jobs = load(JOBS_KEY, SEED_JOBS);
  apps = load(APPS_KEY, SEED_APPS);

  document.getElementById('google-signin').addEventListener('click', signIn);
  document.getElementById('admin-signout').addEventListener('click', signOut);

  initTabs();
  initJobFilters();
  initAppFilters();
  initDrawer();

  if (localStorage.getItem(SESSION_KEY)) showApp();
});

function signIn() {
  const btn = document.getElementById('google-signin');
  btn.disabled = true;
  btn.classList.add('is-loading');
  btn.querySelector('span').textContent = 'Signing in…';

  // Simulates the OAuth redirect round-trip.
  setTimeout(() => {
    save(SESSION_KEY, MOCK_USER);
    btn.disabled = false;
    btn.classList.remove('is-loading');
    btn.querySelector('span').textContent = 'Continue with Google';
    showApp();
    toast(`Signed in as ${MOCK_USER.email}`);
  }, 700);
}

function signOut() {
  localStorage.removeItem(SESSION_KEY);
  document.getElementById('admin-app').hidden = true;
  document.getElementById('admin-login').hidden = false;
}

function showApp() {
  document.getElementById('admin-login').hidden = true;
  document.getElementById('admin-app').hidden = false;

  document.getElementById('admin-avatar').src = MOCK_USER.avatar;
  document.getElementById('admin-user-name').textContent = MOCK_USER.name;
  document.getElementById('admin-user-email').textContent = MOCK_USER.email;

  renderJobs();
  renderApps();
}

/* ---------------- tabs ---------------- */

function initTabs() {
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.getElementById('panel-jobs').hidden = target !== 'jobs';
      document.getElementById('panel-applications').hidden = target !== 'applications';
    });
  });
}

/* ---------------- jobs ---------------- */

function initJobFilters() {
  document.querySelectorAll('#job-status-filters .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#job-status-filters .filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      jobFilter = btn.dataset.status;
      renderJobs();
    });
  });
}

function renderJobs() {
  const table = document.getElementById('jobs-table');
  const empty = document.getElementById('jobs-empty');
  const visible = jobs.filter((j) => jobFilter === 'all' || j.status === jobFilter);

  document.getElementById('stat-published').textContent = jobs.filter((j) => j.status === 'published').length;
  document.getElementById('stat-draft').textContent = jobs.filter((j) => j.status === 'draft').length;
  document.getElementById('stat-closed').textContent = jobs.filter((j) => j.status === 'closed').length;
  document.getElementById('stat-apps').textContent = apps.filter((a) => a.status === 'new').length;
  document.getElementById('tab-jobs-count').textContent = jobs.length;

  table.innerHTML = '';
  empty.hidden = visible.length > 0;

  visible.forEach((job) => {
    const row = document.createElement('article');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <h3>${escapeHtml(job.title)}</h3>
        <p class="admin-row-meta">${TEAM_LABELS[job.team] || job.team} · ${escapeHtml(job.location || '—')} · ${escapeHtml(job.experience || '—')}</p>
      </div>
      <span class="admin-badge status-${job.status}">${job.status}</span>
      <span class="admin-row-applicants">${job.applicants || 0} applicants</span>
      <div class="admin-row-actions">
        <button type="button" class="admin-link-btn" data-action="toggle">${job.status === 'published' ? 'Unpublish' : 'Publish'}</button>
        <button type="button" class="admin-link-btn" data-action="edit">Edit</button>
      </div>
    `;

    row.querySelector('[data-action="edit"]').addEventListener('click', () => openDrawer(job.id));
    row.querySelector('[data-action="toggle"]').addEventListener('click', () => {
      job.status = job.status === 'published' ? 'draft' : 'published';
      job.updatedAt = today();
      save(JOBS_KEY, jobs);
      renderJobs();
      toast(`“${job.title}” is now ${job.status}`);
    });

    table.appendChild(row);
  });
}

/* ---------------- applications ---------------- */

function initAppFilters() {
  document.querySelectorAll('#app-status-filters .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('#app-status-filters .filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appFilter = btn.dataset.appstatus;
      renderApps();
    });
  });
}

function renderApps() {
  const table = document.getElementById('apps-table');
  const empty = document.getElementById('apps-empty');
  const visible = apps.filter((a) => appFilter === 'all' || a.status === appFilter);

  document.getElementById('tab-apps-count').textContent = apps.length;

  table.innerHTML = '';
  empty.hidden = visible.length > 0;

  visible.forEach((app) => {
    const row = document.createElement('article');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <h3>${escapeHtml(app.name)}</h3>
        <p class="admin-row-meta">${escapeHtml(app.role)} · ${escapeHtml(app.email)} · ${escapeHtml(app.phone)}</p>
      </div>
      <a class="admin-resume-link" href="#" title="Mockup — no file attached">${escapeHtml(app.resume)}</a>
      <span class="admin-badge app-${app.status}">${app.status}</span>
      <div class="admin-row-actions">
        <select class="admin-select admin-select-sm" aria-label="Application status">
          ${APP_STATUSES.map(
            (s) => `<option value="${s}"${s === app.status ? ' selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </div>
    `;

    row.querySelector('.admin-resume-link').addEventListener('click', (e) => {
      e.preventDefault();
      toast('Resume preview is not wired in this mockup');
    });

    row.querySelector('select').addEventListener('change', (e) => {
      app.status = e.target.value;
      save(APPS_KEY, apps);
      renderApps();
      renderJobs();
      toast(`${app.name} marked ${app.status}`);
    });

    table.appendChild(row);
  });
}

/* ---------------- job editor drawer ---------------- */

function initDrawer() {
  document.getElementById('new-job-btn').addEventListener('click', () => openDrawer(null));
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
  document.getElementById('job-form').addEventListener('submit', saveJob);
  document.getElementById('job-delete').addEventListener('click', deleteJob);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

function openDrawer(jobId) {
  const job = jobs.find((j) => j.id === jobId) || null;

  document.getElementById('drawer-title').textContent = job ? 'Edit job posting' : 'New job posting';
  document.getElementById('job-id').value = job ? job.id : '';
  document.getElementById('job-title').value = job ? job.title : '';
  document.getElementById('job-team').value = job ? job.team : 'engineering';
  document.getElementById('job-status').value = job ? job.status : 'draft';
  document.getElementById('job-location').value = job ? job.location || '' : '';
  document.getElementById('job-experience').value = job ? job.experience || '' : '';
  document.getElementById('job-type').value = job ? job.type || '' : 'Full-time';
  document.getElementById('job-summary').value = job ? job.summary || '' : '';
  document.getElementById('job-requirements').value = job ? (job.requirements || []).join('\n') : '';
  document.getElementById('job-delete').hidden = !job;

  document.getElementById('job-drawer').hidden = false;
  document.getElementById('drawer-overlay').hidden = false;
  document.body.classList.add('drawer-open');
  document.getElementById('job-title').focus();
}

function closeDrawer() {
  document.getElementById('job-drawer').hidden = true;
  document.getElementById('drawer-overlay').hidden = true;
  document.body.classList.remove('drawer-open');
}

function saveJob(e) {
  e.preventDefault();

  const id = document.getElementById('job-id').value;
  const payload = {
    title: document.getElementById('job-title').value.trim(),
    team: document.getElementById('job-team').value,
    status: document.getElementById('job-status').value,
    location: document.getElementById('job-location').value.trim(),
    experience: document.getElementById('job-experience').value.trim(),
    type: document.getElementById('job-type').value.trim(),
    summary: document.getElementById('job-summary').value.trim(),
    requirements: document
      .getElementById('job-requirements')
      .value.split('\n')
      .map((r) => r.trim())
      .filter(Boolean),
    updatedAt: today(),
  };

  if (!payload.title) return;

  if (id) {
    const job = jobs.find((j) => j.id === id);
    Object.assign(job, payload);
    toast(`Saved “${job.title}”`);
  } else {
    jobs.unshift({ id: `job-${Date.now()}`, applicants: 0, ...payload });
    toast(`Created “${payload.title}”`);
  }

  save(JOBS_KEY, jobs);
  renderJobs();
  closeDrawer();
}

function deleteJob() {
  const id = document.getElementById('job-id').value;
  if (!id) return;

  const job = jobs.find((j) => j.id === id);
  jobs = jobs.filter((j) => j.id !== id);
  save(JOBS_KEY, jobs);
  renderJobs();
  closeDrawer();
  toast(`Deleted “${job ? job.title : 'posting'}”`);
}

/* ---------------- utilities ---------------- */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer;
function toast(message) {
  const el = document.getElementById('admin-toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2600);
}
