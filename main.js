(() => {
  'use strict';

  const p = window.profile;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const setText = (selector, value) => $$(selector).forEach(el => { el.textContent = value; });
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);

  // Preserve the homepage position when opening a legal page.
  const restoreScroll = () => {
    const saved = sessionStorage.getItem('home-scroll-y');
    if (saved === null) return;
    const y = Number(saved);
    if (!Number.isFinite(y)) return;
    requestAnimationFrame(() => setTimeout(() => scrollTo(0, y), 0));
  };

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  $$('a[href$="privacy-policy.html"], a[href$="terms.html"], a[href$="cookie-policy.html"], a[href$="refund-policy.html"]').forEach(link => {
    link.addEventListener('click', () => sessionStorage.setItem('home-scroll-y', String(scrollY)));
  });

  addEventListener('pageshow', event => {
    if (event.persisted || performance.getEntriesByType('navigation')[0]?.type === 'back_forward') restoreScroll();
  });


  // ---------- Content ----------
  setText('[data-logo]', p.logoName);
  setText('[data-name]', p.name);
  setText('[data-tagline]', p.tagline);
  setText('[data-intro]', p.intro);
  setText('[data-about]', p.about);
  setText('[data-learning]', p.currentlyLearning);
  setText('[data-interests]', p.interests);
  setText('[data-location]', p.location);
  $$('[data-resume]').forEach(link => { link.href = p.resume; });
  $('#year').textContent = new Date().getFullYear();

  const email = $('[data-email]');
  if (email) {
    email.href = `mailto:${p.email}`;
    email.textContent = `${p.email} ↗`;
    email.setAttribute('aria-label', `Email ${p.email}`);
  }

  const render = {
    skills: () => p.skills.length
      ? p.skills.map(group => `
          <article class="skill-card">
            <h3>${esc(group.category)}</h3>
            <div class="skill-list">${group.items.map(item => `<span>${esc(item)}</span>`).join('')}</div>
          </article>`).join('')
      : '<article class="skill-card empty-card"><h3>Skills loading...</h3><p>Apparently even the skills section needs a coffee break.</p></article>',

    technologies: () => p.technologies.map(item => `<b>${esc(item)}</b>`).join(''),

    projects: () => p.projects.length
      ? p.projects.map((project, index) => `
          <article class="project-card">
            <div class="project-image">
              ${project.image
                ? `<img src="${esc(project.image)}" alt="${esc(project.name)} project preview" loading="lazy">`
                : `<div class="project-placeholder"><span>${String(index + 1).padStart(2, '0')}</span><div>${esc(project.name)}</div></div>`}
            </div>
            <div class="project-body">
              <div class="project-title-row"><h3>${esc(project.name)}</h3><span class="project-arrow">↗</span></div>
              <p>${esc(project.description)}</p>
              <div class="tag-row">${project.technologies.map(item => `<span>${esc(item)}</span>`).join('')}</div>
              ${(project.live || project.github) ? `<div class="project-links">
                ${project.live ? `<a href="${esc(project.live)}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : ''}
                ${project.github ? `<a href="${esc(project.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''}
              </div>` : ''}
            </div>
          </article>`).join('')
      : '<article class="project-card empty-card"><div class="project-body"><h3>Nothing shipped yet.</h3><p>This space is intentionally empty until the next project is worth showing.</p></div></article>',

    experience: () => p.experience.map(item => `
      <article class="timeline-item">
        <span class="timeline-dot"></span>
        <div class="timeline-date">${esc(item.date)}</div>
        <h3>${esc(item.position)}</h3><h4>${esc(item.organization)}</h4>
        <p>${esc(item.description)}</p>
      </article>`).join(''),

    education: () => p.education.length
      ? p.education.map(item => `
          <article class="education-item">
            <span>${esc(item.duration || 'Education')}</span>
            <h3>${esc(item.degree)}</h3><h4>${esc(item.institution)}</h4>
            ${item.detail ? `<p>${esc(item.detail)}</p>` : ''}
          </article>`).join('')
      : '<article class="education-item empty-card"><span>Currently</span><h3>Learning by building.</h3><p>Because apparently the fastest way to learn is to open VS Code and start breaking things.</p></article>',

    socials: () => Object.entries(p.social)
      .filter(([, url]) => url)
      .map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name[0].toUpperCase() + name.slice(1))} ↗</a>`)
      .join('')
  };

  $('#skills-grid').innerHTML = render.skills();
  $('#technologies').innerHTML = render.technologies();
  $('#projects-grid').innerHTML = render.projects();
  $('#experience-list').innerHTML = render.experience();
  $('#education-list').innerHTML = render.education();
  $('#social-links').innerHTML = render.socials();

  // ---------- Shared UI ----------
  const body = document.body;
  const toastStack = $('#toast-stack');
  const showToast = message => {
    if (!toastStack) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastStack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  };

  // Mobile navigation.
  const menu = $('.nav-links');
  const menuButton = $('.menu-button');
  const closeMenu = () => {
    menu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open);
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));

  // Theme preference.
  const themeButton = $('.theme-toggle');
  if (localStorage.getItem('hrishabh-theme') === 'light') body.classList.add('light-theme');
  const syncTheme = () => {
    const light = body.classList.contains('light-theme');
    themeButton?.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    if (themeButton) themeButton.textContent = light ? '☀' : '☾';
  };
  syncTheme();
  themeButton?.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    localStorage.setItem('hrishabh-theme', body.classList.contains('light-theme') ? 'light' : 'dark');
    syncTheme();
    showToast(body.classList.contains('light-theme') ? 'Light mode on.' : 'Dark mode on.');
  });

  // Scroll helpers.
  const progress = $('.scroll-progress span');
  const backTop = $('#back-top');
  let scrollFrame = 0;
  let lastScrollY = -1;
  let maxScroll = 0;
  const refreshScrollMetrics = () => {
    maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  };
  const updateScrollUI = () => {
    scrollFrame = 0;
    const y = scrollY;
    if (y === lastScrollY) return;
    lastScrollY = y;
    if (progress) progress.style.transform = `scaleX(${maxScroll ? y / maxScroll : 0})`;
    backTop?.classList.toggle('show', y > 650);
  };
  const requestScrollUI = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollUI);
  };
  addEventListener('scroll', requestScrollUI, { passive: true });
  addEventListener('resize', () => { refreshScrollMetrics(); requestScrollUI(); }, { passive: true });
  refreshScrollMetrics();
  updateScrollUI();
  backTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Replayable section reveals.
  const revealTargets = $$('.section, .hero-copy, .hero-visual, .resume-box, .project-card, .skill-card, .timeline-item, .education-item, .about-details > div');
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index % 5 * 70, 280)}ms`);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    }), { threshold: .14, rootMargin: '0px 0px -80px' });
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add('is-visible'));

  // Active navigation state.
  const navLinks = $$('.nav-links a');
  const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-38% 0px -52% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  // Motion effects only on capable pointer devices.
  const motionOK = matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOK) {
    $$('.project-card, .skill-card, .education-item').forEach(card => {
      const rect = card.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      card.addEventListener('pointermove', event => {
        const x = (event.clientX - rect.left - halfW) / halfW;
        const y = (event.clientY - rect.top - halfH) / halfH;
        card.style.setProperty('--rx', `${(-y * 1.5).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(x * 2).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${((x + 1) * 50).toFixed(0)}%`);
        card.style.setProperty('--gy', `${((y + 1) * 50).toFixed(0)}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    const codeWindow = $('.code-window');
    if (codeWindow) {
      const rect = codeWindow.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      codeWindow.addEventListener('pointermove', event => {
        const x = (event.clientX - rect.left - halfW) / halfW;
        const y = (event.clientY - rect.top - halfH) / halfH;
        codeWindow.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-4px)`;
      });
    }
    codeWindow?.addEventListener('pointerleave', () => { codeWindow.style.transform = ''; });

    $$('.button-primary').forEach(button => {
      const rect = button.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      button.addEventListener('pointermove', event => {
        const x = (event.clientX - rect.left - halfW) / halfW;
        const y = (event.clientY - rect.top - halfH) / halfH;
        button.style.transform = `translate(${x * 3}px, ${y * 3}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  // Copy email.
  $('[data-copy-email]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      showToast('Email copied to clipboard.');
    } catch {
      showToast(`Email: ${p.email}`);
    }
  });

  // FAQ accordion.
  $$('.faq-question').forEach(button => button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', open);
  }));

  // Keyboard shortcuts already shown in the footer.
  const shortcutPanel = $('#shortcut-panel');
  const closeShortcuts = () => shortcutPanel?.classList.remove('open');
  $('.shortcut-close')?.addEventListener('click', closeShortcuts);
  shortcutPanel?.addEventListener('click', event => { if (event.target === shortcutPanel) closeShortcuts(); });
  let shortcutPrefix = false;
  let prefixTimer;
  addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const key = event.key.toLowerCase();
    if (key === 'escape') return closeShortcuts();
    if (key === '?') return shortcutPanel?.classList.toggle('open');
    if (key === 't') return themeButton?.click();
    if (shortcutPrefix) {
      const targets = { h:'#home', p:'#projects', c:'#contact' };
      if (targets[key]) $(targets[key])?.scrollIntoView({ behavior: 'smooth' });
      shortcutPrefix = false;
      clearTimeout(prefixTimer);
      return;
    }
    if (key === 'g') {
      shortcutPrefix = true;
      clearTimeout(prefixTimer);
      prefixTimer = setTimeout(() => { shortcutPrefix = false; }, 900);
    }
  });

  // Hide the loader after the first paint.
  addEventListener('load', () => setTimeout(() => {
    body.classList.remove('is-loading');
    $('#skeleton-loader')?.classList.add('hidden');
  }, 350), { once: true });
})();
