// ==UserScript==
// @name         Feed Declutter (HTML-agnostic)
// @namespace    local.feed-declutter
// @version      1.0
// @description  Hides feed posts that contain show-off phrases. Finds posts by layout, not by CSS class names.
// @match        *://*.linkedin.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ---------- SETTINGS ---------- */
  const DRY_RUN = false;           // true = outline matches in red instead of hiding (use this to test)
  const USE_KEEP_OVERRIDE = true;  // true = a post that also has a KEEP word is left alone
  const MIN_POST_HEIGHT = 100;     // px, a "post" is a repeated block at least this tall
  const MIN_SIBLINGS = 3;          // how many similar blocks must sit side by side
  const MAX_POST_TEXT = 6000;      // safety: never hide a block with more text than this

  /* ---------- WORDS TO HIDE (edit freely) ---------- */
  const HIDE = [
    /(happy|excited|thrilled|delighted|pleased|proud|honou?red|humbled|glad) to (share|announce|say|be|join|start|inform|introduce|reveal)/,
    /\b(i am|i['’]m|we are|we['’]re) (so |very |truly )?(happy|excited|thrilled|proud|humbled|delighted|pleased)/,
    /humbled|grateful|gratitude|blessed|thankful/,
    /got (a|the|an) (job|offer)|got placed|accepted (the|an|my) offer|offer letter/,
    /new (job|role|position|chapter|journey|beginning|adventure)|next chapter|career (update|move)|dream (job|come true)/,
    /first day|day one|\bjoined\b|\bjoining\b|started a new|starting a new|promoted|promotion/,
    /work anniversary|birthday|milestone|celebrat|congrat/,
    /certified|certification|\bbadge|\baward|\bwinner|\branked|placement|graduat|convocation/,
    /completed (my|our|the|a|an)\b/,
    /big news|thank you (all|everyone|so much)|couldn['’]t have done|followers|impressions|went viral/,
  ];

  /* ---------- WORDS THAT SAVE A POST (edit freely) ---------- */
  const KEEP = [
    /hiring|job opening|open (position|role)|vacanc|apply (now|here|by)|how to apply|join our team|referral|walk-?in|openings/,
    /internship|fellowship|scholarship|call for (papers|applications|proposals)|applications? (are )?open|deadline|stipend/,
    /hackathon|bootcamp|phd position|postdoc|research assistant|opportunit|\bgrants?\b/,
    /arxiv|preprint|research paper|\bpapers?\b|white ?paper|doi\.org|neurips|icml|iclr|cvpr|emnlp|ieee|journal/,
    /tutorial|how to|step[- ]by[- ]step|guide to|complete guide|beginner|cheat ?sheet|walkthrough|deep dive|lecture|roadmap/,
    /free (resources|course)|handbook|open[- ]source|github/,
  ];

  const compile = list => new RegExp(list.map(r => r.source).join('|'), 'i');
  const HIDE_RE = compile(HIDE);
  const KEEP_RE = compile(KEEP);

  /* ---------- INTERNALS ---------- */
  const MARK = 'data-fd-hidden';
  const seen = new WeakSet();
  const SKIP_TAGS = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/;
  const LANDMARKS = /^(MAIN|HEADER|NAV|ASIDE|FOOTER|BODY|HTML)$/;

  const isTall = el => el.hasAttribute(MARK) || el.offsetHeight >= MIN_POST_HEIGHT;

  // Climb from a matched text node to the nearest ancestor that looks like
  // one item in a repeated list of tall blocks (i.e. a feed post).
  function findPost(start) {
    let el = start;
    while (el && !LANDMARKS.test(el.tagName)) {
      const parent = el.parentElement;
      if (!parent) return null;
      if (isTall(el)) {
        let similar = 0;
        for (const sib of parent.children) {
          if (sib.tagName === el.tagName && isTall(sib)) similar++;
        }
        if (similar >= MIN_SIBLINGS && similar >= parent.children.length * 0.6) return el;
      }
      el = parent;
    }
    return null;
  }

  function hide(el) {
    el.setAttribute(MARK, DRY_RUN ? 'dry' : '1');
    if (DRY_RUN) {
      el.style.outline = '3px solid red';
    } else {
      el.style.setProperty('display', 'none', 'important');
    }
  }

  function scan(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (seen.has(n)) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || SKIP_TAGS.test(p.tagName) || p.closest('[' + MARK + ']')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.length < 4 || !HIDE_RE.test(node.nodeValue)) {
        seen.add(node);
        continue;
      }
      const post = findPost(node.parentElement);
      if (!post) continue; // layout not ready yet, retry on the next scan
      seen.add(node);
      const text = post.innerText || '';
      if (text.length > MAX_POST_TEXT) continue;
      if (USE_KEEP_OVERRIDE && KEEP_RE.test(text)) continue;
      hide(post);
    }
  }

  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => scan(document.body), 300);
  }).observe(document.body, { childList: true, subtree: true });

  scan(document.body);
})();
