/* ── CLIENTS CAROUSEL ──
   Карусель логотипов «S kým pracujeme» для levelupai.cz и квиза.
   Новый клиент: положить логотип в папку clients/ и добавить строку в CLIENTS.
   h — высота логотипа в px (подгоняем на глаз, чтобы логотипы выглядели одинаково крупно).
   label — название рядом со значком, если в самом логотипе названия нет.

   Логотипы всегда видны целиком: в ширину помещается ровно 2 (телефон) … 5 (широкий блок).
   Листается сама, свайпом, колёсиком/трекпадом, мышью (перетаскиванием) и стрелками —
   стрелки появляются, если рядом есть элемент [data-clients-nav]. */
(function() {
  var CLIENTS = [
    { name: 'Sanatoriums.com', logo: 'sanatoriums.webp', h: 20 },
    { name: 'Klunn Group',     logo: 'klunn.svg',        h: 38 },
    { name: 'CARLOVE',         logo: 'carlove.svg',      h: 19 },
    { name: 'LINES',           logo: 'lines.svg',        h: 24 },
    { name: 'DSI',             logo: 'dsi.svg',          h: 30, label: 'DSI' },
    { name: 'Trdelník',        logo: 'trdelnik.png',     h: 48 },
    { name: 'TARGET ON',       logo: 'targeton.png',     h: 24 }
  ];

  var INTERVAL = 2800; // мс между автоперелистываниями
  var IDLE = 6000;     // после ручной прокрутки столько ждём, прежде чем листать самим

  var NAV_LABELS = {
    cs: ['Předchozí', 'Další'],
    ru: ['Назад', 'Вперёд'],
    en: ['Previous', 'Next']
  };

  var script = document.currentScript;
  var base = script ? script.src.replace(/[^/]*$/, '') : 'https://levelupai.cz/clients/';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var css = [
    '.lu-clients { container-type: inline-size; }',
    '.lu-clients-viewport {',
    '  overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory;',
    '  scrollbar-width: none; -webkit-overflow-scrolling: touch;',
    '  cursor: grab; -webkit-user-select: none; user-select: none; border-radius: 14px;',
    '}',
    '.lu-clients-viewport::-webkit-scrollbar { display: none; }',
    '.lu-clients-viewport:focus-visible { outline: 2px solid #4156C3; outline-offset: 3px; }',
    '.lu-clients-viewport.is-dragging { cursor: grabbing; scroll-snap-type: none; }',
    '.lu-clients-list { --per-view: 2; --gap: 10px; display: flex; gap: var(--gap); list-style: none; margin: 0; padding: 0; }',
    '@container (min-width: 420px) { .lu-clients-list { --per-view: 3; } }',
    '@container (min-width: 560px) { .lu-clients-list { --per-view: 4; } }',
    '@container (min-width: 760px) { .lu-clients-list { --per-view: 5; } }',
    '@container (min-width: 1100px) { .lu-clients-list { --per-view: 6; } }',
    '.lu-client {',
    '  flex: 0 0 calc((100% - (var(--per-view) - 1) * var(--gap)) / var(--per-view));',
    '  scroll-snap-align: start; height: 76px; padding: 0 14px;',
    '  display: flex; align-items: center; justify-content: center;',
    '  background: #f4f6fb; border-radius: 14px;',
    '}',
    '.lu-client img { display: block; width: auto; max-width: 100%; object-fit: contain; pointer-events: none; }',
    '.lu-client-label { margin-left: 8px; font-size: 20px; font-weight: 700; letter-spacing: 0.06em; color: #8A6D3B; }',
    '.lu-clients.is-static .lu-clients-viewport { overflow: hidden; cursor: default; }',
    '.lu-clients.is-static .lu-clients-list { justify-content: center; }',
    '.lu-clients.is-static .lu-clients-list > [aria-hidden] { display: none; }',
    '.lu-clients-nav { display: flex; gap: 6px; }',
    '.lu-clients-btn {',
    '  width: 30px; height: 30px; border-radius: 50%; padding: 0;',
    '  display: flex; align-items: center; justify-content: center;',
    '  background: #eaedf6; border: none; color: #4156C3;',
    '  cursor: pointer; transition: background 0.2s, transform 0.15s;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.lu-clients-btn:hover { background: #dfe3f1; }',
    '.lu-clients-btn:active { transform: scale(0.94); }',
    '.lu-clients-btn:focus-visible { outline: 2px solid #4156C3; outline-offset: 2px; }',
    '.lu-clients-btn svg { width: 14px; height: 14px; }',
    '.lu-clients-nav.is-hidden { display: none; }'
  ].join('\n');

  function currentLang() {
    var l = (document.documentElement.lang || 'cs').slice(0, 2);
    return NAV_LABELS[l] ? l : 'cs';
  }

  function makeItems(hidden) {
    return CLIENTS.map(function(c) {
      var li = document.createElement('li');
      li.className = 'lu-client';
      if (hidden) li.setAttribute('aria-hidden', 'true');
      var img = document.createElement('img');
      img.src = base + c.logo;
      img.alt = hidden ? '' : c.name;
      img.style.height = (c.h || 24) + 'px';
      img.decoding = 'async';
      img.draggable = false;
      li.appendChild(img);
      if (c.label) {
        img.alt = '';
        var label = document.createElement('span');
        label.className = 'lu-client-label';
        label.textContent = c.label;
        li.appendChild(label);
      }
      return li;
    });
  }

  function makeButton(dir) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lu-clients-btn';
    b.innerHTML = dir < 0
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    return b;
  }

  function build(host) {
    host.classList.add('lu-clients');
    var viewport = document.createElement('div');
    viewport.className = 'lu-clients-viewport';
    viewport.tabIndex = 0;
    // focusable scroller: name it after the heading next to it («S kým pracujeme» on the site and in the quiz)
    var heading = host.parentElement && host.parentElement.querySelector('[id]');
    viewport.setAttribute('role', 'region');
    if (heading) viewport.setAttribute('aria-labelledby', heading.id);
    var list = document.createElement('ul');
    list.className = 'lu-clients-list';
    // три копии: [копия][оригинал][копия] — листаем по кругу, незаметно перескакивая в середину
    makeItems(true).concat(makeItems(false), makeItems(true)).forEach(function(li) { list.appendChild(li); });
    viewport.appendChild(list);
    host.appendChild(viewport);

    var navHost = host.parentElement && host.parentElement.querySelector('[data-clients-nav]');
    var prevBtn, nextBtn;
    if (navHost) {
      navHost.classList.add('lu-clients-nav');
      prevBtn = makeButton(-1);
      nextBtn = makeButton(1);
      navHost.appendChild(prevBtn);
      navHost.appendChild(nextBtn);
    }

    var N = CLIENTS.length;
    var step = 0, gap = 0, isStatic = false, ready = false;
    var target = null; // номер логотипа, к которому сейчас едем
    var hover = false, focused = false, dragging = false, inView = true, lastUser = 0;
    var restTimer = null;

    function measure() {
      var items = list.children;
      step = items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
      gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    }

    function currentIndex() {
      return target !== null ? target : Math.round(viewport.scrollLeft / step);
    }

    function scrollToIndex(i, smooth) {
      var behavior = smooth && !reduceMotion.matches ? 'smooth' : 'auto';
      var perView = Math.round((viewport.clientWidth + gap) / step);
      if (i < 0 || i > 3 * N - perView) {
        // упёрлись в край копий (очень быстрые клики) — перескакиваем на N назад/вперёд и едем дальше
        var shift = i < 0 ? N : -N;
        viewport.scrollLeft += shift * step;
        i += shift;
        target = i;
        setTimeout(function() { viewport.scrollTo({ left: i * step, behavior: behavior }); }, 30);
        return;
      }
      target = i;
      viewport.scrollTo({ left: i * step, behavior: behavior });
    }

    // когда карусель остановилась, незаметно возвращаемся в среднюю копию [N/2, 3N/2),
    // чтобы было куда листать в обе стороны (копии выглядят одинаково)
    function onRest() {
      target = null;
      if (isStatic || dragging || !step) return;
      var i = Math.round(viewport.scrollLeft / step);
      if (i < N * 0.5) viewport.scrollLeft = (i + N) * step;
      else if (i >= N * 1.5) viewport.scrollLeft = (i - N) * step;
    }

    function layout() {
      if (!viewport.clientWidth) return; // блок пока скрыт (например, результат квиза)
      var index = step ? currentIndex() : N;
      host.classList.remove('is-static');
      measure();
      isStatic = step * N - gap <= viewport.clientWidth + 1;
      host.classList.toggle('is-static', isStatic);
      if (navHost) navHost.classList.toggle('is-hidden', isStatic);
      viewport.scrollLeft = isStatic ? 0 : (ready ? index : N) * step;
      target = null;
      ready = true;
    }

    function go(dir) {
      if (isStatic) return;
      scrollToIndex(currentIndex() + dir, true);
    }

    function userActed() { lastUser = Date.now(); }

    function tick() {
      if (isStatic || !ready || hover || focused || dragging || !inView || document.hidden) return;
      if (reduceMotion.matches || Date.now() - lastUser < IDLE) return;
      go(1);
    }

    viewport.addEventListener('scroll', function() {
      clearTimeout(restTimer);
      restTimer = setTimeout(onRest, 150);
    }, { passive: true });

    ['wheel', 'touchstart', 'keydown'].forEach(function(type) {
      viewport.addEventListener(type, userActed, { passive: true });
    });

    host.addEventListener('pointerenter', function(e) { if (e.pointerType === 'mouse') hover = true; });
    host.addEventListener('pointerleave', function() { hover = false; });
    host.addEventListener('focusin', function() { focused = true; });
    host.addEventListener('focusout', function() { focused = false; });

    // перетаскивание мышью (на тачскринах работает обычный свайп)
    var startX = 0, startLeft = 0;
    viewport.addEventListener('pointerdown', function(e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || isStatic) return;
      userActed();
      target = null;
      dragging = true;
      startX = e.clientX;
      startLeft = viewport.scrollLeft;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove', function(e) {
      if (dragging) viewport.scrollLeft = startLeft - (e.clientX - startX);
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      userActed();
      var i = Math.round(viewport.scrollLeft / step);
      viewport.classList.remove('is-dragging');
      scrollToIndex(i, true);
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    if (prevBtn) {
      prevBtn.addEventListener('click', function() { userActed(); go(-1); });
      nextBtn.addEventListener('click', function() { userActed(); go(1); });
    }

    list.querySelectorAll('img').forEach(function(img) {
      if (!img.complete) img.addEventListener('load', function() { if (!ready) layout(); });
    });
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(viewport);
    else window.addEventListener('resize', layout);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) { inView = entries[0].isIntersecting; }, { threshold: 0.5 }).observe(viewport);
    }
    setInterval(tick, INTERVAL);
    layout();

    return function translate() {
      if (!prevBtn) return;
      var labels = NAV_LABELS[currentLang()];
      prevBtn.setAttribute('aria-label', labels[0]);
      nextBtn.setAttribute('aria-label', labels[1]);
    };
  }

  function init() {
    var hosts = document.querySelectorAll('[data-clients]');
    if (!hosts.length) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    var translators = Array.prototype.map.call(hosts, build);
    function translateAll() { translators.forEach(function(t) { t(); }); }
    translateAll();
    // сайт переключает язык без перезагрузки — подписи стрелок следуют за <html lang>
    new MutationObserver(translateAll)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
