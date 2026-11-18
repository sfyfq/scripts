// ==UserScript==
// @name         Reddit - Disable Threadline Tap-to-Collapse
// @namespace    https://www.reddit.com/
// @version      1.1
// @description  Disables tap/click-to-collapse on .threadline-strip elements.
// @match        https://www.reddit.com/*
// @match        https://sh.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const blockThreadline = (e) => {
    const hit = e.composedPath().some(
      (el) => el instanceof Element && el.classList.contains('threadline-strip')
    );
    if (hit) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };

  for (const event of ['click', 'pointerdown', 'pointerup', 'touchend']) {
    document.addEventListener(event, blockThreadline, true);
  }
})();
