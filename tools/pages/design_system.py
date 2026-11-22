"""Case 02 · Design system. Figma: ganeshuxcraft — Portfolio Design System, node 27:434."""
import pathlib
from build import *

SNIP = pathlib.Path(__file__).resolve().parent / "snippets"
IND = "#4f46e5"

# ---------------------------------------------------------------- small drawings
def btn(label, w=92, h=36, fill=IND, color="#fff", x=0, y=0, outline=None):
    st = f' stroke="{outline}" stroke-width="1.5"' if outline else ""
    return f'<g transform="translate({x} {y})"><rect width="{w}" height="{h}" rx="8" fill="{fill}"{st}/><text x="{w / 2}" y="{h / 2 + 5}" font-size="13" font-weight="600" fill="{color}" text-anchor="middle">{label}</text></g>'

def svg(w, h, body, label=""):
    return (f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{label}">'
            '<style>text{font-family:Inter,system-ui,sans-serif}</style>' + body + '</svg>')

def problem_block():
    figma = svg(300, 120, '<rect width="300" height="120" rx="12" fill="#f5f5f3"/>'
                '<text x="16" y="24" font-size="13" font-weight="600" fill="#15161a">Design (Figma)</text>'
                '<rect x="99" y="56" width="102" height="48" rx="2" fill="none" stroke="#4d8dff" stroke-width="1.5"/>'
                '<rect x="99" y="56" width="5" height="5" fill="#fff" stroke="#4d8dff"/><rect x="196" y="56" width="5" height="5" fill="#fff" stroke="#4d8dff"/><rect x="99" y="99" width="5" height="5" fill="#fff" stroke="#4d8dff"/><rect x="196" y="99" width="5" height="5" fill="#fff" stroke="#4d8dff"/>'
                + btn("Create", 86, 32, x=107, y=64) +
                '<rect x="124" y="106" width="52" height="13" rx="3" fill="#4d8dff"/><text x="150" y="115.5" font-size="9" font-weight="500" fill="#fff" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace">144 × 40</text>', "A button as designed in Figma")
    code = svg(300, 120, '<rect width="300" height="120" rx="12" fill="#f5f5f3"/>'
               '<text x="16" y="24" font-size="13" font-weight="600" fill="#15161a">Code (implementation)</text>' + btn("Create", 86, 32, x=107, y=64), "The same button as implemented in code")
    def surface(title, inner, bg="#f5f5f3"):
        return svg(190, 120, f'<rect width="190" height="120" rx="12" fill="{bg}"/><text x="14" y="22" font-size="13" font-weight="600" fill="#15161a">{title}</text>' + inner, title)
    web = surface("Web", btn("💬 Chat with us", 134, 34, x=28, y="58"))
    sdk = surface("Mobile SDK", btn("Chat", 60, 30, fill="#eef0ff", color=IND, x=65, y=60))
    wa = surface("WhatsApp", '<rect x="18" y="58" width="154" height="34" rx="8" fill="#fff"/><text x="95" y="80" font-size="12" font-weight="600" fill="#1f8a4c" text-anchor="middle">Chat on WhatsApp</text>')
    return ('<div class="dsy2-problem">'
            f'<div class="dsy2-problem__side"><div class="dsy2-problem__pair">{figma}<span aria-hidden="true">↔</span>{code}</div>'
            '<h3 class="c2-h3">Duplicated definitions</h3><p class="c2-p">The same component lived separately in design and code.</p></div>'
            f'<div class="dsy2-problem__side"><div class="dsy2-problem__trio">{web}{sdk}{wa}</div>'
            '<h3 class="c2-h3">Drift across surfaces</h3><p class="c2-p">The same action looked and behaved differently on web, mobile and WhatsApp.</p></div></div>')

def context_cards():
    web = ('<div class="c2-card dsy2-ctx"><span class="c2-lbl">Web · Chat widget</span>'
           '<div class="dsy2-widget"><b>Need help?</b><span>Chat with our team.</span><i class="dsy2-btn">💬 Chat with us</i></div></div>')
    sdk = ('<div class="c2-card dsy2-ctx"><span class="c2-lbl">Mobile SDK</span>'
           '<div class="dsy2-phone"><div class="dsy2-phone__bar"><span>9:41</span><span>▮▮ ◔</span></div><i class="dsy2-btn">💬 Chat with us</i></div></div>')
    wa = ('<div class="c2-card dsy2-ctx dsy2-ctx--wa"><span class="c2-lbl">WhatsApp</span>'
          '<div class="dsy2-wa"><p>Chat with us on WhatsApp.</p><i>◎ Continue on WhatsApp</i></div></div>')
    return grid([web, sdk, wa], 3)

def tokens_row():
    return ('<div class="dsy2-tokens">'
            '<div><span class="c2-lbl">Colour</span><div class="dsy2-swatches"><i style="background:#4f46e5"></i><i style="background:#818cf8"></i><i style="background:#c7d2fe"></i><i style="background:#eef2ff"></i></div>'
            '<code>--color-primary-600</code><code>--color-primary-500</code><code>--color-neutral-200</code></div>'
            '<div><span class="c2-lbl">Typography</span><div class="dsy2-type"><b>Aa</b><span>Inter</span></div><div class="dsy2-weights"><span style="font-weight:400">Aa<small>Regular</small></span><span style="font-weight:500">Aa<small>Medium</small></span><span style="font-weight:600">Aa<small>Semibold</small></span></div></div>'
            '<div><span class="c2-lbl">Spacing</span><div class="dsy2-space">' + "".join(f'<span><i style="width:{v * 4}px"></i><code>{v} px</code></span>' for v in (4, 8, 12, 16, 24)) + '</div></div>'
            '<div><span class="c2-lbl">Radius</span><div class="dsy2-radius">' + "".join(f'<span><i style="border-radius:{v}px"></i><code>{v} px</code></span>' for v in (2, 4, 8, 12)) + '</div></div>'
            '<div class="dsy2-tokens__themes"><div><span class="c2-lbl">Light</span><div class="dsy2-theme"><i class="dsy2-btn">Button</i></div></div><div><span class="c2-lbl">Dark</span><div class="dsy2-theme dsy2-theme--dark"><i class="dsy2-btn dsy2-btn--dark">Button</i></div></div></div>'
            '</div>')

def architecture():
    items = [("◇", "Tokens", "Primitives → Semantic → Component"), ("▦", "Components", "Built with Figma Variables"), ("&lt;/&gt;", "Code Connect", "Map components to production"),
             ("✦", "Figma MCP + Claude", "Generate the Figma library and production components"), ("➚", "Ship", "Consistent, ready to use across products")]
    return flow([card(t, p, ico=f'<span class="c2-ico-lg">{ic}</span>') for ic, t, p in items])

def anatomy_block():
    fig = svg(500, 220, '<rect width="500" height="220" rx="16" fill="#f5f5f3"/>'
              '<rect x="178" y="98" width="146" height="50" rx="2" fill="none" stroke="#4d8dff" stroke-width="1.4" stroke-dasharray="4 3"/>'
              + btn("＋ Button", 134, 40, x=184, y=103) +
              '<text x="284" y="30" font-size="12" font-weight="600" fill="#15161a">Container</text><text x="284" y="46" font-size="11" fill="#61656e">Padding, radius, state</text>'
              '<path d="M300 52v45" stroke="#ffd54a" stroke-width="2"/><circle cx="300" cy="97" r="3" fill="#ffd54a"/>'
              '<text x="90" y="104" font-size="12" font-weight="600" fill="#15161a">Leading icon</text><text x="90" y="120" font-size="11" fill="#61656e">Optional</text>'
              '<path d="M170 110h30" stroke="#ffd54a" stroke-width="2"/><circle cx="200" cy="110" r="3" fill="#ffd54a"/>'
              '<text x="300" y="184" font-size="12" font-weight="600" fill="#15161a">Label</text><text x="300" y="200" font-size="11" fill="#61656e">Typography, colour</text>'
              '<path d="M268 150v26" stroke="#ffd54a" stroke-width="2"/><circle cx="268" cy="150" r="3" fill="#ffd54a"/>', "Anatomy of a button: container, leading icon, label")
    tiles = [('Button', '<i class="dsy2-btn dsy2-btn--sm">Create</i>'), ('Input', '<span class="dsy2-input">Enter a value</span>'),
             ('Tag', '<span class="dsy2-tag">● Active</span>'), ('Alert', '<span class="dsy2-alert">ⓘ Info message</span>')]
    right = '<div class="dsy2-tiles">' + "".join(f'<div class="dsy2-tile"><span>{t}</span>{inner}</div>' for t, inner in tiles) + '</div>'
    return split(fig, right, half=True)

def implementation():
    lib = ('<div class="dsy2-lib"><span class="dsy2-lib__t">Figma library</span><div class="dsy2-lib__body"><ul><li class="is-on">◇ Button</li><li>◇ Input</li><li>◇ Tag</li></ul>'
           '<div class="dsy2-lib__sel"><i class="dsy2-btn">Create</i><i class="dsy2-btn dsy2-btn--ghost">Create</i></div></div></div>')
    code = ('<div class="dsy2-code"><div class="dsy2-code__bar"><span>&lt;/&gt; Production component</span><b>TSX</b></div>'
            '<pre>&lt;Button\n  variant="primary"\n  size="md"\n  leadingIcon="plus"\n&gt;\n  Create\n&lt;/Button&gt;</pre></div>')
    return f'<div class="dsy2-impl">{lib}{code}</div>'

def impact():
    cols3 = [("Before", "", "Components were built per surface, leading to duplication and inconsistencies."),
             ("Now", "c2-pill--now", "A unified system with shared tokens and components across web, mobile SDK and WhatsApp."),
             ("Today", "c2-pill--cream", "A connected workflow from design to code, with faster iteration and easier scaling.")]
    return '<div class="dsy2-impact">' + "".join(f'<div>{pill(t, m)}<p class="c2-p">{p}</p></div>' for t, m, p in cols3) + '</div>'

# ---------------------------------------------------------------- page
hero_vis = (SNIP / "dsx_hero.html").read_text()

HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Design infrastructure · Zoho SalesIQ", "Case study 02 / 07")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">One system. Multiple products. A connected workflow.</h1>
      <p class="c2-lede">Building a unified design system for Zoho SalesIQ, from tokens to components and from Figma to code. A single source that powers web, mobile SDK and WhatsApp surfaces in light and dark modes.</p>
    </div>
    {meta([("Role", "Design system owner"), ("Duration", "2024 – Now"), ("Tools & workflow", "Figma Variables · Code Connect · Claude + Figma MCP"), ("Scope", "26+ reusable components"), ("Surfaces", "Web · Mobile SDK · WhatsApp"), ("Themes", "Light · Dark")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The design system site, rendered live from its own CSS">
    <div class="c2-visual dsy2-stage">
{hero_vis}
    </div>
    {cap("The system’s own components rendered with sample content, in light and dark.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. Product screens are recreated with sample data; components, tokens and code come from the system itself. Internal metrics and customer details are left out.</p></div>
  </section>
'''

SECTIONS = [
    sec("01 / The problem", "The gap between Figma and code.",
        "Components were being defined and rebuilt in multiple places, leading to inconsistencies across design, code and product surfaces.",
        problem_block()),
    sec("02 / Context", "One button, every surface.",
        "A single chat action, adapted for different contexts, but consistent in structure, behaviour and brand.",
        context_cards()),
    sec("03 / Foundations", "Tokens first.",
        "A token system that brings order to colour, typography, spacing and more, with a clear hierarchy from primitives to semantic tokens to component tokens.",
        tokens_row()),
    sec("04 / Architecture", "Figma to code without the gap.",
        "A connected workflow that takes design decisions from tokens to production, with AI-assisted implementation.",
        architecture()),
    sec("05 / The solution", "26+ components on top.",
        "A reusable component library built on a consistent anatomy, interaction patterns and token-driven styling.",
        anatomy_block()),
    sec("06 / Implementation", "Designed once, generated twice.",
        "The same component definition produces both a Figma library for design and a production-ready component for engineering.",
        implementation()),
    sec("07 / Impact", "Shipped on three surfaces, from one source.",
        "A single system now powers multiple product surfaces with greater consistency, faster delivery and easier maintenance.",
        impact()),
    sec("08 / Reflection", "", None,
        '<div class="dsy2-reflect">' + reflect("One source of truth.<br>Zero drift.", ["The system is only as good as the gap between Figma and code. My job is to keep that gap at zero."]).replace('class="c2-sub"', 'class="c2-sub dsy2-reflect-p"') + '</div>'),
]

PAGE = dict(
    file="case-design-system.html",
    title="Design system · One system. Multiple products. A connected workflow. · Case study 02 · Ganeshkumar B",
    description="Building a unified design system that connects foundations, components, and code across Zoho SalesIQ, bringing consistency, speed, and collaboration to product design and development.",
    og="assets/og/case-design-system.png",
    extra_css=f'<link rel="stylesheet" href="ds-system.css?v={VER}" />',
    nav=nav_case(2, 7, "case-zobot.html", "Zobot", "case-operator-console.html", "Operator Console"),
    hero=HERO, sections=SECTIONS,
    next=dict(label="Next case study", title="Operator Console", href="case-operator-console.html"),
)
