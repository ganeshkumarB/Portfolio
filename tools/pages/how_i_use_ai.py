"""How I use AI. Figma node 17:146."""
from pages._info import *

CHECK = '<svg class="ai2-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
SPARK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 15l.9 3.1L23 19l-3.1.9L19 23l-.9-3.1L15 19l3.1-.9z"/></svg>'

def check_list(items, dark=False):
    return '<ul class="ai2-checks">' + "".join(f'<li>{CHECK}{esc(i)}</li>' for i in items) + '</ul>'

SPLIT = ('<div class="ai2-split">'
         f'<div class="ai2-split__card"><h3 class="ai2-split__h">AI handles</h3>{check_list(["First drafts and alternatives", "Execution (UI, code, documentation)", "Exploration (variants, edge cases)"])}</div>'
         f'<div class="ai2-split__card ai2-split__card--dark"><h3 class="ai2-split__h">I own</h3>{check_list(["The problem and direction", "Visual and system decisions", "What ships (the final call)"])}</div>'
         '</div>')

WORKFLOW_STEPS = [("layers", "Tokens", "Define the foundation"), ("box", "Components", "Build and structure"), ("code", "Code Connect", "Map design to code"), ("figma", "Figma MCP", "Inspect and explore"), ("check", "Ship", "Review and publish")]
WORKFLOW = '<ol class="ai2-flow">' + "".join(
    f'<li{" class=is-last" if i == len(WORKFLOW_STEPS) - 1 else ""}><span class="ai2-flow__ico">{ICON[ic]}</span><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></li>' for i, (ic, t, p) in enumerate(WORKFLOW_STEPS)) + '</ol>'

LOOP = row_steps([("Context", "Define the problem and constraints."), ("Prompt", "Give clear, structured input."), ("Critique", "Review for usability, consistency and fit."), ("Refine", "Keep what works, and improve the rest.")], dot="c2-dot--ink")

EXAMPLE = '''<div class="ai2-example">
  <div class="ai2-example__prompt"><span class="c2-mono">&gt;_ Prompt</span><p>“Redesign the operator console header for clarity and quick actions. Keep it minimal and aligned to our design tokens.”</p></div>
  <span class="ai2-example__arrow" aria-hidden="true">→</span>
  <div class="ai2-example__col"><span class="ai2-example__lbl">First output</span>
    <div class="ai2-mock ai2-mock--first" aria-hidden="true"><div class="ai2-mock__bar"><i class="ai2-mock__dot"></i><i class="ai2-mock__line" style="width:34px"></i><i class="ai2-mock__line" style="width:28px"></i><i class="ai2-mock__sp"></i><i class="ai2-mock__dot"></i><i class="ai2-mock__dot"></i><i class="ai2-mock__dot"></i></div><i class="ai2-mock__line ai2-mock__line--wide"></i><i class="ai2-mock__line" style="width:70%"></i></div></div>
  <span class="ai2-example__arrow" aria-hidden="true">→</span>
  <div class="ai2-example__col"><span class="ai2-example__lbl">Refined (after review)</span>
    <div class="ai2-mock" aria-hidden="true"><div class="ai2-mock__bar"><span class="ai2-mock__search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg><i class="ai2-mock__line" style="width:120px"></i></span><i class="ai2-mock__sp"></i><svg class="ai2-mock__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg><svg class="ai2-mock__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4z"/><path d="M10 20h4"/></svg><i class="ai2-mock__dot ai2-mock__dot--ink"></i></div><i class="ai2-mock__line ai2-mock__line--wide"></i></div></div>
</div>'''

DS_FLOW = ('<div class="ai2-dsflow">'
           + f'<div class="c2-card">{ICON["figma"]}<h3 class="c2-h3">Design system</h3><p class="c2-p">Tokens · Components</p></div>'
           + f'<div class="c2-card c2-card--dark">{SPARK}<h3 class="c2-h3">AI-assisted mapping</h3><p class="c2-p">Inspect · Map · Generate</p></div>'
           + f'<div class="c2-card">{ICON["code"]}<h3 class="c2-h3">Code Connect</h3><p class="c2-p">Design → Code</p></div>'
           + f'<div class="c2-card">{ICON["layers"]}<h3 class="c2-h3">Production</h3><p class="c2-p">Reviewed · Maintained</p></div>'
           + '</div>')

DS_EXAMPLE = '''<div class="ai2-comp">
  <div class="ai2-comp__col"><span class="ai2-example__lbl">Component example: Button</span>
    <span class="ai2-comp__btn">Button</span><span class="ai2-comp__sub">Primary</span>
    <div class="ai2-comp__props"><span>Size</span><span class="ai2-comp__sel">Medium <i>⌄</i></span><span>State</span><span class="ai2-comp__sel">Default <i>⌄</i></span></div>
  </div>
  <span class="ai2-example__arrow" aria-hidden="true">→</span>
  <div class="ai2-comp__col"><span class="ai2-example__lbl">Mapped implementation</span>
    <pre class="ai2-code"><code>&lt;Button
  variant="primary"
  size="medium"
  state="default"
/&gt;</code></pre>
  </div>
  <div class="ai2-comp__col ai2-comp__col--checks">''' + '<ul class="ai2-checks ai2-checks--blue">' + "".join(f'<li>{CHECK}{t}</li>' for t in ["Uses design tokens", "Variants mapped automatically", "Reviewed and corrected before ship"]) + '</ul></div></div>'

def wrong(title, before, after, bad, good):
    return (f'<div class="ai2-wrong"><h3 class="c2-h3">{title}</h3><div class="ai2-wrong__pair">{before}<span class="ai2-example__arrow" aria-hidden="true">→</span>{after}</div>'
            f'<div class="ai2-wrong__tags"><span class="ai2-tag ai2-tag--bad">✕ {bad}</span><span class="ai2-tag ai2-tag--good">✓ {good}</span></div></div>')

LOGO_W = '<div class="ai2-logo"><span class="ai2-logo__mark ai2-logo__mark--white">' + SPARK + '</span></div>'
LOGO_Y = '<div class="ai2-logo"><span class="ai2-logo__mark">' + SPARK + '</span></div>'
METRIC_A = '<div class="ai2-metric"><b>↑ 30%</b><span>Improvement</span></div>'
METRIC_B = '<div class="ai2-metric"><b>—</b><span>Improvement</span></div>'
GAL_A = '<div class="ai2-gal"><i></i><i></i><i></i><i></i></div>'
GAL_B = '<div class="ai2-gal ai2-gal--ok"><i></i><i></i><i></i><i></i></div>'

WRONG = ('<div class="ai2-wrongs">'
         + wrong("The logo’s gold went white in dark mode", LOGO_W, LOGO_Y, "Generated", "Corrected")
         + wrong("A metric that did not exist", METRIC_A, METRIC_B, "Fabricated", "Removed")
         + wrong("A gallery view that rendered blank", GAL_A, GAL_B, "Blank output", "Fixed")
         + '</div>'
         + '<div class="ai2-other"><span class="ai2-other__lbl">Other issues I catch</span><span>Career years by guesswork</span><span>One-page resume split</span><span>Screen reader reads nonsense</span></div>')

RULES = '<div class="c2-rules">' + "".join(f'<div><h3>{t}</h3><p class="c2-p">{p}</p></div>' for t, p in [
    ("Draft, never decide", "AI gives options. I make the call."), ("Tokens or nothing", "Only within the design system."),
    ("No real data in prompts", "Use static or sample data."), ("Disclose AI", "Be clear when AI contributes.")]) + '</div>'

DEEPER = ('<div class="ai2-deeper">'
          '<a class="ai2-deeper__item" href="prompts.html"><h3>Prompt library <span aria-hidden="true">→</span></h3><p class="c2-p">The prompts I use for design, systems and critique.</p></a>'
          '<a class="ai2-deeper__item" href="how-this-site-was-built.html"><h3>How this site was built <span aria-hidden="true">→</span></h3><p class="c2-p">Tools, decisions and workflow behind this portfolio.</p></a>'
          '</div>')

SECTIONS = [
    isec("01", "What AI does, what I decide", None, SPLIT),
    isec("02", "My workflow", "A five-step flow from foundation to ship.", WORKFLOW),
    isec("03", "How I work with AI", "A simple loop I follow for product design work.", LOOP + EXAMPLE),
    isec("04", "AI in my design system", "From design tokens to production components.", DS_FLOW + DS_EXAMPLE),
    isec("05", "When AI gets it wrong", "Real examples, and how I corrected them.", WRONG),
    isec("06", "Rules I hold to", "Simple principles, no exceptions.", RULES),
    isec("07", "Go deeper", "More detail, if you want to explore.", DEEPER),
    cta("Working out where AI fits in your design workflow?", "Let’s talk about a practical, design-led approach.", "Email me", f"mailto:{MAIL}?subject=AI%20in%20the%20design%20workflow"),
]

PAGE = dict(
    file="how-i-use-ai.html",
    title="How I use AI · Ganeshkumar B",
    description="Where Claude and Figma MCP sit in a senior product designer's design-system workflow, where they went wrong, and the rules for using them.",
    og="assets/og-image.png",
    nav=nav("how-i-use-ai.html"),
    hero=hero("AI", "Honest version", "How I use AI", "A practical look at how I use Claude, Figma MCP and Code Connect in my product design work.",
              [("Tools", "Claude · Figma MCP · Code Connect"), ("Where", "Design system and product design"), ("Role", "Execution with human judgment"), ("Updated", "November 2026")],
              side_h3="AI drafts. I decide."),
    sections=SECTIONS,
    next=dict(label="Next", title="Open the prompt library", href="prompts.html"),
    back_label="Back to the site", back_href="index.html",
)
