"""How this site was built. Figma node 18:180."""
from pages._info import *

SETUP = ('<ol class="bl2-setup">' + "".join(
    f'<li><span class="bl2-setup__ico">{ICON[ic]}</span><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></li>' for ic, t, p in [
        ("figma", "01 · Design in Figma", "Structure, spacing, hierarchy and visual direction."),
        ("asterisk", "02 · Build with Claude Code", "Turn the design into a working site, and iterate in the browser."),
        ("branch", "03 · Review, then upload", "Review, fix what doesn’t work, then commit and publish to GitHub Pages.")]) + '</ol>')

def pair(before, after, title, text, alt_b, alt_a):
    return f'''<div class="bl2-pair">
      <div class="bl2-pair__col"><span class="bl2-tag bl2-tag--draft">AI draft</span><div class="c2-frame bl2-pair__shot"><img src="{before}" alt="{esc(alt_b)}" width="1440" height="900" loading="lazy" /></div></div>
      <div class="bl2-pair__col"><span class="bl2-tag bl2-tag--final">Final</span><div class="c2-frame bl2-pair__shot"><img src="{after}" alt="{esc(alt_a)}" width="1440" height="900" loading="lazy" /></div></div>
      <div class="bl2-pair__note"><h3 class="c2-h3">{title}</h3><p class="c2-p">{text}</p></div>
    </div>'''

PAIRS = (pair("assets/compare/home-before.webp", "assets/compare/home-after.webp", "Homepage",
              "The first pass had the structure. I refined the typography, spacing and visual rhythm to make it feel like my portfolio.",
              "The first home page Claude built: plain text wordmark, no theme switch, a hero that said less.", "The shipped home page with the pendant mark, the inspector and the Figma v2 layout.")
         + pair("assets/compare/404-before.webp", "assets/compare/404-after.webp", "404 page",
                "The first direction was functional. I simplified the composition and brought it back into the visual language of the site.",
                "Claude’s first 404: a sensible card with a button.", "The shipped 404 with Sunny standing in as the zero under the pendant’s light.")
         + f'<p class="bl2-info">{ICON["info"]} Both pairs are real commits from the same repository, before and after. The case-study pages aren’t shown here because the AI drafts for them were never saved as images.</p>')

TIMELINE = '<ol class="bl2-timeline">' + "".join(
    f'<li><span class="bl2-timeline__d">{esc(d)}</span><span class="bl2-timeline__dot" aria-hidden="true"></span><div><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div></li>' for d, t, p in [
        ("Nov 13", "First upload", "The site goes live on GitHub Pages with a custom domain. HTML, CSS and JavaScript, no framework, no build step."),
        ("Nov 14", "Sunny learns to act", "The mascot gets its acts, emotions and synthesised sound cues, and starts greeting visitors."),
        ("Nov 15", "Seven case studies", "Reports, Brand configuration, Outbound and Feedback join Zobot, then the design system and the Operator Console."),
        ("Nov 16", "The pendant mark", "The lamp becomes the logo and favicon, the Figma v2 page is applied, and the theme switch moves to the new pill."),
        ("Nov 17–18", "Review pass", "Accessibility fixes, a WebP gallery with a lightbox, the resume PDF, and the component inspector with Figma counterparts."),
        ("Nov 19", "The interactive layer", "Career map, hiring page and printable resume, keyboard shortcuts, Sunny’s reactions, a collage gallery, the 404 and more.")]) + '</ol>'

SUNNY_MINI = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 10c1-3-1.5-4-.5-7" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16.5" cy="5.5" rx="3" ry="1.6" transform="rotate(-24 16.5 5.5)" fill="#FFC93C" stroke="#111" stroke-width="1.2"/><circle cx="20" cy="23" r="15" fill="#FFC93C" stroke="#111" stroke-width="2"/><ellipse cx="14.5" cy="22" rx="2.3" ry="3" fill="#111"/><ellipse cx="25.5" cy="22" rx="2.3" ry="3" fill="#111"/><circle cx="15.3" cy="20.8" r="0.9" fill="#fff"/><circle cx="26.3" cy="20.8" r="0.9" fill="#fff"/><path d="M16 28q4 3.5 8 0" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/></svg>'

BOX = '<div class="bl2-box">' + "".join(
    f'<div><span class="bl2-box__ico">{ic}</span><h3>{t}</h3><p class="c2-p">{p}</p>{link_arrow("Explore", href)}</div>' for ic, t, p, href in [
        (SUNNY_MINI, "Sunny", "An SVG mascot with screen emotions and a dozen acts, built from a Figma frame.", "index.html#ai"),
        (ICON["layers"], "Component inspector", "Press I on the home page. Hover any layer to see its tokens, then click to pin it and see the Figma counterpart.", "index.html#hey"),
        (ICON["code"], "Build, replayed", "The prompt-to-component loop, now the fourth step of how I work, with an animated scene for each step.", "index.html#process")]) + '</div>'

SECTIONS = [
    isec("01", "The setup", "Three tools, one loop.", SETUP),
    isec("02", "AI draft, my final", "Left is Claude’s first pass, right is what shipped.", PAIRS),
    isec("03", "The timeline", "From the first upload to today, by day.", TIMELINE),
    isec("04", "What is in the box", "The parts that took the most rounds.", BOX),
    cta("Curious about the code?", "It’s all in the page source: no bundler, no framework. View source on any page, or ask Sunny.", "Email me", f"mailto:{MAIL}?subject=About%20the%20site"),
]

PAGE = dict(
    file="how-this-site-was-built.html",
    title="How this site was built · Ganeshkumar B",
    description="Designed in Figma, built with Claude in plain HTML, CSS and JavaScript. The setup, the AI drafts next to the finals, and the build timeline.",
    og="assets/og-image.png",
    nav=nav("how-this-site-was-built.html"),
    hero=hero("Site", "Build log", "How this site was built", "Designed in Figma, built with Claude in plain HTML, CSS and JavaScript, reviewed by me every round.",
              [("Stack", "HTML, CSS, JavaScript, no framework"), ("Built with", "Figma, Figma MCP, Claude Code"), ("Hosted on", "GitHub Pages"), ("Since", "13 November 2026")]),
    sections=SECTIONS,
    next=dict(label="Next", title="How I use AI", href="how-i-use-ai.html"),
    back_label="Back to the site", back_href="index.html",
)
