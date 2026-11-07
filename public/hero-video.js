// Keep the background controllable and respect visitors who prefer less motion.
(() => {
  const video = document.querySelector('#heroVideo');
  const toggle = document.querySelector('#heroVideoToggle');
  if (!video || !toggle) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => { toggle.textContent = video.paused ? 'Play video' : 'Pause video'; };
  video.muted = true;
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('error', () => { toggle.hidden = true; });
  const applyMotionPreference = () => {
    video.autoplay = !motion.matches;
    if (motion.matches) video.pause();
    else video.play().catch(update);
    update();
  };
  toggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(update);
    else video.pause();
  });
  motion.addEventListener('change', applyMotionPreference);
  toggle.hidden = false;
  applyMotionPreference();
})();
