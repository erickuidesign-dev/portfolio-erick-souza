/* Pre-loader: the name lights up like a tired motel sign while the page finishes loading.
   The letter-by-letter ignition lives in motel-sign.js (shared with the hero's red sign); this file runs the
   progress counter, waits for the sign to settle and the page to load, then holds at "ready" for
   a hand on the MAIN switch — there is no timer that lets a visitor in on its own.
   Runs only when the boot script in <head> marked <html> as .is-loading (home, fresh visit).
   When the switch is thrown it fires "preloader:done", the hero's cue to ignite behind the curtain. */
(() => {
  const doc = document.documentElement;
  const loader = document.getElementById('preloader');
  if (!loader) return;
  if (!doc.classList.contains('is-loading')) { loader.remove(); return; }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN_MS = reduced ? 700 : 2000;   // shortest time on screen, counted from the start of the page
  const FONT_WAIT_MS = 900;              // longest wait for the display font before showing the name
  const WAITING_CEILING = .92;           // progress stops here until the page has loaded and the sign has settled
  const FLARE_MS = 200;
  const LEAVE_MS = 1100;                 // curtain lift, then the loader is removed

  const letters = [...loader.querySelectorAll('.motel-ch')];
  const counter = loader.querySelector('.pre-count');
  const switchBtn = loader.querySelector('#pre-switch');
  const FLIP_MS = 260; // time to see the knob travel before the curtain lifts
  const easeOut = (x) => 1 - (1 - x) * (1 - x);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let pageReady = false;
  let finished = false;
  let sequenceEnd = Infinity;            // when the last letter has finished sputtering
  let shownPercent = -1;

  const paint = (progress) => {
    const percent = Math.round(progress * 100);
    loader.style.setProperty('--p', progress.toFixed(3));
    if (percent !== shownPercent) {
      shownPercent = percent;
      counter.textContent = String(percent).padStart(3, '0');
    }
  };

  const lightAll = () => {
    if (window.MotelSign) window.MotelSign.lightAll(letters);
    else letters.forEach((letter) => letter.classList.add('is-lit'));
  };

  const remove = () => {
    loader.remove();
    doc.classList.remove('is-loading');
  };

  const leave = () => {
    loader.classList.add('is-leaving');
    setTimeout(remove, reduced ? 0 : LEAVE_MS);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    lightAll();
    paint(1);
    loader.classList.add('is-ready', 'is-flare');
    window.preloaderDone = true;
    document.dispatchEvent(new Event('preloader:done'));
    setTimeout(leave, reduced ? 0 : FLARE_MS);
  };

  const tick = (now) => {
    if (finished) return;
    const timed = easeOut(Math.min(1, now / MIN_MS));
    const settled = pageReady && now >= sequenceEnd;
    const progress = settled ? timed : Math.min(timed, WAITING_CEILING);
    paint(progress);
    // Reaching 100% does not finish on its own: it just means the switch is ready for a hand on
    // it. Only the click below finishes the pre-loader — no timer lets a visitor in.
    if (progress < 1) requestAnimationFrame(tick);
  };

  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      if (finished) return;
      switchBtn.classList.add('is-live');
      switchBtn.setAttribute('aria-pressed', 'true');
      switchBtn.setAttribute('aria-label', 'Site ligado');
      switchBtn.querySelector('b').textContent = 'LIGADO';
      setTimeout(finish, reduced ? 0 : FLIP_MS);
    });
  }

  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([loaded, fontsReady]).then(() => { pageReady = true; });

  // Show the name only once its font is in, so it does not jump from a fallback face to Anybody.
  const nameFont = document.fonts && document.fonts.load
    ? document.fonts.load('700 1em Anybody', loader.dataset.name).catch(() => {})
    : Promise.resolve();
  Promise.race([nameFont, wait(FONT_WAIT_MS)]).then(() => {
    if (finished) return;
    loader.classList.add('is-ready');
    if (reduced || !window.MotelSign) {
      lightAll();
      sequenceEnd = 0;
    } else {
      sequenceEnd = window.MotelSign.play(letters).endsAt;
    }
    requestAnimationFrame(tick);
  });
})();
