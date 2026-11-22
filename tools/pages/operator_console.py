"""Case 03 · Operator Console. Figma: ganeshuxcraft — Portfolio Design System, node 30:472."""
import pathlib
from build import *

SNIP = pathlib.Path(__file__).resolve().parent / "snippets"
console = (SNIP / "oc_console.html").read_text()

def problem_block():
    annots = [("Competing information", "Multiple elements demanded attention at the same time."),
              ("Fragmented context", "Conversation and visitor details felt separated across panels."),
              ("Unnecessary scanning", "Operators had to look across the workspace to understand and act.")]
    right = '<ol class="oc2-annots">' + "".join(f'<li><i aria-hidden="true"></i><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></li>' for t, p in annots) + '</ol>'
    vis = '<figure class="c2-frame oc2-before"><img src="assets/case/oc-before.webp" width="1600" height="900" alt="Schematic of the earlier console: a wide navigation rail, a boxed conversation list, the chat in the centre and a bordered visitor panel with tabs, all competing for attention" decoding="async" /></figure>'
    return '<div class="oc2-problem">' + split(vis, right) + '</div>' + cap("An illustrative schematic of the earlier layout. Not a screenshot.")

def approach_block():
    before = ('<div class="oc2-side">' + pill("Before") +
              '<div class="oc2-boxes">' + "".join(f'<span>{b}</span>' for b in ("Navigation", "Conversations", "Chat", "Visitor / CRM")) + '</div>'
              + ul(["Separate areas for different tasks", "Context switching to find information", "A fragmented conversation flow"], "c2-list--x") + '</div>')
    after = ('<div class="oc2-side">' + pill("After", "c2-pill--after") +
             '<div class="oc2-boxes oc2-boxes--after"><span>Navigation</span><span>Conversation management</span><span class="is-hot">Active conversation</span><span>Context (Visitor, CRM…)</span></div>'
             + ul(["A unified workspace with clearer roles", "Context available alongside the conversation", "A more continuous workflow"]) + '</div>')
    return f'<div class="oc2-approach">{before}<span class="oc2-approach__arrow" aria-hidden="true">→</span>{after}</div>'

def experience_block():
    row = row_steps([("Find", "Spot the right conversation quickly."), ("Understand", "Get the full context at a glance."),
                     ("Respond", "Continue the conversation with context close at hand."), ("Resolve", "Complete actions without breaking the conversation flow.")])
    minis = [
        '<div class="oc2-mini"><b>My Active</b><div class="oc2-mini__row is-on"><span class="oc2-av oc2-av--green">P</span><div><b>Priya Sharma</b><span>Can you send the link?</span></div></div></div>',
        '<div class="oc2-mini"><div class="oc2-mini__id"><span class="oc2-av">PS</span><div><b>Priya Sharma</b><span>Bengaluru, India</span></div></div><div class="oc2-chips"><i class="is-green">Support</i><i class="is-blue">Enterprise</i><i class="is-red">VIP</i></div></div>',
        '<div class="oc2-mini"><span class="oc2-bubble">Great, can you send me the link?</span><span class="oc2-bubble oc2-bubble--me">Here’s the link to update your plan.</span></div>',
        '<div class="oc2-mini oc2-mini--acts"><span class="is-on">✓ Close conversation</span><span>→ Assign to</span><span>＋ Add note</span></div>',
    ]
    return row + '<div class="oc2-minis">' + "".join(minis) + '</div>'

def decisions_block():
    checks = [("Clearer hierarchy", "Conversations and primary actions take precedence over secondary information."),
              ("Cleaner layout", "Less unnecessary visual separation, and better use of space."),
              ("Focused context", "Visitor and business information stays accessible alongside the conversation.")]
    left = '<ul class="oc2-checks">' + "".join(f'<li><i aria-hidden="true">✓</i><div><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div></li>' for t, p in checks) + '</ul>'
    right = ('<div class="oc2-ba"><div>' + pill("Before") + '<div class="c2-ba__shot"><img src="assets/case/oc-before.webp" width="1600" height="900" alt="Before: the earlier console schematic" loading="lazy" decoding="async" /></div></div>'
             '<div>' + pill("After", "c2-pill--after") + '<div class="c2-ba__shot"><img src="assets/case/oc-after.webp" width="1600" height="900" alt="After: the redesigned console schematic" loading="lazy" decoding="async" /></div></div></div>'
             + cap("Schematics drawn in the same style, so only the structure changes."))
    return split(left, right, rev=True)

def principles_block():
    rows = [("Focus on the conversation", "The conversation became the centre of the workspace, with surrounding areas supporting it.",
             '<div class="oc2-chipbox"><span class="c2-lbl">Priya Sharma</span><span class="oc2-msg">Hi, is there a yearly plan for a team of 12?</span></div>'),
            ("Context available, not overwhelming", "Visitor, CRM and session information was organised into a scannable structure.",
             '<div class="oc2-chipbox oc2-chipbox--row"><div class="oc2-mini__id"><span class="oc2-av">PS</span><div><b>Priya Sharma</b><span>Bengaluru, India</span></div></div><div><span class="c2-lbl">Lead tags</span><div class="oc2-chips"><i class="is-green">Support</i><i class="is-blue">Enterprise</i><i class="is-red">VIP</i></div></div></div>'),
            ("Actions within the flow", "Common actions moved closer to the conversation, so operators rarely interrupt their work.",
             '<div class="oc2-chipbox"><span class="oc2-toolbar"><b>B</b><b>I</b><b>U</b><b>S</b><b>❝</b><b>⌘</b><b>⧉</b></span></div>')]
    return '<div class="oc2-principles">' + "".join(
        f'<div><b class="c2-big">{i + 1:02d}</b><div><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>{vis}</div>' for i, (t, p, vis) in enumerate(rows)) + '</div>'

def outcome_block():
    left = ('<p class="c2-body">The redesigned console brings navigation, conversation management, active chat and visitor context into one coherent workspace.</p>'
            '<p class="c2-body">Instead of making operators move between disconnected areas, the experience creates a clear relationship between the conversation and everything needed to support it.</p>')
    return (f'<div class="oc2-outcome"><div class="oc2-outcome__copy"><p class="c2-num">07 / The outcome</p><h2 class="c2-h2">A more focused foundation for customer conversations.</h2>{left}</div>'
            f'<div class="oc2-outcome__vis"><div class="oc2-shot">{console}</div>{cap("The redesigned console, recreated with sample data. Internal metrics stay under the NDA.")}</div></div>')

HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Product design · Zoho SalesIQ", "Case study 03 / 07")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">From a crowded console to a focused workspace.</h1>
      <p class="c2-lede">The operator console had everything operators needed. But finding the right conversation, understanding its context and taking action meant navigating a workspace that had grown increasingly complex.</p>
    </div>
    {meta([("Role", "Product Designer"), ("Focus", "Experience redesign"), ("Product", "Zoho SalesIQ"), ("Platform", "Web")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The redesigned operator console, recreated">
    <div class="c2-visual oc2-shot">
{console}
    </div>
    {cap("The redesigned console, recreated with sample data for this case study. Not a production screenshot.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. Screens are recreated with sample data, and internal metrics, customer details and unreleased work are left out.</p></div>
  </section>
'''

ICONS_CH = [ICON["target"], ICON["diamond"], ICON["bolt"]]

SECTIONS = [
    sec("01 / The problem", "Everything was there. But the experience needed to evolve.",
        "The console had grown into a workspace with multiple navigation layers, conversation queues, chat, visitor details and CRM information. Each served a purpose, but together they made it harder to stay focused and move between information and action.",
        problem_block()),
    sec("02 / The design challenge", "How do we make a complex workspace feel simpler?",
        "The challenge was to make a feature-rich console easier to navigate and operate, without removing the depth operators rely on every day.",
        cols([(None, "Information vs. focus", "Give operators the information they need without competing for their attention."),
              (None, "Flexibility vs. structure", "Support different workflows within a consistent, predictable workspace."),
              (None, "Density vs. clarity", "Preserve the depth of information while making it easier to understand and act on.")], icons=ICONS_CH)),
    sec("03 / The approach", "From individual panels to a connected workspace.",
        "Rather than treating every area as an equally important panel, I restructured the console around distinct roles: navigation, conversation management, active chat and contextual information.",
        approach_block()),
    sec("04 / The experience", "A clearer path through every conversation.",
        "The redesigned console follows an operator’s natural flow: locating a conversation, understanding its context, responding and taking action, without losing context along the way.",
        experience_block()),
    sec("05 / Key design decisions", "Less visual noise. More clarity.",
        "The redesign sets clearer boundaries between areas, creates a stronger visual hierarchy and keeps supporting information easy to reach.",
        decisions_block()),
    sec("06 / Design principles", "Three principles shaped the redesign.", None, principles_block()),
    '<section class="c2-sec cs-section" id="part-07">' + outcome_block() + '</section>',
    sec("08 / Takeaway", "", None,
        reflect("A workspace is more than the sum of its panels.",
                ["Redesigning a complex product isn’t about removing information. It’s about understanding what deserves attention, when it matters, and how each part works together.",
                 "<b>The most meaningful improvements often come not from adding more, but from getting the structure right.</b>"])),
]

PAGE = dict(
    file="case-operator-console.html",
    title="From a crowded console to a focused workspace · Operator Console · Case study 03 · Ganeshkumar B",
    description="The operator console had everything operators needed. But finding, understanding and acting on information took more effort than it should.",
    og="assets/og/case-operator-console.png",
    nav=nav_case(3, 7, "case-design-system.html", "Design system", "case-reports.html", "Reports"),
    hero=HERO, sections=SECTIONS,
    next=dict(label="Next case study", title="Reports and analytics revamp", href="case-reports.html"),
)
