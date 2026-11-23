"""Meet Sunny, the mascot. Figma node 85:638 (Case — Sunny).
The faces, acts, sounds and voices are read from sunny.js and puppy.js at build time, so the page can
never claim a number the code does not have; the tiles themselves are drawn live by the mascot's own art."""
import re
from pages._info import *

SRC_S = (ROOT / "sunny.js").read_text()
SRC_P = (ROOT / "puppy.js").read_text()

def keys(src, var, pat=r"\b([a-z0-9]+):"):
    """keys of a JS object literal: one-liners end at the first '};', multi-line ones at the first line that is just '  };'"""
    i = src.index(var); seg = src[i:i + 14000]
    nl = seg.find("\n"); end = seg.find("};")
    if nl == -1 or (end != -1 and end < nl): seg = seg[:end]
    else: seg = seg[:seg.index("\n  };") if "\n  };" in seg else len(seg)]
    return list(dict.fromkeys(m.group(1) for m in re.finditer(pat, seg, re.M)))

S_EMOTIONS = keys(SRC_S, "var EMOTIONS = {", r"\b([a-z]+): \d")
S_ACTS = [k for k in keys(SRC_S, "var ACTS = {", r"^\s{4}([a-z]+):\s*\{") if k]
S_SOUNDS = keys(SRC_S, "var SFX = {", r"^\s{4}([a-z]+):\s*function")
S_VOICES = keys(SRC_S, "var VOICES = {", r"^\s{4}([a-z]+):\s*\{")
MOODS = re.search(r'var MOODS = \[([^\]]*)\]', SRC_S)
MOODS = re.findall(r'"([a-z]+)"', MOODS.group(1)) if MOODS else []
P_EMOTIONS = keys(SRC_P, "var EMOTIONS = {", r"\b([a-z]+): \d")
P_ACTS_ALL = re.findall(r"\b([a-z0-9]+): \{ ms", SRC_P[SRC_P.index("var ACTS = {"):SRC_P.index("var ACTS = {") + 1200])
P_UTILITY = {"blink2", "run", "wakeup"}
P_ACTS = [a for a in P_ACTS_ALL if a not in P_UTILITY]

S_EMO_CAP = {"happy": "A nice moment.", "surprised": "A click, a plot twist.", "curious": "Watching what you do.", "wink": "A quick in-joke.", "sleepy": "Left idle a while.",
    "shy": "After a slip or a compliment.", "excited": "A catch or a trick.", "dizzy": "After being thrown.", "angry": "Pushed too far.", "sad": "When you leave.", "love": "Kind actions.",
    "cool": "Shades on, e.g. right-click.", "laugh": "A big grin.", "whoa": "Very short shock.", "bored": "Nothing happening.", "proud": "After a selfie or a song.", "blush": "Pink cheeks, smile sound.",
    "focused": "Reading along with you.", "relaxed": "Calm, slow idle.", "confused": "Doesn’t quite follow."}
S_ACT_CAP = {"wave": "Waves hello.", "hop": "A quick hop.", "peek": "Ducks, then pops up.", "stretch": "Big stretch and a yawn.", "dance": "A short dance.", "walk": "Walks along the bottom.",
    "cycle": "Rides a bike, rings the bell.", "swim": "Swims out and back: “Brr.”", "drink": "Sips a drink: “Ahh.”", "drunk": "Wobbles and hiccups.", "joker": "Jester hat, juggling.",
    "smoke": "Coughs: “Never again.”", "beer": "“Clink!”, then a gulp.", "sing": "Sings: “Thank you, thank you.”", "read": "Reads: “Plot twist!”", "yoga": "Yoga: “Namaste.”",
    "skate": "Skates across; sometimes bails.", "fish": "Fishes; catches one half the time.", "selfie": "Phone out: “Nailed it.”", "skip": "Skipping rope; may trip.", "sleep": "Naps with a “zZ”."}
P_EMO_CAP = {"happy": "Bright eyes.", "curious": "Head tilt, a question.", "surprised": "Mouth open.", "sleepy": "Heavy eyelids.", "excited": "Bouncy, sparkles.", "sad": "A tear.", "shy": "Blushing.",
    "love": "Hearts.", "proud": "Chest out.", "dizzy": "X eyes.", "scared": "Startled, a drop.", "mischievous": "Up to something.", "confused": "A question mark."}
P_ACT_CAP = {"wag": "Tail wag.", "tilt": "Head tilt.", "twitch": "Ear twitch.", "hop": "Small hop.", "sniff": "Sniffs around.", "scratch": "Scratches an itch.", "shake": "Shakes off.", "peek": "Peeks in.",
    "bounce": "Bounces on the spot.", "sit": "Sits.", "lie": "Lies down.", "sleep": "Sleeps.", "stretch": "Stretches.", "spin": "Spins around.", "listen": "Listens.", "howl": "Howls.", "nudge": "Nudges Sunny.",
    "paw": "Paws at you.", "yawn": "Yawns.", "lookup": "Looks up.", "perk": "Ears up.", "groom": "A quick groom.", "lick": "A lick.", "zoomies": "Zoomies.", "tailchase": "Chases its tail.",
    "oops": "Trips, recovers.", "pawcheck": "Inspects a paw.", "butterfly": "Follows a butterfly.", "attention": "Stares at you.", "sneeze": "Sneezes."}

def tile(kind, who, name, cap, label=None):
    label = label or name
    return (f'<button class="sy-tile sy-art" type="button" data-who="{who}" data-kind="{kind}" data-name="{esc(name)}" title="{esc(who.title())} · {esc(label)}: {esc(cap)}" aria-label="{esc(who.title())} {esc(kind)} {esc(label)}: {esc(cap)}. Click to see it on the mascot.">'
            f'<span class="sy-tile__art" aria-hidden="true"></span><span class="sy-tile__name">{esc(label.capitalize())}</span><span class="sy-tile__cap">{esc(cap)}</span></button>')

def tiles(items, cols=7):
    return f'<div class="sy-tiles" style="--n:{cols}">' + "".join(items) + '</div>'

E_TILES = [tile("emotion", "sunny", "default", "Idle, looking around.")] + [tile("emotion", "sunny", e, S_EMO_CAP.get(e, "")) for e in S_EMOTIONS]
A_TILES = [tile("act", "sunny", a, S_ACT_CAP.get(a, "")) for a in S_ACTS]
PE_TILES = [tile("emotion", "puppy", "default", "Sitting, looking around.")] + [tile("emotion", "puppy", e, P_EMO_CAP.get(e, "")) for e in P_EMOTIONS]
PA_TILES = [tile("act", "puppy", a, P_ACT_CAP.get(a, "")) for a in P_ACTS]

STAGE = '''<div class="c2-frame sy-stage" aria-hidden="true">
  <div class="sy-stage__sunny sy-live sy-art" data-who="sunny" data-kind="emotion" data-name="happy"><span class="sy-tile__art"></span><span class="sy-bubble">Hi! Ask me anything about Ganesh’s work.</span></div>
  <div class="sy-stage__puppy sy-live sy-art" data-who="puppy" data-kind="emotion" data-name="default"><span class="sy-tile__art"></span><span class="sy-bubble sy-bubble--puppy">Woof!</span></div>
</div>
<p class="c2-cap">Sunny and Puppy in Together mode. Both are drawn in Figma and run as plain SVG on the site; every face on this page is the live artwork.</p>'''

HERO = f'''  <section class="cs-hero" data-layer="Hero">
    {kicker("Side project · ganeshuxcraft.in")}
    <div class="c2-hero__grid">
      <h1 class="c2-h1">Meet Sunny: a mascot that pays attention.</h1>
      <div class="c2-hero__side"><p>A small yellow companion living in the corner of every page. Sunny reads the room, reacts to visitors, keeps time of day, answers questions about my work, and has a dog called Puppy.</p></div>
    </div>
    {meta([("Role", "Character, motion and code"), ("Built with", "Figma, SVG, CSS, JavaScript, Claude"), ("Range", f"{len(S_EMOTIONS)} emotions · {len(S_ACTS)} acts · {len(S_SOUNDS)} sounds"), ("Lives on", "Every page, bottom-right")])}
  </section>
  <div class="cs-visual c2-col" data-layer="Visual">{STAGE}</div>
'''

WHY = grid([card("Notices you", "Reacts to scrolling, idling, leaving the tab, a right-click, or being picked up."),
            card("Knows the page", "Comments on the section you’re reading and points to the work behind it."),
            card("Answers questions", "The Ask panel answers questions about my work, backed by a small knowledge file.")], 3)

SENSES = cols([(None, "Drag and throw", "Pick Sunny up and let go; it lands, wobbles and has opinions."), (None, "Idle time", "Leave it alone and it gets bored, then sleepy, then naps."),
               (None, "Time of day", "Morning, evening and night change the greetings and the energy."), (None, "Reading", "Scrolling and section changes shape what it comments on.")], 4) + \
         cols([(None, "Leaving the tab", "Notices you went away, and says so when you come back."), (None, "Right-click", "Puts on sunglasses. Too cool for context menus."),
               (None, "Keyboard", "Responds to keys and shortcuts on the site."), (None, "Nap button", "A small “zz” button lets visitors send Sunny to sleep.")], 4)

GROUPS = "Everyday: wave, hop, peek, stretch, dance, walk, skip, sleep · Hobbies: cycle, swim, skate, fish, yoga, read, sing, selfie, joker · Off-duty: drink, beer, drunk, smoke"
MODES = grid([card("Sunny", "Alone, full size."), card("Puppy", "Alone, 150px."), card("Together", "Puppy at 60% beside Sunny.")], 3)
PUPPY_BODY = (f'<h3 class="sy-sub">Puppy’s faces</h3><p class="c2-p sy-sub__p">Default pose plus {len(P_EMOTIONS)} emotions.</p>' + tiles(PE_TILES)
              + f'<h3 class="sy-sub">Things Puppy does</h3><p class="c2-p sy-sub__p">{len(P_ACTS)} small dog acts. Hover a tile to play it, click to send it to the real pup.</p>' + tiles(PA_TILES)
              + '<p class="c2-lbl sy-modes-lbl">Companion modes</p>' + MODES)
SOUNDS = ('<p class="c2-lbl">Voices</p><div class="sy-pills">' + "".join(pill(v, "c2-pill--blue") for v in S_VOICES) + '</div>'
          '<p class="c2-lbl">Sound cues</p><div class="sy-pills">' + "".join(pill(s) for s in S_SOUNDS) + '</div>')
DECISIONS = decisions([("Page first, Sunny second.", "Sunny mounts after the page has loaded, in an idle slot, so the first paint never waits for the mascot."),
                       ("Chatter is rationed.", "Ambient lines are limited, and anything the visitor does takes priority over an act already running."),
                       ("Motion is optional.", "With reduced motion on, acts are switched off and Sunny stays calm. Visitors can also send it to nap.")])

SECTIONS = [
    sec("01 / Why a mascot", "A portfolio is read alone. Sunny makes it feel like someone is home.", "Most visitors skim. A character that notices them gives the site a voice, makes the small details discoverable, and turns a quiet visit into a short conversation.", WHY),
    sec("02 / Emotions", "Twenty faces, one yellow ball." if len(S_EMOTIONS) == 20 else f"{len(S_EMOTIONS)} faces, one yellow ball.", "Emotions are quick faces that last a second or two. Behind them sits a mood that lasts longer and tints how Sunny idles, which acts it picks and what it says.",
        tiles(E_TILES) + (f'<p class="c2-p sy-note">Behind the faces sit {len(MOODS)} longer moods ({", ".join(MOODS)}) that tint how Sunny idles.</p>' if MOODS else "")),
    sec("03 / Acts", "Twenty-one things to do while you read." if len(S_ACTS) == 21 else f"{len(S_ACTS)} things to do while you read.", "When nobody is interacting, Sunny picks an act that fits its mood. Some come with props, a sound and a line at the end, and anything you do interrupts them. Hover a tile to play it, click to make Sunny do it.",
        tiles(A_TILES) + f'<p class="c2-p sy-note">{GROUPS}</p>'),
    sec("04 / What Sunny notices", "Small signals, small reactions.", None, SENSES),
    sec("05 / Puppy", "And then there’s Puppy.", "A second companion from a Figma illustration, loaded only when someone picks it. Visitors choose Sunny, Puppy or Together in the preferences panel.", PUPPY_BODY),
    sec("06 / Sound and voice", f"{len(S_SOUNDS)} tiny sounds, made in the browser.", f"Every cue is synthesised with Web Audio rather than loaded as a file, so sound costs nothing to download. Visitors pick one of {len(S_VOICES)} voices.", SOUNDS),
    sec("07 / Design decisions", "A mascot that never gets in the way.", None, DECISIONS),
    sec("08 / Takeaway", None, None, quote("“Personality is a detail, repeated.”", "No single blink or line makes Sunny feel alive. Hundreds of small, well-timed ones do, and each one has to know when to stay quiet.")),
]

TILE_JS = '''  <script src="puppy.js?v=%s"></script>
  <script>
  /* Every tile is the mascot's own artwork in a fixed face or act; hover plays it, a click sends it to the live companion. */
  (function () {
    function ready() { return window.Sunny && typeof Sunny.art === "function" && window.Puppy && typeof Puppy.art === "function"; }
    function draw() {
      document.querySelectorAll(".sy-art").forEach(function (t) {
        var who = t.getAttribute("data-who"), kind = t.getAttribute("data-kind"), name = t.getAttribute("data-name"), slot = t.querySelector(".sy-tile__art");
        if (!slot || slot.firstChild) return;
        var attr = kind === "act" ? "data-act" : "data-emotion";
        var cls = who === "puppy" ? "puppy" : "sunny";
        var art = who === "puppy" ? Puppy.art() : Sunny.art();
        slot.innerHTML = '<div class="' + cls + ' is-in"' + (name === "default" ? "" : " " + attr + '="' + name + '"') + '><div class="' + cls + '__char">' + art + "</div></div>";
      });
      document.addEventListener("click", function (e) {
        var t = e.target.closest("button.sy-tile"); if (!t) return;
        var who = t.getAttribute("data-who"), kind = t.getAttribute("data-kind"), name = t.getAttribute("data-name");
        var target = who === "puppy" ? window.Puppy : window.Sunny; if (!target) return;
        if (who === "puppy" && Puppy.mode && Puppy.mode() === "sunny") { if (window.Sunny && Sunny.say) Sunny.say("Puppy is off right now. Pick Together in the preferences panel.", 2600); return; }
        if (name === "default") return;
        if (kind === "act") target.act(name, "direct"); else target.emote(name, 2200);
      });
    }
    var n = 0, t = setInterval(function () { if (ready()) { clearInterval(t); draw(); } else if (++n > 100) clearInterval(t); }, 50);
  })();
  </script>
''' % VER

PAGE = dict(
    file="meet-sunny.html",
    title="Meet Sunny, the mascot · Ganeshkumar B",
    description=f"How a little sun with a sprout got {len(S_EMOTIONS)} emotions, {len(S_ACTS)} acts, {len(S_SOUNDS)} sounds and a dog. The site mascot, drawn in Figma and built as SVG, CSS and JavaScript with Claude.",
    og="assets/og-image.png",
    nav=nav("meet-sunny.html", parts=True),
    hero=HERO,
    sections=SECTIONS,
    extra_js=[TILE_JS],
    next=dict(label="Next", title="Back to all work", href="index.html#work"),
    back_label="Back to the AI section", back_href="index.html#ai",
)
