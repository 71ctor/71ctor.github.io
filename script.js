const GITHUB_USER = '71ctor';

async function loadProjects() {
  const container = document.getElementById('projects-list');

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6&type=public`
    );

    if (!res.ok) throw new Error('GitHub API error');

    const repos = await res.json();

    const filtered = repos.filter(r => !r.fork && r.name !== `${GITHUB_USER}.github.io`);

    if (filtered.length === 0) {
      container.innerHTML = '<p class="loading-text">No public projects yet — check back soon.</p>';
      return;
    }

    container.innerHTML = filtered.map((repo, i) => `
      <div class="project">
        <span class="project-num">0${i + 1}</span>
        <div class="project-body">
          <h3>${formatName(repo.name)}</h3>
          <p class="project-meta">
            ${repo.language ? repo.language + ' · ' : ''}Updated ${timeAgo(repo.updated_at)}
          </p>
          <p>${repo.description || 'No description provided.'}</p>
          <a class="project-link" href="${repo.html_url}" target="_blank" rel="noopener">
            View on GitHub ↗
          </a>
        </div>
      </div>
    `).join('');

  } catch {
    container.innerHTML = '<p class="loading-text">Could not load projects. Visit <a href="https://github.com/71ctor" style="color:var(--accent)">github.com/71ctor</a> directly.</p>';
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

// Contact form status feedback
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();

  const form = document.querySelector('.contact-form');
  const status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
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
        btn.textContent = 'Send message →';
        btn.disabled = false;
      }
    });
  }
});
