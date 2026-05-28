document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStatsCounter();
  initScrollAnimations();
  initA11yHub();
  loadPortfolioData();
  initContactForm();
  initCarousel();
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

  // Mobile menu toggle (responsive transition version)
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

// --- 2. Stats Counter ---
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200; // lower is slower

  const animateCounters = (entries, observer) => {
    entries.forEach(entry => {
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
  counters.forEach(counter => observer.observe(counter));
}

// --- 3. Scroll Animations & Advanced Stagger ---
function initScrollAnimations() {
  // Basic slide-up observer
  const elements = document.querySelectorAll('.slide-up');
  const animateElements = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  };
  const observer1 = new IntersectionObserver(animateElements, { threshold: 0.1 });
  elements.forEach(el => observer1.observe(el));

  // Advanced staggered animations observer
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        const children = entry.target.querySelectorAll('.stagger-item');
        children.forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('reveal');
          }, i * 150 + 100); // 100ms base delay + 150ms stagger
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.stagger-container').forEach(el => staggerObserver.observe(el));
}

// --- 4. Portfolio Data Rendering & Filtering ---
let allProjects = [];

// Helper to parse numerical value from standard Indian rupee formatted values (e.g. Rs. X Lakhs, Rs. X Cr, Rs. X,XX,XXX)
function getProjectNumericValue(proj) {
  const parseVal = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const cleanStr = str.toLowerCase();
    
    if (cleanStr.includes('under progress') || cleanStr.includes('n/a') || cleanStr.includes('completed as per')) {
      return 0;
    }
    
    let multiplier = 1;
    if (cleanStr.includes('cr') || cleanStr.includes('crore')) {
      multiplier = 10000000;
    } else if (cleanStr.includes('lakh') || cleanStr.includes('lac') || cleanStr.includes('lcs')) {
      multiplier = 100000;
    }
    
    const match = cleanStr.match(/\d[\d,.]*/);
    if (!match) return 0;
    
    let numStr = match[0].replace(/,/g, '');
    if (numStr.endsWith('.')) {
      numStr = numStr.slice(0, -1);
    }
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
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Network response was not ok');
    allProjects = await response.json();
    // Sort descending by project value
    allProjects.sort((a, b) => getProjectNumericValue(b) - getProjectNumericValue(a));
    
    // By default (All filter), only show projects >= 1 Crore INR
    const defaultProjects = allProjects.filter(p => getProjectNumericValue(p) >= 10000000);
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
    // Generate a card
    const card = document.createElement('div');
    card.className = 'project-card';
    // Staggered load animation delay
    card.style.animationDelay = `${index * 0.025}s`;
    
    // Determine quality badge class based on grade
    let gradeClass = '';
    const grade = (p.quality_grade || '').toLowerCase();
    if (grade.includes('outstanding') || grade.includes('very good')) gradeClass = 'style="background:#E8F5EE;color:#1D6B3B"';
    else if (grade.includes('good') || grade.includes('satisfactory')) gradeClass = 'style="background:#EBF3FB;color:#2E75B6"';
    
    // We display key info: Name, Client, Value, Quality
    card.innerHTML = `
      <div class="card-content">
        <div class="card-tag">${p.tags ? p.tags[0] : 'Project'} | ${p.period}</div>
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
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active from all
      buttons.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      e.target.classList.add('active');
      
      const filter = e.target.getAttribute('data-filter');
      
      if (filter === 'all') {
        const filtered = allProjects.filter(p => getProjectNumericValue(p) >= 10000000);
        renderProjects(filtered);
      } else {
        const filtered = allProjects.filter(p => 
          p.tags && p.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );
        renderProjects(filtered);
      }
    });
  });
}

// --- 5. Accessibility Hub ---
function initA11yHub() {
  const toggleBtn = document.getElementById('a11y-toggle');
  const menu = document.getElementById('a11y-menu');
  const htmlRoot = document.documentElement;
  
  // Toggle menu visibility
  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('open');
  });

  // Font Scaling
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

  // High Contrast
  const contrastToggle = document.getElementById('toggle-contrast');
  contrastToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.setAttribute('data-theme', 'high-contrast');
    } else {
      document.body.setAttribute('data-theme', 'standard');
    }
  });

  // Reduce Motion
  const motionToggle = document.getElementById('toggle-motion');
  motionToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.setAttribute('data-reduced-motion', 'true');
    } else {
      document.body.removeAttribute('data-reduced-motion');
    }
  });
}

// --- 6. Contact Form Webhook Submission ---
function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerText;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Replace the placeholder below with your actual Google Script Web App URL
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbxasFvbeiPO7q1D54C5B_WnltgAw3xVAcORYMP3Y5m3FcOA7-S226jBG05absMsjrzJOQ/exec'; 
    
    if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
      alert('Invalid Google Web App URL! Please configure a valid Google Web App URL in app.js.');
      return;
    }
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Set loading state
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';
    
    try {
      const formDataObj = {
        name: name,
        email: email,
        message: message,
        submittedAt: new Date().toISOString(),
        source: 'Baltej Infra Website'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: JSON.stringify(formDataObj)
      });
      
      if (response.ok) {
        alert('Thank you for reaching out! Your inquiry has been sent successfully.');
        form.reset();
      } else {
        throw new Error('Server returned status: ' + response.status);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while sending your message.\n\nNote: If you are using an ad-blocker or Brave shields, it may be blocking requests to Zapier. Please temporarily disable it for this site and try again, or check your internet connection.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    }
  });
}

// --- 7. Major Clients Carousel ---
function initCarousel() {
  const track = document.getElementById('client-track');
  const prevBtn = document.getElementById('client-prev');
  const nextBtn = document.getElementById('client-next');
  
  if (!track || !prevBtn || !nextBtn) return;
  
  const scrollAmount = 250; // approximate width of one card + gap
  
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Optional: Auto-scroll
  let autoScroll = setInterval(() => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, 4000);
  
  // Pause on hover
  document.querySelector('.carousel-wrapper').addEventListener('mouseenter', () => clearInterval(autoScroll));
  document.querySelector('.carousel-wrapper').addEventListener('mouseleave', () => {
    autoScroll = setInterval(() => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 4000);
  });
}
