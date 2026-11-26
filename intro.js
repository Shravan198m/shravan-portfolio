(() => {
  const intro = document.querySelector('#cinema-intro');
  const room = document.querySelector('#room');
  const gate = document.querySelector('#film-gate');
  const caption = document.querySelector('#film-caption');
  const status = document.querySelector('#entrance-status');
  const progress = document.querySelector('#film-progress');
  const pause = document.querySelector('#film-pause');
  const mute = document.querySelector('#film-mute');
  const skip = document.querySelector('#skip-intro');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = document.createElement('video');
  video.id = 'opening-film-video'; video.className = 'opening-film-video';
  video.preload = 'none'; video.playsInline = true;
  video.poster = '/assets/intro-photographic-v2-poster.jpg';
  video.setAttribute('aria-label', 'Photographic opening: rainy house exterior, vintage kitchen, and original television room');
  intro.prepend(video);
  const cues = [
    [2, 4.8, 'Some ideas begin quietly.'],
    [7, 11.4, 'A question. A frame. A possibility.'],
    [12, 15.6, 'Then curiosity becomes something you can see.'],
    [18, 22, 'Built in code. Told in pictures.'],
    [23, 26.2, 'Different ways of making an idea real.'],
    [27, 29.4, 'Welcome to my world.']
  ];
  let running = false, starting = false, frame, finishTimer, attempt = 0;
  const seen = () => { try { return sessionStorage.getItem('svm-story-v5'); } catch { return false; } };
  function update() {
    const time = video.currentTime;
    intro.style.setProperty('--progress', Math.min(time / 30, 1));
    progress.textContent = `${String(Math.floor(time)).padStart(2, '0')} / 30`;
    const cue = cues.find(([from, to]) => time >= from && time < to);
    caption.textContent = cue?.[2] || ''; caption.hidden = !cue;
    if (video.readyState >= 3) status.textContent = time < 8.5 ? '01 / COME IN FROM THE RAIN' : time < 14 ? '02 / A MOMENT OF CURIOSITY' : time < 23.5 ? '03 / THROUGH THE ROOM' : '04 / FINDING THE SIGNAL';
    if (running && !video.paused) frame = requestAnimationFrame(update);
  }
  function soundLabel() {
    mute.textContent = video.muted ? 'SOUND OFF' : 'SOUND ON';
    mute.setAttribute('aria-pressed', String(!video.muted));
  }
  function finish() {
    ++attempt; starting = running = false;
    cancelAnimationFrame(frame); clearTimeout(finishTimer);
    video.pause(); window.PortfolioAudio?.stop(); room.inert = false;
    intro.classList.add('departing');
    try { sessionStorage.setItem('svm-story-v5', '1'); } catch {}
    finishTimer = setTimeout(() => {
      intro.hidden = true; intro.classList.remove('departing');
      document.querySelector('.channel-button[aria-pressed=true]')?.focus({ preventScroll: true });
    }, reduced.matches ? 0 : 650);
  }
  async function begin(sound) {
    if (starting || running) return;
    const currentAttempt = ++attempt; starting = true;
    window.PortfolioAudio?.stop();
    if (!video.getAttribute('src')) {
      const compact = matchMedia('(max-width: 760px)').matches || navigator.connection?.saveData;
      video.src = compact ? '/assets/intro-photographic-v2-mobile.mp4' : '/assets/intro-photographic-v2.mp4';
    }
    video.currentTime = 0; video.muted = !sound; video.volume = 1; soundLabel();
    status.textContent = 'LOADING THE OPENING FILM…';
    try {
      // Start in the gesture. The single media clock keeps rendered picture,
      // score and narration together through buffering, pausing and seeking.
      await video.play();
      if (currentAttempt !== attempt) return;
      starting = false; running = true; gate.hidden = true;
      intro.classList.add('playing'); pause.textContent = 'PAUSE';
      if (document.hidden) video.pause();
      skip.focus({ preventScroll: true }); update();
    } catch {
      if (currentAttempt !== attempt) return;
      starting = false; video.pause(); gate.hidden = false;
      status.textContent = 'Film could not play. Try again, play silently, or skip to the portfolio.';
    }
  }
  function prepare() {
    ++attempt; starting = running = false;
    clearTimeout(finishTimer); cancelAnimationFrame(frame);
    video.pause(); if (video.readyState) video.currentTime = 0;
    window.PortfolioAudio?.stop(); document.querySelector('#tv-video')?.pause();
    intro.hidden = false; intro.classList.remove('departing', 'playing');
    gate.hidden = false; caption.hidden = true; room.inert = true;
    progress.textContent = '00 / 30'; intro.style.setProperty('--progress', 0);
    status.textContent = 'A THIRTY-SECOND OPENING FILM';
    document.querySelector('#enter-sound').focus({ preventScroll: true });
  }
  async function togglePause() {
    if (!running) return;
    if (!video.paused) { video.pause(); return; }
    try { await video.play(); } catch { status.textContent = 'Playback paused. Press Resume to try again.'; }
  }
  video.addEventListener('pause', () => { cancelAnimationFrame(frame); pause.textContent = 'RESUME'; });
  video.addEventListener('playing', () => { if (running) { pause.textContent = 'PAUSE'; cancelAnimationFrame(frame); update(); } });
  video.addEventListener('waiting', () => { if (running) status.textContent = 'BUFFERING — YOUR FILM WILL CONTINUE'; });
  video.addEventListener('ended', finish);
  video.addEventListener('error', () => {
    if (!starting && !running) return;
    ++attempt; starting = running = false; cancelAnimationFrame(frame);
    gate.hidden = false; intro.classList.remove('playing');
    status.textContent = 'Film unavailable. Retry playback or skip to the portfolio.';
    video.removeAttribute('src'); video.load();
  });
  document.querySelector('#enter-sound').addEventListener('click', () => begin(true));
  document.querySelector('#enter-silent').addEventListener('click', () => begin(false));
  document.querySelector('#replay-intro').addEventListener('click', prepare);
  skip.addEventListener('click', finish); pause.addEventListener('click', togglePause);
  mute.addEventListener('click', () => { video.muted = !video.muted; soundLabel(); });
  document.addEventListener('keydown', e => { if (!intro.hidden && e.key === 'Escape') finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) video.pause(); });
  if (seen() || reduced.matches) intro.hidden = true; else prepare();
})();
