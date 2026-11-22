"""Case 01 · Zobot. Figma: ganeshuxcraft — Portfolio Design System, node 42:1786."""
from build import *

# ---------------------------------------------------------------- drawings
def canvas(w=1200, h=480, compact=False):
    """The redrawn builder: a dark canvas with one sample bot. Pure SVG so it scales."""
    k = 1
    def card(x, y, cw, ch, kind, color, title, body, rows=None):
        out = [f'<g transform="translate({x} {y})"><rect width="{cw}" height="{ch}" rx="14" fill="#2a2d35"/>',
               f'<rect x="18" y="18" width="12" height="12" rx="3" fill="{color}"/>',
               f'<text x="38" y="29" font-size="14.5" font-weight="600" fill="#fff">{title}</text>',
               f'<text x="18" y="56" font-size="15" font-weight="500" fill="#dce0e8">{body}</text>']
        if rows:
            for i, r in enumerate(rows):
                ry = 72 + i * 36
                out.append(f'<rect x="18" y="{ry}" width="{cw - 36}" height="28" rx="6" fill="#33363f"/><text x="30" y="{ry + 19}" font-size="14" font-weight="500" fill="#dce0e8">{r}</text><circle cx="{cw}" cy="{ry + 14}" r="5" fill="#4d8dff"/>')
        out.append('</g>')
        return "".join(out)
    def wire(x1, y1, x2, y2):
        mx = (x1 + x2) / 2
        return f'<path d="M{x1} {y1} C{mx} {y1} {mx} {y2} {x2} {y2}" fill="none" stroke="#5a5f6b" stroke-width="2"/>'
    s = [f'<svg class="zb2-canvas" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Zobot builder: a Start pill, a Message block, a Question block with three options, each routed to an Action or Message block">',
         '<style>text{font-family:Inter,system-ui,sans-serif}</style>',
         f'<rect width="{w}" height="{h}" rx="18" fill="#1c1e24"/>',
         f'<path d="M0 18 a18 18 0 0 1 18 -18 H{w - 18} a18 18 0 0 1 18 18 V48 H0 Z" fill="#191b20"/>',
         '<text x="24" y="31" font-size="15.5" font-weight="600" fill="#fff">Zobot</text>',
         f'<rect x="{w - 110}" y="12" width="86" height="26" rx="13" fill="#ffd54a"/><text x="{w - 67}" y="30" font-size="14.4" font-weight="600" fill="#15161a" text-anchor="middle">Publish</text>',
         f'<rect x="0" y="48" width="48" height="{h - 66}" fill="#191b20"/><path d="M0 {h - 18} a18 18 0 0 0 18 18 H48 V{h - 18} Z" fill="#191b20"/>']
    for i in range(5):
        s.append(f'<rect x="16" y="{70 + i * 38}" width="16" height="16" rx="4" fill="#3a3d46"/>')
    # blocks
    s.append('<rect x="92" y="222" width="92" height="36" rx="18" fill="#4d8dff"/><text x="138" y="246" font-size="15.5" font-weight="600" fill="#fff" text-anchor="middle">▶ Start</text>')
    s.append(card(228, 180, 200, 110, "msg", "#4d8dff", "Message", "How can I help you today?"))
    s.append(card(486, 118, 220, 210, "q", "#a78bfa", "Question", "Choose an option", ["Sales", "Support", "Others"]))
    s.append(card(788, 62, 220, 92, "act", "#2ea05a", "Action", "Route to Sales"))
    s.append(card(788, 196, 220, 92, "act", "#2ea05a", "Action", "Create a ticket"))
    s.append(card(788, 330, 220, 92, "msg", "#4d8dff", "Message", "How can I assist?"))
    s.append(wire(184, 240, 228, 235)); s.append(wire(428, 235, 486, 223))
    s.append(wire(706, 204, 788, 108)); s.append(wire(706, 240, 788, 242)); s.append(wire(706, 276, 788, 376))
    s.append('</svg>')
    return "".join(s)

def model_linear():
    return ('<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            '<rect x="110" y="18" width="80" height="24" rx="6" fill="#e8f0ff"/><rect x="110" y="58" width="80" height="24" rx="6" fill="#e8f0ff"/><rect x="110" y="98" width="80" height="24" rx="6" fill="#e8f0ff"/>'
            '<path d="M150 42v16M150 82v16" stroke="#b9c7e6" stroke-width="2"/></svg>')
def model_free():
    return ('<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            '<rect x="22" y="22" width="60" height="22" rx="6" fill="#e8f0ff"/><rect x="128" y="12" width="60" height="22" rx="6" fill="#e8f0ff"/><rect x="214" y="46" width="60" height="22" rx="6" fill="#e8f0ff"/>'
            '<rect x="48" y="96" width="60" height="22" rx="6" fill="#e8f0ff"/><rect x="156" y="78" width="60" height="22" rx="6" fill="#e8f0ff"/><rect x="214" y="106" width="60" height="22" rx="6" fill="#e8f0ff"/>'
            '<path d="M82 33L128 23M188 23l26 23M52 44l26 52M108 107l48-18M216 89l-2 17M186 89l28-32" stroke="#b9c7e6" stroke-width="1.6" fill="none"/></svg>')
def model_structured():
    return ('<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            '<rect x="22" y="58" width="56" height="24" rx="12" fill="#4d8dff"/><text x="50" y="74" font-size="11" font-weight="600" fill="#fff" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Start</text>'
            '<rect x="106" y="54" width="64" height="32" rx="7" fill="#1c1e24"/>'
            '<rect x="214" y="22" width="64" height="28" rx="7" fill="#e8f0ff" stroke="#4d8dff" stroke-width="1.5"/><rect x="214" y="90" width="64" height="28" rx="7" fill="#e8f0ff" stroke="#4d8dff" stroke-width="1.5"/>'
            '<path d="M78 70h28M170 66c22 0 22-30 44-30M170 74c22 0 22 30 44 30" stroke="#4d8dff" stroke-width="1.6" fill="none"/></svg>')

def block_card(x, y, w, title, body, rows, foot, foot_icon="▭", scale=1.0):
    """A builder card in the product's own style: grey header, white body, option rows, a footer naming the block type."""
    h = 86 + len(rows) * 34 + 34
    out = [f'<g transform="translate({x} {y})">',
           f'<rect width="{w}" height="{h}" rx="10" fill="#fff" stroke="#d7dae0"/>',
           f'<path d="M0 10a10 10 0 0 1 10-10h{w - 20}a10 10 0 0 1 10 10v26H0z" fill="#6b6b6b"/>',
           f'<text x="14" y="23" font-size="15" font-weight="500" fill="#fff">{title}</text>',
           f'<path d="M{w - 24} 12h10m-9 0v10h8V12m-6 3v5m4-5v5" stroke="#fff" stroke-width="1.3" fill="none"/>',
           f'<text x="14" y="60" font-size="14" fill="#15161a">{body}</text>']
    yy = 76
    out.append(f'<path d="M0 {yy}h{w}" stroke="#e5e5e5"/>')
    for r in rows:
        out.append(f'<text x="14" y="{yy + 22}" font-size="14" fill="#5f6368">{r}</text><circle cx="{w}" cy="{yy + 17}" r="5.5" fill="#7a8290"/>')
        yy += 34
        out.append(f'<path d="M0 {yy}h{w}" stroke="#e5e5e5"/>')
    out.append(f'<path d="M0 {yy}h{w}v{h - yy - 10}a10 10 0 0 1-10 10H10a10 10 0 0 1-10-10z" fill="#f8f8f8"/>')
    out.append(f'<text x="{w / 2}" y="{yy + 22}" font-size="12" font-weight="500" fill="#8a8f98" text-anchor="middle" letter-spacing="1">{foot_icon}  {foot}</text>')
    if not rows:
        out.append(f'<circle cx="{w}" cy="{yy + 17}" r="5.5" fill="#7a8290"/>')
    out.append('</g>')
    return "".join(out), h

def anatomy():
    c, h = block_card(150, 30, 250, "Role selection", "Please select your role: Student or Staff", ["Student", "Staff"], "BUTTON", "⌸")
    pins = [("Title", 48), ("Content", 90), ("Options", 150), ("Block type", 224)]
    out = ['<svg viewBox="0 0 500 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anatomy of a block: title, content, options, block type and output ports">',
           '<style>text{font-family:Inter,system-ui,sans-serif}</style>',
           '<rect width="500" height="270" rx="16" fill="#f5f5f3"/>',
           '<pattern id="zbdots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dadce2"/></pattern><rect width="500" height="270" rx="16" fill="url(#zbdots)"/>', c]
    for label, y in pins:
        out.append(f'<text x="22" y="{y + 4}" font-size="13" font-weight="600" fill="#15161a">{label}</text>')
        out.append(f'<path d="M100 {y}H148" stroke="#ffd54a" stroke-width="2" stroke-dasharray="3 4"/><circle cx="148" cy="{y}" r="3" fill="#ffd54a"/>')
    out.append('<text x="418" y="150" font-size="12" font-weight="600" fill="#15161a">Output</text><text x="418" y="166" font-size="12" font-weight="600" fill="#15161a">ports</text>')
    out.append('<path d="M404 140H414" stroke="#ffd54a" stroke-width="2" stroke-dasharray="3 4"/>')
    out.append('</svg>')
    return "".join(out)

def callback_flow():
    out = ['<svg viewBox="0 0 1200 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A callback flow: a single-choice question routes Yes to a contact-details block and a thank-you message, and No to an end-chat block">',
           '<style>text{font-family:Inter,system-ui,sans-serif}</style>',
           '<rect width="1200" height="372" rx="18" fill="#f5f5f3"/>',
           '<pattern id="zbdots2" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.1" fill="#dadce2"/></pattern><rect width="1200" height="372" rx="18" fill="url(#zbdots2)"/>']
    c1, h1 = block_card(40, 30, 270, "Callback offer", "Would you like to request a callback?", ["Yes", "No"], "SINGLE CHOICE", "☰")
    c2, h2 = block_card(430, 16, 270, "Contact details", "Please share your contact details.", [], "USER INPUT", "⌨")
    c3, h3 = block_card(820, 16, 270, "Thank you", "Thanks! We’ll get in touch soon.", [], "MESSAGE", "✉")
    c4, h4 = block_card(430, 200, 270, "Close chat", "Okay, have a great day!", [], "END CHAT", "⏻")
    out += [c1, c2, c3, c4]
    # ports: yes at (310, 30+93), no at (310, 30+127); c2 in at x 430 y 16+h2-17
    out.append(f'<path d="M310 123 C370 123 370 {16 + h2 - 17} 430 {16 + h2 - 17}" fill="none" stroke="#7a8290" stroke-width="2"/>')
    out.append(f'<path d="M310 157 C370 157 370 {200 + h4 - 17} 430 {200 + h4 - 17}" fill="none" stroke="#7a8290" stroke-width="2"/>')
    out.append(f'<path d="M700 {16 + h2 - 17} C760 {16 + h2 - 17} 760 {16 + h3 - 17} 820 {16 + h3 - 17}" fill="none" stroke="#7a8290" stroke-width="2"/>')
    out.append('<rect x="352" y="98" width="34" height="20" rx="6" fill="#e1f5ea"/><text x="369" y="112" font-size="11" font-weight="500" fill="#1f8a4c" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace">Yes</text>')
    out.append('<rect x="352" y="188" width="30" height="20" rx="6" fill="#fde8eb"/><text x="367" y="202" font-size="11" font-weight="500" fill="#d64545" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace">No</text>')
    out.append('<text x="40" y="352" font-size="10" font-weight="500" fill="#61656e" font-family="JetBrains Mono,ui-monospace,monospace" letter-spacing="0.8">SAMPLE BOT · OPTION PORTS ROUTE THE CONVERSATION: YES COLLECTS DETAILS, NO CLOSES THE CHAT</text>')
    out.append('</svg>')
    return "".join(out)

def before_flow():
    item = lambda ico, t: f'<div class="zb2-before__step"><span>{ico}</span>{t}</div>'
    return ('<div class="zb2-before"><span class="c2-lbl">Before · A basic, linear flow</span><div class="zb2-before__row">'
            + item("▷", "Welcome message") + '<i aria-hidden="true">→</i>' + item("?", "Ask a question") + '<i aria-hidden="true">→</i>' + item("≡", "Show a response")
            + '</div><span class="c2-lbl">Illustrative. A conversation was a short sequence of steps.</span></div>')

# ---------------------------------------------------------------- page
HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Zobot · Product design", "Case study 01 / 07")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">From a basic bot flow to a complete chatbot builder.</h1>
      <p class="c2-lede">The story of Zobot: a chatbot-building experience that evolved from a simple, linear flow to a visual, structured builder for real-world conversations.</p>
    </div>
    {meta([("Product", "Zoho SalesIQ"), ("Role", "Product Designer"), ("Timeline", "2018 – 2024"), ("Scope", "Builder, interaction, system")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The Zobot builder canvas, redrawn">
    <div class="c2-visual c2-frame c2-frame--dark">{canvas()}</div>
    {cap("Sample bot on the shipped builder, redrawn. One canvas holds the question, the decision, every branch and its outcome.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. The builder is shown with a sample bot; other screens are recreated with sample data, and internal metrics, customer details and unreleased work are left out.</p></div>
  </section>
'''

SECTIONS = [
    sec("01 / Context", "A simpler flow wasn’t enough anymore.",
        "Zobot began as a basic, linear bot builder: good for simple use cases, but it quickly showed its limits as conversation needs grew.",
        before_flow()),
    sec("02 / Challenge", "As conversations grew, the builder became harder to use.", None,
        cols([("01", "Linear interaction", "Worked for simple flows, but felt restrictive."),
              ("02", "Disconnected configuration", "Switching between steps made it hard to see the flow."),
              ("03", "Growing complexity", "More branches and logic made it difficult to maintain.")])),
    sec("03 / Exploration", "Finding the right way to build conversations.",
        "I explored three interaction models to balance simplicity, freedom and structure.",
        grid([card("Linear flow", "Easy to follow, but limited for complex logic.", "Model 01", model_linear()),
              card("Freeform canvas", "Flexible and powerful, but can feel unstructured.", "Model 02", model_free()),
              card("Structured flow", "A directional canvas that keeps the conversation readable and scalable.", "Chosen direction", model_structured(), mod="c2-card--cream", chosen=True)], 3)
        + principle("The design principle", "The conversation should read like a list, but behave like a flowchart.")),
    sec("04 / Experience", "From individual steps to a connected conversation.",
        "A visual builder to see, build and configure the entire conversation in one place.",
        split(f'<div class="c2-frame c2-frame--dark">{canvas()}</div>',
              steps([("See the whole conversation", "Understand the flow at a glance."),
                     ("Build through blocks", "Connect, branch and extend with ease."),
                     ("Configure in context", "Edit a block without losing the bigger flow.")]))),
    sec("05 / System", "Different jobs. One shared anatomy.",
        "Every block follows the same structural pattern, so it is easy to learn, consistent to use and flexible to extend.",
        '<div class="zb2-system">' + anatomy() + '<div><h3 class="zb2-system__h">Block families</h3>'
        + grid([card("Response", "Communicate with visitors.", "01"), card("Action", "Control the conversation (routing, handoffs).", "02"),
                card("Data", "Collect and use information.", "03"), card("Integration", "Connect with CRM and other tools.", "04")], 2) + '</div></div>'),
    sec("06 / Design decisions", "Three key decisions shaped the builder.", None,
        decisions([("A flowchart, not a script.", "Make conversation logic visible and easier to understand."),
                   ("Start simple. Customize when needed.", "Sensible defaults, without limiting advanced control."),
                   ("Built to expand.", "New blocks and integrations fit into the same system.")])),
    sec("07 / In action", "A conversation, built visually.",
        "A simple callback flow that brings the key pieces together, from the first question to the final outcome.",
        f'<div class="c2-frame">{callback_flow()}</div>'),
    sec("08 / Shipped, then it grew", "From a focused builder to a broader platform.", None,
        timeline([("2018", "Original design", "A simple, linear bot builder for basic use cases."),
                  ("2020", "Team implementation", "Shipped, stabilised and adopted by customers."),
                  ("2022 – 2024", "Product evolution", "Expanded block types, more capabilities, integrations, channels and AI.")],
                 "Later capabilities belong to the product and the team who kept building it. Sources: help.zoho.com, blog.zoho.com/salesiq.")),
    outcome("09 / Outcome", "Complex conversations became easier to build, understand and extend.",
            [("▷", "Visual control", "over conversation logic."), ("◇", "More flexibility", "without writing code."), ("∞", "A foundation", "for more complex chatbot experiences.")]),
    sec("10 / Reflection", None, None, reflect("“Defaults matter as much as features.”",
        ["A flexible builder is only useful when people know where to start. The experience needs structure, sensible defaults and the freedom to customise as complexity grows."])),
]

PAGE = dict(
    file="case-zobot.html",
    title="From a basic bot flow to a complete chatbot builder · Zobot · Case study 01 · Ganeshkumar B",
    description="Redesigning Zobot, the no-code chatbot builder in Zoho SalesIQ, from a linear flow into a visual, structured builder for real conversations.",
    og="assets/og/case-zobot.png",
    nav=nav_case(1, 7, "index.html#work", "All work", "case-design-system.html", "Design system"),
    hero=HERO, sections=SECTIONS,
    next=dict(label="Next case study", title="Design system", href="case-design-system.html"),
)
