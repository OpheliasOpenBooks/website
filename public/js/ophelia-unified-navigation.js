/* Ophelia's Open Book — shared navigation for public pages.
   Keep this single list aligned with the homepage and use index.html anchors
   from inner pages. The clickable wordmark is the Home link. */
(function () {
  'use strict';
  const links = [
    ['Browse all books', 'catalog.html'],
    ['Featured books', 'index.html#books'],
    ['Magazine Library', 'magazines.html'],
    ['Music Room', 'music.html'],
    ['Braille resources', 'index.html#braille'],
    ['Our story', 'index.html#about'],
    ['Support the library ❦', 'support.html'],
    ['Get the App', 'get-the-app.html'],
    ['My Bookshelf', 'my-bookshelf.html'],
    ['Correspondence', 'correspondence.html'],
    ['Write to the Editor', 'editor-desk.html']
  ];
  const styleText = `
    header .ophelia-unified-brand {
      display:flex!important;align-items:center!important;gap:12px!important;
      flex:0 0 auto!important;color:inherit!important;text-decoration:none!important;
      font:normal 23px/1.2 Georgia,'Times New Roman',serif!important;
    }
    header .ophelia-unified-brand .ophelia-unified-seal {
      width:49px;height:49px;display:inline-flex;align-items:center;justify-content:center;
      border:1px solid #98a9a2;border-radius:50%;font:normal 22px Georgia,serif;
      flex:0 0 49px;line-height:1;
    }
    header .ophelia-unified-brand small {
      display:block!important;font:10px/1.7 Arial,sans-serif!important;
      letter-spacing:2.4px!important;margin-top:2px;
    }
    header .ophelia-unified-nav {
      display:flex!important;flex-wrap:wrap!important;align-items:center!important;
      gap:11px 19px!important;min-width:0;flex:1 1 540px!important;
      font:14px/1.55 Arial,Helvetica,sans-serif!important;
    }
    header .ophelia-unified-nav a {
      font:inherit!important;color:inherit!important;text-decoration:none!important;
      text-align:left!important;white-space:normal!important;
    }
    header .ophelia-unified-nav a:hover,
    header .ophelia-unified-nav a:focus-visible {
      text-decoration:underline!important;text-underline-offset:4px;
    }
    header .ophelia-unified-nav a[aria-current="page"] {
      text-decoration:underline!important;text-underline-offset:5px;font-weight:700!important;
    }
    header .ophelia-unified-nav .ophelia-support-link {
      color:#8b6637!important;font:italic 15px Georgia,serif!important;
    }
    header .ophelia-unified-brand:focus-visible,
    header .ophelia-unified-nav a:focus-visible {
      outline:2px solid #946e35!important;outline-offset:4px;
    }
    @media(max-width:760px){
      header .ophelia-unified-nav{flex:1 1 100%!important;gap:10px 16px!important}
      header .ophelia-unified-nav a{font-size:13px!important}
    }
  `;
  function install() {
    const header = document.querySelector('header');
    if (!header) return; // Book readers use intentionally different reading controls.
    const nav = header.querySelector('nav');
    if (!nav || nav.dataset.opheliaUnified === 'yes') return;
    const current = location.pathname.split('/').pop() || 'index.html';
    const items = document.createDocumentFragment();
    for (const [label, target] of links) {
      const anchor = document.createElement('a');
      anchor.textContent = label;
      anchor.href = current === 'index.html' && target.startsWith('index.html#') ? target.substring(10) : target;
      const targetPage = target.split('#')[0];
      if (targetPage === current && (!target.includes('#') || target.endsWith(location.hash) && location.hash)) anchor.setAttribute('aria-current', 'page');
      if (targetPage === 'support.html') anchor.className = 'ophelia-support-link';
      items.appendChild(anchor);
    }
    nav.replaceChildren(items);
    nav.classList.add('ophelia-unified-nav');
    nav.setAttribute('aria-label','Main navigation');
    nav.dataset.opheliaUnified = 'yes';
    const brand = header.querySelector('a.brand, a.wordmark');
    if (brand) {
      brand.href = 'index.html';
      brand.setAttribute('aria-label', "Ophelia’s Open Book home");
      brand.classList.add('ophelia-unified-brand');
      brand.innerHTML = '<span class="ophelia-unified-seal" aria-hidden="true">O.</span><span>Ophelia’s<small>OPEN BOOK</small></span>';
    }
    if (!document.getElementById('ophelia-unified-nav-style')) {
      const sheet = document.createElement('style');
      sheet.id = 'ophelia-unified-nav-style';
      sheet.textContent = styleText;
      document.head.appendChild(sheet);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
})();
