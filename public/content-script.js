/**
 * ベネステ行動収集 content script
 *
 * ユーザーが普通にベネステを閲覧する際、以下を記録:
 * - ページ訪問 (URL, タイトル, 抽出メタ)
 * - 滞在時間 (visibility-API で正確に計測)
 * - スクロール深度 (どこまで読んだか)
 * - クリック (興味の強いシグナル)
 *
 * 収集したデータは service-worker に送信され、chrome.storage.local に蓄積される。
 * 自動巡回・自動ログインは行わない。ユーザーの自然な閲覧を観察するのみ。
 */

(function () {
  'use strict';

  let pageState = null;

  function extractMeta() {
    const candidates = {
      title: ['h1', '.service-title', '[data-testid="service-title"]', '.detail-title'],
      description: ['.service-description', '.description', '.detail-description', 'meta[name="description"]'],
      price: ['.price', '.member-price', '.discount-price', '[data-testid="price"]'],
      category: ['.category', '.breadcrumb', '.category-name', '[data-category]'],
      tags: ['.tag', '.label', '.badge', '.chip'],
    };

    function pickFirst(selectors) {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          if (el.tagName === 'META') return el.getAttribute('content')?.trim() || null;
          return el.textContent?.trim() || null;
        }
      }
      return null;
    }

    function pickAll(selectors) {
      const results = [];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length < 30 && !results.includes(text)) results.push(text);
        });
      }
      return results.slice(0, 8);
    }

    return {
      title: pickFirst(candidates.title) || document.title,
      description: pickFirst(candidates.description),
      price: pickFirst(candidates.price),
      category: pickFirst(candidates.category),
      tags: pickAll(candidates.tags),
    };
  }

  function startPageTracking() {
    const meta = extractMeta();
    if (!meta.title && !meta.description) return;

    pageState = {
      url: window.location.href,
      pageTitle: document.title,
      ...meta,
      visitedAt: Date.now(),
      visitedAtISO: new Date().toISOString(),
      dwellMs: 0,
      maxScrollDepth: 0,
      clicks: [],
      _activeStart: Date.now(),
    };

    sendPageData(true);
  }

  function updateDwell() {
    if (!pageState) return;
    if (document.visibilityState === 'visible' && pageState._activeStart) {
      pageState.dwellMs += Date.now() - pageState._activeStart;
      pageState._activeStart = Date.now();
    }
  }

  function trackScroll() {
    if (!pageState) return;
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    const winH = window.innerHeight;
    const scrolled = window.scrollY + winH;
    const depth = Math.min(1, scrolled / docH);
    if (depth > pageState.maxScrollDepth) {
      pageState.maxScrollDepth = depth;
    }
  }

  function trackClick(event) {
    if (!pageState) return;
    const target = event.target.closest('a, button, [role="button"], [onclick]');
    if (!target) return;
    const text = (target.textContent || '').trim().slice(0, 60);
    const href = target.getAttribute('href') || null;
    if (text || href) {
      pageState.clicks.push({
        at: Date.now() - pageState.visitedAt,
        text,
        href,
      });
    }
  }

  function sendPageData(isInitial = false) {
    if (!pageState) return;
    updateDwell();
    const payload = {
      url: pageState.url,
      pageTitle: pageState.pageTitle,
      title: pageState.title,
      description: pageState.description,
      price: pageState.price,
      category: pageState.category,
      tags: pageState.tags,
      visitedAt: pageState.visitedAt,
      visitedAtISO: pageState.visitedAtISO,
      dwellSeconds: Math.round(pageState.dwellMs / 1000),
      scrollDepth: Math.round(pageState.maxScrollDepth * 100) / 100,
      clicks: pageState.clicks,
    };
    try {
      chrome.runtime.sendMessage({
        type: isInitial ? 'PAGE_VISITED' : 'PAGE_UPDATED',
        data: payload,
      });
    } catch (err) {
      /* 拡張アンロード中等は無視 */
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!pageState) return;
    if (document.visibilityState === 'hidden') {
      updateDwell();
      pageState._activeStart = null;
      sendPageData();
    } else {
      pageState._activeStart = Date.now();
    }
  });

  window.addEventListener('beforeunload', () => sendPageData());

  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => {
      trackScroll();
      scrollTimer = null;
    }, 200);
  }, { passive: true });

  document.addEventListener('click', trackClick, true);

  setInterval(() => {
    if (pageState && document.visibilityState === 'visible') {
      sendPageData();
    }
  }, 5000);

  if (document.readyState === 'complete') {
    setTimeout(startPageTracking, 800);
  } else {
    window.addEventListener('load', () => setTimeout(startPageTracking, 800));
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      sendPageData();
      lastUrl = location.href;
      setTimeout(startPageTracking, 1200);
    }
  }).observe(document.body, { subtree: true, childList: true });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'REQUEST_CURRENT_PAGE') {
      sendResponse(pageState ? extractMeta() : null);
      return true;
    }
  });
})();
