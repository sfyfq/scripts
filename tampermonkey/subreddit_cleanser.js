// ==UserScript==
// @name         Reddit Filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Remove posts from specific subreddits on reddit.com
// @match        https://reddit.com/*
// @match        https://www.reddit.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const BLOCKED_SUBREDDITS = [
    'whatisit',
    'AmItheAsshole',
    'AskReddit',
    'TopCharacterTropes',
    'whenthe',
    'popculturechat',
    'PeterExplainsTheJoke',
    'SipsTea',
    'HistoryMemes',
    'comics',
    'antiwork',
  ];

  function getBlockList() {
    return GM_getValue('blockList', BLOCKED_SUBREDDITS);
  }

  function addToBlockList(subreddit) {
    const list = getBlockList();
    if (!list.map(s => s.toLowerCase).includes(subreddit.toLowerCase())) {
      list.push(subreddit);
      GM_setValue('blockList', list);
    }
  }


  function getSubRedditFromPost(em) {
    const post = em.closest('[data-subreddit], shreddit-post');
    if (!post) {
      return null;
    }

    return post.getAttribute('subreddit-prefixed-name')?.replace('r/', '') || post.getAttribute('data-subreddit') || null;
  }

  function removePostsAndAds() {
    // Works for both old and new Reddit layouts
    const posts = document.querySelectorAll('[data-subreddit], shreddit-post');

    posts.forEach(post => {
      // New Reddit
      const sub = post.getAttribute('subreddit-prefixed-name')?.replace('r/', '')
        || post.getAttribute('data-subreddit');

      if (sub && BLOCKED_SUBREDDITS.map(s => s.toLowerCase()).includes(sub.toLowerCase())) {
        post.remove();
        console.log(`post from ${sub} was removed`);
      }
    });

    const ads = document.querySelectorAll('shreddit-ad-post');
    ads.forEach(ad => {
      ad.remove();
      console.log(`removed an ad`);
    })
  }

  // --- Context menu ---
  const menu = document.createElement('div');
  menu.id = 'tm-context-menu';
  Object.assign(menu.style, {
    position: 'fixed',
    zIndex: '999999',
    background: '#1a1a1b',
    border: '1px solid #343536',
    borderRadius: '4px',
    padding: '4px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    display: 'none',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    minWidth: '200px',
  });
  document.body.appendChild(menu);

  function showMenu(x, y, subreddit) {
    menu.innerHTML = '';

    // Label
    const label = document.createElement('div');
    Object.assign(label.style, {
      padding: '6px 16px',
      color: '#818384',
      fontSize: '12px',
    });
    label.textContent = `r/${subreddit}`;
    menu.appendChild(label);

    // Divider
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      borderTop: '1px solid #343536',
      margin: '4px 0',
    });
    menu.appendChild(divider);

    // Block button
    const btn = document.createElement('div');
    Object.assign(btn.style, {
      padding: '8px 16px',
      color: '#ff4500',
      cursor: 'pointer',
    });
    btn.textContent = `🚫 Block r/${subreddit}`;
    btn.onmouseenter = () => btn.style.background = '#272729';
    btn.onmouseleave = () => btn.style.background = 'transparent';
    btn.onclick = () => {
      addToBlockList(subreddit);
      removePostsAndAds();
      hideMenu();

      // Confirmation toast
      showToast(`r/${subreddit} added to blocklist`);
    };
    menu.appendChild(btn);

    // Position and show
    menu.style.display = 'block';
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    menu.style.left = (x + menuWidth > window.innerWidth ? x - menuWidth : x) + 'px';
    menu.style.top = (y + menuHeight > window.innerHeight ? y - menuHeight : y) + 'px';
  }

  function hideMenu() {
    menu.style.display = 'none';
  }

  // --- Toast notification ---
  function showToast(message) {
    const toast = document.createElement('div');
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#ff4500',
      color: 'white',
      padding: '10px 18px',
      borderRadius: '4px',
      zIndex: '999999',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      transition: 'opacity 0.4s',
    });
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  // --- Event listeners ---
  document.addEventListener('contextmenu', (e) => {
    const subreddit = getSubRedditFromPost(e.target);
    if (subreddit) {
      e.preventDefault();
      showMenu(e.clientX, e.clientY, subreddit);
    } else {
      hideMenu();
    }
  });

  document.addEventListener('click', hideMenu);
  document.addEventListener('scroll', hideMenu);

  // --- Init ---
  removePostsAndAds();
  const observer = new MutationObserver(removePostsAndAds);
  observer.observe(document.body, { childList: true, subtree: true });

})();
