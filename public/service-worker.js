/**
 * ベネステAI検索 service worker
 *
 * 役割:
 * - content-script からページ閲覧データを受け取り chrome.storage.local に集約
 * - URLごとに最新の状態を保持（同じページの再訪問は dwell/clicks/scroll を統合）
 * - サイドパネルからのエクスポート要求に応じて整形JSONを返す
 * - 拡張アクションクリックでサイドパネルを開く
 */

const STORAGE_KEY_PAGES = 'visitedPages';
const MAX_PAGES = 500;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ベネステAI検索] インストール完了');
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.warn('sidePanel設定エラー:', err));
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (chrome.sidePanel?.open) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  } catch (err) {
    console.warn('[ベネステAI検索] サイドパネル展開エラー:', err);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_VISITED' || message.type === 'PAGE_UPDATED') {
    handlePageData(message.data, message.type === 'PAGE_VISITED');
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === 'GET_VISITED_PAGES') {
    chrome.storage.local.get([STORAGE_KEY_PAGES], (result) => {
      sendResponse({ pages: result[STORAGE_KEY_PAGES] || [] });
    });
    return true;
  }

  if (message.type === 'EXPORT_DATA') {
    chrome.storage.local.get([STORAGE_KEY_PAGES], (result) => {
      const pages = result[STORAGE_KEY_PAGES] || [];
      sendResponse({ json: buildExportJson(pages) });
    });
    return true;
  }

  if (message.type === 'GET_STATS') {
    chrome.storage.local.get([STORAGE_KEY_PAGES], (result) => {
      sendResponse({ stats: buildStats(result[STORAGE_KEY_PAGES] || []) });
    });
    return true;
  }

  if (message.type === 'CLEAR_HISTORY') {
    chrome.storage.local.remove([STORAGE_KEY_PAGES], () => {
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ ok: true });
    });
    return true;
  }
});

async function handlePageData(pageData, isInitial) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY_PAGES]);
    const pages = result[STORAGE_KEY_PAGES] || [];

    const existingIndex = pages.findIndex((p) => p.url === pageData.url);

    if (existingIndex >= 0) {
      const existing = pages[existingIndex];
      pages[existingIndex] = {
        ...existing,
        ...pageData,
        visitCount: (existing.visitCount || 1) + (isInitial ? 1 : 0),
        dwellSeconds: Math.max(existing.dwellSeconds || 0, pageData.dwellSeconds || 0),
        scrollDepth: Math.max(existing.scrollDepth || 0, pageData.scrollDepth || 0),
        clicks: mergeClicks(existing.clicks || [], pageData.clicks || []),
        lastVisitedAt: pageData.visitedAt,
        lastVisitedAtISO: pageData.visitedAtISO,
      };
    } else {
      pages.unshift({
        ...pageData,
        visitCount: 1,
        firstVisitedAt: pageData.visitedAt,
        firstVisitedAtISO: pageData.visitedAtISO,
        lastVisitedAt: pageData.visitedAt,
        lastVisitedAtISO: pageData.visitedAtISO,
      });
    }

    const trimmed = pages.slice(0, MAX_PAGES);
    await chrome.storage.local.set({ [STORAGE_KEY_PAGES]: trimmed });

    chrome.action.setBadgeText({ text: String(trimmed.length) });
    chrome.action.setBadgeBackgroundColor({ color: '#003F8E' });
  } catch (err) {
    console.warn('[ベネステAI検索] 保存エラー:', err);
  }
}

function mergeClicks(existing, incoming) {
  const seen = new Set(existing.map((c) => c.text + c.href));
  const merged = [...existing];
  for (const c of incoming) {
    const key = c.text + c.href;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(c);
    }
  }
  return merged.slice(-30);
}

function buildStats(pages) {
  if (!pages.length) {
    return {
      totalPages: 0,
      totalVisits: 0,
      lastCollectedAt: null,
      categoryCounts: {},
      topCategories: [],
    };
  }

  const categoryCounts = {};
  let totalVisits = 0;
  let lastTime = 0;

  for (const p of pages) {
    totalVisits += (p.visitCount || 1);
    if ((p.lastVisitedAt || 0) > lastTime) lastTime = p.lastVisitedAt;
    const cat = (p.category || '').split('>').pop()?.trim() || 'その他';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalPages: pages.length,
    totalVisits,
    lastCollectedAt: lastTime ? new Date(lastTime).toISOString() : null,
    categoryCounts,
    topCategories,
  };
}

function buildExportJson(pages) {
  const stats = buildStats(pages);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: 'beneste-ai-search-extension',
    summary: stats,
    pages: pages.map((p) => ({
      url: p.url,
      pageTitle: p.pageTitle,
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      tags: p.tags,
      visitCount: p.visitCount || 1,
      firstVisitedAtISO: p.firstVisitedAtISO,
      lastVisitedAtISO: p.lastVisitedAtISO,
      dwellSeconds: p.dwellSeconds || 0,
      scrollDepth: p.scrollDepth || 0,
      clickCount: (p.clicks || []).length,
      clicks: (p.clicks || []).slice(0, 10),
    })),
  };
}
