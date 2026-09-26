/* ============================================================
   FACTOR ONE — SRAM RED POWER METER | LANDING PAGE JAVASCRIPT
   Animation Engine: GSAP + ScrollTrigger (Axisform Design System)
   ============================================================ */

/* ── 0. REGISTER GSAP PLUGINS ─────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/* ── LUCIDE ICONS — init as soon as DOM is ready ──────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
} else {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── 1. PRELOADER ─────────────────────────────────────────── */
(function initPreloader() {
  const loader    = document.getElementById('ax-loader');
  if (!loader) return;

  const brand     = loader.querySelector('.ax-loader__brand');
  const bar       = loader.querySelector('.ax-loader__bar');
  const meta      = loader.querySelector('.ax-loader__meta');
  const pctEl     = loader.querySelector('.ax-loader__pct');

  const tl = gsap.timeline({
    onComplete: () => {
      // Slide loader up and remove it
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.72,
        ease: EASE,
        onComplete: () => {
          loader.style.display = 'none';
          initPageAnimations(); // Start page animations after loader exits
        }
      });
    }
  });

  // 1a. Brand text fades in
  tl.to(brand, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.8,
    ease: EASE
  });

  // 1b. Meta label fades in
  tl.to(meta, { opacity: 1, duration: 0.3, ease: 'power1.out' }, '-=0.4');

  // 1c. Progress bar fills + counter ticks
  tl.to(bar, {
    scaleX: 1,
    duration: 1.1,
    ease: 'power2.inOut',
    onUpdate: function () {
      if (!pctEl) return;
      const val = Math.round(this.progress() * 100);
      pctEl.textContent = String(val).padStart(3, '0');
    }
  }, '-=0.2');

  // Small hold at 100%
  tl.to({}, { duration: 0.18 });
})();

/* ── 2. PAGE ANIMATIONS (fires after preloader exits) ─────── */
function initPageAnimations() {

  /* ── 2a. HERO ENTRANCE + PINNED SCROLL ───────────────── */
  const heroSection = document.querySelector('#hero');

  if (heroSection) {
    // Initial entrance animation (fires once after preloader)
    const heroEntranceTl = gsap.timeline({ defaults: { ease: EASE } });

    heroEntranceTl
      .from('.hero-copy', { opacity: 0, y: 44, duration: 1.0 })
      .from('.hero-card', {
        opacity: 0,
        y: 80,
        rotation: 'random(-8, 8)',
        stagger: 0.12,
        duration: 1.0
      }, '-=0.55')
      .from('.hero-meta', { opacity: 0, x: 30, duration: 0.8 }, '-=0.6')
      .from('.hero-wordmark', {
        opacity: 0,
        y: 60,
        duration: 1.1,
        ease: 'power2.out'
      }, '-=0.9');

    // ── PINNED HERO SCROLL (exact Axisform behavior) ──────
    // Pin the hero section for 1200px of scroll progress
    const heroScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: '+=1200',        // pins for 1200px of scroll
        scrub: 1.2,           // smooth scrub, matches original feel
        pin: true,            // pin the whole section
        pinSpacing: true,     // add spacing after pin
        anticipatePin: 1
      }
    });

    // Hero copy: fade out + translate up (fully gone by ~65% progress)
    heroScrollTl.to('.hero-copy', {
      opacity: 0,
      y: -80,
      ease: 'power2.in',
      duration: 0.65
    }, 0);

    // Hero CTA button fades early
    heroScrollTl.to('.hero-cta', {
      opacity: 0,
      scale: 0.8,
      ease: 'power2.in',
      duration: 0.4
    }, 0);

    // Hero meta: fade out and slide right
    heroScrollTl.to('.hero-meta', {
      opacity: 0,
      x: 40,
      ease: 'power2.in',
      duration: 0.5
    }, 0);

    // Cards FAN OUT — each flies in a different direction
    // Card 1 (orange gradient, behind-left): fly upper-left + rotate more
    heroScrollTl.to('.hero-card:nth-child(1)', {
      x: -220,
      y: -340,
      rotation: -32,
      scale: 0.82,
      opacity: 0,
      ease: 'power2.in',
      duration: 1
    }, 0.15);

    // Card 2 (cream, behind-right): fly upper-right + rotate more
    heroScrollTl.to('.hero-card:nth-child(2)', {
      x: 260,
      y: -280,
      rotation: 28,
      scale: 0.78,
      opacity: 0,
      ease: 'power2.in',
      duration: 1
    }, 0.2);

    // Card 3 (dark carbon, far behind-right): shoot right + up
    heroScrollTl.to('.hero-card:nth-child(3)', {
      x: 380,
      y: -200,
      rotation: 36,
      scale: 0.72,
      opacity: 0,
      ease: 'power2.in',
      duration: 1
    }, 0.1);

    // Card 4 (main top card): scale up slightly then shoot upward
    heroScrollTl.to('.hero-card:nth-child(4)', {
      y: -180,
      scale: 1.06,
      rotation: 8,
      opacity: 0,
      ease: 'power2.in',
      duration: 1
    }, 0.25);

    // Wordmark rises from bottom — fast parallax (hero of the scroll effect)
    // It moves up FASTER than the page, filling the viewport behind the cards
    heroScrollTl.to('.hero-wordmark', {
      y: '-55vh',        // rises from below into center
      scale: 1.18,       // grows slightly as it rises
      opacity: 0.18,     // becomes more visible
      ease: 'none',
      duration: 1
    }, 0);

  } else {
    // Fallback: simple entrance if hero section not found
    gsap.from('.hero-copy', { opacity: 0, y: 44, duration: 1.0, ease: EASE });
    gsap.from('.hero-card', { opacity: 0, y: 60, stagger: 0.1, duration: 1.0, ease: EASE, delay: 0.3 });
    gsap.from('.hero-meta', { opacity: 0, x: 30, duration: 0.8, ease: EASE, delay: 0.7 });
    gsap.from('.hero-wordmark', { opacity: 0, y: 60, duration: 1.1, ease: 'power2.out', delay: 0.4 });
  }

  /* ── 2b. HEADER FADE IN ────────────────────────────── */
  gsap.from('#header', {
    opacity: 0,
    y: -20,
    duration: 0.7,
    ease: EASE,
    delay: 0.2
  });

  /* ── 2c. SCROLL REVEAL — [data-reveal] ─────────────── */
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  /* ── 2d. SCROLL REVEAL — .reveal elements ──────────── */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  /* ── 2e. STAGGER GROUPS ────────────────────────────── */
  // Service cards
  gsap.utils.toArray('.service-card').forEach((group, i) => {
    gsap.fromTo(group,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0,
        duration: 0.75,
        ease: EASE,
        delay: (i % 3) * 0.1,
        scrollTrigger: {
          trigger: group,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Note cards (benefits, testimonial-like)
  gsap.utils.toArray('.note-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0,
        duration: 0.75,
        ease: EASE,
        delay: (i % 4) * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Feature items (solution section)
  const featureItems = gsap.utils.toArray('.feature-item');
  if (featureItems.length) {
    gsap.fromTo(featureItems,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: EASE,
        scrollTrigger: {
          trigger: featureItems[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // FAQ items
  gsap.utils.toArray('.faq-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.55,
        ease: EASE,
        delay: i * 0.06,
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Diff table rows
  gsap.utils.toArray('.diff-table tbody tr').forEach((row, i) => {
    gsap.fromTo(row,
      { opacity: 0, x: -16 },
      {
        opacity: 1, x: 0,
        duration: 0.6,
        ease: EASE,
        delay: i * 0.07,
        scrollTrigger: {
          trigger: row,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  /* ── 2f. HERO CARDS — removed (controlled by ScrollTrigger pin) ─ */

  /* ── 2g. SECTION HEADINGS — reveal on scroll ────────── */
  gsap.utils.toArray('h2, h1.hero-wordmark').forEach(el => {
    // Skip hero-wordmark (already handled above)
    if (el.classList.contains('hero-wordmark')) return;
    // Skip elements already covered by data-reveal
    if (el.closest('[data-reveal]')) return;

    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  /* ── 2h. GALLERY PANEL entrance when tabs switch ─────── */
  // (handled in tab click — see section 5)

  /* ── 2i. FOOTER WORDMARK — scale up on scroll ────────── */
  const footerWordmark = document.querySelector('.footer-wordmark');
  if (footerWordmark) {
    gsap.fromTo(footerWordmark,
      { opacity: 0, scale: 0.88, y: 40 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 1.1,
        ease: EASE,
        scrollTrigger: {
          trigger: footerWordmark,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      }
    );
  }
}

/* ── 3. DOMContentLoaded — non-animation init ─────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // ── 3a. STICKY HEADER ─────────────────────────────────────
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  });

  // ── 3b. MOBILE MENU ───────────────────────────────────────
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu   = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  window.closeMobileMenu = () => {
    if (mobileMenu && hamburgerBtn) {
      mobileMenu.classList.remove('open');
      hamburgerBtn.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', false);
    }
  };

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => window.closeMobileMenu());
  });

  // ── 3c. COLOR SELECTOR (HERO) ─────────────────────────────
  const colorOptions = document.querySelectorAll('.color-option');
  const heroBikeImg  = document.getElementById('heroBikeImg');

  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(opt => {
        opt.classList.remove('active');
        opt.setAttribute('aria-pressed', 'false');
      });
      option.classList.add('active');
      option.setAttribute('aria-pressed', 'true');

      const newImgSrc = option.getAttribute('data-img');
      const newAlt    = option.getAttribute('data-alt');

      if (heroBikeImg && newImgSrc) {
        gsap.to(heroBikeImg, {
          opacity: 0, duration: 0.22, ease: 'power2.in',
          onComplete: () => {
            heroBikeImg.src = newImgSrc;
            heroBikeImg.alt = newAlt || 'Factor ONE SRAM RED';
            gsap.to(heroBikeImg, { opacity: 1, duration: 0.38, ease: 'power2.out' });
          }
        });
      }
    });
  });

  // ── 3d. GALLERY TAB SWITCHER ──────────────────────────────
  const galleryTabs   = document.querySelectorAll('.gallery-tab');
  const galleryPanels = document.querySelectorAll('.gallery-panel');

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = tab.getAttribute('data-panel');

      galleryTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      galleryPanels.forEach(panel => panel.classList.remove('active'));
      const activePanel = document.getElementById(`panel-${panelId}`);
      if (activePanel) {
        activePanel.classList.add('active');
        // Animate the new panel in
        gsap.fromTo(activePanel,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: EASE }
        );
      }
    });
  });

  // ── 3e. GALLERY THUMBNAIL SWITCHER ────────────────────────
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const panelId    = thumb.getAttribute('data-panel');
      const newMainSrc = thumb.getAttribute('data-main');

      document.querySelectorAll(`.gallery-thumb[data-panel="${panelId}"]`)
        .forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      const mainImg = document.getElementById(
        `galleryMain${panelId.charAt(0).toUpperCase() + panelId.slice(1)}`
      );
      if (mainImg && newMainSrc) {
        gsap.to(mainImg, {
          opacity: 0, scale: 0.97, duration: 0.2, ease: 'power2.in',
          onComplete: () => {
            mainImg.src = newMainSrc;
            gsap.to(mainImg, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
          }
        });
      }
    });
  });

  // ── 3f. FAQ ACCORDION ─────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item       = question.parentElement;
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      question.setAttribute('aria-expanded', !isExpanded);
      item.classList.toggle('open');
    });
  });

  // ── 3g. TESTIMONIALS CAROUSEL ─────────────────────────────
  const track   = document.getElementById('testimonialsTrack');
  const cards   = document.querySelectorAll('.testimonial-card');
  const dots    = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentIndex = 0;
  let autoRotateInterval;

  function updateCarousel(index) {
    if (!track || cards.length === 0) return;

    let maxIndex = window.innerWidth <= 768 ? cards.length - 1 : cards.length - 2;
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    currentIndex = index;

    const cardWidth = window.innerWidth <= 768 ? 100 : 50;
    const gap       = window.innerWidth <= 768 ? 0 : 24;
    const offset    = currentIndex * (cardWidth + (gap / track.offsetWidth) * 100);

    gsap.to(track, {
      x: `-${offset}%`,
      duration: 0.62,
      ease: EASE
    });

    dots.forEach((dot, idx) => {
      const active = idx === currentIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active);
    });
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      resetAutoRotate();
      const maxIndex = window.innerWidth <= 768 ? cards.length - 1 : cards.length - 2;
      updateCarousel(currentIndex <= 0 ? maxIndex : currentIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
      resetAutoRotate();
      const maxIndex = window.innerWidth <= 768 ? cards.length - 1 : cards.length - 2;
      updateCarousel(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      resetAutoRotate();
      updateCarousel(parseInt(dot.getAttribute('data-index'), 10));
    });
  });

  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      const maxIndex = window.innerWidth <= 768 ? cards.length - 1 : cards.length - 2;
      updateCarousel(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 5000);
  }

  function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    startAutoRotate();
  }

  window.addEventListener('resize', () => updateCarousel(currentIndex));
  updateCarousel(0);
  startAutoRotate();

  const testimonialsWrapper = document.querySelector('.testimonials-wrapper');
  if (testimonialsWrapper) {
    testimonialsWrapper.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
    testimonialsWrapper.addEventListener('mouseleave', startAutoRotate);
  }

  // ── 3h. STICKY MOBILE CTA ─────────────────────────────────
  const stickyCTAMobile = document.getElementById('stickyCTAMobile');
  if (stickyCTAMobile) {
    window.addEventListener('scroll', () => {
      if (window.innerWidth <= 768 && window.scrollY > 450) {
        gsap.to(stickyCTAMobile, { y: 0, opacity: 1, duration: 0.45, ease: EASE });
      } else {
        gsap.to(stickyCTAMobile, { y: '100%', opacity: 0, duration: 0.35, ease: EASE });
      }
    });
  }

  // ── 3i. MAGNETIC BUTTON HOVER EFFECT ──────────────────────
  document.querySelectorAll('.magnetic-button').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      gsap.to(btn, {
        x: dx * 0.18,
        y: dy * 0.18,
        duration: 0.35,
        ease: 'power2.out'
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: EASE });
    });
  });

});
