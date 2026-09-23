/* Hero background video. The markup carries only a poster (the video's first frame); this script picks
   the file for the screen and plays it while the hero is on screen.
   No JS, reduced motion or Save-Data: the poster stays and no video bytes are downloaded. */
(() => {
  const video = document.querySelector('.power-video-el');
  if (!video) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reduced || saveData) return;

  const MOBILE_QUERY = '(max-width: 780px)';
  const source = matchMedia(MOBILE_QUERY).matches ? video.dataset.srcMobile : video.dataset.srcDesktop;
  let heroInView = true;

  // Playback only runs while the hero is visible and the tab is in front, to spare CPU and battery.
  const sync = () => {
    if (heroInView && !document.hidden) {
      // If the browser refuses autoplay the poster simply stays, which is a complete hero on its own.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  video.muted = true;
  video.preload = 'auto';
  video.src = source;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      sync();
    }).observe(video);
  } else {
    sync();
  }
  document.addEventListener('visibilitychange', sync);
})();
