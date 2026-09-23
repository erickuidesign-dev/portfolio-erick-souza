/* Shared behavior for every page: custom cursor and scroll meter. Requires gsap + ScrollTrigger. */
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(window.ScrollTrigger);

  const doc = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const HOVER_TARGETS = 'a, button';

  if (finePointer && !reduced) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
      doc.classList.add('has-cursor');
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      const dotX = gsap.quickTo(dot, 'x', { duration: .08, ease: 'power3' });
      const dotY = gsap.quickTo(dot, 'y', { duration: .08, ease: 'power3' });
      const ringX = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
      const ringY = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
      window.addEventListener('pointermove', (event) => {
        dotX(event.clientX); dotY(event.clientY);
        ringX(event.clientX); ringY(event.clientY);
      }, { passive: true });
      document.addEventListener('pointerover', (event) => {
        ring.classList.toggle('is-hover', Boolean(event.target.closest(HOVER_TARGETS)));
      });
    }

  }

  const fill = document.querySelector('.meter-fill');
  const count = document.querySelector('.meter-count');
  if (fill && count) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        fill.style.transform = `scaleX(${self.progress})`;
        count.textContent = String(Math.round(self.progress * 100)).padStart(2, '0');
      },
    });
  }
})();
