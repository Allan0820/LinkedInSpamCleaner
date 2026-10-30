# LinkedInSpamCleaner

A userscript that hides LinkedIn posts that add no signal ("thrilled to announce", "humbled and grateful", "new chapter", certificates, badges) and keeps the ones that do: hiring posts, opportunities, research papers, tutorials.

It does not rely on LinkedIn's CSS class names, which change often. It reads the post text, finds the repeated block that holds the post, and hides only that block.

Written with Claude. Runs entirely in your browser. It makes no network requests and collects nothing.

---

## What it hides and keeps

**Hides** posts containing phrases like:
- "happy / excited / thrilled to share / announce"
- "humbled", "grateful", "blessed", "thankful"
- "got a job", "new role", "new chapter", "first day", "promoted"
- "certified", "certification", "badge", "award", "graduated"
- "milestone", "celebrating", "congrats", "followers", "impressions"

**Keeps** a post, even if it contains a hide phrase, when it also contains words like:
- hiring, openings, apply, referral, internship, fellowship, scholarship, call for papers
- arXiv, preprint, research paper, journal, NeurIPS, ICML, IEEE
- tutorial, how to, step-by-step, guide, cheat sheet, roadmap, open source, GitHub

Both word lists are at the top of the script and are easy to edit.

---

## Setup

You need a userscript manager. Pick your browser:

### Chrome

1. Install **Tampermonkey** from the Chrome Web Store.
2. Right-click the Tampermonkey icon, choose **Manage Extension**, and switch on **Allow User Scripts**. On Chrome versions older than 138, turn on **Developer mode** at `chrome://extensions` instead.
3. Click the Tampermonkey icon and choose **Create a new script**.
4. Delete the template, paste the full contents of `feed-declutter.user.js` (including the `// ==UserScript==` header), and save with Ctrl+S (Cmd+S on Mac).
5. Hard-refresh LinkedIn (Ctrl+Shift+R).

### Firefox

1. Install **Tampermonkey** or **Violentmonkey** from Firefox Add-ons.
2. Click the extension icon and choose **Create a new script**.
3. Delete the template, paste the full contents of `feed-declutter.user.js`, and save.
4. Hard-refresh LinkedIn.

### Safari (Mac)

1. Install **Userscripts** from the Mac App Store (needs macOS 12+ and Safari 14.1+).
2. Open Safari → Settings → Extensions and tick **Userscripts**.
3. On linkedin.com, click the Userscripts icon in the toolbar and allow it to run on the site.
4. Click the icon again, choose **Open Extension Page**, and add a new script. Paste the full contents of `feed-declutter.user.js` and save. Alternatively, copy the `.user.js` file into the Userscripts folder.
5. Refresh LinkedIn.

### Safari (iPhone / iPad)

1. Install **Userscripts** from the App Store (needs iOS 15.1+).
2. Go to Settings → Apps → Safari → Extensions (on iOS 17 and older: Settings → Safari → Extensions). Enable Userscripts and allow it on other sites.
3. Save `feed-declutter.user.js` into the Userscripts folder (for example from the Files app), then refresh LinkedIn.

---

## Test before you trust it

1. In the script, change `const DRY_RUN = false;` to `true` and save.
2. Hard-refresh LinkedIn and scroll.
3. Matching posts get a **red outline** instead of disappearing. Check that each outline wraps one whole post and nothing else.
4. Set `DRY_RUN` back to `false` and save.

---

## Settings

All at the top of the script.

| Setting | Default | What it does |
|---|---|---|
| `DRY_RUN` | `false` | `true` outlines matches in red instead of hiding them |
| `USE_KEEP_OVERRIDE` | `true` | A post that also has a keep word is left alone. Set `false` for strictly "hide phrase means hidden" |
| `MIN_POST_HEIGHT` | `100` | Minimum height in px for a block to count as a post |
| `MIN_SIBLINGS` | `3` | How many similar blocks must sit side by side to count as a feed |
| `MAX_POST_TEXT` | `6000` | Safety cap: never hide a block with more text than this |

---

## Customising the word lists

The `HIDE` and `KEEP` lists are arrays of regular expressions. Add or remove entries freely.

```js
/humbled|grateful|gratitude/,   // hide posts with any of these words
/tutorial|how to|arxiv/,        // keep posts with any of these words
```

Matching is case-insensitive.

---

## Troubleshooting

**Nothing happens.**
- Chrome: check that **Allow User Scripts** is still on for Tampermonkey.
- Safari: check that Userscripts is allowed on linkedin.com.
- Click the manager's icon while on LinkedIn. The script should be listed as running.
- Restart the browser once.

**Red outlines wrap a section of a post, not the whole post, or nothing is found.**
Lower `MIN_SIBLINGS` to `2`, or lower `MIN_POST_HEIGHT` to `80`, then refresh.

**All of one person's posts disappear.**
The match runs on the whole post, including the author's headline. A headline like "AWS Certified Architect" can trigger it. Remove `certified`, `award` or `joined` from the `HIDE` list.

**A useful post got hidden.**
Add one of its distinctive words to the `KEEP` list.

**A show-off post got through.**
Add its phrase to the `HIDE` list. Check that it doesn't also contain a keep word, since keep words win.

---

## Known limits

- It is a layout heuristic, not a fixed selector. It should survive markup changes, but it may need tuning on a given day or layout.
- A phrase split across separate text elements may not match.
- The keep words "opportunity" and "papers" are broad and can let some show-off posts through.
- It only runs on `linkedin.com`. To use it elsewhere, change the `@match` line in the script header.

---

## Uninstall

Open your userscript manager's dashboard and disable or delete "Feed Declutter".
