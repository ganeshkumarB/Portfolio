#!/usr/bin/env python3
"""Builds the case-study and info pages from tools/pages/*.py and cs2.css from tools/css/*.css.

    python3 tools/build.py            # write every page and cs2.css
    python3 tools/build.py zobot hire # only these

Each page module exports PAGE = dict(file=..., title=..., description=..., og=..., kind="case"|"info",
nav=dict(...), hero=..., sections=[html...], after=html, next=dict(label, title, href)).
Content HTML is written by the modules with the helpers below, so the page language stays in one place.
"""
import html as H, importlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
VER = "20261309"

# ---------------------------------------------------------------- small helpers
def esc(s): return H.escape(str(s), quote=False)

def kicker(main, small=None):
    return f'<p class="c2-kicker">{esc(main)}' + (f'<small>{esc(small)}</small>' if small else "") + '</p>'

def meta(items, cols=None):
    cls = "c2-meta" + (" c2-meta--6" if len(items) == 6 else "")
    style = f' style="--cols:{cols}"' if cols else ""
    return f'<dl class="{cls}"{style}>' + "".join(f'<div><dt>{esc(k)}</dt><dd>{v}</dd></div>' for k, v in items) + '</dl>'

def sec_id(num, id_=None):
    """'01 / Context' -> 'part-01', so Sunny's section sense keeps working on the new pages."""
    if id_: return id_
    m = re.match(r"\s*(\d+)", str(num))
    return f"part-{int(m.group(1)):02d}" if m else re.sub(r"[^a-z0-9]+", "-", str(num).lower()).strip("-")

def sec(num, title, sub=None, body="", head_mod="", band=False, id_=None):
    """A numbered section: '01 / Context', an h2, an optional lede on the right, then body html."""
    headcls = "c2-sec__head" + (" c2-sec__head--solo" if not sub else "") + (f" {head_mod}" if head_mod else "")
    head = f'<div class="{headcls}"><p class="c2-num">{esc(num)}</p>' + (f'<h2 class="c2-h2">{title}</h2>' if title else "") + (f'<p class="c2-sub">{sub}</p>' if sub else "") + '</div>'
    idattr = f' id="{sec_id(num, id_)}"'
    inner = head + body
    if band:
        return f'<section class="c2-sec cs-section"{idattr}><div class="c2-band c2-sec">{inner}</div></section>'
    return f'<section class="c2-sec cs-section"{idattr}>{inner}</section>'

def cols(items, n=3, icons=None):
    """Ruled columns. items: list of (label_or_None, title, text)."""
    out = []
    for i, (lbl, t, p) in enumerate(items):
        ico = f'<span class="c2-ico">{icons[i]}</span>' if icons else ""
        out.append(f'<div>{ico}' + (f'<span class="c2-lbl c2-lbl--11">{esc(lbl)}</span>' if lbl else "") + f'<h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>')
    return f'<div class="c2-cols" style="--n:{n}">' + "".join(out) + '</div>'

def decisions(items):
    return '<div class="c2-decisions" style="--n:%d">' % len(items) + "".join(
        f'<div><b class="c2-big">{i + 1:02d}</b><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>' for i, (t, p) in enumerate(items)) + '</div>'

def card(title, text, lbl=None, fig=None, mod="", chosen=False, ico=None):
    return (f'<div class="c2-card{(" " + mod) if mod else ""}">' + (f'<div class="c2-chosen" aria-hidden="true">✓</div>' if chosen else "")
            + (f'<div class="c2-card__fig">{fig}</div>' if fig else "") + (ico or "")
            + (f'<span class="c2-lbl">{esc(lbl)}</span>' if lbl else "") + f'<h3 class="c2-h3">{title}</h3><p class="c2-p">{text}</p></div>')

def grid(cards, n=3, mod=""):
    return f'<div class="c2-grid{(" " + mod) if mod else ""}" style="--n:{n}">' + "".join(cards) + '</div>'

def flow(cards): return f'<div class="c2-flow" style="--n:{len(cards)}">' + "".join(cards) + '</div>'

def steps(items, dot="", loose=False):
    """Numbered list beside a visual. items: (title, text)."""
    return f'<ol class="c2-steps{" c2-steps--loose" if loose else ""}">' + "".join(
        f'<li><span class="c2-dot{(" " + dot) if dot else ""}">{i + 1 if dot == "" else f"{i + 1:02d}"}</span><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></li>' for i, (t, p) in enumerate(items)) + '</ol>'

def row_steps(items, dot="", numbered=True):
    return f'<div class="c2-row-steps" style="--n:{len(items)}">' + "".join(
        f'<div><span class="c2-dot{(" " + dot) if dot else ""}">{(f"{i + 1:02d}" if dot != "c2-dot--ink" else i + 1)}</span><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>' for i, (t, p) in enumerate(items)) + '</div>'

def split(vis, right, rev=False, half=False):
    cls = "c2-split" + (" c2-split--rev" if rev else "") + (" c2-split--half" if half else "")
    return f'<div class="{cls}"><div class="c2-split__vis">{vis}</div><div>{right}</div></div>'

def principle(label, quote): return f'<div class="c2-principle"><span class="c2-lbl">{esc(label)}</span><p>{quote}</p></div>'
def quote(q, text): return f'<div class="c2-quote"><p>{q}</p><p>{text}</p></div>'
def reflect(q, paras):
    return f'<div class="c2-reflect"><p>{q}</p><div>' + "".join(f'<p class="c2-sub">{p}</p>' for p in paras) + '</div></div>'

def outcome(num, title, items, tint=False):
    cls = "c2-outcome" + (" c2-outcome--tint" if tint else "")
    return (f'<section class="c2-sec cs-section" id="{sec_id(num)}"><div class="{cls}"><div><p class="c2-num">{esc(num)}</p><h2>{title}</h2></div><div class="c2-outcome__cols">'
            + "".join(f'<div>{(f"<i>{ic}</i>" if ic else "")}<b>{b}</b><span>{s}</span></div>' for ic, b, s in items) + '</div></div></section>')

def timeline(items, foot=None):
    return '<div class="c2-timeline">' + "".join(f'<div><span class="c2-year">{esc(y)}</span><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>' for y, t, p in items) + '</div>' + (f'<p class="c2-foot">{foot}</p>' if foot else "")

def cap(text): return f'<p class="c2-cap">{text}</p>'
def pill(text, mod=""): return f'<span class="c2-pill{(" " + mod) if mod else ""}">{esc(text)}</span>'
def ul(items, mod=""): return f'<ul class="c2-list{(" " + mod) if mod else ""}">' + "".join(f'<li>{i}</li>' for i in items) + '</ul>'

def public(title, tiles, source):
    return ('<section class="cs-public" data-layer="Public context"><span class="c2-lbl c2-lbl--11">In the shipped product · From public Zoho documentation</span>'
            f'<h2>{esc(title)}</h2>' + grid([card(t, p) for t, p in tiles], 4) + f'<span class="c2-lbl">{esc(source)}</span></section>')

ICON = {  # 24px stroke icons, currentColor
    "target": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
    "diamond": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l9 9-9 9-9-9z"/></svg>',
    "bolt": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    "layers": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>',
    "bars": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 20V10M10 20V4M15 20v-7M20 20v-3"/></svg>',
    "trend": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    "donut": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5" stroke-linecap="round"/></svg>',
    "table": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 10v9M15 10v9"/></svg>',
    "code": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
    "chat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    "users": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5.5"/></svg>',
    "calendar": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    "megaphone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 10v4l11 4V6z"/><path d="M14 8a4 4 0 0 1 0 8M6 14v5h3v-4" stroke-linecap="round"/></svg>',
    "doc": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6" stroke-linecap="round"/></svg>',
    "pen": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3"/></svg>',
    "linkedin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
    "box": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
    "figma": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 3h3v6H9a3 3 0 0 1 0-6zM12 3h3a3 3 0 0 1 0 6h-3zM9 9h3v6H9a3 3 0 0 1 0-6zM12 12a3 3 0 1 1 3 3 3 3 0 0 1-3-3zM9 15h3v3a3 3 0 1 1-3-3z"/></svg>',
    "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    "branch": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-10 6"/></svg>',
    "asterisk": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/></svg>',
    "info": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>',
    "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "back": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    "copy": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg>',
    "download": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M4 20h16"/></svg>',
}

# ---------------------------------------------------------------- shell
def _brand():
    src = (ROOT / "case-zobot.html").read_text()
    m = re.search(r'<a class="nav__brand mono".*?</a>', src, re.S)
    return m.group(0)

def nav_case(num, total, prev_href, prev_label, next_href, next_label):
    prev = (f'<a class="nav__link nav__dir nav__dir--prev" href="{prev_href}" title="Previous: {esc(prev_label)}" aria-label="Previous: {esc(prev_label)}"><span class="nav__arrow" aria-hidden="true">←</span><span class="nav__txt">{esc(prev_label)}</span></a>'
            if prev_href != "index.html#work" else '<a class="nav__link nav__dir nav__dir--prev" href="index.html#work" title="Back to all work" aria-label="Back to all work"><span class="nav__arrow" aria-hidden="true">←</span><span class="nav__txt">All work</span></a>')
    nxt = f'<a class="nav__link nav__dir nav__dir--next" href="{next_href}" title="Next: {esc(next_label)}" aria-label="Next: {esc(next_label)}"><span class="nav__txt">{esc(next_label)}</span><span class="nav__arrow" aria-hidden="true">→</span></a>'
    return f'''  <header class="cs-top" data-layer="Nav">
    <div class="progress" aria-hidden="true"></div>
    <div class="nav-slot">
    <nav class="nav nav--rail" aria-label="Primary">
      {_brand()}
      <div class="nav__pill nav__pill--case nav__pill--parts">
        <span class="nav__indicator" aria-hidden="true"></span>
        <a class="nav__link nav__home" href="index.html" title="Home"><svg class="nav__ico" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 7.5 8 2.8l5.5 4.7V13a.8.8 0 0 1-.8.8H9.6V9.6H6.4v4.2H3.3a.8.8 0 0 1-.8-.8V7.5Z"/></svg><span class="nav__txt">Home</span></a>
        <span class="nav__sep" aria-hidden="true"></span>
        <!--sections-->
        <span class="nav__sep" aria-hidden="true"></span>
        {prev}
        <a class="nav__case mono" href="index.html#work" title="All work">{num:02d} / {total:02d}</a>
        {nxt}
      </div>
      <div class="nav__utils"><button class="nav__theme" id="themeToggle" type="button" aria-label="Toggle dark mode" aria-pressed="false"><span class="nav__theme-icon">☀</span></button></div>
      <a class="nav__resume" href="assets/Ganeshkumar-B-Resume.pdf" download="Ganeshkumar-B-Resume.pdf" title="Download the resume (PDF)" aria-label="Download the resume (PDF)"><span class="nav__resume-txt">Resume</span><span class="nav__resume-arrow" aria-hidden="true">↓</span></a>
    </nav>
    </div>
  </header>
'''

def nav_info(active):
    src = (ROOT / "hire.html").read_text()
    m = re.search(r'  <header class="cs-top".*?</header>\n', src, re.S)
    nav = m.group(0)
    # mark the current page in the pill
    nav = re.sub(r' is-active', '', nav)
    nav = nav.replace(f'href="{active}"', f'href="{active}" aria-current="page"')
    return nav

def head(p):
    desc = esc(p["description"])
    title = esc(p["title"])
    og = p.get("og", "assets/og/site.png")
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ganeshuxcraft.in" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="https://ganeshuxcraft.in/{p["file"]}" />
  <meta property="og:image" content="https://ganeshuxcraft.in/{og}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://ganeshuxcraft.in/{og}" />
  <meta name="theme-color" content="#111111" />
  <link rel="preload" href="assets/fonts/space-grotesk-300-700-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="assets/fonts/inter-400-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="assets/fonts/fonts.css?v={VER}" media="print" onload="this.media='all'" /><noscript><link rel="stylesheet" href="assets/fonts/fonts.css?v={VER}" /></noscript>
  <link rel="stylesheet" href="styles.css?v={VER}" />
  <link rel="icon" href="/assets/favicon-96.png" sizes="96x96" type="image/png" />
  <link rel="icon" href="/assets/favicon-48.png" sizes="48x48" type="image/png" />
  <link rel="icon" href="/favicon.ico" sizes="48x48 32x32 16x16" type="image/x-icon" />
  <link rel="icon" href="/assets/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
  <link rel="manifest" href="site.webmanifest" />
  <link rel="stylesheet" href="case.css?v={VER}" />
  {p.get("extra_css", "")}
  <link rel="stylesheet" href="cs2.css?v={VER}" />
  <link rel="stylesheet" href="sunny.css?v={VER}" media="print" onload="this.media='all'" /><noscript><link rel="stylesheet" href="sunny.css?v={VER}" /></noscript>
</head>
<body class="is-ready cs-page c2-page">
  <script src="sunny-loader.js?v={VER}"></script>
'''

def footer(nxt, back_label="All work", back_href="index.html#work"):
    return f'''  <footer class="cs-next" data-layer="Next">
    <div class="cs-next__inner">
      <div class="cs-next__main">
        <span class="cs-next__lbl">{esc(nxt["label"])}</span>
        <a class="cs-next__title{" cs-next__title--long" if len(nxt["title"]) > 26 else ""}" href="{nxt["href"]}">{esc(nxt["title"])}<span class="cs-next__arrow" aria-hidden="true">→</span></a>
      </div>
      <a class="cs-next__all" href="{back_href}"><span aria-hidden="true">←</span> {esc(back_label)}</a>
    </div>
  </footer>

  <script src="prefs.js?v={VER}"></script>
  <script src="case.js?v={VER}"></script>
  <script src="sunny.js?v={VER}"></script>
  <script src="sunny-config.js?v={VER}"></script>
  <script src="ai/knowledge.js?v={VER}"></script>
  <script src="sunny-ai.js?v={VER}"></script>
{p_extra_js()}</body>
</html>
'''

_EXTRA_JS = []
def p_extra_js(): return "".join(_EXTRA_JS)

def number_sections(html_):
    """Every top-level content section gets `cs-section` and a stable part-NN id (from its number line, else its order),
    so Sunny's section sense and deep links work on pages whose modules used their own wrappers."""
    n = [0]
    def fix(m):
        n[0] += 1
        tag = m.group(0)
        if ' id="' in tag: return tag if "cs-section" in tag else tag.replace('class="c2-sec', 'class="c2-sec cs-section', 1)
        tag = tag.replace('class="c2-sec', 'class="c2-sec cs-section', 1)
        return tag[:-1] + f' id="part-{n[0]:02d}">'
    return re.sub(r'<section class="c2-sec[^"]*"(?: id="[^"]*")?>', fix, html_)

# short names for the header pill, where the section's own label is too long for a row of eight
NAV_SHORT = {
    "The problem": "Problem", "The design challenge": "Challenge", "The approach": "Approach", "The experience": "Experience",
    "Key design decisions": "Decisions", "Design principles": "Principles", "The outcome": "Outcome", "The transformation": "Transformation",
    "Chat window customisation": "Customisation", "The decisions": "Decisions", "The takeaway": "Takeaway", "The solution": "Solution",
    "The challenge": "Challenge", "The new experience": "Experience", "The reframing": "Reframing", "The opportunity": "Opportunity",
    "Two ways to reach out": "Two ways", "Proactive messages": "Proactive", "The core decisions": "Decisions",
    "From message to conversation": "Conversation", "Design decisions": "Decisions", "Shipped, then it grew": "Shipped",
    "What AI does, what I decide": "Roles", "My workflow": "Workflow", "How I work with AI": "Practice", "AI in my design system": "Design system",
    "When AI gets it wrong": "Mistakes", "Rules I hold to": "Rules", "The prompts": "Prompts", "How to use them": "Using them",
    "The setup": "Setup", "AI draft, my final": "Draft vs final", "The timeline": "Timeline", "What is in the box": "In the box",
}

def section_links(content):
    """One pill link per content section, labelled from its number line ('03 / Exploration') or, failing that, its heading."""
    links = []
    for m in re.finditer(r'<section class="c2-sec cs-section[^"]*" id="(part-\d\d)">(.*?)(?=<section class="c2-sec|\Z)', content, re.S):
        pid, body = m.group(1), m.group(2)
        num = re.search(r'<p class="c2-num">(.*?)</p>', body)
        h2 = re.search(r'<h2[^>]*>(.*?)</h2>', body, re.S)
        label = ""
        if num and "/" in num.group(1): label = num.group(1).split("/", 1)[1].strip()
        elif h2: label = re.sub(r"<[^>]+>", "", h2.group(1)).strip()
        if not label: continue
        label = NAV_SHORT.get(label, label[4:] if label.startswith("The ") else label)
        links.append(f'<a class="nav__link nav__part" href="#{pid}"><span>{esc(label)}</span></a>')
    return links

def render(p):
    _EXTRA_JS.clear(); _EXTRA_JS.extend(p.get("extra_js", []))
    content = number_sections("\n".join(p["sections"]))
    nav = p["nav"]
    if "<!--sections-->" in nav:
        links = section_links(content)
        nav = nav.replace("<!--sections-->", "\n        ".join(links))
        if len(links) > 7: nav = nav.replace('class="nav__pill nav__pill--case nav__pill--parts"', 'class="nav__pill nav__pill--case nav__pill--parts nav__pill--dense"')
    out = head(p)
    out += nav
    out += p["hero"]
    for s in p.get("pre", []): out += s
    out += '  <main class="cs-content" data-layer="Content">\n' + content + '\n  </main>\n'
    out += p.get("after", "")
    out += footer(p["next"], p.get("back_label", "All work"), p.get("back_href", "index.html#work"))
    return out

def build_css():
    parts = sorted((ROOT / "tools" / "css").glob("*.css"))
    (ROOT / "cs2.css").write_text("\n\n".join(x.read_text().rstrip() + "\n" for x in parts))
    return len(parts)

def main(names):
    sys.path.insert(0, str(ROOT / "tools"))
    n = build_css()
    mods = names or [x.stem for x in sorted((ROOT / "tools" / "pages").glob("*.py")) if not x.stem.startswith("_")]
    for name in mods:
        mod = importlib.import_module(f"pages.{name}")
        page = mod.PAGE
        (ROOT / page["file"]).write_text(render(page))
        print("wrote", page["file"])
    print(f"cs2.css from {n} parts")

if __name__ == "__main__":
    main(sys.argv[1:])
