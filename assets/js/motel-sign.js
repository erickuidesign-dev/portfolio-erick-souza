/* Motel-sign ignition, shared by the pre-loader name and the hero's red sign.
   MotelSign.play(letters, options) lights the letters one at a time, in random order. Each one sputters through
   one of the keyframe patterns in site.css (.motel-ch) before it holds; a couple are stubborn (a longer pattern
   with a dead stretch) and a couple stay tired, cutting out now and then for as long as the page is open.
   play() returns { endsAt, stop }: endsAt is a performance.now() timestamp for when the last letter has settled;
   stop() cancels what is pending and puts every letter out again.
   MotelSign.lightAll(letters) lights everything at once (reduced motion, or to end the show early). */
window.MotelSign = (() => {
  const DEFAULTS = {
    firstMs: 120,              // first attempt, after play() is called
    gapMs: 95,                 // spacing between attempts, plus a little jitter
    jitterMs: 50,
    strikeMs: [500, 700],      // how long a normal letter sputters before it holds
    stubbornMs: [1100, 1300],
    stubbornCount: 2,          // picked among the first letters to try, so the sign starts sputtering
    stubbornPool: 5,
    tiredCount: 2,             // keep cutting out once the sign is lit
    tiredCycleS: [2.8, 5],
    tiredStartS: [1.4, 2.4],   // after the longest strike, so the two never overlap
  };
  const STRIKE_PATTERNS = ['motel-strike-a', 'motel-strike-b', 'motel-strike-c'];
  const STUBBORN_PATTERN = 'motel-strike-hard';

  const between = (min, max) => min + Math.random() * (max - min);
  const shuffled = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const buildPlan = (letters, options) => {
    const pool = Math.min(options.stubbornPool, letters.length);
    const stubbornRanks = new Set(shuffled([...Array(pool).keys()]).slice(0, options.stubbornCount));
    return shuffled(letters).map((letter, rank) => {
      const stubborn = stubbornRanks.has(rank);
      return {
        letter,
        delay: options.firstMs + rank * options.gapMs + Math.random() * options.jitterMs,
        duration: Math.round(between(...(stubborn ? options.stubbornMs : options.strikeMs))),
        pattern: stubborn ? STUBBORN_PATTERN : STRIKE_PATTERNS[Math.floor(Math.random() * STRIKE_PATTERNS.length)],
      };
    });
  };

  const reset = (letter) => {
    letter.classList.remove('is-lit', 'is-tired');
    ['--pd', '--strike', '--fd', '--fl'].forEach((name) => letter.style.removeProperty(name));
  };

  const play = (letters, overrides = {}) => {
    const options = { ...DEFAULTS, ...overrides };
    const plan = buildPlan(letters, options);
    const endsAt = performance.now() + Math.max(0, ...plan.map((step) => step.delay + step.duration));
    const timers = plan.map(({ letter, delay, duration, pattern }) => (
      setTimeout(() => {
        letter.style.setProperty('--pd', `${duration}ms`);
        letter.style.setProperty('--strike', pattern);
        letter.classList.add('is-lit');
      }, delay)
    ));
    shuffled(letters).slice(0, options.tiredCount).forEach((letter) => {
      letter.style.setProperty('--fd', `${between(...options.tiredCycleS).toFixed(2)}s`);
      letter.style.setProperty('--fl', `${between(...options.tiredStartS).toFixed(2)}s`);
      letter.classList.add('is-tired');
    });
    const stop = () => {
      timers.forEach((timer) => clearTimeout(timer));
      letters.forEach(reset);
    };
    return { endsAt, stop };
  };

  const lightAll = (letters) => letters.forEach((letter) => letter.classList.add('is-lit'));

  return { play, lightAll };
})();
