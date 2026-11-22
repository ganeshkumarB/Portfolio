"""Case 04 · Reports and analytics. Figma node 25:396."""
from build import *

# ---------------------------------------------------------------- recreated dashboard (em-scaled HTML + SVG chart)
KPIS = [("Total chats", "12K", "↑ 2.43%", "up"), ("Incoming", "10K", "↓ 12%", "down"), ("Attended", "12K", "↑ 0%", "up"),
        ("Acceptance rate", "86%", "↑ 0%", "up"), ("Closed", "12K", "↑ 0%", "up"), ("Outgoing", "2K", "↑ 42%", "up")]
RAIL = [("chat", "Chats"), ("phone", "Calls"), ("star", "Feedback"), ("bars", "Reports"), ("doc", "Articles"), ("help", "FAQs")]
RAIL_ICO = {
    "chat": '<path d="M4 5h16v11H9l-5 4z"/>', "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    "star": '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>', "bars": '<path d="M5 20V10M10 20V4M15 20v-7M20 20v-3"/>',
    "doc": '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>', "help": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17v.01"/>'}
NAV = [("Brands", "g"), ("Operators", "g"), ("Outbound", "g"), ("Volume & demand ⌄", "g"), ("Chats", "on"), ("Calls", ""), ("Video calls", ""), ("Screen share", ""), ("Meeting", ""), ("Channel demand", ""), ("Time & visitor analysis", "")]

def _ico(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{RAIL_ICO[name]}</svg>'

def _chart():
    """Three smooth lines, a grid, hour labels and a tooltip. 560×200 units."""
    def path(pts, color, fill=None):
        d = f"M{pts[0][0]} {pts[0][1]}"
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            mx = (x0 + x1) / 2
            d += f" C{mx} {y0} {mx} {y1} {x1} {y1}"
        out = f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2"/>'
        if fill:
            out = f'<path d="{d} V190 H{pts[0][0]} Z" fill="{fill}"/>' + out
        return out
    xs = [40, 100, 160, 220, 280, 340, 400, 460, 520]
    total = list(zip(xs, [120, 100, 70, 85, 60, 50, 80, 95, 110]))
    inc = list(zip(xs, [150, 140, 125, 130, 118, 112, 128, 140, 150]))
    outg = list(zip(xs, [175, 170, 160, 165, 150, 155, 162, 170, 176]))
    s = ['<svg viewBox="0 0 560 210" class="rp-chart__svg" aria-hidden="true">']
    for y, lab in ((40, "300"), (90, "200"), (140, "100")):
        s.append(f'<path d="M40 {y}H540" stroke="#eef0f2"/><text x="8" y="{y + 3}" font-size="9" fill="#9a9ea8">{lab}</text>')
    s.append(path(total, "#2bb59a", "rgba(43,181,154,0.12)")); s.append(path(inc, "#4d8dff", "rgba(77,141,255,0.10)")); s.append(path(outg, "#c084fc", "rgba(192,132,252,0.10)"))
    for x, lab in zip(xs[:-1] + [xs[-1]], ["1 AM", "4 AM", "7 AM", "10 AM", "1 PM", "4 PM", "7 PM", "10 PM", ""]):
        if lab: s.append(f'<text x="{x}" y="204" font-size="9" fill="#9a9ea8" text-anchor="middle">{lab}</text>')
    s.append('<path d="M340 30V190" stroke="#d7dae0" stroke-dasharray="3 3"/>')
    s.append('<g transform="translate(350 40)"><rect width="128" height="70" rx="8" fill="#fff" stroke="#e6e7ea"/><text x="10" y="18" font-size="10" font-weight="600" fill="#15161a">09 Sep, 3 PM</text>'
             '<circle cx="14" cy="33" r="3" fill="#2bb59a"/><text x="22" y="36" font-size="9" fill="#61656e">Total chats</text><text x="118" y="36" font-size="9" font-weight="600" fill="#15161a" text-anchor="end">320</text>'
             '<circle cx="14" cy="47" r="3" fill="#4d8dff"/><text x="22" y="50" font-size="9" fill="#61656e">Incoming chats</text><text x="118" y="50" font-size="9" font-weight="600" fill="#15161a" text-anchor="end">145</text>'
             '<circle cx="14" cy="61" r="3" fill="#c084fc"/><text x="22" y="64" font-size="9" fill="#61656e">Outgoing chats</text><text x="118" y="64" font-size="9" font-weight="600" fill="#15161a" text-anchor="end">109</text></g>')
    s.append('</svg>')
    return "".join(s)

def _bars():
    days = [("Mon", 62), ("Tue", 70), ("Wed", 100), ("Thu", 74), ("Fri", 68), ("Sat", 44), ("Sun", 36)]
    out = ['<div class="rp-bars">']
    for d, h in days:
        on = " is-on" if d == "Wed" else ""
        out.append(f'<div class="rp-bar{on}" style="--h:{h}%">' + ('<span class="rp-bar__tip">1.8K</span>' if on else "") + f'<i></i><b>{d}</b></div>')
    out.append('</div>')
    return "".join(out)

def _heat():
    shades = {0: "#eaf1ff", 1: "#c8dcff", 2: "#93b8ff", 3: "#5a91f5", 4: "#2f6fe0"}
    rows = [[0, 1, 1, 1, 2, 2, 2, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4, 4, 4, 4, 1, 1, 0, 0],
            [2, 1, 0, 2, 0, 1, 2, 0, 4, 3, 2, 4, 1, 3, 4, 0, 4, 3, 2, 4, 0, 1, 1, 0],
            [1, 1, 2, 1, 1, 0, 1, 4, 4, 4, 2, 0, 2, 4, 4, 4, 2, 0, 1, 3, 2, 2, 1, 0]]
    out = ['<div class="rp-heat"><div class="rp-heat__labels"><span>&gt;100</span><span>&gt;50</span><span>0–50</span></div><div class="rp-heat__grid">']
    for r in rows:
        for v in r:
            out.append(f'<i style="background:{shades[v]}"></i>')
    out.append('</div></div>')
    return "".join(out)

def dashboard(small=False, heat=False):
    cls = "rp-dash" + (" rp-dash--sm" if small else "")
    rail = "".join(f'<div class="rp-rail__item{" is-on" if n == "Reports" else ""}">{_ico(i)}<span>{n}</span></div>' for i, n in RAIL)
    nav = "".join(f'<div class="rp-nav__item{" rp-nav__item--g" if k == "g" else ""}{" is-on" if k == "on" else ""}">{n}</div>' for n, k in NAV)
    kpis = "".join(f'<div class="rp-kpi"><span>{l}</span><b>{v}</b><em class="rp-delta rp-delta--{d}">{dl}</em></div>' for l, v, dl, d in KPIS)
    return f'''<div class="{cls}" role="img" aria-label="The redesigned Chats report: a left rail, a report navigation grouped by question, six KPI cards, a chat-volume trend line chart and chats by day">
  <div class="rp-top"><div class="rp-search">⌕ Search for chats, visitors and more</div><div class="rp-avail">Available <i></i></div><span class="rp-ava"></span></div>
  <div class="rp-body">
    <div class="rp-rail">{rail}</div>
    <div class="rp-nav">{nav}</div>
    <div class="rp-main">
      <div class="rp-main__head"><h4>Chats</h4><span class="rp-select">Today ⌄</span></div>
      <div class="rp-kpis">{kpis}</div>
      <div class="rp-charts">
        <div class="rp-card rp-chart"><div class="rp-card__head"><h5>Chat volume trend</h5><div class="rp-legend"><span><i style="background:#2bb59a"></i>Total</span><span><i style="background:#4d8dff"></i>Incoming</span><span><i style="background:#c084fc"></i>Outgoing</span></div></div>{_chart()}</div>
        <div class="rp-card rp-days"><div class="rp-card__head"><h5>Chats by day</h5><span class="rp-sub">This week</span></div>{_bars()}</div>
      </div>
      {('<div class="rp-card rp-heatcard"><div class="rp-card__head"><h5>Incoming chat volume</h5></div>' + _heat() + '</div>') if heat else ''}
    </div>
  </div>
</div>'''

def before_articles():
    return '''<div class="rp-before" role="img" aria-label="Earlier Articles report: a blue banner, three KPI cards and an illustration">
  <div class="rp-before__bar"></div>
  <div class="rp-before__banner">
    <div><h4>Articles report</h4><p>Consolidated portal-level business reports can be viewed, emailed and saved as a document, and department usage can be filtered for any given range.</p>
      <div class="rp-before__kpis">
        <div><i></i><em class="rp-delta rp-delta--up">↑ 10%</em><span>Overall articles</span><b>100K</b></div>
        <div><i></i><em class="rp-delta rp-delta--up">↑ 10%</em><span>Avg time spent</span><b>3 min</b></div>
        <div><i></i><em class="rp-delta rp-delta--down">↓ 10%</em><span>Search not found</span><b>10K</b></div>
      </div></div>
    <div class="rp-before__art" aria-hidden="true"><span class="rp-before__p rp-before__p--y"></span><span class="rp-before__p rp-before__p--g"></span><span class="rp-before__box"></span><span class="rp-before__p rp-before__p--s"></span><span class="rp-before__p rp-before__p--w"></span></div>
  </div>
  <span class="c2-pill c2-pill--blue rp-before__tag">Before</span>
</div>'''

def challenge_band():
    rows = [("layers", "Bring consistency", "across different report types."), ("bolt", "Make key insights", "faster to understand."), ("target", "Help teams go from", "an overview to deeper analysis, effortlessly.")]
    right = '<ul class="rp-aims">' + "".join(f'<li><span class="c2-ico">{ICON[i]}</span><div><b>{t}</b><span>{p}</span></div></li>' for i, t, p in rows) + '</ul>'
    return f'<section class="c2-sec"><div class="c2-band rp-challenge"><div><p class="c2-num">02 / The challenge</p><h2 class="c2-h2 rp-challenge__h">How can we make complex operational data easier to scan, compare and explore?</h2></div>{right}</div></section>'

def approach():
    items = [("bars", "Overview", "Key metrics at a glance."), ("trend", "Trends", "Understand performance over time."), ("donut", "Distribution", "See how data is spread."), ("table", "Detail", "Explore individual records.")]
    return grid([card(t, p, mod="c2-card--line", ico=f'<div class="c2-icotile">{ICON[i]}</div>') for i, t, p in items], 4)

HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Product design · Zoho SalesIQ", "Case study 04 / 07")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">A reporting experience built for clarity and action.</h1>
      <p class="c2-lede">I redesigned SalesIQ’s reporting experience to bring consistency, reduce complexity and make product activity easier to understand and act on.</p>
    </div>
    {meta([("Role", "Owned product design"), ("Platform", "Web dashboard"), ("Period", "2018 – 2024"), ("Built with", "KPI card, Chart, Heatmap, Table")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The redesigned Chats report, recreated">
    <div class="c2-visual c2-frame">{dashboard()}</div>
    {cap("The redesigned Chats report, recreated with sample data. Not a production screenshot.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. Reports are recreated with sample data; internal metrics, customer details and unreleased work are left out.</p></div>
  </section>
'''

SECTIONS = [
    sec("01 / Context", "Reports were valuable, but hard to navigate.",
        "The existing reports provided useful data, but the experience felt fragmented, visually noisy and inconsistent across different report types.",
        before_articles()),
    challenge_band(),
    sec("03 / The approach", "A clearer structure for deeper insights.",
        "I reimagined the reporting experience around a simple, consistent structure: overview, trends, distribution and detailed records.",
        approach()),
    sec("04 / The new experience", "From high-level performance to conversation details.",
        "A unified reporting experience with clear hierarchy, consistent visual patterns, and everything teams need to understand, monitor and improve customer interactions.",
        split(f'<div class="c2-frame">{dashboard(small=True, heat=True)}</div>',
              steps([("At a glance", "Key performance metrics to quickly understand overall activity."),
                     ("Across time", "Trend and volume views to spot patterns, peaks and changes in engagement."),
                     ("Into detail", "A complete conversation record with filtering, export and deeper context.")], dot="c2-dot--blue", loose=True))),
    outcome("05 / The outcome", "A more consistent, structured and actionable reporting experience.",
            [("", "1 surface", "Engagement, support, bots, outbound and live activity."), ("", "7 report groups", "Each answers a single question."), ("", "4 layers", "Number, trend, breakdown, rows.")], tint=True),
]

AFTER = public("What the feature does today",
               [("One overview", "Reports 2.0 covers brand performance and support operations."),
                ("Operator reports", "Chat volume, feedback rating, availability and performance per operator."),
                ("Bot reports", "Zobot and Answer Bot conversation volume, operator offload and bot performance."),
                ("Filters that fit", "Filter by bot name, department and bot platform, and choose whether bot data counts in operator reports.")],
               "Source: help.zoho.com · Reports 2.0")

PAGE = dict(
    file="case-reports.html",
    title="Reports and analytics revamp · Case study 04 · Ganeshkumar B",
    description="SalesIQ’s numbers were spread across modules. I owned the design of the Reports revamp: one place to read engagement, support, bots, outbound and live activity, without hunting for it.",
    og="assets/og/case-reports.png",
    nav=nav_case(4, 7, "case-operator-console.html", "Operator Console", "case-brand-configuration.html", "Brand"),
    hero=HERO, sections=SECTIONS, after=AFTER,
    extra_css='<style>.c2-page .cs-next__title{font-size:clamp(30px,3.1vw,45px)}</style>',
    next=dict(label="Next case study", title="Brand configuration, rebuilt as self-service", href="case-brand-configuration.html"),
)
