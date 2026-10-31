// =============================================
// CUSTOM CURSOR (desktop uniquement)
// =============================================
const isTouchDevice = window.matchMedia('(hover: none)').matches;

if (!isTouchDevice) {
  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  const cursorRing = document.createElement('div');
  cursorRing.className = 'cursor-ring';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, summary, .icon-item, .about-card, .contact-card, .timeline-card, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-ring--hover'));
  });
}

// =============================================
// APPARITION LETTRE PAR LETTRE (titre hero)
// =============================================
const heroTitle = document.querySelector('.hero-title');
if (heroTitle && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroTitle.setAttribute('aria-label', heroTitle.textContent.replace(/\s+/g, ' ').trim());
  let index = 0;
  const splitLetters = (node) => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...child.textContent].forEach(ch => {
          if (!ch.trim()) return;
          const span = document.createElement('span');
          span.className = 'char';
          span.setAttribute('aria-hidden', 'true');
          span.style.setProperty('--i', index++);
          span.textContent = ch;
          frag.appendChild(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        splitLetters(child);
      }
    });
  };
  splitLetters(heroTitle);

  // Description et boutons apparaissent d'un bloc, une fois le nom entièrement apparu
  const heroBlock = heroTitle.closest('.hero-content');
  const titleEnd = 0.2 + (index - 1) * 0.03 + 0.5;
  heroBlock.style.setProperty('--reveal-delay', `${titleEnd.toFixed(2)}s`);
  heroBlock.classList.add('title-split');
}

// =============================================
// TERMINAL « À PROPOS » : texte tapé au clavier
// =============================================
document.querySelectorAll('.terminal-body').forEach(terminalBody => {
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const segments = [];
  const walker = document.createTreeWalker(terminalBody, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.classList.contains('terminal-prompt')) continue;
    const full = node.textContent.replace(/\s+/g, ' ');
    if (!full.trim()) continue;
    segments.push({ node, full: segments.length === 0 ? full.trim() : full });
  }
  // Pause après la commande avant d'afficher le résultat
  segments.splice(1, 0, { node: null, full: ' '.repeat(60) });

  terminalBody.style.minHeight = terminalBody.offsetHeight + 'px';
  segments.forEach(seg => { if (seg.node) seg.node.textContent = ''; });

  const cursor = document.createElement('span');
  cursor.className = 'term-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  segments[0].node.after(cursor);

  const total = segments.reduce((n, seg) => n + seg.full.length, 0);
  const CHARS_PER_SECOND = 140;

  const startTyping = () => {
    const start = performance.now();
    const tick = (now) => {
      let remaining = Math.floor((now - start) / 1000 * CHARS_PER_SECOND);
      let active = segments[0].node;
      for (const seg of segments) {
        const n = Math.max(0, Math.min(seg.full.length, remaining));
        remaining -= seg.full.length;
        if (!seg.node) continue;
        seg.node.textContent = seg.full.slice(0, n);
        if (n > 0) active = seg.node;
      }
      active.after(cursor);
      if (now - start < total / CHARS_PER_SECOND * 1000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const termObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      termObserver.disconnect();
      startTyping();
    }
  }, { threshold: 0.5 });
  termObserver.observe(terminalBody);
}
});

// =============================================
// COMPTEURS ANIMÉS (cartes « À propos »)
// =============================================
const counters = document.querySelectorAll('[data-count]');
if (counters.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const format = (el, value) => { el.textContent = value + (el.dataset.suffix || ''); };
  counters.forEach(el => format(el, 0));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterObserver.unobserve(el);
      const target = Number(el.dataset.count);
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        format(el, Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));
}

// =============================================
// BOUTONS « COPIER » (contact)
// =============================================
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
    } catch {
      // Contexte non sécurisé ou accès refusé : repli par sélection temporaire
      const field = document.createElement('textarea');
      field.value = btn.dataset.copy;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    const label = btn.textContent;
    btn.textContent = 'Copié ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = label;
      btn.classList.remove('copied');
    }, 1800);
  });
});

// =============================================
// LIGHTBOX (captures de projets)
// =============================================
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  document.querySelectorAll('.project-shot').forEach(shot => {
    shot.addEventListener('click', () => {
      const img = shot.querySelector('img');
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  // Un clic en dehors de l'image ferme la fenêtre
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
}

// =============================================
// PARALLAXE HERO
// =============================================
const avatarWrapper = document.querySelector('.avatar-wrapper');
const heroChips   = document.querySelector('.hero-chips');
const heroContent = document.querySelector('.hero-content');
const heroSection = document.querySelector('.hero');

document.addEventListener('mousemove', (e) => {
  if (!heroSection) return;
  const bottom = heroSection.getBoundingClientRect().bottom;
  if (e.clientY > bottom) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 24;
  const y = (e.clientY / window.innerHeight - 0.5) * 24;
  if (heroContent) heroContent.style.transform = `translate(${-x * 0.25}px, ${-y * 0.25}px)`;
});

// =============================================
// BOUTONS MAGNÉTIQUES
// =============================================
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    btn.style.transform = '';
    setTimeout(() => btn.style.transition = '', 500);
  });
});

// =============================================
// DARK MODE
// =============================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-toggle-icon');
const root        = document.documentElement;

const savedTheme = localStorage.getItem('theme') ?? 'dark';
if (savedTheme === 'dark') {
  root.classList.add('dark');
  themeIcon.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  const isDark = root.classList.toggle('dark');
  themeIcon.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// =============================================
// NAVBAR
// =============================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Fade-up on scroll (Intersection Observer)
const fadeEls = document.querySelectorAll('.fade-up, .reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
fadeEls.forEach(el => observer.observe(el));

// Tuiles de compétences : décalage d'apparition par groupe
document.querySelectorAll('.icon-grid').forEach(grid => {
  [...grid.children].forEach((tile, i) => tile.style.setProperty('--i', i));
});

// Frise des expériences : la ligne se dessine au fil du scroll
const timeline = document.querySelector('.timeline');
if (timeline && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const drawLine = () => {
    const rect = timeline.getBoundingClientRect();
    const progress = (window.innerHeight * 0.7 - rect.top) / rect.height;
    timeline.style.setProperty('--line', Math.min(1, Math.max(0, progress)).toFixed(3));
  };
  drawLine();
  window.addEventListener('scroll', drawLine, { passive: true });
  window.addEventListener('resize', drawLine);
}

// Skill bars animation
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        entry.target.style.width = width + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);
skillFills.forEach(el => skillObserver.observe(el));

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active-link', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });
