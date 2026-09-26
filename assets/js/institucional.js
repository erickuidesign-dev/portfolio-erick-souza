/* Sites institucionais listing: the same horizontal scroll-jack index the homepage's Projetos
   scene uses, scoped down to just this page's cards — no hero to hand off from, no paper-split
   flash, the track is on screen and ready from the first frame of the pin.
   Runs only when <html> has .cine (desktop, motion allowed); mobile/reduced-motion gets the
   plain stacked layout from site.css with no scroll-jack. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const doc = document.documentElement;
  const cine = doc.classList.contains('cine');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Same sputter timing as the homepage's project cards: a quick light-up, since a card is
  // only lit for a moment as the needle passes.
  const PROJECT_SIGN = { firstMs: 40, gapMs: 60, jitterMs: 40, strikeMs: [420, 620], stubbornMs: [900, 1100], tiredStartS: [1.2, 2] };
  const HIGHLIGHT_LETTERS_PER_ODD_ONE = 8;

  const signRuns = new Map();
  const lightSignNow = (sign) => {
    const letters = $$('.motel-ch', sign);
    if (window.MotelSign) window.MotelSign.lightAll(letters);
    else letters.forEach((letter) => letter.classList.add('is-lit'));
  };
  const igniteSign = (sign, options = PROJECT_SIGN) => {
    if (signRuns.has(sign)) return;
    if (!window.MotelSign) { lightSignNow(sign); signRuns.set(sign, { stop: () => {} }); return; }
    signRuns.set(sign, window.MotelSign.play($$('.motel-ch', sign), options));
  };
  const extinguishSign = (sign) => {
    const run = signRuns.get(sign);
    if (!run) return;
    run.stop();
    signRuns.delete(sign);
  };
  // A heading holds only its highlight tubes, so the odd letters are counted from those (same
  // rule the homepage's Sobre/Contato highlight words use).
  const highlightOptions = (heading) => {
    const odd = Math.max(1, Math.round($$('.motel-ch', heading).length / HIGHLIGHT_LETTERS_PER_ODD_ONE));
    return { ...PROJECT_SIGN, stubbornCount: odd, tiredCount: odd };
  };
  const igniteHeading = (heading) => igniteSign(heading, highlightOptions(heading));
  const watchSign = (sign, light = igniteSign) => {
    if (reduced || !('IntersectionObserver' in window)) { lightSignNow(sign); return; }
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) light(sign);
      else extinguishSign(sign);
    }, { threshold: .35 }).observe(sign);
  };

  document.addEventListener('DOMContentLoaded', () => {
    $$('.neon-accent').forEach((heading) => watchSign(heading, igniteHeading));

    // Same background video as the homepage Hero, same device-switch — no bytes downloaded
    // under reduced motion or Save-Data, the poster alone stands in.
    const heroVideo = $('.case-hero-video-el');
    const saveData = navigator.connection && navigator.connection.saveData;
    if (heroVideo && !reduced && !saveData) {
      heroVideo.src = matchMedia('(max-width: 780px)').matches ? heroVideo.dataset.srcMobile : heroVideo.dataset.srcDesktop;
      heroVideo.play().catch(() => {});
    }

    const list = $('#lista');
    if (!list) return;
    const track = $('.index-track', list);
    const cards = $$('.sign-card', track || list);
    if (!cards.length) return;

    if (reduced || !('IntersectionObserver' in window)) { cards.forEach(lightSignNow); return; }
    if (!cine || !track) { cards.forEach(watchSign); return; }

    const needle = $('.index-needle', list);
    const trackDistance = () => Math.max(0, track.scrollWidth - innerWidth);
    const activateCenteredCard = () => {
      const center = innerWidth / 2;
      let best = null;
      let bestGap = Infinity;
      cards.forEach((card) => {
        const box = card.getBoundingClientRect();
        const gap = center < box.left ? box.left - center : center > box.right ? center - box.right : 0;
        const tie = Math.abs(box.left + box.width / 2 - center) / 1e6;
        if (gap + tie < bestGap) { bestGap = gap + tie; best = card; }
      });
      cards.forEach((card) => {
        const active = card === best;
        card.classList.toggle('is-active', active);
        if (active) igniteSign(card); else extinguishSign(card);
      });
    };
    if (needle) gsap.set(needle, { autoAlpha: 1 });
    gsap.timeline({
      onUpdate: activateCenteredCard,
      scrollTrigger: {
        id: 'lista', trigger: list, start: 'top top', end: () => `+=${trackDistance() + innerHeight * .6}`,
        pin: true, pinSpacing: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      },
    }).to(track, { x: () => -trackDistance(), ease: 'none', duration: 1 }, 0);
    ScrollTrigger.addEventListener('refreshInit', () => gsap.set(track, { x: 0 }));
    activateCenteredCard();
  });
})();
