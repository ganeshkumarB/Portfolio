"""Prompt library. Figma node 19:214. Prompt texts are the ones on the current page, unchanged."""
from pages._info import *

PROMPTS = [
    ("Token setup from an existing stylesheet", "Design system", "Extract design tokens from an existing product and structure them for Figma.", ["Claude", "Figma MCP", "Tokens", "Variables"],
     "You are helping me set up Figma variables from an existing product. Here is the stylesheet: [paste CSS or a link]. Extract every colour, type size, spacing and radius value that appears more than once. Group them into collections (color, type, space, radius), propose a name for each in the form `color/ink`, `space/4`, `radius/md`, and show me the values that look like one-offs so I can decide whether to keep or merge them. Do not invent values that are not in the file."),
    ("Light and dark modes without drift", "Theme", "Propose dark-mode values that keep every token’s role and contrast.", ["Claude", "Tokens", "Contrast"],
     "Here are my light-mode colour tokens: [paste]. Propose a dark-mode value for each that keeps the same role (background, surface, text, muted, line, accent) and the same contrast ratios against the text tokens, within ±0.3. Flag any pair that cannot reach 4.5:1 and suggest the smallest change that fixes it. Output as a two-column table: token, light, dark, contrast."),
    ("Generate a component through Figma MCP", "Components", "Build a variant set bound to the library’s variables, then list every binding for review.", ["Claude", "Figma MCP", "Components", "Variables"],
     "Using the connected Figma file, build a [Button] component with variants for [primary, ghost, danger] × [sm, md, lg] × [default, hover, disabled]. Bind every fill, text colour, radius and padding to the existing variables; never type a raw hex or pixel value. Name layers the way the rest of the library does. When you are done, list every variable you bound so I can review the mapping before I publish."),
    ("Code Connect mapping", "Implementation", "Map a Figma component to its code props and surface what does not line up.", ["Claude", "Code Connect", "React"],
     "Map the Figma component [Button] to the React component at [path/to/Button.tsx]. Match each Figma variant property to a prop (variant, size, state) and each boolean property to an optional prop. Write the Code Connect file so Dev Mode shows a real, copy-pasteable usage example for the selected variant. Then tell me which props exist in code but have no Figma property, and which Figma properties have no prop."),
    ("Audit a generated component against the system", "Review", "Check a generated component for hard-coded values and wrong bindings, then fix only those.", ["Claude", "Figma MCP", "Audit"],
     "Here is a component you generated: [paste or select in Figma]. Check it against the design system: every colour, radius, space and type value must be a variable. List anything hard-coded, anything bound to the wrong token (for example a surface colour used as text), and any spacing that is not on the 4-point scale. Fix only what you listed and show me a before/after table."),
    ("Critique in order", "Critique", "Review a screen the way a senior designer runs a critique: goal, flow, hierarchy, component, pixel.", ["Claude", "ChatGPT", "Critique"],
     "Review this screen the way a senior designer runs a critique: goal, flow, hierarchy, component, pixel, in that order. For each layer, say what you see, what it costs the user, and ask one question. Do not start with spacing or colour. If the goal is unclear, stop there and tell me what you would need to know."),
    ("Turn research notes into a case-study outline", "Case study", "Draft a six-section outline from notes, keeping every number exactly as written.", ["Claude", "Writing"],
     "Here are my notes on a project: [paste]. Draft a case-study outline with six sections: the problem as the user felt it, what we tried first, the design decisions (three, each with the trade-off), what shipped, what changed for users, and what I would do differently. Keep my numbers exactly as written; where I have no number, leave a marker rather than inventing one."),
]

def listing():
    rows = []
    for i, (title, cat, _d, _w, _body) in enumerate(PROMPTS):
        n = i + 1
        rows.append(f'<button type="button" class="pl2-row{" is-on" if n == 1 else ""}" data-prompt="{n}" role="tab" aria-selected="{"true" if n == 1 else "false"}" aria-controls="prompt-{n}" id="tab-{n}">'
                    f'<span class="pl2-row__n">{n:02d}</span><span class="pl2-row__t">{esc(title)}</span><span class="pl2-row__c">{esc(cat)}</span></button>')
    return '<div class="pl2-list" role="tablist" aria-label="Prompts">' + "".join(rows) + '</div>'

def details():
    out = []
    for i, (title, cat, desc, works, body) in enumerate(PROMPTS):
        n = i + 1
        chips = "".join(f'<span class="pl2-chip">{esc(w)}</span>' for w in works)
        out.append(f'''<article class="prompt pl2-detail" id="prompt-{n}" role="tabpanel" aria-labelledby="tab-{n}"{"" if n == 1 else " hidden"}>
          <span class="pl2-detail__k">{esc(cat)} <i>·</i> {n:02d}</span>
          <h3 class="pl2-detail__h">{esc(title)}</h3>
          <p class="pl2-detail__d">{esc(desc)}</p>
          <div class="pl2-prompt"><div class="pl2-prompt__head"><span class="c2-lbl c2-lbl--11">The prompt</span><button type="button" class="pl2-copy prompt__copy" data-copy>Copy</button></div><p class="prompt__body">{esc(body)}</p></div>
          <div class="pl2-works"><span class="c2-lbl c2-lbl--11">Works with</span><div class="pl2-chips">{chips}</div></div>
        </article>''')
    return '<div class="pl2-detailwrap">' + "".join(out) + '</div>'

LIBRARY = '<div class="pl2">' + listing() + details() + '</div>'

HOWTO = ('<div class="c2-rows">' + "".join(
    f'<div><span class="c2-rowno">{i + 1:02d}</span><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>' for i, (t, p) in enumerate([
        ("Swap the brackets", "Fill in the square brackets. The rest is structure."),
        ("Ask for the list of bindings", "Use the model’s binding list as your review surface."),
        ("Keep the numbers out of its hands", "Use supplied figures only; never invent metrics.")])) + '</div>')

SWITCH_JS = '''<script>
(function () {
  var rows = document.querySelectorAll(".pl2-row"), panels = document.querySelectorAll(".pl2-detail");
  rows.forEach(function (row) {
    row.addEventListener("click", function () {
      var n = row.getAttribute("data-prompt");
      rows.forEach(function (r) { var on = r === row; r.classList.toggle("is-on", on); r.setAttribute("aria-selected", String(on)); });
      panels.forEach(function (p) { p.hidden = p.id !== "prompt-" + n; });
    });
  });
})();
</script>
'''

SECTIONS = [
    isec("01", "The prompts", "Choose one to view.", LIBRARY),
    isec("02", "How to use them", "Three habits that make the output reviewable.", HOWTO),
    cta("Want the whole set as a file?", "One Markdown file with all seven prompts, for your notes or team wiki.", "Download prompts.md", "assets/prompts.md").replace('class="c2-cta__btn"', 'class="c2-cta__btn" download').replace(f'<span class="c2-cta__ico" aria-hidden="true">{ICON["arrow"]}</span>', f'<span class="c2-cta__ico" aria-hidden="true">{ICON["download"]}</span>'),
]

PAGE = dict(
    file="prompts.html",
    title="Prompt library · Claude + Figma MCP · Ganeshkumar B",
    description="Seven free prompts for design-system work with Claude and Figma MCP: tokens, dark mode, components, Code Connect, audits, critique and case studies.",
    og="assets/og-image.png",
    nav=nav("prompts.html", parts=True),
    hero=hero("Prompts", "Free to use", "Prompt library", "The prompts behind my Claude + Figma MCP workflow. Copy, adapt and use them as a starting point.",
              [("Count", "7 prompts"), ("For", "Claude + Figma MCP + Code Connect"), ("License", "Use freely, credit optional"), ("Download", '<a href="assets/prompts.md" download>prompts.md</a>')]),
    sections=SECTIONS,
    next=dict(label="Next", title="How this site was built", href="how-this-site-was-built.html"),
    back_label="Back to the site", back_href="index.html",
    extra_js=[f'<script src="extras.js?v={VER}"></script>\n', SWITCH_JS],
)
