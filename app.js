document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStatsCounter();
  initScrollAnimations();
  initA11yHub();
  loadPortfolioData();
  initContactForm();
  initCarousel();
  initTilt();
});

// --- 1. Sticky Navbar ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
}

// --- 2. Stats Counter ---
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200;

  const animateCounters = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');

        const updateCount = () => {
          const count = +counter.innerText;
          const inc = target / speed;

          if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 15);
          } else {
            counter.innerText = target;
          }
        };

        updateCount();
        observer.unobserve(counter);
      }
    });
  };

  const observer = new IntersectionObserver(animateCounters, { threshold: 0.5 });
  counters.forEach((counter) => observer.observe(counter));
}

// --- 3. Scroll Animations ---
function initScrollAnimations() {
  const elements = document.querySelectorAll('.slide-up');
  const observer1 = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  elements.forEach((el) => observer1.observe(el));

  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          const children = entry.target.querySelectorAll('.stagger-item');
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('reveal'), i * 120 + 80);
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.stagger-container').forEach((el) => staggerObserver.observe(el));
}

// --- 4. Light 3D tilt on capabilities ---
function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (document.body.getAttribute('data-reduced-motion') === 'true') return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

// --- 5. Portfolio ---
let allProjects = [];

function getProjectNumericValue(proj) {
  const parseVal = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const cleanStr = str.toLowerCase();

    if (
      cleanStr.includes('under progress') ||
      cleanStr.includes('n/a') ||
      cleanStr.includes('completed as per')
    ) {
      return 0;
    }

    let multiplier = 1;
    if (cleanStr.includes('cr') || cleanStr.includes('crore')) {
      multiplier = 10000000;
    } else if (
      cleanStr.includes('lakh') ||
      cleanStr.includes('lac') ||
      cleanStr.includes('lcs')
    ) {
      multiplier = 100000;
    }

    const match = cleanStr.match(/\d[\d,.]*/);
    if (!match) return 0;

    let numStr = match[0].replace(/,/g, '');
    if (numStr.endsWith('.')) numStr = numStr.slice(0, -1);
    const num = parseFloat(numStr);
    if (isNaN(num)) return 0;

    return num * multiplier;
  };

  const gross = parseVal(proj.gross_value);
  const awarded = parseVal(proj.awarded_value);

  return Math.max(gross, awarded);
}

async function loadPortfolioData() {
  const container = document.getElementById('projects-container');
  if (!container) return;
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Network response was not ok');
    allProjects = await response.json();
    allProjects.sort((a, b) => getProjectNumericValue(b) - getProjectNumericValue(a));

    const defaultProjects = allProjects.filter((p) => getProjectNumericValue(p) >= 10000000);
    renderProjects(defaultProjects);
    initFilters();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    container.innerHTML = '<p>Error loading projects. Please try again later.</p>';
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = '<p>No projects found for this category.</p>';
    return;
  }

  projects.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${index * 0.04}s`;

    let gradeClass = '';
    const grade = (p.quality_grade || '').toLowerCase();
    if (grade.includes('outstanding') || grade.includes('very good')) {
      gradeClass = 'style="background:#E8F5EE;color:#1D6B3B"';
    } else if (grade.includes('good') || grade.includes('satisfactory')) {
      gradeClass = 'style="background:#EBF3FB;color:#2E75B6"';
    }

    card.innerHTML = `
      <div class="card-content">
        <div class="card-tag">${p.tags ? p.tags[0] : 'Project'}${p.period ? ' | ' + p.period : ''}</div>
        <h3 class="card-title">${p.name}</h3>
        <div class="card-meta">
          <p>Client: <span>${p.client}</span></p>
          <p>Quality: <span class="quality-badge" ${gradeClass}>${p.quality_grade || 'N/A'}</span></p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      buttons.forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');

      const filter = e.target.getAttribute('data-filter');

      if (filter === 'all') {
        renderProjects(allProjects.filter((p) => getProjectNumericValue(p) >= 10000000));
      } else {
        renderProjects(
          allProjects.filter(
            (p) => p.tags && p.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase()))
          )
        );
      }
    });
  });
}

// --- 6. Accessibility Hub ---
function initA11yHub() {
  const toggleBtn = document.getElementById('a11y-toggle');
  const menu = document.getElementById('a11y-menu');
  const htmlRoot = document.documentElement;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('open');
  });

  const btnInc = document.getElementById('btn-font-inc');
  const btnDec = document.getElementById('btn-font-dec');
  let currentScale = 1;

  btnInc.addEventListener('click', () => {
    if (currentScale < 1.5) {
      currentScale += 0.1;
      htmlRoot.style.fontSize = `${16 * currentScale}px`;
    }
  });

  btnDec.addEventListener('click', () => {
    if (currentScale > 0.8) {
      currentScale -= 0.1;
      htmlRoot.style.fontSize = `${16 * currentScale}px`;
    }
  });

  document.getElementById('toggle-contrast').addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.target.checked ? 'high-contrast' : 'standard');
  });

  document.getElementById('toggle-motion').addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.setAttribute('data-reduced-motion', 'true');
    } else {
      document.body.removeAttribute('data-reduced-motion');
    }
  });
}

// --- 7. Contact Form ---
function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerText;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const webhookUrl =
      'https://script.google.com/macros/s/AKfycbxasFvbeiPO7q1D54C5B_WnltgAw3xVAcORYMP3Y5m3FcOA7-S226jBG05absMsjrzJOQ/exec';

    if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
      alert('Invalid Google Web App URL! Please configure a valid Google Web App URL in app.js.');
      return;
    }

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    try {
      const formDataObj = {
        name,
        email,
        message,
        submittedAt: new Date().toISOString(),
        source: 'Baltej Infra Website',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: JSON.stringify(formDataObj),
      });

      if (response.ok) {
        alert('Thank you for reaching out! Your inquiry has been sent successfully.');
        form.reset();
      } else {
        throw new Error('Server returned status: ' + response.status);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(
        'An error occurred while sending your message.\n\nNote: If you are using an ad-blocker or Brave shields, it may be blocking requests. Please temporarily disable it for this site and try again.'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    }
  });
}

// --- 8. Clients Carousel ---
function initCarousel() {
  const track = document.getElementById('client-track');
  const prevBtn = document.getElementById('client-prev');
  const nextBtn = document.getElementById('client-next');

  if (!track || !prevBtn || !nextBtn) return;

  const scrollAmount = 250;

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  let autoScroll = setInterval(() => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, 4000);

  const wrapper = document.querySelector('.carousel-wrapper');
  wrapper.addEventListener('mouseenter', () => clearInterval(autoScroll));
  wrapper.addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 4000);
  });
}
