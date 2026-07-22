/* ===================================================
   M&B GUIDE — main.js
   Handles: Navbar scroll, hamburger menu, particle
   canvas, scroll-reveal animations, sidebar active link
   =================================================== */

'use strict';

// ─── DOM REFS ─────────────────────────────────────────
const header    = document.querySelector('.site-header');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
const canvas    = document.getElementById('particles-canvas');

// ─── NAVBAR SCROLL EFFECT ────────────────────────────
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveSidebarLink();
}, { passive: true });

// ─── HAMBURGER MENU ──────────────────────────────────
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });
}

// ─── SCROLL REVEAL ───────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── SIDEBAR ACTIVE LINK ─────────────────────────────
const sidebarLinks   = document.querySelectorAll('.nav-link-side');
const contentSections = document.querySelectorAll('.content-section');

function updateActiveSidebarLink() {
  if (!contentSections.length) return;
  let current = '';
  const scrollY = window.scrollY + 120;

  contentSections.forEach(section => {
    if (section.offsetTop <= scrollY) {
      current = section.id;
    }
  });

  sidebarLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ─── PARTICLE CANVAS ─────────────────────────────────
(function initParticles() {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles;
  const PARTICLE_COUNT = 60;

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * width;
      this.y    = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.alpha  = Math.random() * 0.6 + 0.1;
      // Gold/crimson/steel tones
      const colors = [
        `rgba(200,160,80,${this.alpha})`,
        `rgba(220,180,100,${this.alpha})`,
        `rgba(139,26,42,${this.alpha})`,
        `rgba(96,125,158,${this.alpha})`,
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
        this.x = this.x < 0 ? 0 : this.x > width ? width : this.x;
        this.y = this.y < 0 ? 0 : this.y > height ? height : this.y;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200,160,80,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
  animate();
})();

// ─── STAT BAR ANIMATION ──────────────────────────────
// Animate stat bars when they enter viewport
const statBarObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.stat-bar');
        bars.forEach(bar => {
          const targetWidth = bar.style.width;
          bar.style.width   = '0%';
          setTimeout(() => { bar.style.width = targetWidth; }, 100);
        });
        statBarObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.weapon-card').forEach(card => {
  statBarObserver.observe(card);
});

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')) || 72;
      window.scrollTo({
        top: target.offsetTop - offset - 20,
        behavior: 'smooth'
      });
    }
  });
});

// ─── GAME CARDS STAGGER ANIMATION ────────────────────
const cards = document.querySelectorAll('.game-card, .tip-card, .faction-card');
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.01, rootMargin: '0px 0px 60px 0px' }
);

cards.forEach((card, i) => {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
  cardObserver.observe(card);
});

// ─── ACTIVE NAV LINK (page-level) ───────────────────
(function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();

// ─── TOOLTIP (hover) for weapon cards ────────────────
document.querySelectorAll('.weapon-type-badge').forEach(badge => {
  const tips = {
    'Melee': 'Senjata jarak dekat — memerlukan pendekatan langsung ke musuh',
    'Two-Handed': 'Dua tangan — damage tinggi, tidak bisa pakai shield',
    'Polearm': 'Jangkauan panjang — unggul menahan kavaleri',
    'Ranged': 'Serangan jarak jauh — efektif sebelum kontak melee',
    'Throwing': 'Lempar sekali — terbatas ammo, efektif pembuka',
    'Firearm': 'Senjata api — damage tinggi, reload sangat lambat',
    'Explosive': 'Area damage — hancurkan kelompok musuh',
    'Shield': 'Perlindungan — blok serangan dan panah',
    'Sabre': 'Senjata cepat berkaki — ideal untuk kavaleri',
    'Hussar Lance': 'Lance panjang — charge damage sangat tinggi',
    'Mace': 'Blunt damage — pingsan musuh tanpa membunuh',
  };

  badge.title = tips[badge.textContent.trim()] || '';
});
