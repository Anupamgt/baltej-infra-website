/**
 * Baltej Infra Careers — dedicated careers destination (mock data)
 */
const CAREERS_JOBS = [
  {
    id: 'site-engineer',
    title: 'Site Engineer — Highways',
    team: 'engineering',
    teamLabel: 'Engineering',
    location: 'panchkula',
    locationLabel: 'Panchkula / Project sites',
    type: 'Full-time',
    experience: '3–6 yrs',
    summary:
      'Support execution of highway and protection works — quality checks, measurement, and coordination with subcontractors.',
    requirements: [
      'Diploma / B.Tech Civil preferred',
      'Experience on NH / EPC packages a plus',
      'Willingness to travel to active corridors',
    ],
  },
  {
    id: 'structural',
    title: 'Structural / Design Engineer',
    team: 'engineering',
    teamLabel: 'Engineering',
    location: 'jaipur',
    locationLabel: 'Jaipur',
    type: 'Full-time',
    experience: '4–8 yrs',
    summary:
      'In-house support for structural detailing, drawings review, and coordination with site teams on concrete and retaining works.',
    requirements: [
      'B.Tech / M.Tech Civil or Structural',
      'Familiarity with AutoCAD / STAAD or equivalent',
      'Exposure to highway structures preferred',
    ],
  },
  {
    id: 'pm',
    title: 'Project Manager — Civil Works',
    team: 'site',
    teamLabel: 'Site Operations',
    location: 'multi',
    locationLabel: 'Multi-site',
    type: 'Full-time',
    experience: '8+ yrs',
    summary:
      'Own schedule, cost, and quality for assigned packages. Interface with clients and lead site supervision teams.',
    requirements: [
      'Proven delivery on highway or industrial civil projects',
      'Strong client communication and documentation habits',
      'Ready to base near active project locations',
    ],
  },
  {
    id: 'qaqc',
    title: 'QA / QC Engineer',
    team: 'site',
    teamLabel: 'Site Operations',
    location: 'himachal',
    locationLabel: 'Himachal / Punjab corridors',
    type: 'Full-time',
    experience: '3–7 yrs',
    summary:
      'Implement ITP, material testing coordination, and non-conformance closure across highway and structural packages.',
    requirements: [
      'Knowledge of MoRTH / IS codes',
      'Lab and field testing coordination experience',
      'Clear reporting and audit readiness',
    ],
  },
  {
    id: 'billing',
    title: 'Billing & Contracts Executive',
    team: 'corporate',
    teamLabel: 'Corporate',
    location: 'panchkula',
    locationLabel: 'Panchkula',
    type: 'Full-time',
    experience: '2–5 yrs',
    summary:
      'Prepare RA bills, track variations, and support contract correspondence for active packages.',
    requirements: [
      'Civil background or contracts experience',
      'Comfortable with measurement books and client formats',
      'Strong Excel and documentation skills',
    ],
  },
  {
    id: 'hr',
    title: 'HR & Admin Coordinator',
    team: 'corporate',
    teamLabel: 'Corporate',
    location: 'jaipur',
    locationLabel: 'Jaipur',
    type: 'Full-time',
    experience: '2–4 yrs',
    summary:
      'Support recruitment logistics, site onboarding, and office administration for project deployments.',
    requirements: [
      'Prior experience in construction or manufacturing preferred',
      'Organized follow-up and vendor coordination',
      'Comfortable with multi-location teams',
    ],
  },
];

document.addEventListener('DOMContentLoaded', () => {
  let activeTeam = 'all';
  let query = '';
  let location = 'all';

  const listEl = document.getElementById('careers-job-list');
  const emptyEl = document.getElementById('careers-empty');
  const countEl = document.getElementById('careers-count');

  function matches(job) {
    const teamOk = activeTeam === 'all' || job.team === activeTeam;
    const locOk = location === 'all' || job.location === location ||
      (location === 'himachal' && (job.location === 'himachal' || job.locationLabel.toLowerCase().includes('punjab')));
    const q = query.trim().toLowerCase();
    const queryOk =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.summary.toLowerCase().includes(q) ||
      job.teamLabel.toLowerCase().includes(q) ||
      job.locationLabel.toLowerCase().includes(q) ||
      job.requirements.some((r) => r.toLowerCase().includes(q));
    return teamOk && locOk && queryOk;
  }

  function render() {
    if (!listEl) return;
    const jobs = CAREERS_JOBS.filter(matches);
    listEl.innerHTML = '';

    if (countEl) {
      countEl.textContent = `${jobs.length} opening${jobs.length === 1 ? '' : 's'}`;
    }
    if (emptyEl) emptyEl.hidden = jobs.length > 0;

    jobs.forEach((job) => {
      const article = document.createElement('article');
      article.className = 'careers-job-card';
      article.dataset.id = job.id;

      article.innerHTML = `
        <div class="careers-job-row">
          <button type="button" class="careers-job-summary" aria-expanded="false">
            <div class="careers-job-main">
              <h3>${job.title}</h3>
              <p class="careers-job-meta">${job.locationLabel} · ${job.type} · ${job.experience}</p>
            </div>
            <span class="job-dept">${job.teamLabel}</span>
            <span class="job-toggle" aria-hidden="true">+</span>
          </button>
          <a class="btn-primary careers-apply-chip" href="apply.html?role=${encodeURIComponent(job.title)}">Apply</a>
        </div>
        <div class="careers-job-detail" hidden>
          <p>${job.summary}</p>
          <ul>${job.requirements.map((r) => `<li>${r}</li>`).join('')}</ul>
          <a class="btn-primary careers-apply-link" href="apply.html?role=${encodeURIComponent(job.title)}">Apply for this role</a>
          <a class="careers-portfolio-link" href="index.html#portfolio">See highway &amp; civil packages you’d support →</a>
        </div>
      `;

      const summary = article.querySelector('.careers-job-summary');
      const detail = article.querySelector('.careers-job-detail');
      const toggle = article.querySelector('.job-toggle');
      const applyChip = article.querySelector('.careers-apply-chip');

      applyChip?.addEventListener('click', (e) => e.stopPropagation());

      summary.addEventListener('click', () => {
        const open = summary.getAttribute('aria-expanded') === 'true';
        listEl.querySelectorAll('.careers-job-card').forEach((card) => {
          if (card === article) return;
          const s = card.querySelector('.careers-job-summary');
          const d = card.querySelector('.careers-job-detail');
          const t = card.querySelector('.job-toggle');
          if (s) s.setAttribute('aria-expanded', 'false');
          if (d) d.hidden = true;
          if (t) t.textContent = '+';
          card.classList.remove('open');
        });
        summary.setAttribute('aria-expanded', String(!open));
        detail.hidden = open;
        article.classList.toggle('open', !open);
        toggle.textContent = open ? '+' : '−';
      });

      listEl.appendChild(article);
    });
  }

  document.getElementById('careers-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    query = document.getElementById('careers-query')?.value || '';
    location = document.getElementById('careers-location')?.value || 'all';
    render();
    document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('careers-query')?.addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });

  document.getElementById('careers-location')?.addEventListener('change', (e) => {
    location = e.target.value;
    render();
  });

  document.querySelectorAll('#careers-filters .filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#careers-filters .filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeTeam = btn.getAttribute('data-filter') || 'all';
      render();
    });
  });

  document.querySelectorAll('.careers-team-card').forEach((card) => {
    card.addEventListener('click', () => {
      const team = card.getAttribute('data-team') || 'all';
      activeTeam = team;
      document.querySelectorAll('#careers-filters .filter-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-filter') === team);
      });
      render();
      document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  render();
});
