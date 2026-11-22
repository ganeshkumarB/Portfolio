"""Case 05 · Brand configuration. Figma node 24:358."""
from build import *

CH = {"web": ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>', "br-ch--blue"),
      "sdk": ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17h2"/></svg>', "br-ch--blue"),
      "wa": ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l1.5-4A8 8 0 1 1 8.5 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/></svg>', "br-ch--green")}
ROWS = [("N", "Northwind", "General +2", ["web", "sdk", "wa"], "#f6c6a8", "Anita R.", "updated a few seconds ago"),
        ("L", "Lumen Labs", "Research +2", ["web", "sdk", "wa"], "#c8e0f8", "Karthik S.", "updated 5 minutes ago"),
        ("B", "Brightside", "Support +30", ["web", "wa"], "#d5e8c8", "Meera J.", "updated 1 hour ago"),
        ("K", "Kestrel Foods", "General +2", ["web", "sdk"], "#e0d0f8", "Rohan P.", "updated 3 days ago")]

def brands_table(small=False):
    rows = "".join(
        f'<div class="br-row"><div class="br-row__name"><span class="br-letter">{l}</span>{n}</div><div class="br-row__dept"><i>⌘</i>{d}</div>'
        f'<div class="br-row__ch">' + "".join(f'<span class="br-ch {CH[c][1]}">{CH[c][0]}</span>' for c in chs) + '</div>'
        f'<div class="br-row__by"><span class="br-ava" style="background:{col}"></span><div><b>{who}</b><span>{when}</span></div></div><span class="br-toggle" aria-hidden="true"></span></div>'
        for l, n, d, chs, col, who, when in ROWS)
    return f'''<div class="br-table{" br-table--sm" if small else ""}" role="img" aria-label="Brands home: four brands with departments, channels, last editor and an on/off toggle">
  <div class="br-crumb">← Settings › Brands</div>
  <div class="br-table__head"><h4>Brands (04)</h4><span class="br-search">⌕ Search</span><span class="br-btn">Filter</span><span class="br-btn br-btn--blue">Add</span></div>
  <div class="br-thead"><span>Name</span><span>Departments</span><span>Channels</span><span>Modified by</span><span></span></div>
  {rows}
</div>'''

def before_cards():
    overview = ('<div class="br-mini"><div class="br-mini__hero"><span class="br-mini__logo">N</span><div><b>Northwind <small>1 department</small></b><span>Add description here</span></div></div>'
                '<div class="br-mini__tiles">' + "".join(f'<div><i></i>{t}</div>' for t in ("Installation", "Components", "Messenger", "Response")) + '</div></div>')
    apps = ('<div class="br-mini br-mini--apps"><div class="br-mini__title">Apps (3)</div>'
            + "".join(f'<div class="br-mini__app"><span style="background:{c}"></span><div><b>{n}</b><em class="{k}">{s}</em></div></div>' for n, s, c, k in (("Northwind", "Active", "#ffd54a", "is-on"), ("Lumen Labs", "Active", "#f8d0d8", "is-on"), ("Kestrel Foods", "Inactive", "#15161a", ""))) + '</div>')
    chat = ('<div class="br-mini br-mini--chat"><div class="br-mini__side">' + "".join(f'<span class="{"is-on" if t == "Appearance" else ""}">{t}</span>' for t in ("Messenger", "Stickers", "Appearance", "Forms")) + '</div>'
            '<div class="br-mini__themes"><b>Themes</b><div><div class="br-theme is-on"><i></i><span>Ribbon</span></div><div class="br-theme"><i></i><span>Connect</span></div></div></div></div>')
    return ('<div class="c2-grid br-before" style="--n:3">'
            f'<div class="c2-card"><span class="c2-lbl">Before · Brand overview</span>{overview}</div>'
            f'<div class="c2-card"><span class="c2-lbl">Before · Apps / brands</span>{apps}</div>'
            f'<div class="c2-card"><span class="c2-lbl">Before · Chat customisation</span>{chat}</div></div>'
            + cap("Illustrative recreations of the earlier screens, with sample data."))

def before_after():
    before = ('<div class="br-list"><h4>Brand settings</h4>' + "".join(f'<div>{t}</div>' for t in ("Business hours", "Departments", "Language", "Operator conversation settings", "Data security")) + '</div>')
    return (f'<div class="c2-ba"><div>{pill("Before")}{before}</div><div class="c2-ba__arrow" aria-hidden="true">→</div>'
            f'<div>{pill("After", "c2-pill--blue")}<div class="c2-ba__shot">{brands_table(small=True)}</div></div></div>')

def approach_screens():
    radios = lambda on: "".join(f'<label><i class="{"is-on" if i == on else ""}"></i>{t}</label>' for i, t in enumerate(("24 / 7", "24 / 5", "Set custom hours")))
    create = ('<div class="br-create"><h4>Create your brand</h4><span class="br-create__logo">N</span>'
              '<label>Name *</label><div class="br-input">Northwind</div><label>Departments *</label><div class="br-input br-input--ph">Choose</div>'
              '<label>Language *</label><div class="br-input br-input--ph">Choose</div><label>Business hours *</label><div class="br-radios">' + radios(0) + '</div></div>')
    nav = "".join(f'<span class="{"is-on" if t == "Business hours" else ""}">{t}</span>' for t in ("Business hours", "⌄ Departments", "Language", "Home", "Chat", "Response message", "Proficiency management", "Call"))
    settings = ('<div class="br-settings"><div class="br-crumb">← Settings › Brand › Northwind › Brand settings</div><div class="br-settings__body">'
                f'<div class="br-settings__nav"><b>BRAND SETTINGS ⌄</b>{nav}</div>'
                '<div class="br-settings__main"><h4>Business hours</h4><label>Business hours *</label><div class="br-radios">' + radios(0) + '</div>'
                '<label>Business operating time zone</label><div class="br-input">Indian Standard Time GMT +5:30 ⌄</div><label class="br-check"><i></i>Hide chat widget outside business hours</label></div></div></div>')
    return (f'<div class="c2-ba br-approach"><div><div class="c2-frame">{create}</div></div><div class="c2-ba__arrow" aria-hidden="true">→</div><div><div class="c2-frame">{settings}</div></div></div>'
            + cap("Create the brand once, then every shared setting lives in one place. Recreated with sample data."))

def website_setup():
    nav_items = [("› Installation", "is-on"), ("⌄ Personalisation", "g"), ("Launcher", "sub"), ("Home", "sub"), ("Chat", "sub"), ("Forms", "sub"), ("Response message", "sub"), ("Ratings & feedback", "sub"), ("Call", "sub"), ("› Configuration", "g"), ("› Translation", "g")]
    nav = "".join(f'<span class="{k}">{t}</span>' for t, k in nav_items)
    code = ("&lt;script type=\"text/javascript\" id=\"zsiqchat\"&gt;\n  var $zoho = $zoho || {};\n  $zoho.salesiq = $zoho.salesiq || {\n    widgetcode: \"siq••••••••••••••\",\n    values: {}, ready: function(){}\n  };\n"
            "  var d = document; s = d.createElement(\"script\");\n  s.type = \"text/javascript\"; s.defer = true;\n  s.src = \"https://salesiq.zoho.com/widget\";\n&lt;/script&gt;")
    widget = ('<div class="br-widget"><div class="br-widget__head">' + ICON["chat"] + 'Chat with us now</div>'
              + "".join(f'<div class="br-widget__field{" br-widget__field--ta" if f == "Message *" else ""}">{f}</div>' for f in ("First name *", "Last name *", "Email", "Department *", "Message *"))
              + '<div class="br-widget__btn">Start chat</div></div>')
    return f'''<div class="c2-frame br-site" role="img" aria-label="Website channel setup: a section navigation, the install script, and a live chat widget preview">
  <div class="br-crumb">← Settings › Brand › Northwind › Website</div>
  <div class="br-site__body">
    <div class="br-site__nav"><b>{ICON["target"]} WEBSITE ⌄</b>{nav}</div>
    <div class="br-site__main"><h4>Website</h4><p>Install this code on your website to start using SalesIQ.</p><span class="br-select">SalesIQ script ⌄</span><pre class="br-code">{code}</pre><div class="br-site__links"><span>✉ Email webmaster</span><span>◎ Personalise your chat launcher</span><span>▦ Schedule a free setup</span></div></div>
    <div class="br-site__preview">{widget}</div>
  </div>
</div>'''

def custom_cards():
    chat = ('<div class="br-small"><b>' + ICON["chat"] + 'Chat</b><div class="br-tabs"><span>Forms</span><span class="is-on">Personalisation</span></div><label>Display info</label>'
            '<div class="br-radios br-radios--row"><label><i></i>Company</label><label><i class="is-on"></i>Brand</label><label><i></i>Operator</label></div><label>During business hours</label><div class="br-input br-input--ph">First name *</div><div class="br-input br-input--ph">Last name *</div></div>')
    launcher = ('<div class="br-small"><b>' + ICON["bolt"] + 'Launcher</b><label>Launcher type</label><div class="br-radios br-radios--row"><label><i class="is-on"></i>Default launcher</label><label><i></i>Custom launcher</label></div><label>Launcher style</label>'
                '<div class="br-launchers"><div class="is-on"><span>Hey there!</span><i>' + ICON["chat"] + '</i></div><div><span>Hey there!</span><i>' + ICON["chat"] + '</i></div></div></div>')
    home = ('<div class="br-small"><b>' + ICON["box"] + 'Home</b><label>Header</label><div class="br-input">Chat with us now!</div><label>Welcome message</label><div class="br-input br-input--ta">We’re here to help you. How can we assist you today?</div></div>')
    items = [(chat, "Configure the conversation.", "Collect the right information with customisable forms, conversation options and controls."),
             (launcher, "Shape the first interaction.", "Choose a launcher style, message, position and behaviour that fits your brand."),
             (home, "See it as visitors do.", "Customise the home view, welcome message and quick actions with a live preview.")]
    return '<div class="c2-grid br-custom" style="--n:3">' + "".join(f'<div><div class="c2-frame">{ui}</div><h3 class="c2-h3">{t}</h3><p class="c2-p">{p}</p></div>' for ui, t, p in items) + '</div>'

HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Product design · Zoho SalesIQ", "Case study 05 / 07")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">Brand configuration, rebuilt as self-service.</h1>
      <p class="c2-lede">The earlier experience spread brand and channel settings across multiple screens, making it hard to set up, maintain and scale. I rebuilt Brand as a self-service home: shared settings set once, and every channel on its own.</p>
    </div>
    {meta([("Role", "Product design and information architecture"), ("Platform", "Web · SDK · WhatsApp"), ("Timeline", "2019 – 2024"), ("Scope", "Brand setup, channel configuration, forms, security and more")])}
  </section>

  <section class="cs-visual" data-layer="Hero visual" aria-label="The new Brands home, recreated">
    <div class="c2-visual c2-frame">{brands_table()}</div>
    {cap("The new Brands home, recreated with sample brands and people. Not a production screenshot.")}
  </section>

  <section class="cs-note" data-layer="NDA note">
    <div class="cs-note__box"><span class="lbl">Note</span><p>This work was done under a non-disclosure agreement with Zoho. Screens are recreated with sample brands and data; internal metrics, customer details and unreleased work are left out.</p></div>
  </section>
'''

SECTIONS = [
    sec("01 / Context", "One brand, many channels.",
        "A brand in SalesIQ works across multiple surfaces (website, mobile SDK and WhatsApp) with a consistent identity and experience. Before, that brand was set up in three different places.",
        before_cards()),
    sec("02 / The transformation", "From a settings list to a brand home.",
        "Earlier, a brand was a long list of settings spread across pages. The new brand home gives a clear overview and an entry point for each channel.",
        before_after()),
    sec("03 / The approach", "Set once, used everywhere.",
        "A shared business setup for the brand, and channel-specific configuration for unique needs, so nothing is repeated and things stay consistent.",
        approach_screens()),
    sec("04 / Chat window customisation", "Your brand, inside every conversation.",
        "A focused, structured customisation experience for the chat window, from how it launches to how conversations look and feel, with a live preview at every step.",
        website_setup() + custom_cards(), band=True),
    sec("05 / The decisions", "Three decisions that shaped it.", None,
        decisions([("The brand is the home, not the channel.", "A single place to manage the brand, with clear entry points for each channel."),
                   ("Shared first, channel second.", "Common details like business hours, departments and security are set once and applied everywhere."),
                   ("Room for the next channel.", "A structure that can grow: new channels are added without redesigning the experience.")])),
    sec("06 / What changed", "What changed.", "A more focused, flexible and scalable brand configuration experience.",
        grid([card("Developer help", "From multiple dependencies to a self-service setup.", ico=f'<div class="c2-icotile">{ICON["code"]}</div>'),
              card("Self-service", "Business and channel settings in one place, with clear guidance.", ico=f'<div class="c2-icotile">{ICON["bolt"]}</div>'),
              card("Channels in one place", "Website, SDK and WhatsApp, managed under a single brand.", ico=f'<div class="c2-icotile">{ICON["layers"]}</div>')], 3)),
    sec("07 / The takeaway", "", None, quote("“Settings are a place, not a list.”", "Giving each brand one home, with every channel visible on it, did more for self-service than any single new setting.")).replace('<h2 class="c2-h2"></h2>', ""),
]

PAGE = dict(
    file="case-brand-configuration.html",
    title="Brand configuration · Case study 05 · Ganeshkumar B",
    description="Setting up a brand across website, app and WhatsApp needed developer help. I rebuilt Brand as a self-service home: shared business settings set once, and every channel on its own card.",
    og="assets/og/case-brand-configuration.png",
    nav=nav_case(5, 7, "case-reports.html", "Reports", "case-outbound.html", "Outbound"),
    hero=HERO, sections=SECTIONS,
    next=dict(label="Next case study", title="Outbound broadcast", href="case-outbound.html"),
)
