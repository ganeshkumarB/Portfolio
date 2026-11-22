"""Case 06 · Outbound Messages. Figma: ganeshuxcraft — Portfolio Design System, node 20:282."""
from build import *

# ---------------------------------------------------------------- small drawings
WA = '<svg viewBox="0 0 16 16" class="ob2-ch ob2-ch--wa" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.6 6.2c.3 1.6 1.5 3 3.2 3.4l.9-.9 1.2.6-.3 1.1c-2.8.4-5.4-2.1-5.6-4.9l1-.4.6 1.2z" fill="currentColor"/></svg>'
GLOBE = '<svg viewBox="0 0 16 16" class="ob2-ch ob2-ch--web" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.7 8h12.6M8 1.7c2 2 2 10.6 0 12.6M8 1.7c-2 2-2 10.6 0 12.6" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
PHONE = '<svg viewBox="0 0 16 16" class="ob2-ch ob2-ch--app" aria-hidden="true"><rect x="4" y="1.7" width="8" height="12.6" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 12h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
SEARCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.3 10.3L13.5 13.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
MEGA = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6.5v3l7 2.5V4z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 5.2a3 3 0 0 1 0 5.6M4 9.5v3h2v-2.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'

def status(label, kind): return f'<span class="ob2-status ob2-status--{kind}">{label}</span>'
def channels(*icons): return '<span class="ob2-channels">' + "".join(icons) + '</span>'

def phone(title="Your discount is here!", msg="Get 20% off on your next purchase.", link="Shop now →", big=True):
    return (f'<div class="ob2-phone{"" if big else " ob2-phone--sm"}"><span class="ob2-phone__notch"></span><span class="ob2-phone__time">12:00</span>'
            f'<div class="ob2-notif"><div class="ob2-notif__app"><i></i>Northwind</div><b>{title}</b><p>{msg}</p>' + (f'<a>{link}</a>' if link else "") + '</div></div>')

def hero_visual():
    rows = [("Signal Stream", "Introduce your brand with a video", channels(GLOBE, PHONE, WA), "Leads", "Immediately", status("Active", "active")),
            ("Feature update", "Share the latest product updates", channels(GLOBE, WA), "Contacts", "Oct 28, 10:00 AM", status("Scheduled", "sched")),
            ("Feedback request", "Collect customer feedback", channels(WA), "Users", "Oct 30, 06:00 PM", status("Scheduled", "sched")),
            ("Festival offer", "Announce your special offer", channels(GLOBE, WA), "Leads", "—", status("Draft", "draft"))]
    table = ('<table class="ob2-table"><thead><tr><th>Broadcast name</th><th>Channel</th><th>Audience</th><th>Schedule</th><th>Status</th></tr></thead><tbody>'
             + "".join(f'<tr><td><b>{n}</b><span>{d}</span></td><td>{c}</td><td>{a}</td><td>{s}</td><td>{st}</td></tr>' for n, d, c, a, s, st in rows) + '</tbody></table>')
    return (f'<div class="ob2-hero"><div class="ob2-hero__blob" aria-hidden="true"></div>'
            f'<div class="ob2-app ob2-app--hero"><div class="ob2-app__top"><span class="ob2-search">{SEARCH}Search chat, lead, contact, company</span><span class="ob2-btn">Create</span></div>'
            f'<div class="ob2-app__head"><span class="ob2-app__title">{MEGA}Broadcasts</span></div>'
            '<div class="ob2-tabs"><span class="is-on">All</span><span>Active</span><span>Scheduled</span><span>Completed</span></div>' + table + '</div>'
            + phone() + '</div>')

def toasts(n):
    return '<div class="ob2-toasts">' + "".join(f'<div class="ob2-toast" style="--i:{i}"><i></i><i></i><i></i><b></b><b class="s"></b></div>' for i in range(n)) + '</div>'

def two_ways():
    a = (f'<div class="c2-card ob2-way"><div class="ob2-way__head"><span class="c2-icotile">{ICON["bolt"]}</span><div><h3 class="c2-h3">Proactive messages</h3><p class="c2-p">Reach users based on behaviour, conditions and timing.</p></div></div>{toasts(1)}</div>')
    b = (f'<div class="c2-card ob2-way"><div class="ob2-way__head"><span class="c2-icotile">{ICON["megaphone"]}</span><div><h3 class="c2-h3">Broadcasts</h3><p class="c2-p">Create and send a message to a selected audience across channels.</p></div></div>{toasts(3)}</div>')
    return grid([a, b], 2)

def field(label, placeholder, select=False, wide=False):
    return (f'<label class="ob2-field{" ob2-field--wide" if wide else ""}"><span>{label}</span><div class="ob2-input{" ob2-input--select" if select else ""}">{placeholder}' + ('<i aria-hidden="true">⌄</i>' if select else "") + '</div></label>')

def steps_col(items):
    return '<ol class="ob2-steps">' + "".join(f'<li{" class=is-on" if i == 0 else ""}><i></i>{t}</li>' for i, t in enumerate(items)) + '</ol>'

def screen_push():
    return (f'<div class="ob2-app ob2-screen"><div class="ob2-screen__bar"><span class="ob2-back" aria-hidden="true">←</span><b>Create push notification for mobile</b><span class="ob2-x" aria-hidden="true">×</span></div>'
            '<div class="ob2-screen__body ob2-screen__body--3">'
            + steps_col(["Push notification details", "Content", "Targeted platforms &amp; recipients", "Frequency"])
            + '<div class="ob2-form"><div class="ob2-form__h"><b>Mobile push notification</b><a>ⓘ Help</a></div>'
            + field("Title *", "Enter title here…") + field("Brand *", "Choose", select=True)
            + '<div class="ob2-form__h ob2-form__h--sub"><b>Content</b></div>' + field("Title *", "Enter title here…") + field("Message *", "Enter your message…")
            + '</div><div class="ob2-preview">' + phone("Your title…", "Your message…", None, big=False) + '</div></div></div>')

def screen_broadcast():
    gallery = ('<div class="ob2-gallery"><b>Message template gallery</b><div class="ob2-gallery__row">'
               '<div class="ob2-tpl"><i></i><i></i><i></i><b>Visual welcome</b><div class="ob2-tpl__art ob2-tpl__art--pills"><span></span><span></span><span></span></div></div>'
               '<div class="ob2-tpl"><i></i><i></i><i></i><b>Introduce your brand with a video</b><div class="ob2-tpl__art ob2-tpl__art--video"><span>▶</span></div></div>'
               '<div class="ob2-tpl"><i></i><i></i><i></i><b>Rate your satisfaction with this product</b><div class="ob2-tpl__art ob2-tpl__art--stars"><span>★ ★ ★ ★</span></div></div>'
               '</div></div>')
    return (f'<div class="ob2-app ob2-screen"><div class="ob2-screen__bar"><span class="ob2-back" aria-hidden="true">←</span><b>Create broadcast for website</b><span class="ob2-x" aria-hidden="true">×</span></div>'
            '<div class="ob2-screen__body ob2-screen__body--3b">'
            + steps_col(["Broadcast details", "Notification configuration", "Targeted platforms &amp; recipients", "Frequency", "Route response"])
            + '<div class="ob2-form"><div class="ob2-form__h"><b>Broadcast details</b></div>'
            + '<label class="ob2-field"><span>Name *<em class="ob2-id">ID: #10597970</em></span><div class="ob2-input">Enter broadcast name</div></label>'
            + field("Brands *", "Choose", select=True) + field("Departments *", "Choose", select=True)
            + '</div>' + gallery + '</div></div>')

def replies_table():
    rows = [("Parker Wheeler", "Confirms the customer’s order details and shares a summary.", "06:00 AM", "Northwind", "Support"),
            ("Braylee Church", "Lets the customer know a payment succeeded or is pending.", "06:00 PM", "Lumen Labs", "Billing"),
            ("Ivy Thompson", "Reminds the customer about an appointment tomorrow.", "08:30 PM", "Northwind", "Support")]
    return (f'<div class="ob2-app"><div class="ob2-app__top ob2-app__top--left"><span class="ob2-app__title">{MEGA}Outbound</span><span class="ob2-search">{SEARCH}Search chat, lead, contact, company</span></div>'
            '<div class="ob2-tabs ob2-tabs--export"><span class="is-on">All</span><span>Replied</span><span>Not replied</span><span>Failed</span><span class="ob2-export">⇪ Export</span></div>'
            '<table class="ob2-table ob2-table--replies"><thead><tr><th>Phone number</th><th>Outbound message</th><th>Time</th><th>Brand</th><th>Department</th><th>Channel</th></tr></thead><tbody>'
            '<tr class="ob2-group"><td colspan="6">Today, October 23</td></tr>'
            + "".join(f'<tr><td><b>{n}</b></td><td>{m}</td><td>{t}</td><td>{b}</td><td>{d}</td><td>{WA}</td></tr>' for n, m, t, b, d in rows)
            + '</tbody></table></div>')

# ---------------------------------------------------------------- page
HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Product design · Zoho SalesIQ", "Case study 06 / 07")}
    <div class="c2-hero__grid">
      <div><h1 class="c2-h1">Outbound Messages</h1><p class="c2-hero__tagline">Starting conversations, before customers do.</p></div>
      <p class="c2-lede">A new capability in Zoho SalesIQ to initiate conversations, reach the right audience and manage outbound communication across channels.</p>
    </div>
    {meta([("Role", "Product design"), ("Channels", "Web · WhatsApp · Mobile push"), ("Period", "2018 – 2024"), ("Built with", "Composer, audience targeting, scheduler, response routing")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The Broadcasts list and a mobile push preview, recreated">
    {hero_visual()}
    {cap("Recreated with sample campaigns. Not a production screenshot.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. Screens are recreated with sample campaigns and data; internal metrics, customer details and unreleased work are left out.</p></div>
  </section>
'''

SECTIONS = [
    sec("01 / The opportunity", "Conversations don’t always begin with the customer.",
        "Businesses often need to reach out: to share updates, follow up, promote offers or send timely reminders. The opportunity was to bring outbound communication into SalesIQ with the right flexibility and control."),
    sec("02 / Two ways to reach out", "One is personal. One is for many.", None, two_ways()),
    sec("03 / Proactive messages", "Reach the right person at the right moment.",
        "Initiate conversations based on visitor conditions, frequency and activation schedules, with complete control over who sees the message and when.",
        screen_push(), band=True),
    sec("04 / Broadcasts", "A message built to reach an audience.",
        "Create, configure and send messages to a targeted group, with support for rich content, templates, scheduling and response routing.",
        screen_broadcast(), band=True),
    sec("05 / The core decisions", "Compose. Target. Schedule. Route.",
        "The outbound experience comes together through four key decisions, each designed to give businesses the right control without adding complexity.",
        flow([card("Compose", "Write or select a message template.", ico=f'<span class="c2-icotile">{ICON["chat"]}</span>'),
              card("Target", "Choose the audience and set conditions.", ico=f'<span class="c2-icotile">{ICON["users"]}</span>'),
              card("Schedule", "Define when and how often to send.", ico=f'<span class="c2-icotile">{ICON["calendar"]}</span>'),
              card("Route", "Direct replies to a team, rule or bot.", ico=f'<span class="c2-icotile">{ICON["layers"]}</span>')])),
    sec("06 / From message to conversation", "The message is the beginning.",
        "Outbound messages don’t end at delivery. Responses flow back into SalesIQ, where bots or teams can continue the conversation.",
        replies_table() + cap("Recreated with sample people and brands.")),
    '<section class="c2-sec"><p class="c2-num">07 / The outcome</p>' + quote("“Different needs. Different ways to reach out. One connected experience.”",
        "Outbound Messages gives businesses a flexible, controlled way to start conversations, from timely notifications to large-scale broadcasts, all within SalesIQ.") + '</section>',
]

PAGE = dict(
    file="case-outbound.html",
    title="Outbound broadcast and push campaigns · Case study 06 · Ganeshkumar B",
    description="Sometimes the business should speak first. I designed how teams write a campaign, choose who gets it, schedule it and see how it went, on WhatsApp, the web and mobile.",
    og="assets/og/case-outbound.png",
    nav=nav_case(6, 7, "case-brand-configuration.html", "Brand", "case-feedback.html", "Feedback"),
    hero=HERO, sections=SECTIONS,
    after=public("What the feature does today",
                 [("WhatsApp broadcast", "Schedule bulk WhatsApp messages from pre-approved templates."),
                  ("Sending preferences", "Start date, end schedule and frequency, to avoid over-messaging."),
                  ("Website and app broadcasts", "One message to many leads and contacts, shown in the chat window, on a recurring schedule."),
                  ("Outbound reports", "Broadcast and proactive results read from a single dashboard.")],
                 "Source: help.zoho.com · SalesIQ Outbound · blog.zoho.com/salesiq"),
    next=dict(label="Next case study", title="Survey, Rating and Feedback", href="case-feedback.html"),
)
