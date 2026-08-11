document.addEventListener('DOMContentLoaded', () => {
  initJobFilters();
  initJobAccordions();
  initJobApplyLinks();
  initJobInterestForm();
});

function initJobFilters() {
  const buttons = document.querySelectorAll('#jobs-filters .filter-btn');
  const rows = document.querySelectorAll('.job-row');
  const empty = document.getElementById('jobs-empty');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      let visible = 0;

      rows.forEach((row) => {
        const match = filter === 'all' || row.getAttribute('data-dept') === filter;
        row.hidden = !match;
        if (match) visible += 1;
        if (!match) collapseJob(row);
      });

      if (empty) empty.hidden = visible > 0;
    });
  });
}

function collapseJob(row) {
  const summary = row.querySelector('.job-summary');
  const detail = row.querySelector('.job-detail');
  const toggle = row.querySelector('.job-toggle');
  if (!summary || !detail) return;
  summary.setAttribute('aria-expanded', 'false');
  detail.hidden = true;
  row.classList.remove('open');
  if (toggle) toggle.textContent = '+';
}

function initJobAccordions() {
  document.querySelectorAll('.job-row').forEach((row) => {
    const summary = row.querySelector('.job-summary');
    const detail = row.querySelector('.job-detail');
    const toggle = row.querySelector('.job-toggle');
    if (!summary || !detail) return;

    summary.addEventListener('click', () => {
      const open = summary.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.job-row').forEach((other) => {
        if (other !== row) collapseJob(other);
      });

      summary.setAttribute('aria-expanded', String(!open));
      detail.hidden = open;
      row.classList.toggle('open', !open);
      if (toggle) toggle.textContent = open ? '+' : '−';
    });
  });
}

function initJobApplyLinks() {
  const roleSelect = document.getElementById('job-role');
  document.querySelectorAll('.job-apply-link').forEach((link) => {
    link.addEventListener('click', () => {
      const role = link.getAttribute('data-role');
      if (roleSelect && role) {
        [...roleSelect.options].forEach((opt) => {
          opt.selected = opt.value === role || opt.textContent === role;
        });
      }
    });
  });
}

function initJobInterestForm() {
  const form = document.getElementById('jobs-interest-form');
  const note = document.getElementById('jobs-form-note');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('job-name')?.value?.trim() || 'there';
    const role = document.getElementById('job-role')?.value || 'the selected role';

    if (note) {
      note.textContent = `Thanks, ${name}. Your interest for “${role}” is recorded in this mockup only — no email was sent.`;
    }

    form.reset();
    const roleSelect = document.getElementById('job-role');
    if (roleSelect) roleSelect.selectedIndex = 0;
  });
}
