// ==UserScript==
// @name         Reddit - Remove Mobile App Nag
// @namespace    https://www.reddit.com/
// @version      3.0
// @description  Blocks Reddit's immediate and delayed mobile web "Open in App" bottom sheets and scroll locks.
// @match        https://www.reddit.com/*
// @match        https://sh.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const XPROMO_SELECTOR = [
    '[id*="xpromo"]',
    '[class*="xpromo"]',
    '[bundlename*="xpromo"]',
    '[data-testid*="xpromo"]',
    'xpromo-app-selector',
    'xpromo-bottom-sheet',
    'xpromo-nsfw-blocking-modal'
  ].join(',');

  const style = document.createElement('style');
  style.textContent = `${XPROMO_SELECTOR} { display: none !important; visibility: hidden !important; pointer-events: none !important; }`;
  (document.head || document.documentElement).appendChild(style);

  const isAppNagSheet = (sheet) => {
    if (sheet.matches(XPROMO_SELECTOR) || sheet.closest(XPROMO_SELECTOR) || sheet.querySelector(XPROMO_SELECTOR)) {
      return true;
    }
    const panel = sheet.shadowRoot?.querySelector('.dialog-panel');
    if (panel?.getAttribute('style')?.includes('--bottom-sheet-forced-initial-height: 332px')) {
      return true;
    }
    return /see this post in|open in app|continue in|reddit app/i.test(sheet.textContent || '');
  };

  const unlockScroll = () => {
    const hasLegitModal = Array.from(
      document.querySelectorAll('faceplate-bottom-sheet[open], faceplate-dialog[open], [role="dialog"][aria-modal="true"]')
    ).some((el) => !isAppNagSheet(el));

    if (hasLegitModal) return;

    for (const el of [document.documentElement, document.body]) {
      if (!el) continue;
      if (el.style.overflow === 'hidden') el.style.removeProperty('overflow');
      if (el.style.position === 'fixed') el.style.removeProperty('position');
      if (el.hasAttribute('inert')) el.removeAttribute('inert');
    }
  };

  const purgeNags = () => {
    for (const el of document.querySelectorAll(XPROMO_SELECTOR)) {
      el.remove();
    }

    for (const sheet of document.querySelectorAll('faceplate-bottom-sheet, faceplate-dialog, .rpl-bottom-sheet')) {
      if (isAppNagSheet(sheet)) {
        sheet.remove();
      }
    }

    unlockScroll();
  };

  const observer = new MutationObserver(purgeNags);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['open', 'style', 'class', 'id', 'inert']
  });

  window.addEventListener('DOMContentLoaded', purgeNags);
})();
