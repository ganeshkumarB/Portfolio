"""Shared bits for the four info pages (How I use AI, Prompts, How this site was built, Hire)."""
import re
from build import *
from build import _brand

MAIL = "ganesh.rayanbalu@gmail.com"

def nav(active=None, parts=False):
    """Home · Work · Hiring me? pill with the current page marked, or (parts=True) Home plus the page's own sections, as on the home page."""
    brand = _brand()
    home_on = "" if active in ("index.html#work", "hire.html") else " is-active"  # the AI pages are not in the pill: Home stays the marked link, as in the Figma
    def link(href, label, extra=""):
        on = " is-active" if href == active else ""
        cur = ' aria-current="page"' if href == active else ""
        return f'<a class="nav__link{on}" href="{href}"{cur}>{label}</a>'
    return f'''  <header class="cs-top" data-layer="Nav">
    <div class="progress" aria-hidden="true"></div>
    <div class="nav-slot">
    <nav class="nav" aria-label="Primary">
      {brand}
      <div class="nav__pill nav__pill--case{" nav__pill--parts" if parts else ""}">
        <span class="nav__indicator" aria-hidden="true"></span>
        <a class="nav__link nav__home{"" if parts else home_on}" href="index.html" title="Home"><svg class="nav__ico" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 7.5 8 2.8l5.5 4.7V13a.8.8 0 0 1-.8.8H9.6V9.6H6.4v4.2H3.3a.8.8 0 0 1-.8-.8V7.5Z"/></svg><span class="nav__txt">Home</span></a>
        <span class="nav__sep" aria-hidden="true"></span>
        {"<!--sections-->" if parts else link("index.html#work", "Work") + chr(10) + "        " + link("hire.html", "Hiring me?")}
      </div>
      <div class="nav__utils"><button class="nav__theme" id="themeToggle" type="button" aria-label="Toggle dark mode" aria-pressed="false"><span class="nav__theme-icon">☀</span></button></div>
      <a class="nav__resume" href="assets/Ganeshkumar-B-Resume.pdf" download="Ganeshkumar-B-Resume.pdf" title="Download the resume (PDF)" aria-label="Download the resume (PDF)"><span class="nav__resume-txt">Resume</span><span class="nav__resume-arrow" aria-hidden="true">↓</span></a>
    </nav>
    </div>
  </header>
'''

def hero(tag, kick, h1, side_p, meta_items, side_h3=None, mod=""):
    """Back pill, `<Tag /> · kicker`, big title with a divided side column, meta row."""
    side = (f'<h3>{side_h3}</h3>' if side_h3 else "") + f'<p>{side_p}</p>'
    return f'''  <section class="cs-hero c2-hero--info{(" " + mod) if mod else ""}" data-layer="Hero">
    <a class="c2-back" href="index.html">{ICON["back"]} Back to the site</a>
    <p class="c2-kicker c2-kicker--info">&lt;{esc(tag)} /&gt; <span>·</span> {esc(kick)}</p>
    <div class="c2-hero__grid">
      <h1 class="c2-h1">{h1}</h1>
      <div class="c2-hero__side">{side}</div>
    </div>
    {meta(meta_items)}
  </section>
'''

def cta(h3, p, label, href, ext=False):
    arrow = "↗" if ext else ICON["arrow"]
    target = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
    return f'<div class="c2-cta"><div><h3>{h3}</h3><p>{p}</p></div><a class="c2-cta__btn" href="{href}"{target}>{label} <span class="c2-cta__ico" aria-hidden="true">{arrow}</span></a></div>'

def isec(num, title, sub, body):
    """Info-page section: '01', title left, short line right-aligned."""
    return sec(num, title, sub, body, head_mod="c2-sec__head--right")

def link_arrow(label, href, ext=False, down=False):
    target = ' target="_blank" rel="noopener"' if href.startswith("http") else (" download" if down else "")
    return f'<a class="c2-link" href="{href}"{target}>{esc(label)} <span aria-hidden="true">{"↓" if down else "↗" if ext else "→"}</span></a>'
