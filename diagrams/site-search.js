/*! Raisd docs — site search modal (index from site-search-index.json). */
(function () {
  'use strict';

  var OVERLAY_ID = 'raisd-site-search';
  var indexCache = null;
  var indexPromise = null;

  function scriptBase() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('site-search.js') !== -1) {
        return src.replace(/site-search\.js(?:\?.*)?$/, '');
      }
    }
    return '';
  }

  function indexUrl() {
    return scriptBase() + 'site-search-index.json';
  }

  function loadIndex() {
    if (indexCache) return Promise.resolve(indexCache);
    if (indexPromise) return indexPromise;
    indexPromise = fetch(indexUrl(), { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('Search index unavailable');
        return res.json();
      })
      .then(function (data) {
        indexCache = Array.isArray(data) ? data : data.pages || [];
        return indexCache;
      })
      .catch(function (err) {
        indexPromise = null;
        throw err;
      });
    return indexPromise;
  }

  function resolveHref(pathFromRoot) {
    if (!pathFromRoot) return '#';
    if (/^https?:\/\//i.test(pathFromRoot)) return pathFromRoot;
    var base = scriptBase(); // .../diagrams/
    // Index paths are relative to docs root; script lives in diagrams/
    return base + '../' + pathFromRoot.replace(/^\//, '');
  }

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/&amp;/g, '&')
      .replace(/[^\p{L}\p{N}\s#+./-]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function scoreEntry(entry, query) {
    var q = normalize(query);
    if (!q) return 0;
    var terms = q.split(' ').filter(Boolean);
    var hay = normalize(
      [entry.title, entry.summary, entry.section]
        .concat(entry.keywords || [])
        .join(' ')
    );
    var score = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!hay.includes(t)) return 0;
      if (normalize(entry.title).includes(t)) score += 8;
      if (normalize(entry.section).includes(t)) score += 3;
      if ((entry.keywords || []).some(function (k) { return normalize(k).includes(t); })) score += 4;
      if (normalize(entry.summary).includes(t)) score += 2;
    }
    return score + Math.min(3, terms.length);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderResults(list, query) {
    var box = document.getElementById('raisd-search-results');
    if (!box) return;
    if (!query.trim()) {
      box.innerHTML =
        '<p class="raisd-search-hint">Type to search pages. Results show a short summary; choose one to open it.</p>';
      return;
    }
    if (!list.length) {
      box.innerHTML = '<p class="raisd-search-empty">No matching pages for “' + escapeHtml(query) + '”.</p>';
      return;
    }
    box.innerHTML = list
      .map(function (item, idx) {
        return (
          '<button type="button" class="raisd-search-result" data-href="' +
          escapeHtml(item.href) +
          '" data-index="' +
          idx +
          '">' +
          '<span class="raisd-search-result-section">' +
          escapeHtml(item.section || 'Docs') +
          '</span>' +
          '<span class="raisd-search-result-title">' +
          escapeHtml(item.title) +
          '</span>' +
          '<span class="raisd-search-result-summary">' +
          escapeHtml(item.summary || '') +
          '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  function openResult(href) {
    closeModal();
    if (!href) return;
    window.location.href = href;
  }

  function runSearch(query) {
    loadIndex()
      .then(function (pages) {
        var ranked = pages
          .map(function (page) {
            return { page: page, score: scoreEntry(page, query) };
          })
          .filter(function (row) { return row.score > 0; })
          .sort(function (a, b) { return b.score - a.score || a.page.title.localeCompare(b.page.title); })
          .slice(0, 24)
          .map(function (row) {
            return {
              title: row.page.title,
              summary: row.page.summary,
              section: row.page.section,
              href: resolveHref(row.page.path),
            };
          });
        renderResults(ranked, query);
      })
      .catch(function () {
        var box = document.getElementById('raisd-search-results');
        if (box) {
          box.innerHTML = '<p class="raisd-search-empty">Search index could not be loaded.</p>';
        }
      });
  }

  function closeModal() {
    var el = document.getElementById(OVERLAY_ID);
    if (el) el.remove();
    document.documentElement.classList.remove('raisd-search-open');
  }

  function openModal(initialQuery) {
    if (document.getElementById(OVERLAY_ID)) {
      var existing = document.getElementById('raisd-search-input');
      if (existing) existing.focus();
      return;
    }
    document.documentElement.classList.add('raisd-search-open');
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'raisd-search-title');
    overlay.innerHTML =
      '<div class="raisd-search-backdrop" data-raisd-search-close></div>' +
      '<div class="raisd-search-panel">' +
      '  <div class="raisd-search-head">' +
      '    <h2 id="raisd-search-title">Search documentation</h2>' +
      '    <button type="button" class="raisd-search-close" data-raisd-search-close aria-label="Close search">×</button>' +
      '  </div>' +
      '  <label class="raisd-search-field">' +
      '    <span class="raisd-search-field-icon" aria-hidden="true">' +
      '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">' +
      '        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>' +
      '        <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '      </svg>' +
      '    </span>' +
      '    <input id="raisd-search-input" type="search" placeholder="Search pages…" autocomplete="off" enterkeyhint="search" />' +
      '  </label>' +
      '  <div id="raisd-search-results" class="raisd-search-results" role="listbox" aria-label="Search results"></div>' +
      '  <p class="raisd-search-footer"><kbd>/</kbd> or <kbd>⌘K</kbd> open · <kbd>Esc</kbd> close · Enter opens highlighted result</p>' +
      '</div>';

    document.body.appendChild(overlay);
    var input = document.getElementById('raisd-search-input');
    var results = document.getElementById('raisd-search-results');
    var active = -1;

    function highlight(next) {
      var items = results.querySelectorAll('.raisd-search-result');
      if (!items.length) {
        active = -1;
        return;
      }
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      active = next;
      items.forEach(function (el, i) {
        el.classList.toggle('is-active', i === active);
      });
      items[active].scrollIntoView({ block: 'nearest' });
    }

    overlay.addEventListener('click', function (e) {
      var close = e.target.closest('[data-raisd-search-close]');
      if (close) {
        closeModal();
        return;
      }
      var hit = e.target.closest('.raisd-search-result');
      if (hit) openResult(hit.getAttribute('data-href'));
    });

    input.addEventListener('input', function () {
      active = -1;
      runSearch(input.value);
    });

    input.addEventListener('keydown', function (e) {
      var items = results.querySelectorAll('.raisd-search-result');
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlight(active + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlight(active - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active >= 0 && items[active]) {
          openResult(items[active].getAttribute('data-href'));
        } else if (items[0]) {
          openResult(items[0].getAttribute('data-href'));
        }
      }
    });

    renderResults([], '');
    input.value = initialQuery || '';
    input.focus();
    if (input.value) runSearch(input.value);
    loadIndex().catch(function () {});
  }

  function ensureTrigger() {
    if (document.querySelector('.site-search-trigger')) return;
    var nav = document.querySelector('nav.nav[aria-label="Primary"]');
    if (!nav || !nav.parentElement) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'site-search-trigger';
    btn.setAttribute('aria-label', 'Search documentation');
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
    nav.parentElement.insertBefore(btn, nav);
  }

  function bind() {
    ensureTrigger();
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.site-search-trigger');
      if (btn) {
        e.preventDefault();
        openModal('');
      }
    });
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      var typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openModal('');
        return;
      }
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openModal('');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
