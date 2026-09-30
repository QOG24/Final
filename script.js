(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var progress = document.querySelector('.progress');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tabs ---------- */
  function showTab(id, focusTab) {
    var found = false;
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('aria-controls') === id;
      if (on) found = true;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });
    if (!found) return showTab('problem', focusTab);
    panels.forEach(function (panel) { panel.hidden = panel.id !== id; });
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    observeCharts();
    updateProgress();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { showTab(tab.getAttribute('aria-controls')); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); showTab(next.getAttribute('aria-controls'), true); }
    });
  });

  document.querySelectorAll('[data-go]').forEach(function (btn) {
    btn.addEventListener('click', function () { showTab(btn.getAttribute('data-go')); });
  });

  /* ---------- Reading progress ---------- */
  function updateProgress() {
    if (!progress) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- Hero: notifications pile up ---------- */
  var notifs = document.querySelectorAll('.notif');
  notifs.forEach(function (n, i) {
    if (reduceMotion) { n.classList.add('show'); return; }
    setTimeout(function () { n.classList.add('show'); }, 500 + i * 520);
  });

  /* ---------- Charts draw when visible ---------- */
  var chartObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-drawn'); chartObserver.unobserve(entry.target); }
        });
      }, { threshold: 0.3 })
    : null;

  function observeCharts() {
    document.querySelectorAll('[data-chart]:not(.is-drawn)').forEach(function (c) {
      if (chartObserver && !reduceMotion) chartObserver.observe(c); else c.classList.add('is-drawn');
    });
  }

  /* ---------- Videos load only when played ---------- */
  document.querySelectorAll('.video-play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-yt');
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
      frame.title = btn.getAttribute('aria-label') || 'Video';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.onerror = function () { window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener'); };
      btn.replaceWith(frame);
    });
  });

  /* ---------- Start on the tab in the address bar ---------- */
  var start = (location.hash || '#problem').slice(1);
  showTab(start);
})();
