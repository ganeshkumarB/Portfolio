"""Case 07 · Survey, Rating and Feedback. Figma: ganeshuxcraft — Portfolio Design System, node 22:320."""
from build import *

# ---------------------------------------------------------------- pieces of the recreated product
SEARCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.3 10.3L13.5 13.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
RAIL_ICONS = {
    "Live view": '<svg viewBox="0 0 20 20"><path d="M3 11a7 7 0 0 1 14 0M6 11a4 4 0 0 1 8 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="10" cy="11.5" r="1.4" fill="currentColor"/></svg>',
    "Chats": '<svg viewBox="0 0 20 20"><path d="M3 4h14v9H8l-4 3z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    "My chats": '<svg viewBox="0 0 20 20"><path d="M3 4h14v9H8l-4 3z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    "Visitors": '<svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 17a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    "Calls": '<svg viewBox="0 0 20 20"><path d="M5 3l3 1 1 3-2 1.5a8 8 0 0 0 4.5 4.5L13 11l3 1 1 3-2 2C9 17 3 11 3 5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    "Feedback": '<svg viewBox="0 0 20 20"><path d="M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    "Reports": '<svg viewBox="0 0 20 20"><path d="M4 16V9M8 16V4M12 16v-6M16 16v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    "Articles": '<svg viewBox="0 0 20 20"><rect x="4" y="3" width="12" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
}
def rail(items, active="Feedback"):
    return '<nav class="fb2-rail" aria-hidden="true">' + "".join(f'<span class="{"is-on" if n == active else ""}">{RAIL_ICONS[n]}<i>{n}</i></span>' for n in items) + '</nav>'
def topbar():
    return f'<div class="fb2-top"><span class="fb2-search">{SEARCH}Search chat, lead, contact, company</span><span class="fb2-avail">Available <i></i></span><span class="fb2-ava"></span></div>'

SMILE_GOOD = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#ffd54a"/><circle cx="14" cy="16" r="2.2" fill="#15161a"/><circle cx="26" cy="16" r="2.2" fill="#15161a"/><path d="M12 24q8 7 16 0" fill="none" stroke="#15161a" stroke-width="2.4" stroke-linecap="round"/></svg>'
def face(kind):  # tiny emoji badges for the old list
    col = {"good": "#ffd54a", "neutral": "#ffd54a", "bad": "#f28b82"}[kind]
    mouth = {"good": "M8 13q4 3 8 0", "neutral": "M8 13.5h8", "bad": "M8 14.5q4-3 8 0"}[kind]
    return f'<svg class="fb2-face" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="{col}"/><circle cx="8.5" cy="9.5" r="1.3" fill="#15161a"/><circle cx="15.5" cy="9.5" r="1.3" fill="#15161a"/><path d="{mouth}" fill="none" stroke="#15161a" stroke-width="1.6" stroke-linecap="round"/></svg>'

def card_review():
    return ('<div class="fb2-card"><b class="fb2-card__t">Rating review</b><div class="fb2-review"><div class="fb2-review__face">' + SMILE_GOOD + '<b>Good</b><span>Average</span></div>'
            '<div class="fb2-bars">' + "".join(f'<div><span>{l}</span><i style="--w:{w}%"></i><em>{v}</em></div>' for l, w, v in [("Good", 60, "98 (60%)"), ("Neutral", 20, "35 (20%)"), ("Bad", 16, "28 (16%)")]) + '</div></div></div>')
def card_csat():
    return ('<div class="fb2-card"><b class="fb2-card__t">CSAT score</b><div class="fb2-gauge"><svg viewBox="0 0 120 120" aria-hidden="true">'
            '<path d="M60 14a46 46 0 0 1 46 46" fill="none" stroke="#7c6ff0" stroke-width="10" stroke-linecap="round" stroke-dasharray="40 200" stroke-dashoffset="-10" transform="rotate(-20 60 60)"/>'
            '<path d="M60 14a46 46 0 0 1 46 46" fill="none" stroke="#7c6ff0" stroke-width="10" stroke-linecap="round" stroke-dasharray="40 200" stroke-dashoffset="-10" transform="rotate(70 60 60)"/>'
            '<path d="M60 14a46 46 0 0 1 46 46" fill="none" stroke="#7c6ff0" stroke-width="10" stroke-linecap="round" stroke-dasharray="40 200" stroke-dashoffset="-10" transform="rotate(160 60 60)"/>'
            '<path d="M60 14a46 46 0 0 1 46 46" fill="none" stroke="#7c6ff0" stroke-width="10" stroke-linecap="round" stroke-dasharray="40 200" stroke-dashoffset="-10" transform="rotate(250 60 60)"/>'
            '</svg><b>40</b><span>Fair</span></div><p class="fb2-card__foot">Last updated: 1 min ago</p></div>')
def card_trend():
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = [(28, 6, 8, 8), (16, 4, 6, 6), (22, 5, 6, 6), (26, 8, 8, 8), (20, 4, 6, 6), (34, 12, 10, 10), (56, 14, 12, 12), (40, 10, 10, 10), (30, 8, 8, 8), (46, 12, 10, 10), (24, 6, 6, 6), (30, 10, 8, 8)]
    bars = "".join(f'<div class="fb2-bar"><i style="height:{d[3]}px;background:#d7dae0"></i><i style="height:{d[2]}px;background:#e8505b"></i><i style="height:{d[1]}px;background:#ffd54a"></i><i style="height:{d[0]}px;background:#7c6ff0"></i><span>{m}</span></div>' for m, d in zip(months, data))
    return ('<div class="fb2-card fb2-card--trend"><b class="fb2-card__t">Rating trend</b><div class="fb2-legend"><span><i style="background:#7c6ff0"></i>Happy</span><span><i style="background:#ffd54a"></i>Neutral</span><span><i style="background:#e8505b"></i>Sad</span><span><i style="background:#d7dae0"></i>Unrated</span></div>'
            '<div class="fb2-chart"><div class="fb2-axis"><span>100</span><span>50</span><span>0</span></div><div class="fb2-bars-row">' + bars + '</div></div></div>')
def cards_row(): return '<div class="fb2-cards">' + card_review() + card_csat() + card_trend() + '</div>'

ROWS = [("good", "Good", "Northwind support helped us improve our engagement with website visitors, so we connect instantly and help right when they need it.", "#28022 · Pricing page enquiry", "Rowan", "Northwind", "#f5a623", "Finance", "1 min 49s"),
        ("score", "9/10", "The setup was quick and straightforward, and the interface is easy to use. Our team was able to start with minimal training.", "#28023 · Onboarding help", "Rowan", "Lumen Labs", "#2bb59a", "Marketing", "1 min 49s"),
        ("good", "Good", "The CRM integration is seamless. It’s great to have all our chat history and lead data synced directly, which saves time.", "#28024 · CRM sync question", "", "Brightside", "#e8505b", "Sales", "1 min 49s")]
def table(rows=3, compact=False):
    out = [f'<div class="fb2-table{" fb2-table--compact" if compact else ""}"><b class="fb2-card__t">All feedback</b><table><thead><tr><th></th><th>Rating</th><th>Feedback</th><th>Chat details</th>' + ("" if compact else "<th>Brand</th><th>Department</th><th>Time</th>") + '</tr></thead><tbody>']
    for kind, lbl, text, chat, agent, brand, col, dept, time in ROWS[:rows]:
        rating = (f'<span class="fb2-rate fb2-rate--good">{SMILE_GOOD}<i>Good</i></span>' if kind == "good" else '<span class="fb2-rate fb2-rate--score"><b>9/10</b><i>Extremely</i></span>')
        chatcell = f'<a>{chat}</a>' + (f'<span class="fb2-agent"><i></i>{agent}</span>' if agent else "")
        extra = "" if compact else f'<td><span class="fb2-brand"><i style="background:{col}"></i>{brand}</span></td><td><span class="fb2-dept">⚲ {dept}</span></td><td><span class="fb2-time">◷ {time}</span></td>'
        out.append(f'<tr><td><span class="fb2-check"></span></td><td>{rating}</td><td class="fb2-text">{text}</td><td>{chatcell}</td>{extra}</tr>')
    out.append('</tbody></table></div>')
    return "".join(out)

FILTERS = [("All feedback", "16.8k", True), ("My feedback", "123", False), ("Good", "500", False), ("Neutral", "200", False), ("Bad", "100", False), ("Website", "40", False), ("iOS", "25", False), ("Android", "12", False), ("WhatsApp", "16.8k", False), ("Telegram", "19.8k", False), ("Brand 1", "20", False), ("Brand 2", "1", False), ("Brand 3", "1", False)]
def filters():
    return '<aside class="fb2-filters"><span class="fb2-filters__h">Feedback</span>' + "".join(f'<span class="{"is-on" if on else ""}"><b>{n}</b><i>{c}</i></span>' for n, c, on in FILTERS) + '</aside>'

def dashboard(mini=False):
    return (f'<div class="fb2-app{" fb2-app--mini" if mini else ""}" role="img" aria-label="The redesigned Rating and feedback view: filters, rating review, CSAT score, rating trend and a feedback table">'
            + topbar() + '<div class="fb2-body fb2-body--dash">' + rail(["Live view", "Chats", "Visitors", "Calls", "Feedback", "Reports", "Articles"]) + filters()
            + '<div class="fb2-main"><div class="fb2-main__h"><b>Rating &amp; feedback</b><span class="fb2-select">Today ⌄</span></div>' + cards_row() + table(3) + '</div></div></div>')

def old_view(mini=False):
    items = [("Visitor 6098", "Good experience. Got what I needed.", "09 Apr", "good", True), ("Visitor 4127", "Share your rating and feedback", "09 Apr", "neutral", False),
             ("Ishrath", "ok", "01 Apr", "neutral", False), ("Ishrath", "Very good experience", "01 Apr", "good", False), ("Visitor 80690", "Slow to reply today", "01 Apr", "bad", False)]
    lst = '<div class="fb2-list"><div class="fb2-list__h">All feedback <i>⌄</i></div>' + "".join(f'<div class="fb2-item{" is-on" if on else ""}"><span class="fb2-item__ava"></span><div><b>{n}</b><p>{t}</p></div><em>{d}</em>{face(k)}</div>' for n, t, d, k, on in items) + '</div>'
    mid = ('<div class="fb2-conv"><div class="fb2-conv__h"><b>Visitor 6098</b><span>#37112 · Arav</span></div><div class="fb2-conv__tabs"><span class="is-on">Summary</span><span>Ratings &amp; feedback</span><span>Conversation info</span></div>'
           '<div class="fb2-summary">This conversation doesn’t have enough information to generate a summary.</div>'
           '<div class="fb2-msg"><b>Visitor 6098</b><span>hello <em>08:32 PM</em></span></div><div class="fb2-msg"><b>Arav</b><span>hello <em>08:32 PM</em></span></div></div>')
    info = ('<div class="fb2-info"><div class="fb2-info__tabs"><span class="is-on">Info</span><span>Recent feedback</span><span>Notes</span></div><b>Visitor 6098</b><p>Chennai, Tamil Nadu, India</p><p>10 Apr 2026, 03:16 PM (GMT +5:30)</p>'
            '<dl><dt>Source</dt><dd>Website</dd><dt>IP address</dt><dd>121.244.•••</dd><dt>Chat initiated page</dt><dd><a>/pricing</a></dd><dt>Landing page</dt><dd><a>/home</a></dd><dt>Current page</dt><dd><a>/pricing</a></dd></dl></div>')
    return (f'<div class="fb2-app{" fb2-app--mini" if mini else ""}" role="img" aria-label="The earlier, conversation-centric view: a feedback list, the chat transcript and visitor info side by side">'
            + topbar() + '<div class="fb2-body fb2-body--old">' + rail(["Live view", "My chats", "Visitors", "Calls", "Feedback"]) + lst + mid + info + '</div></div>')

def side_panel():
    return ('<div class="fb2-app fb2-app--panel" role="img" aria-label="A feedback entry opened beside the table: the conversation with its Refer a friend tag"><div class="fb2-body fb2-body--panel">'
            + rail(["Live view", "Chats", "Visitors", "Calls"]) + '<div class="fb2-panel-main"><div class="fb2-main__h fb2-main__h--line"><b>Rating &amp; feedback</b></div>' + table(2, compact=True) + '</div>'
            '<aside class="fb2-side"><div class="fb2-side__h"><span class="fb2-x">×</span><div><b>#28022</b><span>Northwind · Onboarding</span></div><span class="fb2-infopill">ⓘ Info</span></div>'
            '<span class="fb2-side__lbl">Conversation tag:</span><div class="fb2-refer"><div class="fb2-refer__top"><b>Refer a friend</b><span>Get a month free</span></div><p>Hey Alex! You can’t miss our ongoing referral offer at Northwind 🎉</p></div>'
            '<div class="fb2-reply">Thanks, sharing it now!</div></aside></div></div>')

def ba():
    return ('<div class="c2-ba fb2-ba"><div><b class="fb2-ba__lbl">Before</b><div class="c2-ba__shot">' + old_view(True) + '</div><h3 class="c2-h3">Conversation-centric</h3><p class="c2-p">Feedback lived inside the chat workspace.</p></div>'
            '<span class="c2-ba__arrow" aria-hidden="true">→</span>'
            '<div><b class="fb2-ba__lbl fb2-ba__lbl--after">After</b><div class="c2-ba__shot">' + dashboard(True) + '</div><h3 class="c2-h3">Feedback-centric</h3><p class="c2-p">A dedicated space to review feedback, trends and context.</p></div></div>')

def side_sec(num, title, text, screen):
    left = f'<h2 class="c2-h2">{title}</h2><p class="c2-body fb2-side-p">{text}</p>'
    return f'<section class="c2-sec fb2-sidesec"><p class="c2-num">{esc(num)}</p>' + split(left, screen, rev=True) + '</section>'

# ---------------------------------------------------------------- page
HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Product experience · Zoho SalesIQ", "Case study 07 / 07")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">Every response tells a bigger story.</h1>
      <p class="c2-lede">Bringing customer sentiment, feedback and conversation context together in a more connected review experience.</p>
    </div>
    {meta([("Role", "Product Designer"), ("Platform", "Zoho SalesIQ (Web)"), ("Focus", "Feedback · CSAT · Analytics"), ("Scope", "Product design · Interaction design · Experience redesign")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The redesigned Rating and feedback view, recreated">
    <div class="c2-visual">{dashboard()}</div>
    {cap("The redesigned Rating &amp; feedback view, recreated with sample brands and data. Not a production screenshot.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. Screens are recreated with sample brands, visitors and data; internal metrics, customer details and unreleased work are left out.</p></div>
  </section>
'''

SECTIONS = [
    sec("01 / The problem", "Feedback existed. Understanding it took more effort.",
        "The previous experience placed feedback within the conversation workspace. Reviewing responses meant navigating a chat-centric interface, where feedback, conversation history and visitor information shared the same space.",
        old_view() + cap("Illustrative recreation of the earlier, conversation-centric view.")),
    sec("02 / The reframing", "Make feedback the starting point.",
        "We moved from a conversation-centric view to a dedicated feedback experience, designed to help teams review, explore and act on customer sentiment more effectively.",
        ba(), band=True),
    side_sec("03 / Sentiment", "See sentiment at a glance.", "Rating distribution, CSAT score and trends bring the overall feedback picture into focus before diving into individual responses.", cards_row()),
    side_sec("04 / Context", "Read feedback in context.", "A structured feedback table brings ratings, customer comments and key details (brand, department and time) into a single, scannable view.", table(2)),
    side_sec("05 / Conversation", "Keep the conversation close.", "Open a feedback entry to see the related conversation in a side panel, and review it with full context without leaving the feedback flow.", side_panel()),
    '<section class="c2-sec fb2-take"><p class="c2-num">06 / Takeaway</p><h2 class="c2-h2">Feedback is more than a score.</h2><p class="c2-sub">It is the context that makes it meaningful.</p></section>',
]

PAGE = dict(
    file="case-feedback.html",
    title="Survey, Rating and Feedback · Case study 07 · Ganeshkumar B",
    description="The end of a chat is the best moment to ask how it went. I redesigned Rating & Feedback so teams choose how visitors rate, how SalesIQ replies to each answer, and when to hand off to a full Zoho Survey.",
    og="assets/og/case-feedback.png",
    nav=nav_case(7, 7, "case-outbound.html", "Outbound", "index.html#work", "All work"),
    hero=HERO, sections=SECTIONS,
    after=public("What the feature does today",
                 [("After every chat", "Visitors are shown a feedback form when a chat ends."),
                  ("Feedback module", "Responses are listed newest first, each opening a detailed chat review."),
                  ("Rating filters and export", "Filter by Happy, Neutral or Sad ratings, and export the results."),
                  ("Zoho Survey", "Send surveys through chat and map answers to visitor information.")],
                 "Source: help.zoho.com · zoho.com/survey/salesiq-integration.html"),
    next=dict(label="Next case study", title="Back to all work", href="index.html#work"),
)
