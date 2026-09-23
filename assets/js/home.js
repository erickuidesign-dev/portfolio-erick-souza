/* Home scenes. Ignition adapted from the Afterglow design system.
   Pinned scenes run only when <html> has .cine (desktop, motion allowed).
   Everything else (mobile, reduced motion) is the static stacked layout. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, window.SplitText);

  const EASE = 'expo.out';
  const doc = document.documentElement;
  const cine = doc.classList.contains('cine');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Scene change. Timings are deliberately unhurried: the hero holds still for 1.6 screens of
  // scroll as it fades out; then, inside the projects pin itself, the first 1.7 "units" are spent
  // on the "PROJETOS" chapter flash (word rises, fades, the paper splits open) before the
  // horizontal track takes over for 3 units — the cards sit there the whole time, already lit,
  // just uncovered as the paper clears.
  const heroHold = () => innerHeight * 1.6;
  const PROJECTS_OPEN_UNITS = 1.7;
  const PROJECTS_TRACK_UNITS = 3;
  // Dead scroll after the last card settles, so the blinds (home.js, Serviços transition) get a
  // beat where nothing is still sliding before they start closing over the scene.
  const PROJECTS_CLOSE_UNITS = 1;
  const PROJECTS_UNITS_TOTAL = PROJECTS_OPEN_UNITS + PROJECTS_TRACK_UNITS + PROJECTS_CLOSE_UNITS;
  const PROJECTS_OPEN_SHARE = PROJECTS_OPEN_UNITS / PROJECTS_UNITS_TOTAL;
  // Pre-loader hand-off: the hero ignites this long after the loader's progress closes, behind the curtain.
  const LOADER_DONE_IGNITE_DELAY = .1;
  const LOADER_FAILSAFE_S = 6.4;
  // The red sign starts sputtering this long after the ignition begins, as its line fades in.
  const HERO_SIGN_DELAY_S = .85;
  const HERO_SIGN_GAP_MS = 80;
  // Project signs: a quicker version of the same sputter, since a card is only lit for a moment as the needle passes.
  const PROJECT_SIGN = { firstMs: 40, gapMs: 60, jitterMs: 40, strikeMs: [420, 620], stubbornMs: [900, 1100], tiredStartS: [1.2, 2] };
  // Highlight words (Sobre's last line, Contato's "marca" and "?"): a handful of letters, so only one stubborn and one tired.
  const HIGHLIGHT_LETTERS_PER_ODD_ONE = 8;

  document.addEventListener('DOMContentLoaded', async () => {
    /* ---------------- 01 Hero: power-on ignition ---------------- */
    const power = $('#power');
    const scrollCall = $('[data-scroll-copy]', power);
    const faultWord = $('.fault-word', power);
    const labels = power.dataset;
    const faultLetters = faultWord ? $$('.motel-ch', faultWord) : [];
    let faultColorScroll;

    const connectFaultColorToScroll = () => {
      if (faultColorScroll || !faultWord || !cine) return;
      faultColorScroll = gsap.timeline({ scrollTrigger: { trigger: power, start: 'top top', end: () => `+=${heroHold()}`, scrub: .7 } })
        .fromTo(faultWord,
          { '--fault-core': '#ff2800', '--fault-mid': '#c21a00', '--fault-far': 'rgba(255,40,0,.46)' },
          { '--fault-core': '#78ef74', '--fault-mid': '#25b982', '--fault-far': 'rgba(70,224,132,.4)', duration: 1, ease: 'none', immediateRender: true }, 0);
    };

    const markPowered = () => {
      power.classList.add('is-powered');
      power.classList.remove('is-awaiting-power');
      if (scrollCall) scrollCall.textContent = labels.callOn;
    };

    // The red sign: its letters catch one by one like a tired motel sign (motel-sign.js).
    const lightSign = () => {
      if (window.MotelSign) window.MotelSign.play(faultLetters, { gapMs: HERO_SIGN_GAP_MS });
      else faultLetters.forEach((letter) => letter.classList.add('is-lit'));
    };

    let ignited = false;
    const energize = () => {
      if (ignited) return;
      ignited = true;
      if (reduced) {
        faultLetters.forEach((letter) => letter.classList.add('is-lit'));
        markPowered();
        return;
      }

      power.classList.add('is-powered');

      gsap.timeline({
        onComplete: () => {
          power.classList.remove('is-awaiting-power');
          if (scrollCall) scrollCall.textContent = labels.callOn;
          connectFaultColorToScroll();
          ScrollTrigger.refresh();
        },
      })
        .to('.power-grid', { opacity: .08, duration: .06, ease: 'none' })
        .to('.power-grid', { opacity: .02, duration: .04, ease: 'none' })
        .to('.power-grid', { opacity: .34, scale: 1, duration: .11, ease: 'none' })
        .to('.power-grid', { opacity: .12, duration: .055, ease: 'none' })
        .to('.power-grid', { opacity: .24, duration: 1.15, ease: EASE })
        .to('.power-video', { opacity: 1, duration: 2, ease: EASE }, .2)
        .to(['#power .section-label', '#power .power-readouts', '#power .power-sub', '#power .power-actions'], { opacity: 1, duration: .9, stagger: .08, ease: EASE }, .38)
        .to(['.power-line-a', '.power-line-b', '.power-line-c', '.power-line-d'], { autoAlpha: 1, y: 0, duration: 1.05, stagger: .12, ease: EASE }, .3)
        .call(lightSign, null, HERO_SIGN_DELAY_S);
    };

    // While the pre-loader covers the page the hero waits for its cue and ignites behind the curtain.
    const loaderCovering = doc.classList.contains('is-loading') && !window.preloaderDone;
    const startHeroSequence = (igniteDelay) => {
      gsap.delayedCall(igniteDelay, energize);
    };

    if (reduced) {
      energize();
    } else if (loaderCovering) {
      document.addEventListener('preloader:done', () => startHeroSequence(LOADER_DONE_IGNITE_DELAY), { once: true });
      // Failsafe: if the cue never comes, the hero still lights itself (energize runs only once).
      gsap.delayedCall(LOADER_FAILSAFE_S, energize);
    } else {
      // Content never waits for input: the hero lights itself a moment after load.
      startHeroSequence(cine ? .7 : .5);
    }

    /* ---------------- Motel signs: project names and the highlight words of Sobre / Contato ---------------- */
    // Each sign is a row of tubes (.motel-ch). It lights, letter by letter, when it comes into play (the active card
    // on desktop, the section arriving, or scrolling into view) and goes dark when it leaves.
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
    // A heading holds only its highlight tubes, so the odd letters are counted from those.
    const highlightOptions = (heading) => {
      const odd = Math.max(1, Math.round($$('.motel-ch', heading).length / HIGHLIGHT_LETTERS_PER_ODD_ONE));
      return { ...PROJECT_SIGN, stubbornCount: odd, tiredCount: odd };
    };
    const igniteHeading = (heading) => igniteSign(heading, highlightOptions(heading));
    // Lights `sign` while it is on screen (mobile / plain layout), replaying each time it comes back.
    const watchSign = (sign, light, threshold) => {
      if (reduced || !('IntersectionObserver' in window)) { lightSignNow(sign); return; }
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) light(sign);
        else extinguishSign(sign);
      }, { threshold }).observe(sign);
    };

    const signCards = $$('.sign-card');
    const contactHeading = $('.inquire h2');
    const aboutHeading = $('#sobre h2');
    if (contactHeading) watchSign(contactHeading, igniteHeading, .4);
    if (aboutHeading && !cine) watchSign(aboutHeading, igniteHeading, .5);
    if (reduced) {
      signCards.forEach(lightSignNow);
    } else if (!cine) {
      signCards.forEach((card) => watchSign(card, igniteSign, .35));
    }

    /* ---------------- Nav: smooth jump + active section ---------------- */
    const navLinks = $$('[data-nav-link]');
    const sectionIds = navLinks.map((link) => link.hash.slice(1));
    const jumpTo = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const trigger = ScrollTrigger.getById(id);
      let top = trigger ? trigger.start : el.getBoundingClientRect().top + window.scrollY;
      // The projects scene starts behind the chapter-flash paper; land just after it splits open.
      if (id === 'projetos' && trigger) top += (trigger.end - trigger.start) * PROJECTS_OPEN_SHARE + 2;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    };
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const id = link.hash.slice(1);
        if (!id || !document.getElementById(id)) return;
        event.preventDefault();
        jumpTo(id);
      });
    });

    let ranges = [];
    const computeRanges = () => {
      ranges = sectionIds.map((id) => {
        const el = document.getElementById(id);
        const trigger = ScrollTrigger.getById(id);
        if (trigger) return { id, start: trigger.start, end: trigger.end };
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { id, start: top, end: top + el.offsetHeight };
      });
    };
    const paintNav = () => {
      const y = window.scrollY + innerHeight * .4;
      const current = ranges.find((range) => y >= range.start && y < range.end);
      navLinks.forEach((link) => link.classList.toggle('is-active', Boolean(current) && link.hash === `#${current.id}`));
    };
    ScrollTrigger.addEventListener('refresh', () => { computeRanges(); paintNav(); });
    window.addEventListener('scroll', paintNav, { passive: true });

    if (!cine) { computeRanges(); paintNav(); return; }

    // Pinned scenes and SplitText measure text, so they wait for the fonts. The hero above never does.
    await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1400))]);
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    /* ---------------- Cinematic scenes (desktop) ---------------- */
    gsap.timeline({
      scrollTrigger: {
        id: 'hero', trigger: '#power', start: 'top top', end: () => `+=${heroHold()}`,
        pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    })
      .to('.power-grid', { opacity: .5, scale: 1.08, ease: 'none' }, 0)
      .to('.power-copy', { yPercent: -12, autoAlpha: .15, ease: 'none' }, .35)
      // fromTo, not to: this scrubbed tween renders once immediately on setup, before the
      // separate ignition timeline has faded the video in, so a plain `to` bakes in that stale
      // pre-ignition opacity as its start value — scrolling back up to the hero would then
      // snap the video back to it instead of showing it fully lit.
      .fromTo('.power-video', { scale: 1, autoAlpha: 1 }, { scale: 1.06, autoAlpha: .3, ease: 'none' }, .35);

    /* 02 Projects: "PROJETOS" flashes up on daylight paper over the pinned scene, then the paper
       splits open down the middle baring the cards — already lit, just uncovered — before the
       horizontal index takes over and the needle activates the centered card. */
    const projects = $('#projetos');
    const chapterWord = $('.chapter-word', projects);
    const chapterLeafA = $('.chapter-leaf-a', projects);
    const chapterLeafB = $('.chapter-leaf-b', projects);
    const needle = $('.index-needle', projects);
    const track = $('.index-track', projects);
    const cards = $$('.sign-card', track);
    const trackDistance = () => Math.max(0, track.scrollWidth - innerWidth);
    const activateCenteredCard = () => {
      const center = innerWidth / 2;
      let best = null;
      let bestGap = Infinity;
      cards.forEach((card) => {
        const box = card.getBoundingClientRect();
        // Distance from the needle to the card's nearest edge (0 when the needle is over the card).
        const gap = center < box.left ? box.left - center : center > box.right ? center - box.right : 0;
        const tie = Math.abs(box.left + box.width / 2 - center) / 1e6;
        if (gap + tie < bestGap) { bestGap = gap + tie; best = card; }
      });
      const pin = ScrollTrigger.getById('projetos');
      // Cards only light once the paper has finished splitting open.
      const live = Boolean(pin) && pin.isActive && pin.progress >= PROJECTS_OPEN_SHARE;
      cards.forEach((card) => {
        const active = card === best;
        card.classList.toggle('is-active', active);
        if (active && live) igniteSign(card);
        else extinguishSign(card);
      });
    };
    gsap.set(chapterWord, { autoAlpha: 0, scale: .82, filter: 'blur(10px)' });
    gsap.set(track, { autoAlpha: 0 });
    if (needle) gsap.set(needle, { autoAlpha: 0 });
    // The track eases toward the scroll position (scrub), so the active card is read on every
    // animation frame of the timeline, not only when the scroll position changes.
    gsap.timeline({
      onUpdate: activateCenteredCard,
      scrollTrigger: {
        id: 'projetos', trigger: projects, start: 'top top',
        end: () => `+=${(trackDistance() + innerHeight * 1.2) * PROJECTS_UNITS_TOTAL / PROJECTS_TRACK_UNITS}`,
        pin: true, pinSpacing: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      },
    })
      .to(chapterWord, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .7, ease: 'none' }, 0)
      .to(chapterWord, { autoAlpha: 0, scale: 1.05, filter: 'blur(4px)', duration: .35, ease: 'none' }, .75)
      .to(chapterLeafA, { xPercent: -100, duration: .6, ease: 'none' }, 1.1)
      .to(chapterLeafB, { xPercent: 100, duration: .6, ease: 'none' }, 1.1)
      // The cards fade in as their own reveal, not just uncovered already-solid behind the paper.
      .to(track, { autoAlpha: 1, duration: .6, ease: 'none' }, 1.1)
      // The needle only shows once the scene it points at is actually there.
      .to(needle || [], { autoAlpha: 1, duration: .3, ease: 'none' }, 1.4)
      .to(track, { x: () => -trackDistance(), ease: 'none', duration: PROJECTS_TRACK_UNITS }, PROJECTS_OPEN_UNITS)
      // Dead time once the last card is settled — nothing here but PROJECTS_CLOSE_UNITS of scroll,
      // so the blinds (home.js) have room to close without catching the track still sliding.
      .to(track, { duration: PROJECTS_CLOSE_UNITS }, PROJECTS_OPEN_UNITS + PROJECTS_TRACK_UNITS);
    ScrollTrigger.addEventListener('refreshInit', () => gsap.set(track, { x: 0 }));
    activateCenteredCard();

    /* 03 Services: the eight parts arrive scattered, like an exploded diagram, and assemble
       into the grid piece by piece as the section stays pinned to the scroll. */
    const services = $('#servicos');
    const serviceTitle = $$('.line-mask > span', services);
    const serviceParts = $$('.part', services);
    // Each part's starting offset before it settles into its grid slot (x/y in px, rotate in deg).
    const PART_ORIGINS = [
      { x: -140, y: -70, rotate: -9 }, { x: 120, y: -100, rotate: 7 },
      { x: -100, y: 90, rotate: 6 }, { x: 130, y: 60, rotate: -8 },
      { x: -80, y: -110, rotate: 9 }, { x: 100, y: 110, rotate: -7 },
      { x: -120, y: 50, rotate: 5 }, { x: 110, y: -50, rotate: -6 },
    ];
    // Rest tilt once settled — matches the CSS nth-child(8n+…) values, so the post-it stays
    // slightly crooked instead of snapping dead level.
    const PART_REST_ROTATE = [-1.6, 1.1, -.9, 1.7, 1, -1.3, 1.5, -1];
    gsap.set(serviceTitle, { yPercent: 112, autoAlpha: 0 });
    // Each card gets its own slot in the timeline — paper slides in first, then its own words
    // type themselves out, one card fully done before the next one starts.
    const PART_START = .3;
    const PART_SLOT = .85;
    const partChars = serviceParts.map((part) => {
      const origin = PART_ORIGINS[serviceParts.indexOf(part) % PART_ORIGINS.length];
      gsap.set(part, { x: origin.x, y: origin.y, rotate: origin.rotate, autoAlpha: 0, filter: 'blur(6px)' });
      const strong = $('strong', part);
      const small = $('small', part);
      if (!window.SplitText || !strong || !small) return null;
      const titleSplit = new SplitText(strong, { type: 'chars', charsClass: 'type-ch' });
      const bodySplit = new SplitText(small, { type: 'chars', charsClass: 'type-ch' });
      gsap.set([...titleSplit.chars, ...bodySplit.chars], { autoAlpha: 0 });
      return { titleChars: titleSplit.chars, bodyChars: bodySplit.chars };
    });
    const servicesTl = gsap.timeline({
      scrollTrigger: {
        id: 'servicos', trigger: services, start: 'top top', end: () => `+=${innerHeight * 8.5}`,
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    servicesTl.to(serviceTitle, { yPercent: 0, autoAlpha: 1, duration: .4, stagger: .12, ease: EASE }, 0);
    serviceParts.forEach((part, i) => {
      const rest = PART_REST_ROTATE[i % PART_REST_ROTATE.length];
      const slotStart = PART_START + i * PART_SLOT;
      servicesTl.to(part, { x: 0, y: 0, rotate: rest, autoAlpha: 1, filter: 'blur(0px)', duration: .25, ease: 'none' }, slotStart);
      const chars = partChars[i];
      if (chars) {
        servicesTl
          .to(chars.titleChars, { autoAlpha: 1, duration: .01, stagger: .02, ease: 'none' }, slotStart + .27)
          .to(chars.bodyChars, { autoAlpha: 1, duration: .01, stagger: .0055, ease: 'none' }, slotStart + .5);
      }
    });

    /* Blinds: a venetian curtain closes over the tail of the Projetos pin and opens again over
       the head of the Serviços one, like the reference site's own scene change. One function
       derives the slats from scroll position, so scrolling back and forth always lands right. */
    const slats = $$('.scene-blinds i');
    const blindsTitle = $('.blinds-title');
    if (blindsTitle) gsap.set(blindsTitle, { autoAlpha: 0 });
    if (slats.length) {
      const blindEase = gsap.parseEase('power2.inOut');
      const SLAT_DURATION = .4;
      const SLAT_STAGGER = .045;
      const BLINDS_SETTLE_MS = 260;
      const CLOSE_SPAN = innerHeight * .7;
      const OPEN_SPAN = innerHeight * .7;
      const slatSpan = SLAT_DURATION + (slats.length - 1) * SLAT_STAGGER;
      // reverse: true runs the cascade from the last slat back to the first, for the open half.
      const slatProgress = (progress, index, reverse) => {
        const i = reverse ? slats.length - 1 - index : index;
        return blindEase(gsap.utils.clamp(0, 1, (progress * slatSpan - i * SLAT_STAGGER) / SLAT_DURATION));
      };
      // Where scroll says the blinds should be: 0 = open (before), 0..1 = closing over the end
      // of Projetos, 1 = shut, 1..2 = opening as Serviços begins, 2 = open (after).
      const blindTarget = () => {
        const out = ScrollTrigger.getById('projetos');
        const into = ScrollTrigger.getById('servicos');
        if (!out || !into) return 0;
        const y = window.scrollY;
        const closeStart = out.end - CLOSE_SPAN;
        const openEnd = into.start + OPEN_SPAN;
        if (y <= closeStart) return 0;
        if (y < out.end) return (y - closeStart) / CLOSE_SPAN;
        if (y < into.start) return 1;
        if (y < openEnd) return 1 + (y - into.start) / OPEN_SPAN;
        return 2;
      };
      const paintBlinds = (level) => {
        slats.forEach((slat, i) => {
          const scale = level <= 1 ? slatProgress(level, i, false) : 1 - slatProgress(level - 1, i, true);
          gsap.set(slat, { scaleY: scale });
        });
        // The headline rides the same curtain: it surfaces as the slats shut, and clears with them.
        // Held back until the slats are almost fully shut, not a 1:1 fade with them — the title
        // reads as arriving after the curtain closes, not racing it down.
        if (blindsTitle) {
          const titleAlpha = level <= 1
            ? gsap.utils.clamp(0, 1, (level - .9) / .1)
            : gsap.utils.clamp(0, 1, (1.1 - level) / .1);
          gsap.set(blindsTitle, { autoAlpha: titleAlpha });
        }
      };
      let blindLevel = null;
      gsap.ticker.add((time, deltaMs) => {
        const target = blindTarget();
        if (blindLevel === null) blindLevel = target;
        blindLevel += (target - blindLevel) * (1 - Math.exp(-deltaMs / BLINDS_SETTLE_MS));
        if (Math.abs(target - blindLevel) < .0005) blindLevel = target;
        paintBlinds(blindLevel);
      });
      ScrollTrigger.addEventListener('refresh', () => { blindLevel = blindTarget(); paintBlinds(blindLevel); });
    }

    /* Serviços -> Processo: a fixed black curtain fades in over whatever is on screen (Serviços,
       still pinned), shows "PROCESSO", clears the word, then fades itself out to bare Processo.
       Scroll-derived like the blinds above (0 = clear, 1 = fully black + held, 2 = clear again),
       not tied into either pin's own timeline, so it never races their content. */
    const processFlash = $('#process-flash');
    if (processFlash) {
      const processWord = $('.chapter-word', processFlash);
      const PROCESS_FADE_SPAN = innerHeight * .6;
      gsap.set(processFlash, { autoAlpha: 0 });
      gsap.set(processWord, { autoAlpha: 0, scale: 1 });
      const processTarget = () => {
        const out = ScrollTrigger.getById('servicos');
        const into = ScrollTrigger.getById('processo');
        if (!out || !into) return 0;
        const y = window.scrollY;
        const fadeInStart = out.end - PROCESS_FADE_SPAN;
        const fadeOutEnd = into.start + PROCESS_FADE_SPAN;
        if (y <= fadeInStart) return 0;
        if (y < out.end) return (y - fadeInStart) / PROCESS_FADE_SPAN;
        if (y < into.start) return 1;
        if (y < fadeOutEnd) return 1 + (y - into.start) / PROCESS_FADE_SPAN;
        return 2;
      };
      gsap.ticker.add(() => {
        const level = processTarget();
        gsap.set(processFlash, { autoAlpha: level <= 1 ? level : 2 - level });
        // The word waits for the screen to read as fully black first, then fades in on its own —
        // not racing the curtain. On the way out it zooms in as it fades, instead of just vanishing.
        let wordAlpha = 0;
        let wordScale = 1;
        if (level <= 1) {
          wordAlpha = gsap.utils.clamp(0, 1, (level - .85) / .15);
        } else {
          // Spread across the whole fade-out span (not just the first slice of it) so the zoom
          // has real scroll distance to play out slowly, growing large before it's gone.
          const outProgress = gsap.utils.clamp(0, 1, level - 1);
          wordScale = 1 + outProgress * 1.6;
          wordAlpha = outProgress < .7 ? 1 : 1 - (outProgress - .7) / .3;
        }
        gsap.set(processWord, { autoAlpha: wordAlpha, scale: wordScale });
      });
    }

    /* 04 Process: ten readings, one per step, with a rail and a status bar */
    const process = $('#processo');
    const readings = $$('.reading', process);
    const steps = readings.length;
    const stepNow = $('[data-step-now]', process);
    gsap.set(readings, { autoAlpha: 0, y: 60, filter: 'blur(12px)' });
    const processTl = gsap.timeline({
      scrollTrigger: {
        id: 'processo', trigger: process, start: 'top top', end: () => `+=${innerHeight * (steps * .7 + 1)}`,
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { if (stepNow) stepNow.textContent = String(Math.min(steps, Math.floor(self.progress * steps) + 1)).padStart(2, '0'); },
      },
    });
    readings.forEach((reading, i) => {
      processTl.to(reading, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .35, ease: 'none' }, i);
      if (i < steps - 1) processTl.to(reading, { autoAlpha: 0, y: -60, filter: 'blur(12px)', duration: .3, ease: 'none' }, i + .7);
    });
    processTl
      .to('.ledger-rail-fill', { scaleY: 1, duration: steps, ease: 'none' }, 0)
      .to('.ledger-status b', { scaleX: 1, duration: steps, ease: 'none' }, 0);

    /* 05 About: title lines, bio lines and the two frames arrive in sequence */
    const about = $('#sobre');
    const aboutTitle = $$('.line-mask > span', about);
    const bioSplit = new SplitText('#sobre .bender-bio', { type: 'lines', linesClass: 'bender-bio-line', aria: 'none' });
    gsap.set(aboutTitle, { yPercent: 112, autoAlpha: 0 });
    gsap.set(bioSplit.lines, { yPercent: 105, autoAlpha: 0, filter: 'blur(4px)' });
    gsap.set('#sobre .bender-meta', { y: 16, autoAlpha: 0 });
    gsap.set('#sobre .portrait', { scale: .82, filter: 'blur(14px)', autoAlpha: 0 });
    gsap.set('#sobre .flame-study', { xPercent: -38, y: -10, rotate: -9, filter: 'blur(9px)', autoAlpha: 0 });
    gsap.timeline({
      scrollTrigger: {
        id: 'sobre', trigger: about, start: 'top top', end: () => `+=${innerHeight * 3}`,
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: () => igniteHeading(aboutHeading), onEnterBack: () => igniteHeading(aboutHeading),
        onLeave: () => extinguishSign(aboutHeading), onLeaveBack: () => extinguishSign(aboutHeading),
      },
    })
      .to(aboutTitle, { yPercent: 0, autoAlpha: 1, duration: .28, stagger: .3, ease: EASE }, 0)
      .to('#sobre .portrait', { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: .5, ease: 'none' }, .9)
      .to('#sobre .flame-study', { xPercent: 0, y: 0, rotate: -3, filter: 'blur(0px)', autoAlpha: 1, duration: .5, ease: 'none' }, 1.1)
      .to(bioSplit.lines, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: .3, stagger: .08, ease: 'none' }, 1.0)
      .to('#sobre .bender-meta', { y: 0, autoAlpha: 1, duration: .3, ease: 'none' }, 2.3);

    ScrollTrigger.refresh();
    computeRanges();
    paintNav();
  });
})();
