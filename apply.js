/**
 * LinkedIn-style job application page (client-side prototype)
 * Route: apply.html?role=<title>&team=...&location=...
 */

const JOB_CATALOG = {
  'Site Engineer — Highways': {
    team: 'Engineering',
    location: 'Panchkula / Project sites',
    type: 'Full-time',
    experience: '3–6 yrs',
  },
  'Structural / Design Engineer': {
    team: 'Engineering',
    location: 'Jaipur',
    type: 'Full-time',
    experience: '4–8 yrs',
  },
  'Project Manager — Civil Works': {
    team: 'Site Operations',
    location: 'Multi-site',
    type: 'Full-time',
    experience: '8+ yrs',
  },
  'QA / QC Engineer': {
    team: 'Site Operations',
    location: 'Himachal / Punjab corridors',
    type: 'Full-time',
    experience: '3–7 yrs',
  },
  'Billing & Contracts Executive': {
    team: 'Corporate',
    location: 'Panchkula',
    type: 'Full-time',
    experience: '2–5 yrs',
  },
  'HR & Admin Coordinator': {
    team: 'Corporate',
    location: 'Jaipur',
    type: 'Full-time',
    experience: '2–4 yrs',
  },
};

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ['pdf', 'doc', 'docx'];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const role =
    params.get('role') ||
    params.get('job') ||
    'General interest';

  const meta = JOB_CATALOG[role] || {
    team: params.get('team') || 'General',
    location: params.get('location') || 'India',
    type: params.get('type') || 'Full-time',
    experience: params.get('experience') || '—',
  };

  document.getElementById('apply-job-title').textContent = role;
  document.getElementById('apply-job-meta').textContent = `${meta.team} · Baltej Infra LLP`;
  document.getElementById('apply-role').value = role;
  document.title = `Apply — ${role} | Baltej Infra`;

  const facts = document.getElementById('apply-job-facts');
  facts.innerHTML = `
    <span>${meta.location}</span>
    <span>${meta.type}</span>
    <span>${meta.experience}</span>
  `;

  initResumeUpload();
  initApplicationForm(role);
});

function initResumeUpload() {
  const input = document.getElementById('apply-resume');
  const zone = document.getElementById('resume-dropzone');
  const idle = document.getElementById('resume-idle');
  const fileView = document.getElementById('resume-file');
  const nameEl = document.getElementById('resume-file-name');
  const sizeEl = document.getElementById('resume-file-size');
  const removeBtn = document.getElementById('resume-remove');
  const errorEl = document.getElementById('resume-error');
  const iconEl = document.querySelector('.resume-file-icon');

  let selectedFile = null;

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function extOf(name) {
    const parts = name.toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
  }

  function setFile(file) {
    if (!file) {
      selectedFile = null;
      input.value = '';
      idle.hidden = false;
      fileView.hidden = true;
      zone.classList.remove('has-file');
      return;
    }

    const ext = extOf(file.name);
    if (!ALLOWED_EXT.includes(ext)) {
      showError('Please upload a PDF or Word file (.pdf, .doc, .docx).');
      setFile(null);
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      showError('Resume must be 5 MB or smaller.');
      setFile(null);
      return;
    }

    clearError();
    selectedFile = file;
    nameEl.textContent = file.name;
    sizeEl.textContent = formatSize(file.size);
    if (iconEl) iconEl.textContent = ext.toUpperCase();
    idle.hidden = true;
    fileView.hidden = false;
    zone.classList.add('has-file');
  }

  zone.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn.contains(e.target)) return;
    input.click();
  });

  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    setFile(file || null);
  });

  ;['dragenter', 'dragover'].forEach((evt) => {
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
  });

  ;['dragleave', 'drop'].forEach((evt) => {
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
    });
  });

  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) setFile(file);
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setFile(null);
  });

  window.__getResumeFile = () => selectedFile;
}

function initApplicationForm(role) {
  const form = document.getElementById('job-application-form');
  const formView = document.getElementById('apply-form-view');
  const success = document.getElementById('apply-success');
  const successCopy = document.getElementById('apply-success-copy');
  const resumeError = document.getElementById('resume-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const resume = window.__getResumeFile?.();
    if (!resume) {
      resumeError.hidden = false;
      resumeError.textContent = 'Please upload a resume (PDF or Word, max 5 MB).';
      document.getElementById('resume-dropzone')?.focus();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById('apply-name').value.trim();
    const email = document.getElementById('apply-email').value.trim();

    // Prototype: keep a local record so demos feel real; nothing is uploaded to a server yet.
    try {
      const payload = {
        role,
        name,
        email,
        phone: document.getElementById('apply-phone').value.trim(),
        location: document.getElementById('apply-location').value.trim(),
        linkedin: document.getElementById('apply-linkedin').value.trim(),
        cover: document.getElementById('apply-cover').value.trim(),
        resumeName: resume.name,
        resumeSize: resume.size,
        submittedAt: new Date().toISOString(),
      };
      const prev = JSON.parse(localStorage.getItem('baltej_applications') || '[]');
      prev.unshift(payload);
      localStorage.setItem('baltej_applications', JSON.stringify(prev.slice(0, 25)));
    } catch (_) {
      /* ignore storage errors */
    }

    successCopy.textContent = `Thanks, ${name}. We’ve received your application for “${role}”${resume ? ` with “${resume.name}”` : ''}.`;
    formView.hidden = true;
    success.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
