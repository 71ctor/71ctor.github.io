const GITHUB_USER = '71ctor';

// ---------- THEME ----------
function initTheme() {
  const saved = localStorage.getItem('theme');
  const hour = new Date().getHours();
  const isDark = saved ? saved === 'dark' : (hour >= 19 || hour < 7);
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  updateToggleIcon();
}

function updateToggleIcon() {
  const icon = document.querySelector('.theme-icon');
  if (!icon) return;
  icon.textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '🌙';
}

// ---------- WAVE EMOJI ----------
function initWave() {
  const wave = document.querySelector('.wave');
  if (!wave) return;

  function triggerWave() {
    wave.classList.remove('waving');
    void wave.offsetWidth; // reflow to restart animation
    wave.classList.add('waving');
  }

  // Auto-wave on load
  setTimeout(triggerWave, 800);
  wave.addEventListener('mouseenter', triggerWave);
}

// ---------- SCROLL TO TOP ----------
function initScrollTop() {
  const btn = document.querySelector('.top-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---------- SCROLL REVEAL ----------
function initScrollReveal() {
  if (typeof ScrollReveal === 'undefined') return;

  const sr = ScrollReveal({
    origin: 'bottom',
    distance: '20px',
    duration: 600,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    reset: false,
  });

  sr.reveal('.intro',          { origin: 'left',   delay: 100 });
  sr.reveal('.about',          { delay: 100 });
  sr.reveal('.skills',         { delay: 100 });
  sr.reveal('.experience',     { delay: 100 });
  sr.reveal('.work',           { delay: 100 });
  sr.reveal('.other-projects', { delay: 100 });
  sr.reveal('.contact',        { delay: 100 });
}

// ---------- PROJECTS ----------
async function loadProjects() {
  const featuredContainer = document.getElementById('projects-list');
  const otherContainer    = document.getElementById('other-projects-list');

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=20&type=public`
    );
    if (!res.ok) throw new Error('GitHub API error');

    const repos = await res.json();
    const filtered = repos.filter(r => !r.fork && r.name !== `${GITHUB_USER}.github.io`);

    if (filtered.length === 0) {
      featuredContainer.innerHTML = '<p class="loading-text">No public projects yet — check back soon.</p>';
      return;
    }

    const featured = filtered.slice(0, 3);
    const others   = filtered.slice(3);

    featuredContainer.innerHTML = featured.map((repo, i) => `
      <div class="project">
        <span class="project-num">0${i + 1}</span>
        <div class="project-body">
          <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${formatName(repo.name)}</a></h3>
          <p class="project-meta">
            ${repo.language ? repo.language + ' · ' : ''}Updated ${timeAgo(repo.updated_at)}
          </p>
          <p class="project-desc">${repo.description || 'No description provided.'}</p>
          <a class="project-link" href="${repo.html_url}" target="_blank" rel="noopener">
            View on GitHub ↗
          </a>
        </div>
      </div>
    `).join('');

    if (otherContainer && others.length > 0) {
      otherContainer.innerHTML = others.map(repo => `
        <div class="other-card">
          <div class="other-card-header">
            <span class="other-card-icon">📁</span>
            <a class="other-card-link" href="${repo.html_url}" target="_blank" rel="noopener">↗</a>
          </div>
          <h4>${formatName(repo.name)}</h4>
          <p>${repo.description || 'No description provided.'}</p>
          <div class="other-card-footer">
            ${repo.language ? `<span class="other-card-lang">${repo.language}</span>` : ''}
            <span>${timeAgo(repo.updated_at)}</span>
          </div>
        </div>
      `).join('');
    } else if (otherContainer) {
      otherContainer.style.display = 'none';
      document.querySelector('.other-projects-title').style.display = 'none';
    }

  } catch {
    featuredContainer.innerHTML = `<p class="loading-text">Could not load projects. Visit <a href="https://github.com/${GITHUB_USER}" style="color:var(--accent)">github.com/${GITHUB_USER}</a> directly.</p>`;
  }
}

function formatName(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ---------- CONTACT FORM ----------
function initContactForm() {
  const form   = document.querySelector('.contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = 'Message sent — I\'ll get back to you soon.';
        status.style.color = 'var(--accent)';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      status.textContent = 'Something went wrong. Try emailing directly.';
    } finally {
      btn.textContent = 'Say Hello';
      btn.disabled = false;
    }
  });
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWave();
  initScrollTop();
  initScrollReveal();
  loadProjects();
  initContactForm();

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    updateToggleIcon();
  });
});
