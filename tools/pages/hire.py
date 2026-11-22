"""Hiring me? Quick answers. Figma node 16:112. Answers are the current page's, unchanged."""
from pages._info import *

ROLES = ('<div class="hr2-roles">'
         '<div class="hr2-primary"><div><h3>Lead Product Designer <span class="hr2-primary__tag">Primary</span></h3><p>Product direction, complex workflows, interaction design and end-to-end ownership.</p></div></div>'
         + cols([(None, "Design systems lead", "Tokens, components, governance and the Figma-to-code pipeline."),
                 (None, "Staff or senior, systems", "Senior individual contributor with systems scope."),
                 (None, "Design tooling and AI", "Connect Figma, design systems and AI-assisted workflows.")]).replace('class="c2-cols"', 'class="c2-cols hr2-cols"')
         + '</div>')

WHERE = cols([(None, "Chennai", "On-site or hybrid."), (None, "Remote, India", "Fully remote for an Indian company."),
              (None, "Remote, international", "Remote, with timezone overlap."), (None, "Relocation", "Open for the right role.")], n=4)

FAQ = [
    ("Do you code?", "Enough to ship this site and to speak the language of the people who build my designs. HTML and CSS by hand, JavaScript with help from Claude. On the product I work in Figma variables and Code Connect so every component maps to its real code, and I use Figma MCP to generate production components from the library. I am not a front-end engineer and I do not pretend to be one."),
    ("Have you led a team?", "I have led the design direction, not the people. I own the Design system and the design reviews across a five-engineer team, set the product design practices, and align product managers and engineers on what ships. No direct reports yet, and a lead role where that changes is exactly what I am looking for."),
    ("What tools do you use?", "Figma every day: variables and modes, Code Connect, Dev Mode and Figma MCP. Claude and ChatGPT for critique, research synthesis and design-to-code. Photoshop, Illustrator, After Effects and Spline for visuals and motion. HTML and CSS for prototypes and this site."),
    ("What roles are you looking for?", "Lead or staff product designer, or a senior role that owns a design system. Enterprise or B2B SaaS, with a team that ships. I am most useful where design and engineering need one source of truth."),
    ("What is your notice period?", "30 days."),
    ("Where do you work from?", "Chennai, India, on IST. I am open to on-site or hybrid in Chennai, remote for an Indian or international team with IST overlap, and relocating for the right role."),
    ("Can I see the real product?", "Most of my work is under NDA with Zoho. The case studies recreate every screen with sample data, and I walk through the full Figma files live on a call, or share them with a password on request."),
    ("How fast do you reply?", "Within a day, usually the same day."),
]
FAQ_HTML = '<div class="hr2-faq">' + "".join(
    f'<details class="hr2-q"{" open" if i == 0 else ""}><summary><span>{esc(q)}</span><i class="hr2-q__ico" aria-hidden="true"></i></summary><p class="c2-body">{esc(a)}</p></details>' for i, (q, a) in enumerate(FAQ)) + '</div>'

ASK = [
    ("How do you decide what becomes a component and what stays a one-off?", "Tokens first, then anatomy, then governance.", "Design system", "case-design-system.html"),
    ("Walk me through a change that has to land in Figma and in code at the same time.", "Figma variables, Code Connect and the bridge between them.", "Design system", "case-design-system.html"),
    ("Where does AI fit in your workflow, and where do you keep it out?", "Claude drafts. I decide.", "How I use AI", "how-i-use-ai.html"),
    ("What did you ship without research, and how did you find out whether it worked?", "A real product decision, its trade-offs and what happened.", "Zobot", "case-zobot.html"),
    ("Which Zobot decision would you make differently today?", "Flowchart instead of a script, defaults on every block, website first.", "Zobot", "case-zobot.html"),
    ("How do you design a screen someone works in all day?", "Operator Console: fewer controls, less friction, and the work visible.", "Operator Console", "case-operator-console.html"),
    ("How do you run a critique so it changes the work?", "Goal, flow, hierarchy, component, pixel.", "Prompt library", "prompts.html"),
    ("What would you do first with our design system?", "Audit tokens, map components to code, pick the screens that prove the system.", None, None),
]
ASK_HTML = '<div class="hr2-ask">' + "".join(
    f'<div><span class="c2-rowno">{i + 1:02d}</span><div><h3 class="c2-h3">{esc(q)}</h3><p class="c2-p">{esc(h)}</p></div>' + (link_arrow(l, href) if l else "") + '</div>' for i, (q, h, l, href) in enumerate(ASK)) + '</div>'

LOOK = grid([
    f'<div class="c2-card hr2-look">{ICON["layers"]}<h3 class="c2-h3">Seven case studies</h3><p class="c2-p">Zobot, design system, Operator Console, Reports, Brand, Outbound, Feedback.</p>{link_arrow("Explore", "index.html#work")}</div>',
    f'<div class="c2-card hr2-look">{ICON["doc"]}<h3 class="c2-h3">Resume</h3><p class="c2-p">A printable web version, plus one-page and full PDFs.</p>{link_arrow("Open", "resume.html")}</div>',
    f'<div class="c2-card hr2-look">{ICON["linkedin"]}<h3 class="c2-h3">LinkedIn</h3><p class="c2-p">Profile, recommendations and career history.</p>{link_arrow("View", "https://www.linkedin.com/in/ganeshkumarb1997/", ext=True)}</div>',
    f'<div class="c2-card hr2-look">{ICON["pen"]}<h3 class="c2-h3">Writing</h3><p class="c2-p">Short posts on fundamentals, UX and working systems.</p>{link_arrow("Read", "index.html#writing")}</div>'], 4)

SECTIONS = [
    isec("01", "The roles that fit", "Where eight years on one product count most.", ROLES),
    isec("02", "Where and how I work", "Chennai, IST, flexible on the rest.", WHERE),
    isec("03", "Questions I get asked", "Straight answers, so the first call can go deeper.", FAQ_HTML),
    isec("04", "Questions I’d love to be asked", "Ask any of these and you’ll get my best half hour. Each one points at the work that backs it up.", ASK_HTML),
    isec("05", "What you can look at", "What a hiring person asks for, in one place.", LOOK),
    cta("Ready to talk?", "One email is enough. I reply within a day, and I’m happy to start with a 30-minute call.", "Email me", f"mailto:{MAIL}?subject=Hiring%20conversation", ext=True),
]

PAGE = dict(
    file="hire.html",
    title="Hiring me? · Quick answers · Ganeshkumar B",
    description="Role preferences, 30-day notice, Chennai or remote, and answers to the questions recruiters ask first.",
    og="assets/og-image.png",
    nav=nav("hire.html"),
    hero=hero("Hire me", "Quick answers for recruiters", "Hiring me? Here is the short version.",
              "A lead or senior product design role owning the design system and the Figma-to-code bridge, in a B2B SaaS team that ships.",
              [("Role", "Lead, staff or senior product designer · design systems"), ("Notice period", "30 days"), ("Location", "Chennai, India · IST · remote or relocation welcome"), ("Experience", "8+ years, one enterprise product end to end")], mod="c2-hero--info-68"),
    sections=SECTIONS,
    next=dict(label="Next", title="Read the resume", href="resume.html"),
    back_label="Back to the site", back_href="index.html",
)
