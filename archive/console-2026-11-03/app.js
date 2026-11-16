import { projects, films, destinations } from './data.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const safe = (text) => String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets = 'assets/';
let typingTimer;
let restoreTimer;
let currentDestination = '';
let modalOrigin = null;
let filmIndex = 0;
let playingIndex = 0;
let videoRequest = 0;

function typeScreen(destination, force = false) {
  if (!destinations[destination] || (!force && currentDestination === destination)) return;
  currentDestination = destination;
  clearTimeout(typingTimer);
  const [title, description] = destinations[destination];
  const titleElement = $('#typed-title');
  $('#screen-title').setAttribute('aria-label', title.replace('\n', ' '));
  $('#screen-description').textContent = description;
  if (reducedMotion.matches) {
    titleElement.textContent = title;
    $('#screen-status').innerHTML = '<i></i>READY';
    return;
  }
  let position = 0;
  titleElement.textContent = '';
  $('#screen-status').innerHTML = '<i></i>TYPING';
  const tick = () => {
    position += 1;
    titleElement.textContent = title.slice(0, position);
    if (position < title.length) typingTimer = setTimeout(tick, 44);
    else $('#screen-status').innerHTML = '<i></i>READY';
  };
  typingTimer = setTimeout(tick, destination === 'home' ? 350 : 75);
}

function restoreScreen() {
  clearTimeout(restoreTimer);
  restoreTimer = setTimeout(() => {
    if ($('dialog[open]')) return;
    const focused = document.activeElement?.closest('.key');
    const hovered = $('.key:hover');
    const active = focused || hovered;
    typeScreen(active?.dataset.destination || active?.dataset.preview || 'home');
  }, 350);
}

const keyElements = $$('.key');
keyElements.forEach((key, index) => {
  key.style.setProperty('--key-index', index);
  const preview = () => {
    clearTimeout(restoreTimer);
    stopWave();
    typeScreen(key.dataset.destination || key.dataset.preview);
  };
  key.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') preview(); });
  key.addEventListener('focus', preview);
  key.addEventListener('pointerleave', restoreScreen);
  key.addEventListener('blur', restoreScreen);
  if (key.dataset.destination) key.addEventListener('click', () => {
    const section = document.getElementById(key.dataset.destination);
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    const heading = $('h2', section);
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll: true});
    history.replaceState(null, '', `#${section.id}`);
  });
});

let waveTimeouts = [];
let consoleVisible = true;
function stopWave() {
  waveTimeouts.forEach(clearTimeout);
  waveTimeouts = [];
  keyElements.forEach((key) => key.classList.remove('wave'));
}
function wave() {
  if (reducedMotion.matches || document.hidden || !consoleVisible || $('dialog[open]') || document.activeElement?.closest('.key') || $('.key:hover')) return;
  keyElements.forEach((key, index) => {
    waveTimeouts.push(setTimeout(() => {
      key.classList.add('wave');
      waveTimeouts.push(setTimeout(() => key.classList.remove('wave'), 1150));
    }, index * 85));
  });
}
new IntersectionObserver(([entry]) => {
  consoleVisible = entry.isIntersecting;
  if (!consoleVisible) stopWave();
}).observe($('#console'));
setInterval(wave, 7000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopWave(); $('#cinema-video').pause(); }
});
reducedMotion.addEventListener('change', () => { stopWave(); typeScreen(currentDestination, true); });

function art(icon) {
  switch (icon) {
    case 'eye': return '<div class="eye-art"></div>';
    case 'network': return '<div class="art-network"><span>AUTH</span><span>INTERVIEW</span><span>PROCTOR</span><span>EVALUATE</span><span>EXECUTE</span><span>NOTIFY</span></div>';
    case 'waves': return '<div class="art-waves"><i></i><i></i><i></i></div>';
    case 'cross': return '<div class="art-cross">+</div>';
    default: return '<div class="art-code">&lt;/&gt;</div>';
  }
}

$('#project-grid').innerHTML = projects.map((project) => `
  <article class="project-card ${project.theme}">
    <div class="project-card-top mono"><span>${project.number} / ${project.category}</span><span>↗</span></div>
    <div class="project-art" aria-hidden="true">${art(project.icon)}</div>
    <div class="project-card-body"><h3><button data-project="${project.id}" aria-label="Read about ${safe(project.title)}">${safe(project.title)}</button></h3><p>${safe(project.description)}</p>
    <div class="project-tags">${project.tags.map((tag) => `<span>${safe(tag)}</span>`).join('')}</div>
    <div class="project-card-footer"><span><b>${safe(project.metric)}</b>${project.metricLabel}</span><span class="card-arrow" aria-hidden="true">↗</span></div></div>
  </article>`).join('');

function showDialog(dialog, origin) {
  modalOrigin = origin || document.activeElement;
  stopWave();
  dialog.showModal();
  document.body.classList.add('modal-open');
  $('.close-dialog', dialog).focus();
}

function closeDialog(dialog) { dialog.close(); }

$$('dialog').forEach((dialog) => {
  let startedOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    const rect = dialog.getBoundingClientRect();
    startedOnBackdrop = event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  });
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (startedOnBackdrop && event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
    startedOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    if (dialog.id === 'film-dialog') {
      videoRequest++;
      const video = $('#cinema-video');
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    document.body.classList.remove('modal-open');
    if (modalOrigin?.isConnected) modalOrigin.focus({preventScroll:true});
    restoreScreen();
  });
  // Native dialog handles modal focus; keep Tab cycling inside its controls.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = $$('a[href],button:not([disabled]),video[controls],[tabindex="0"]', dialog).filter((el) => el.getClientRects().length > 0);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
});
$$('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));

function openProject(id, origin) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;
  $('#project-dialog-content').innerHTML = `
    <div class="project-dialog-head"><p class="eyebrow">${project.number} / ${project.category}</p><h2 id="project-dialog-title">${safe(project.title)}</h2><p>${safe(project.summary)}</p><div class="project-dialog-meta"><span>${safe(project.role)}</span><span>${project.year}</span></div></div>
    <div class="dialog-tabs" role="tablist" aria-label="Project information">
      <button role="tab" id="overview-tab" aria-controls="overview-panel" aria-selected="true" tabindex="0">Overview</button>
      <button role="tab" id="approach-tab" aria-controls="approach-panel" aria-selected="false" tabindex="-1">Approach</button>
      <button role="tab" id="stack-tab" aria-controls="stack-panel" aria-selected="false" tabindex="-1">Stack</button>
    </div>
    <section class="tab-panel" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab"><h3>The project</h3><p>${safe(project.overview)}</p><div class="detail-metric"><strong>${safe(project.metric)}</strong><span>${project.metricLabel}</span></div><p class="project-detail-note">${safe(project.note)}</p></section>
    <section class="tab-panel" role="tabpanel" id="approach-panel" aria-labelledby="approach-tab" hidden><h3>How it comes together</h3><p>${safe(project.approach)}</p><div class="flow-diagram" aria-label="Project components">${project.flow.map((step,index) => `<div class="flow-node"><span>${String(index+1).padStart(2,'0')}</span>${safe(step)}</div>`).join('')}</div><p class="project-detail-note">${safe(project.note)}</p></section>
    <section class="tab-panel" role="tabpanel" id="stack-panel" aria-labelledby="stack-tab" hidden><h3>Tools & techniques</h3><ul class="stack-list">${project.stack.map((item) => `<li>${safe(item)}</li>`).join('')}</ul><p>Explore the linked source or supporting material for more detail.</p></section>
    <div class="project-dialog-links">${project.links.length ? project.links.map((link) => `<a class="button button-primary" href="${safe(link.href)}" target="_blank" rel="noopener noreferrer">${safe(link.label)} <span>↗</span></a>`).join('') : '<p>Ideathon concept · No public demo listed.</p>'}</div>`;
  const tabs = $$('.dialog-tabs [role=tab]');
  const activate = (tab, focus = false) => {
    tabs.forEach((item) => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !active; });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(tabs[next], true); }
    });
  });
  showDialog($('#project-dialog'), origin);
  $('#project-dialog').scrollTop = 0;
}
$$('[data-project]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.project, button)));

$('#film-list').innerHTML = films.map((film, index) => `
  <button class="film-row" data-film="${index}" aria-pressed="${index === 0}" aria-label="Select ${safe(film.title)}">
  <span class="film-row-number">${String(index+1).padStart(2,'0')}</span><img src="${assets}${film.poster}" alt="" loading="lazy"><span class="film-row-info"><strong>${safe(film.title)}</strong><small>${safe(film.role)}</small></span><span class="film-row-duration">${film.duration}</span></button>`).join('');

function selectFilm(index) {
  filmIndex = index;
  const film = films[index];
  const poster = $('#featured-poster');
  poster.src = assets + film.poster;
  poster.alt = film.alt;
  $('#featured-film').setAttribute('aria-label', `Play ${film.title}`);
  $('#featured-film').classList.toggle('portrait', film.format === 'Portrait');
  $('#feature-index').textContent = `${String(index + 1).padStart(2, '0')} / 07`;
  $('#feature-title').textContent = film.title;
  $('#feature-role').textContent = film.role.toUpperCase();
  $('#feature-duration').textContent = film.duration;
  $('#feature-format').textContent = film.format.toUpperCase();
  $$('.film-row').forEach((row) => row.setAttribute('aria-pressed', String(Number(row.dataset.film) === index)));
}
$$('.film-row').forEach((row) => row.addEventListener('click', () => selectFilm(Number(row.dataset.film))));

async function loadFilm(index) {
  playingIndex = (index + films.length) % films.length;
  const film = films[playingIndex];
  selectFilm(playingIndex);
  const request = ++videoRequest;
  const video = $('#cinema-video');
  video.pause();
  $('#video-error').hidden = true;
  $('#film-dialog-title').textContent = film.title;
  $('#film-dialog-role').textContent = film.role.toUpperCase();
  $('#film-dialog-index').textContent = `${String(playingIndex + 1).padStart(2,'0')} / 07 — ${film.duration}`;
  video.poster = assets + film.poster;
  video.src = assets + film.file;
  video.setAttribute('aria-label', film.title);
  $('#video-download').href = assets + film.file;
  try { await video.play(); }
  catch (error) {
    if (request !== videoRequest || !$('#film-dialog').open) return;
    // Autoplay rejection leaves native controls available; actual decode/load errors show a fallback.
    if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') $('#video-error').hidden = false;
  }
}
$('#featured-film').addEventListener('click', () => { showDialog($('#film-dialog'), $('#featured-film')); loadFilm(filmIndex); });
$('#previous-film').addEventListener('click', () => loadFilm(playingIndex - 1));
$('#next-film').addEventListener('click', () => loadFilm(playingIndex + 1));
$('#cinema-video').addEventListener('error', () => { if ($('#film-dialog').open && $('#cinema-video').getAttribute('src')) $('#video-error').hidden = false; });

$('#copy-email').addEventListener('click', async () => {
  const status = $('#copy-status');
  try { await navigator.clipboard.writeText('svmoodlu198@gmail.com'); status.textContent = 'Email address copied.'; }
  catch { status.textContent = 'Select the email address above to copy it, or click it to open your mail app.'; }
});

const navLinks = $$('.site-header nav a');
const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) {
    navLinks.forEach((link) => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
}, {rootMargin:'-10% 0px -65% 0px', threshold:0});
$$('main>section').forEach((section) => sectionObserver.observe(section));
$('#year').textContent = new Date().getFullYear();
selectFilm(0);
typeScreen('home');
