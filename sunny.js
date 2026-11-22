/* Sunny: the site companion. A little sun with a sprout who lives in the
   bottom-right corner of every page, keeps itself busy with small acts
   (cycle, swim, skate, skip rope, drink, read, yoga, fish, selfie, dance,
   peek, sleep), wears a set of emotions, talks in a speech bubble and reacts
   to the visitor (pointer, clicks, drag, scroll, theme, leaving the window).
   Plain JS, inline SVG, CSS animations.

   Behaviour engine: Sunny knows the page, the section in view, whether the
   visitor is reading, scrolling, idle or chatting, and its own mood. Acts
   are chosen from context pools with cooldowns and priorities, and
   proactive speech is rationed (see CONFIG). Quiet while you read,
   expressive at meaningful moments.

   Sound: a welcome chime on the visitor's first click, tap or key (browsers
   block audio before that), a smile chirp on every click, a small sound for
   every emotion and quiet cues for the acts. Off until the visitor turns it
   on. Sunny.setSound / setCues.

   API: Sunny.act(name) · Sunny.emote(name) · Sunny.say(text) · Sunny.acts
        Sunny.context() · Sunny.setAskOpen(bool) · Sunny.mood() · Sunny.config
        Sunny.on(event, fn) · Sunny.cue(name) · Sunny.pose(name, ms) · Sunny.shift(dx, ms)
*/
(function (global) {
  "use strict";
  if (global.Sunny) return;
  var reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce-motion");
  var finePointer = global.matchMedia && global.matchMedia("(pointer: fine)").matches;
  var INK = "#111111", SUN = "#FFC93C", DEEP = "#F2AE2E";
  var SELF = (document.currentScript && document.currentScript.src) || "sunny.js"; /* to find puppy.js next to this file */

  /* ---------- Art ---------- */
  function art() {
    return '' +
    '<svg class="sunny__svg" viewBox="0 0 220 220" aria-hidden="true" focusable="false" overflow="visible">' +
      '<defs>' +
        '<radialGradient id="s-grad" cx="0.36" cy="0.3" r="0.78"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="#F2AE2E"/></radialGradient>' +
        '<linearGradient id="s-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aa3ff"/><stop offset="1" stop-color="#3f7ff0"/></linearGradient>' +
      '</defs>' +
      '<ellipse class="s-shadow" cx="110" cy="207" rx="46" ry="6" fill="' + INK + '" fill-opacity="0.09"/>' +
      /* props behind the character */
      '<g class="s-prop s-prop--water-back"><path d="M-40 158 Q-10 148 20 158 T80 158 T140 158 T200 158 T260 158 T320 158 V240 H-40 Z" fill="url(#s-water)" opacity="0.45"/></g>' +
      '<g class="s-prop s-prop--bike" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="s-wheel" style="transform-origin:66px 194px"><circle cx="66" cy="194" r="21"/><path d="M66 173V215M45 194H87M51 179L81 209M81 179L51 209" stroke-width="1.6" opacity="0.7"/></g>' +
        '<g class="s-wheel" style="transform-origin:156px 194px"><circle cx="156" cy="194" r="21"/><path d="M156 173V215M135 194H177M141 179L171 209M171 179L141 209" stroke-width="1.6" opacity="0.7"/></g>' +
        '<path d="M66 194L96 156H132L156 194M96 156L112 194H156M96 156L90 146M84 146H98M128 150H146"/>' +
        '<circle cx="112" cy="194" r="5" fill="' + INK + '"/>' +
      '</g>' +
      '<g class="s-prop s-prop--mat"><rect x="34" y="194" width="152" height="11" rx="5.5" fill="#7c5cff" stroke="' + INK + '" stroke-width="2.2"/></g>' +
      '<g class="s-prop s-prop--pond"><ellipse cx="6" cy="198" rx="42" ry="8" fill="url(#s-water)" opacity="0.85"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-linecap="round"><path d="M46 120 L4 58" stroke-width="2.6"/><path d="M4 58 V188" stroke-width="1.3" opacity="0.7"/></g>' +
        '<circle class="s-bob" cx="4" cy="188" r="4.5" fill="#de364d" stroke="' + INK + '" stroke-width="1.8"/>' +
        '<g class="s-fish"><g transform="translate(6 196)"><g class="s-fish-in"><path d="M-10 0 Q0 -8 10 0 Q0 8 -10 0 Z M10 0 L17 -6 V6 Z" fill="#ff7a2f" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/><circle cx="-4" cy="-1.5" r="1.4" fill="' + INK + '"/></g></g></g>' +
      '</g>' +
      '<g class="s-prop s-prop--board"><rect x="60" y="194" width="100" height="9" rx="4.5" fill="#2bb673" stroke="' + INK + '" stroke-width="2.2"/>' +
        '<g class="s-bwheel" style="transform-origin:80px 206px"><circle cx="80" cy="206" r="5.5" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><path d="M80 201V211" stroke="' + INK + '" stroke-width="1.4"/></g>' +
        '<g class="s-bwheel" style="transform-origin:140px 206px"><circle cx="140" cy="206" r="5.5" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><path d="M140 201V211" stroke="' + INK + '" stroke-width="1.4"/></g>' +
      '</g>' +
      '<g class="s-prop s-prop--rope-b"><path class="s-rope" d="M56 130 Q110 352 164 130" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></g>' +
      /* the character */
      '<g class="s-char">' +
        '<g class="s-feet">' +
          '<ellipse class="s-foot s-foot--l" cx="92" cy="191" rx="12" ry="7" fill="' + DEEP + '" stroke="' + INK + '" stroke-width="2.5"/>' +
          '<ellipse class="s-foot s-foot--r" cx="128" cy="191" rx="12" ry="7" fill="' + DEEP + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '</g>' +
        '<g class="s-body">' +
          '<circle class="s-ball" cx="110" cy="125" r="66" fill="url(#s-grad)" stroke="' + INK + '" stroke-width="3"/>' +
          '<ellipse class="s-highlight" cx="80" cy="90" rx="14" ry="8" transform="rotate(-35 80 90)" fill="#fff" opacity="0.85"/>' +
          '<g class="s-face">' +
            '<g class="s-look"><g class="s-eyes">' +
              '<g class="s-eye s-eye--l"><ellipse cx="93" cy="120" rx="8.5" ry="10.5" fill="' + INK + '"/><circle cx="96" cy="115" r="3.2" fill="#fff"/><circle cx="90" cy="124" r="1.6" fill="#fff"/></g>' +
              '<g class="s-eye s-eye--r"><ellipse cx="127" cy="120" rx="8.5" ry="10.5" fill="' + INK + '"/><circle cx="130" cy="115" r="3.2" fill="#fff"/><circle cx="124" cy="124" r="1.6" fill="#fff"/></g>' +
              '<path class="s-eye-happy" d="M84 123 Q93 111 102 123" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
              '<path class="s-eye-happy" d="M118 123 Q127 111 136 123" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
              '<g class="s-eye-x" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"><path d="M86 113l14 14M100 113l-14 14"/><path d="M120 113l14 14M134 113l-14 14"/></g>' +
            '</g></g>' +
            '<g class="s-glasses"><rect x="80" y="111" width="25" height="16" rx="6" fill="' + INK + '"/><rect x="115" y="111" width="25" height="16" rx="6" fill="' + INK + '"/><path d="M105 117H115M80 116L62 110M140 116L158 110" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>' +
            '<g class="s-blush"><ellipse cx="72" cy="140" rx="8" ry="4.5" fill="#F6A3A3" opacity="0.85"/><ellipse cx="148" cy="140" rx="8" ry="4.5" fill="#F6A3A3" opacity="0.85"/></g>' +
            '<g class="s-mouth" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<path class="s-m s-m--smile" d="M102 141 Q110 150 118 141"/>' +
              '<circle class="s-m s-m--o" cx="110" cy="145" r="4.5" fill="' + INK + '" stroke="none"/>' +
              '<g class="s-m s-m--grin"><path d="M99 140 Q110 158 121 140 Z" fill="' + INK + '" stroke="none"/><ellipse cx="110" cy="150" rx="4.5" ry="3" fill="#F27C7C" stroke="none"/></g>' +
              '<path class="s-m s-m--frown" d="M102 148 Q110 139 118 148"/>' +
              '<path class="s-m s-m--wavy" d="M100 144 q3 -5 6 0 t6 0 t6 0"/>' +
              '<path class="s-m s-m--flat" d="M102 145 H118"/>' +
            '</g>' +
            '<path class="s-tear" d="M80 128 c-5 7 -5 11 0 11 c5 0 5 -4 0 -11 Z" fill="#4d8dff"/>' +
          '</g>' +
          '<g class="s-sprout" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round">' +
            '<path d="M110 59 C113 50 105 45 108 35" fill="none"/>' +
            '<ellipse cx="97" cy="36" rx="10" ry="5.5" transform="rotate(-22 97 36)"/>' +
            '<ellipse cx="119" cy="31" rx="10" ry="5.5" transform="rotate(24 119 31)"/>' +
          '</g>' +
          '<g class="s-hat"><path d="M66 72 Q58 44 42 30 Q74 46 86 60 Q100 32 110 16 Q120 32 134 60 Q146 46 178 30 Q162 44 154 72 Z" fill="#de364d" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="42" cy="30" r="5" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/><circle cx="110" cy="16" r="5" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/><circle cx="178" cy="30" r="5" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/></g>' +
          '<g class="s-cap"><path d="M52 92 Q110 40 172 88 L160 84 Q110 60 64 100 Z" fill="#4d8dff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><circle cx="174" cy="90" r="7" fill="#fff" stroke="' + INK + '" stroke-width="2"/></g>' +
        '</g>' +
        '<g class="s-arm s-arm--l"><ellipse cx="48" cy="132" rx="10" ry="15" transform="rotate(-15 48 132)" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2.5"/></g>' +
        '<g class="s-arm s-arm--r"><ellipse cx="172" cy="132" rx="10" ry="15" transform="rotate(15 172 132)" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2.5"/></g>' +
        '<g class="s-cup"><rect x="118" y="134" width="17" height="22" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/><path d="M128 134 L134 118" stroke="#de364d" stroke-width="2.5" stroke-linecap="round"/><rect x="118" y="144" width="17" height="6" fill="#4d8dff" opacity="0.6"/></g>' +
        '<g class="s-balls"><circle class="s-ball1" r="6.5" fill="' + INK + '"/><circle class="s-ball2" r="6.5" fill="#de364d" stroke="' + INK + '" stroke-width="2"/><circle class="s-ball3" r="6.5" fill="' + SUN + '" stroke="' + INK + '" stroke-width="2"/></g>' +
      '<g class="s-cig"><rect x="117" y="146" width="24" height="5" rx="2.5" fill="#fff" stroke="' + INK + '" stroke-width="1.8"/><rect x="135" y="146" width="6" height="5" rx="1.5" fill="#ff7a2f"/><circle class="s-ember" cx="141" cy="148.5" r="2.6" fill="#ff4d1f"/></g>' +
      '<g class="s-mug"><rect x="118" y="134" width="18" height="24" rx="3" fill="#f5a623" stroke="' + INK + '" stroke-width="2.2"/><path d="M136 140 q10 0 10 8 q0 8 -10 8" fill="none" stroke="' + INK + '" stroke-width="2.2"/><ellipse cx="127" cy="134" rx="11" ry="5" fill="#fff" stroke="' + INK + '" stroke-width="2"/><circle cx="132" cy="129" r="3" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><path d="M122 142 V152" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.6"/></g>' +
      '<g class="s-book"><path d="M76 158 Q94 150 110 158 Q126 150 144 158 V184 Q126 176 110 184 Q94 176 76 184 Z" fill="#fff" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><path class="s-page" d="M110 158 Q126 150 144 158 V184 Q126 176 110 184 Z" fill="#f3f4f6" stroke="' + INK + '" stroke-width="1.6"/><path d="M110 158 V184" stroke="' + INK + '" stroke-width="2"/><path d="M84 166 H102 M84 172 H100 M84 178 H98" stroke="#9a9ea8" stroke-width="1.6" stroke-linecap="round"/></g>' +
      '<g class="s-phone"><rect x="150" y="76" width="18" height="30" rx="3.5" fill="' + INK + '"/><rect x="153" y="80" width="12" height="20" rx="1.5" fill="#6aa3ff"/><circle cx="159" cy="103" r="1.3" fill="#fff"/></g>' +
      '<g class="s-mic"><rect x="124" y="140" width="6" height="22" rx="3" fill="#555b66" stroke="' + INK + '" stroke-width="1.6"/><circle cx="127" cy="137" r="8" fill="#9a9ea8" stroke="' + INK + '" stroke-width="2"/><path d="M121 134 h12 M121 139 h12" stroke="' + INK + '" stroke-width="1" opacity="0.6"/></g>' +
      '</g>' +
      '<g class="s-prop s-prop--rope-f"><path class="s-rope" d="M56 130 Q110 352 164 130" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/></g>' +
      /* props in front */
      '<g class="s-prop s-prop--water-front"><path d="M-40 166 Q-10 156 20 166 T80 166 T140 166 T200 166 T260 166 T320 166 V240 H-40 Z" fill="url(#s-water)" opacity="0.8"/><g class="s-splash" fill="#6aa3ff"><circle cx="54" cy="150" r="3"/><circle cx="168" cy="146" r="3.5"/><circle cx="40" cy="140" r="2"/></g></g>' +
      /* effects */
      '<g class="s-fx s-fx--lines" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"><path d="M192 62 q6 9 0 18"/><path d="M203 56 q9 12 0 26"/></g>' +
      '<g class="s-fx s-fx--zzz" fill="' + INK + '" font-family="JetBrains Mono, ui-monospace, monospace" font-weight="500"><text class="s-z s-z1" x="158" y="70" font-size="12">z</text><text class="s-z s-z2" x="170" y="56" font-size="15">z</text><text class="s-z s-z3" x="184" y="40" font-size="19">Z</text></g>' +
      '<g class="s-fx s-fx--hic" font-family="JetBrains Mono, ui-monospace, monospace" font-weight="500" fill="' + INK + '"><circle class="s-bub s-bub1" cx="160" cy="84" r="3" fill="none" stroke="' + INK + '" stroke-width="1.6"/><circle class="s-bub s-bub2" cx="172" cy="70" r="4.5" fill="none" stroke="' + INK + '" stroke-width="1.6"/><text class="s-bub s-bub3" x="178" y="58" font-size="11">hic</text></g>' +
      '<g class="s-fx s-fx--hearts" fill="#de364d"><g transform="translate(158 74)"><path class="s-heart s-heart1" d="M0 4 C0 -2 8 -2 8 4 C8 9 0 14 0 14 C0 14 -8 9 -8 4 C-8 -2 0 -2 0 4Z"/></g><g transform="translate(178 96) scale(0.7)"><path class="s-heart s-heart2" d="M0 4 C0 -2 8 -2 8 4 C8 9 0 14 0 14 C0 14 -8 9 -8 4 C-8 -2 0 -2 0 4Z"/></g></g>' +
      '<g class="s-fx s-fx--puffs" fill="#c9ced8" stroke="' + INK + '" stroke-width="1.2" stroke-opacity="0.35"><circle class="s-puff s-puff1" cx="150" cy="130" r="4"/><circle class="s-puff s-puff2" cx="160" cy="116" r="6"/><circle class="s-puff s-puff3" cx="172" cy="100" r="8"/></g>' +
      '<g class="s-fx s-fx--flash"><circle class="s-flash" cx="159" cy="90" r="26" fill="#fff"/></g>' +
      '<g class="s-fx s-fx--notes" fill="' + INK + '" font-family="Space Grotesk, Inter, sans-serif"><text class="s-note s-note1" x="160" y="70" font-size="20">♪</text><text class="s-note s-note2" x="180" y="52" font-size="16">♫</text></g>' +
      '<g class="s-fx s-fx--stars" fill="' + SUN + '" stroke="' + INK + '" stroke-width="1.5"><g transform="translate(50 60)"><path class="s-star s-star1" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g><g transform="translate(172 52) scale(0.7)"><path class="s-star s-star2" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g><g transform="translate(60 150) scale(0.6)"><path class="s-star s-star3" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g></g>' +
    '</svg>';
  }

  /* ---------- Lines ---------- */
  var isCase = /case-/.test(location.pathname);
  var QUIPS = [
    "Pssst. Try clicking me.",
    "Fun fact: I'm 100% SVG and a little JavaScript.", "I run on design tokens. And snacks.",
    "Scroll on, there's more below.", "My favourite colour? #FFC93C. Obviously.",
    "Why did the designer go broke? Too many free trials.", "I told a CSS joke. Nobody got it. It needed more context.",
    "I'd tell you a UX joke, but it's three screens deep.", "Ganesh built me from a Figma frame. No frameworks were harmed.",
    "Between you and me, the Zobot case is the good one.", "Did you know every button here is Code Connected?",
    "Hold on, stretching.", "I could do this all day. I literally do.", "Press A if you have a question. I know things."
  ];
  /* a few lines that only fit a mood */
  var MOOD_QUIPS = {
    curious: ["Ooh. What's this bit?", "I'm reading along. Slowly.", "Hm. Interesting choice."],
    proud: ["Not bad, right?", "That one took a while. Worth it.", "I had nothing to do with this. Still proud."],
    sleepy: ["Long day.", "Five more minutes.", "Is it bedtime yet?"],
    relaxed: ["Take your time.", "No rush. I'm not going anywhere.", "Nice and quiet."],
    happy: ["Hi again.", "This is fun.", "You're good company."]
  };
  var CASE_QUIPS = ["Good pick. This one's a favourite.", "The next case is one scroll away →", "Spot the component library? It's everywhere here.", "Take your time, I'll wait. Badly."];
  var ACT_LINES = {
    walk: ["Just stretching my legs.", "Patrolling.", "Going for a walk."],
    cycle: ["Wheee!", "On my bike. Don't tell Ganesh.", "Cycling to the next section."],
    swim: ["Pool's open!", "Splash.", "Lane one is mine."],
    drink: ["Hydration break.", "Cheers!", "Glug glug."],
    drunk: ["Whoa… that was strong juice.", "hic. I'm fine. I'm FINE.", "The page is spinning. Or is that me?"],
    joker: ["Ta-da!", "Juggling production and design.", "Hat on, show time."],
    dance: ["♪ tokens in the night ♪", "Dance break!", "Nobody's watching, right?"],
    peek: ["Boo!", "Still here.", "Peekaboo."],
    wave: ["Hi!", "Hello there!", "Hey, you."],
    sleep: ["zzz…", "Just resting my eyes."],
    stretch: ["Yawn.", "Big stretch."],
    smoke: ["Smoke break.", "Don't try this at home. I'm a vector.", "Just one. Okay, two.", "Designers and their habits…"],
    beer: ["Cheers!", "Happy hour.", "Friday vibes. Whatever day it is.", "To good design."],
    sing: ["♪ La la laaa ♪", "Karaoke night!", "♪ Tokens in the night ♪", "I'm not crying, you're crying."],
    read: ["Chapter one…", "Reading the design guidelines.", "Shh. Good part.", "Plot twist incoming."],
    yoga: ["Ommm.", "Namaste.", "Inner peace, outer glow.", "Breathe in. Breathe out."],
    skate: ["Kickflip! …almost.", "Cruising.", "Skate or die. Mostly skate.", "Wheels down."],
    fish: ["Fishing for compliments.", "Patience…", "Something's biting. Maybe.", "Shh. You'll scare the fish."],
    selfie: ["Say cheese!", "Golden hour. Literally.", "One for the grid.", "Portfolio shot."],
    skip: ["One, two, three…", "Cardio!", "Jump rope champion. Self-declared.", "Don't trip, don't trip."]
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- Config: how often Sunny acts and speaks on its own ----------
     Conservative on purpose. Replies to the visitor (clicks, drags, questions)
     are never rationed; only Sunny's own initiative is. Tweak at runtime with
     Sunny.config.<key> = value. */
  var CONFIG = {
    tick: 2000,                   /* engine heartbeat, ms */
    ambientGap: [16000, 30000],   /* pause between ambient acts, ms, drawn from this range */
    actCooldown: 100000,          /* fallback cooldown for an act without its own */
    bubbleGap: 14000,             /* minimum gap between proactive speech bubbles */
    maxProactivePerPage: 6,       /* proactive bubbles per page view */
    sectionLines: true,           /* one line the first time a section comes into view */
    readingAfter: 5000,           /* scrolled, then still this long = reading: quiet acts only, no bubbles */
    idleAfter: 60000,             /* no scroll this long = idle: Sunny may play */
    sleepAfter: 50000,            /* no input at all this long = sleep */
    welcomeOncePerSession: true,  /* the full hello once per tab session, a wave on later pages */
    ignoreAfter: 3                /* this many unanswered bubbles in a row and Sunny goes quieter */
  };
  /* priorities: a running act is only interrupted by something of equal or higher priority */
  var PRI = { sleep: 0, idle: 1, ambient: 2, scroll: 3, section: 4, duo: 4.5, event: 5, drag: 6, direct: 7 };

  /* ---------- DOM ---------- */
  var root, charEl, bubble, napBtn, svg, look, actTimer = 0, sayTimer = 0, emoteTimer = 0, busy = false, asleep = false;
  var sx = 0, stageW = 320, charW = 140, lastInput = Date.now(), facingLeft = false;
  /* what Sunny is doing and feeling */
  var state = { mood: "neutral", moodUntil: 0, cur: null, nextAmbient: 0, lastBubble: 0, pending: false, proactive: 0, unanswered: 0, engaged: 0, lastAct: {}, recent: [], lastScroll: 0, lastNear: 0 };
  /* what Sunny knows about the page and the visitor */
  var ctx = { page: "home", project: null, section: null, sectionLabel: null, sectionTitle: null, reading: false, idle: true, atTop: true, atBottom: false, askOpen: false, seen: {} };

  /* ---------- Companion mode: sunny | puppy | together ----------
     Chosen in the preferences panel (pref:companion). Sunny stays the same
     size in every mode. In puppy mode Sunny's figure is hidden and its engine
     muted, but the Ask panel stays. puppy.js is loaded only when needed. */
  var MODES = ["sunny", "puppy", "together"], mode = "sunny";
  try { var pm = localStorage.getItem("pref:companion"); if (MODES.indexOf(pm) > -1) mode = pm; } catch (e) { /* ignore */ }
  /* a small event hub so the sidekick can follow along: Sunny.on(name, fn) */
  var listeners = {};
  function emit(name, detail) { var l = listeners[name]; if (!l) return; for (var i = 0; i < l.length; i++) { try { l[i](detail); } catch (e) { /* a listener must never break Sunny */ } } }
  function ensurePuppy(cb) {
    if (global.Puppy) { cb(); return; }
    var wait = function () { var w = setInterval(function () { if (global.Puppy) { clearInterval(w); cb(); } }, 100); };
    if (document.querySelector("script[data-puppy]")) { wait(); return; }
    var sc = document.createElement("script");
    sc.src = /sunny\.js/.test(SELF) ? SELF.replace(/sunny\.js/, "puppy.js") : "puppy.js";
    sc.setAttribute("data-puppy", ""); sc.async = true; sc.onload = wait;
    document.head.appendChild(sc);
  }
  function applyMode() {
    if (!root) return;
    root.classList.toggle("is-silent", mode === "puppy");
    root.classList.toggle("is-duo", mode === "together");
    if (mode === "puppy") { stopAct(); root.classList.remove("is-talking"); root.removeAttribute("data-emotion"); }
    if (mode !== "sunny") ensurePuppy(function () { global.Puppy.setMode(mode); });
    else if (global.Puppy) global.Puppy.setMode("sunny");
  }

  function build() {
    root = document.createElement("div");
    root.className = "sunny";
    root.setAttribute("role", "complementary");
    root.setAttribute("aria-label", "Sunny, the site mascot");
    root.innerHTML = '<div class="sunny__char"><div class="sunny__bubble" aria-hidden="true"></div><button type="button" class="sunny__nap" aria-label="Let Sunny nap" title="Let Sunny nap">zz</button>' + art() + '</div>';
    document.body.appendChild(root);
    charEl = root.querySelector(".sunny__char");
    bubble = root.querySelector(".sunny__bubble");
    napBtn = root.querySelector(".sunny__nap");
    svg = root.querySelector(".sunny__svg");
    look = root.querySelector(".s-look");
    measure();
    global.addEventListener("resize", measure);
  }
  function measure() {
    stageW = root.getBoundingClientRect().width || 320;
    charW = charEl.getBoundingClientRect().width || 140;
    setX(sx, 0);
  }
  function minX() { return -(stageW - charW); }
  function setX(x, ms) {
    x = Math.max(minX(), Math.min(0, x));
    if (x < sx - 2) face(true); else if (x > sx + 2) face(false);
    sx = x;
    charEl.style.setProperty("--walk-ms", (ms || 0) + "ms");
    charEl.style.setProperty("--sx", x.toFixed(1) + "px");
  }
  function face(left) { facingLeft = left; root.classList.toggle("is-flip", left); }

  /* ---------- Speech ---------- */
  /* say: show a bubble now. Used for replies to something the visitor did. */
  function say(text, ms) {
    if (mode === "puppy") return; /* Sunny is off stage; the panel still answers */
    /* lines inside an ambient act stay silent while the visitor reads */
    if (state.quietAct && ctx.reading && !state.sayForce) return;
    clearTimeout(sayTimer);
    bubble.textContent = text;
    root.classList.add("is-talking");
    emit("say", text);
    sayTimer = setTimeout(function () { root.classList.remove("is-talking"); }, ms || Math.max(1800, 900 + text.length * 55));
  }
  /* speak: Sunny's own initiative. Rationed: not while reading or chatting,
     not too often, not past the per-page budget, and quieter when ignored.
     `force` is for reactions to the visitor (coming back, leaving): they skip
     the reading check and the budget but keep a short gap. */
  function speak(text, ms, force) {
    var now = Date.now();
    if (!root || asleep || ctx.askOpen) return false;
    if (!force && ctx.reading) return false;
    if (!force && now < (state.hushUntil || 0)) return false; /* a shared moment or the puppy's story has the floor */
    if (now - state.lastBubble < (force ? 2500 : CONFIG.bubbleGap * quietFactor())) return false;
    if (!force && state.proactive >= CONFIG.maxProactivePerPage) return false;
    if (!force) { if (state.pending) state.unanswered++; state.pending = true; state.proactive++; }
    state.lastBubble = now;
    state.sayForce = true; say(text, ms); state.sayForce = false;
    return true;
  }
  /* ignored three times in a row: twice the gaps; six: three times. Engaged visitors get a little more. */
  function quietFactor() {
    if (state.unanswered >= CONFIG.ignoreAfter * 2) return 3;
    if (state.unanswered >= CONFIG.ignoreAfter) return 2;
    return state.engaged >= 2 ? 0.75 : 1;
  }
  /* the visitor did something to Sunny: it was not being ignored */
  function noticed() { state.pending = false; state.unanswered = 0; state.engaged++; lastInput = Date.now(); }

  /* ---------- Sound: tiny synthesized cues, no audio files ----------
     Browsers only let audio start after a gesture (click, key, touch). Cues
     triggered by a gesture play right away; cues from Sunny's own acts play
     only once a gesture has unlocked audio. All of it is quiet. */
  var actx = null, unlocked = false, soundOn = false, extraCues = true;
  /* sound profiles: the same cues, a different instrument.
     pitch scales every note, wave overrides the oscillator, gain scales volume,
     attack/release stretch the envelope, filter is a low-pass cutoff, noise scales the hiss bursts */
  var VOICES = {
    soft:   { pitch: 0.75, wave: "sine",     gain: 0.9,  attack: 0.03,  release: 1.6, filter: 1600, noise: 0.5 },
    bubbly: { pitch: 1,    wave: null,       gain: 1,    attack: 0.012, release: 1,   filter: 0,    noise: 1 },
    retro:  { pitch: 1,    wave: "square",   gain: 0.4,  attack: 0.004, release: 0.8, filter: 2600, noise: 0.6 },
    bell:   { pitch: 1.5,  wave: "triangle", gain: 0.75, attack: 0.004, release: 2.4, filter: 0,    noise: 0.5 }
  };
  var voiceName = "soft";
  try {
    soundOn = localStorage.getItem("sunny:sound") === "on"; /* off until the visitor turns it on */
    extraCues = localStorage.getItem("sunny:cues") !== "off";
    if (VOICES[localStorage.getItem("sunny:voice")]) voiceName = localStorage.getItem("sunny:voice");
  } catch (e) { /* ignore */ }
  var voice = VOICES[voiceName];
  var gestured = false; /* browsers only start audio after a click, tap or key press */
  function ctx_audio() {
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC || !gestured) return null;
    if (!actx) actx = new AC();
    if (actx.state === "suspended") actx.resume();
    if (actx.state === "running") unlocked = true;
    return actx;
  }
  function tone(notes, type, vol) {
    /* notes: [frequency, start, duration, glideTo] in seconds */
    var ac = ctx_audio(); if (!ac) return;
    var t = ac.currentTime, v = voice;
    notes.forEach(function (n) {
      var o = ac.createOscillator(), g = ac.createGain(), dur = n[2] * v.release;
      o.type = v.wave || type || "sine";
      o.frequency.setValueAtTime(n[0] * v.pitch, t + n[1]);
      if (n[3]) o.frequency.exponentialRampToValueAtTime(n[3] * v.pitch, t + n[1] + dur);
      g.gain.setValueAtTime(0.0001, t + n[1]);
      g.gain.exponentialRampToValueAtTime((vol || 0.06) * v.gain, t + n[1] + v.attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + dur);
      var out = g;
      if (v.filter) { var f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = v.filter; g.connect(f); out = f; }
      o.connect(g); out.connect(ac.destination);
      o.start(t + n[1]); o.stop(t + n[1] + dur + 0.03);
    });
  }
  function hiss(dur, from, to, vol, filterType) {
    /* a short filtered noise burst: splashes, swooshes, shutter clicks */
    var ac = ctx_audio(); if (!ac) return;
    var len = Math.ceil(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    src.buffer = buf; f.type = filterType || "bandpass"; f.Q.value = 0.8;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime((vol || 0.05) * voice.noise, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(ac.destination); src.start(t); src.stop(t + dur + 0.02);
  }
  var SFX = {
    boop: function () { tone([[660, 0, 0.09, 880], [990, 0.09, 0.16, 1250]], "sine", 0.07); },
    whee: function () { tone([[480, 0, 0.26, 1500]], "triangle", 0.06); },
    grumble: function () { tone([[190, 0, 0.12, 150], [170, 0.14, 0.18, 120]], "sawtooth", 0.03); },
    pickup: function () { tone([[420, 0, 0.08, 700]], "triangle", 0.05); },
    land: function () { tone([[160, 0, 0.1, 90]], "sine", 0.08); hiss(0.06, 900, 300, 0.03, "lowpass"); },
    pop: function () { tone([[520, 0, 0.05, 260]], "sine", 0.06); },
    tick: function () { tone([[1400, 0, 0.03]], "square", 0.02); },
    bell: function () { tone([[1760, 0, 0.12], [2093, 0.1, 0.18]], "sine", 0.04); },
    splash: function () { hiss(0.32, 2400, 500, 0.05); tone([[300, 0, 0.1, 120]], "sine", 0.04); },
    gulp: function () { tone([[260, 0, 0.08, 180], [240, 0.18, 0.08, 160], [230, 0.36, 0.1, 140]], "sine", 0.05); },
    hic: function () { tone([[520, 0, 0.05, 900]], "triangle", 0.045); },
    tada: function () { tone([[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.3]], "triangle", 0.045); },
    shutter: function () { hiss(0.05, 3000, 1200, 0.06, "highpass"); tone([[900, 0.06, 0.03]], "square", 0.02); },
    swoosh: function () { hiss(0.28, 400, 2600, 0.035); },
    ding: function () { tone([[1319, 0, 0.5], [1976, 0.02, 0.4]], "sine", 0.035); },
    yawn: function () { tone([[330, 0, 0.5, 220]], "sine", 0.03); },
    snore: function () { tone([[110, 0, 0.35, 90]], "sawtooth", 0.012); },
    bubble: function () { tone([[700, 0, 0.06, 1100], [820, 0.12, 0.06, 1300]], "sine", 0.03); },
    /* emotion sounds */
    gasp: function () { hiss(0.18, 600, 2400, 0.03, "bandpass"); tone([[520, 0, 0.14, 1040]], "sine", 0.035); },
    hmm: function () { tone([[330, 0, 0.16, 350], [392, 0.18, 0.2, 494]], "sine", 0.04); },
    ting: function () { tone([[1568, 0, 0.14], [2093, 0.02, 0.12]], "sine", 0.03); },
    aww: function () { tone([[660, 0, 0.3, 494]], "sine", 0.035); },
    sadden: function () { tone([[440, 0, 0.22, 392], [370, 0.26, 0.34, 294]], "sine", 0.035); },
    heart: function () { tone([[659, 0, 0.14], [831, 0.14, 0.26]], "sine", 0.035); },
    shwoop: function () { tone([[900, 0, 0.26, 260]], "triangle", 0.03); },
    giggle: function () { tone([[880, 0, 0.06], [988, 0.09, 0.06], [880, 0.18, 0.06], [1047, 0.27, 0.08]], "sine", 0.035); },
    wobble: function () { tone([[440, 0, 0.14, 520], [520, 0.14, 0.14, 400], [400, 0.28, 0.16, 480]], "triangle", 0.03); },
    proud: function () { tone([[784, 0, 0.12], [1047, 0.12, 0.3]], "triangle", 0.035); },
    sigh: function () { hiss(0.4, 1200, 300, 0.02, "lowpass"); tone([[300, 0, 0.4, 220]], "sine", 0.02); },
    /* the sidekick */
    bark: function () { tone([[520, 0, 0.07, 420], [640, 0.09, 0.08, 480]], "square", 0.03); },
    sniff: function () { hiss(0.09, 1800, 900, 0.025, "bandpass"); hiss(0.08, 1800, 900, 0.02, "bandpass"); },
    paw: function () { tone([[900, 0, 0.03]], "square", 0.015); tone([[760, 0.12, 0.03]], "square", 0.015); },
    chirp: function () { tone([[880, 0, 0.08, 1320]], "sine", 0.035); }
  };
  /* which cue each emotion makes; blush is the smile chirp and always plays */
  var EMOTION_SFX = { happy: "bubble", surprised: "gasp", curious: "hmm", wink: "ting", sleepy: "yawn", shy: "aww", excited: "whee", dizzy: "wobble", angry: "grumble", sad: "sadden", love: "heart", cool: "shwoop", laugh: "giggle", whoa: "swoosh", bored: "sigh", proud: "proud" };
  function play(name) { if (soundOn && SFX[name]) { try { SFX[name](); } catch (e) { /* silent */ } } }
  /* the one sound on by default: the smile chirp when Sunny is clicked */
  function smileSound() { play("boop"); }
  /* every other cue is opt-in (Sunny.setCues(true)); gesture cues play now,
     act cues only once an earlier gesture has unlocked audio */
  function sfx(name) { if (extraCues) play(name); }
  function cue(name) { if (extraCues && unlocked && !ctx.askOpen) play(name); }
  function setSound(on) {
    soundOn = !!on;
    try { localStorage.setItem("sunny:sound", soundOn ? "on" : "off"); } catch (e) { /* ignore */ }
  }
  function setCues(on) {
    extraCues = !!on;
    try { localStorage.setItem("sunny:cues", extraCues ? "on" : "off"); } catch (e) { /* ignore */ }
  }
  function setVoice(name, preview) {
    if (!VOICES[name]) return;
    voiceName = name; voice = VOICES[name];
    try { localStorage.setItem("sunny:voice", name); } catch (e) { /* ignore */ }
    if (preview) { gestured = true; unlocked = true; if (!soundOn) setSound(true); play("boop"); setTimeout(function () { play("ding"); }, 220); }
  }
  /* ---------- Emotions (faces) and mood (the longer-lived state behind them) ---------- */
  var EMOTIONS = { happy: 1800, surprised: 1200, curious: 2000, wink: 900, sleepy: 3000, shy: 1800, excited: 1500, dizzy: 1800, angry: 1500, sad: 2400, love: 2200, cool: 2600, laugh: 1600, whoa: 900, bored: 2400, proud: 2000, blush: 1700, focused: 2600, relaxed: 3000, confused: 1800 };
  function emote(name, ms, silent) {
    if (!EMOTIONS[name] || mode === "puppy") return;
    emit("emote", name);
    if (!silent) { if (name === "blush") smileSound(); else if (EMOTION_SFX[name]) cue(EMOTION_SFX[name]); }
    clearTimeout(emoteTimer);
    root.removeAttribute("data-emotion");
    void root.offsetWidth;
    root.setAttribute("data-emotion", name);
    emoteTimer = setTimeout(function () { root.removeAttribute("data-emotion"); }, ms || EMOTIONS[name]);
  }
  /* mood: set by events, decays back to neutral. It tints the idle animation
     (CSS data-mood), biases which acts get picked and which quips fit. */
  var MOODS = ["neutral", "happy", "curious", "excited", "proud", "shy", "sleepy", "relaxed", "focused", "dizzy", "confused"];
  function setMood(name, ms) {
    if (MOODS.indexOf(name) < 0) return;
    state.mood = name; state.moodUntil = Date.now() + (ms || 20000);
    emit("mood", name);
    if (root) { if (name === "neutral") root.removeAttribute("data-mood"); else root.setAttribute("data-mood", name); }
  }
  function moodTick(now) { if (state.mood !== "neutral" && now > state.moodUntil) setMood("neutral"); }

  /* ---------- Acts ---------- */
  var ACTS = {
    wave: { ms: 1800 },
    hop: { ms: 900, run: function () { cue("bubble"); } },
    peek: { ms: 2600, run: function () { later(function () { emote("surprised", 900); cue("pop"); }, 1400); } },
    stretch: { ms: 2400, run: function () { cue("yawn"); } },
    dance: { ms: 3400 },
    walk: { ms: 0, run: function () {
      var target = Math.random() < 0.5 ? minX() * Math.random() : 0;
      if (Math.abs(target - sx) < 40) target = sx < minX() / 2 ? 0 : minX();
      var ms = Math.abs(target - sx) * 14 + 400;
      setX(target, ms);
      return ms + 300;
    } },
    cycle: { ms: 0, run: function () {
      var far = minX(), ms1 = Math.abs(far - sx) * 9 + 500, ms2 = Math.abs(far) * 9 + 500;
      cue("bell"); later(function () { cue("bell"); }, ms1 + 350);
      setX(far, ms1);
      later(function () { setX(0, ms2); }, ms1 + 350);
      return ms1 + ms2 + 900;
    } },
    swim: { ms: 0, run: function () {
      var far = minX() * 0.7, ms1 = Math.abs(far - sx) * 22 + 600;
      later(function () { setX(far, ms1); cue("splash"); }, 500);
      later(function () { setX(0, ms1); }, ms1 + 900);
      later(function () { emote("dizzy", 900); say("Brr."); }, ms1 * 2 + 1700);
      return ms1 * 2 + 2800;
    } },
    drink: { ms: 3000, run: function () {
      later(function () { cue("gulp"); }, 900);
      if (Math.random() < 0.45) later(function () { act("drunk"); }, 3100);
      else later(function () { say("Ahh."); emote("happy"); }, 3000);
    } },
    drunk: { ms: 6500, run: function () {
      var i = 0, t = setInterval(function () {
        if (!root.matches('[data-act="drunk"]') || i++ > 5) { clearInterval(t); return; }
        if (i % 2 === 1) cue("hic");
        setX(sx + (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 40), 900);
      }, 1000);
      later(function () { say("…okay. Water next time."); emote("shy"); }, 6600);
    } },
    joker: { ms: 4600, run: function () { later(function () { say("Ta-da!"); cue("tada"); }, 3800); } },
    smoke: { ms: 4200, run: function () {
      later(function () { emote("dizzy", 1400); say(pick(["cough… cough. Okay. Never again.", "*cough* That's it, I quit.", "Yuck. Water next time."])); }, 4300);
    } },
    beer: { ms: 4200, run: function () {
      later(function () { say("Clink!"); cue("bell"); }, 900);
      later(function () { cue("gulp"); }, 2200);
      if (Math.random() < 0.6) later(function () { act("drunk"); }, 4300);
      else later(function () { emote("happy"); say(pick(["Ahh. Refreshing.", "Burp. Pardon."])); }, 4200);
    } },
    sing: { ms: 4200, run: function () { later(function () { emote("proud"); say(pick(["Thank you, thank you.", "I'll be here all week."])); }, 4300); } },
    read: { ms: 5200, run: function () {
      later(function () { say(pick(["Hmm.", "Interesting…", "Wait, what?"])); }, 2400);
      later(function () { emote("surprised", 1200); say("Plot twist!"); }, 5300);
    } },
    yoga: { ms: 5600, run: function () { later(function () { emote("proud"); say("Namaste."); }, 5700); } },
    skate: { ms: 0, run: function () {
      var far = minX(), ms1 = Math.abs(far - sx) * 7 + 500, ms2 = Math.abs(far) * 7 + 500;
      later(function () { setX(far, ms1); }, 300);
      later(function () { emote("excited", 700); }, ms1 + 350);
      later(function () { setX(0, ms2); }, ms1 + 700);
      later(function () { if (Math.random() < 0.4) { emote("dizzy", 1200); say("Bailed. Still cool."); } else { emote("cool"); } }, ms1 + ms2 + 1000);
      return ms1 + ms2 + 1100;
    } },
    fish: { ms: 6200, run: function () {
      face(false);
      var caught = Math.random() < 0.55;
      later(function () { say("…"); }, 2400);
      later(function () {
        if (caught) { root.classList.add("is-catch"); cue("splash"); emote("excited", 1500); say(pick(["Got one!", "Dinner!", "Look at the size of it!"])); }
        else { emote("bored", 1800); say(pick(["Nothing. Again.", "The fish are busy.", "Catch and release. Mostly release."])); }
      }, 4600);
      later(function () { root.classList.remove("is-catch"); }, 6400);
    } },
    selfie: { ms: 3200, run: function () {
      later(function () { say("Say cheese!"); }, 600);
      later(function () { cue("shutter"); }, 2080);
      later(function () { emote("proud", 1500); say(pick(["Posted.", "Nailed it.", "Filter: none. Naturally."])); }, 3300);
    } },
    skip: { ms: 4800, run: function () {
      if (Math.random() < 0.35) later(function () { root.removeAttribute("data-act"); emote("dizzy", 1400); say("Tripped. Nobody saw that."); }, 3000);
    } },
    sleep: { ms: 0 }
  };
  var actToken = 0;
  /* a follow-up that only fires if the act that scheduled it is still running */
  function later(fn, ms) {
    var mine = actToken;
    return setTimeout(function () { if (actToken === mine) fn(); }, ms);
  }
  /* act(name, pri): run an act unless something more important is still
     running. Ambient acts (chosen by the engine) are interrupted by anything;
     a reaction to the visitor interrupts an ambient act; a drag beats both.
     Lines belonging to an ambient act go through speak() and are rationed. */
  function act(name, pri) {
    var a = ACTS[name];
    if (!a || reduced || mode === "puppy") return false;
    if (pri == null) pri = PRI.event;
    var now = Date.now();
    if (state.cur && now < state.cur.until && pri < state.cur.pri) return false;
    clearTimeout(actTimer);
    actToken++;
    root.removeAttribute("data-act");
    root.classList.remove("is-catch");
    void root.offsetWidth;
    root.setAttribute("data-act", name);
    busy = true; state.quietAct = pri <= PRI.ambient;
    var ms = a.ms;
    if (a.run) { var r = a.run(); if (r) ms = r; }
    state.lastAct[name] = now;
    state.recent.push(name); if (state.recent.length > 4) state.recent.shift();
    if (ACT_LINES[name] && Math.random() < 0.8) { if (pri <= PRI.ambient) speak(pick(ACT_LINES[name])); else say(pick(ACT_LINES[name])); }
    if (name === "sleep") {
      asleep = true; state.cur = { name: name, pri: PRI.sleep, until: Infinity };
      var sn = setInterval(function () { if (!asleep) { clearInterval(sn); return; } cue("snore"); }, 3400);
      emit("act", { name: name, pri: pri, ms: 0 });
      return true;
    }
    state.cur = { name: name, pri: pri, until: now + ms };
    emit("act", { name: name, pri: pri, ms: ms });
    /* quietAct stays on past the end so an act's closing line (a beat after it) is gated too; the next act or stopAct() resets it */
    actTimer = setTimeout(function () { root.removeAttribute("data-act"); busy = false; state.cur = null; }, ms);
    return true;
  }
  function stopAct() { clearTimeout(actTimer); actToken++; root.removeAttribute("data-act"); root.classList.remove("is-catch"); busy = false; state.cur = null; state.quietAct = false; }
  function wake() {
    if (!asleep) return;
    asleep = false; stopAct(); cue("pop"); emit("wake");
    setMood("happy", 12000);
    emote("surprised"); say(pick(["Huh? I'm awake!", "Was I snoring?", "Oh! Hi."]));
  }

  /* ---------- Welcome: the full hello once per session, a wave after that ---------- */
  var CASE_LINES = {
    "zobot": "💬 Bots! My people. Scroll in.",
    "design-system": "🧩 26 components and me. I’m the 27th.",
    "operator-console": "🎧 Agent mode. Queue's calm today.",
    "reports": "📋 Charts. Each one answers one question.",
    "brand-configuration": "🎨 Brand day. Pick a colour, I'll wear it.",
    "outbound": "📣 Outbound! Say it loud.",
    "feedback": "⭐ Rate me. Five stars, I hope."
  };
  function caseLine() { return CASE_LINES[ctx.project] || "Oh, a case study. Good choice."; }
  function helloLine() {
    var h = new Date().getHours();
    var tod = h >= 5 && h < 12 ? "Good morning ☀ " : h >= 12 && h < 17 ? "Afternoon. " : h >= 17 && h < 21 ? "Golden hour, my favourite. " : "Late one? Me too. ";
    return tod + (isCase ? caseLine() : "I'm Sunny. I'll keep you company.");
  }
  var welcomed = false, welcomedAt = 0, welcomeWaiting = false;
  function greet() {
    if (document.documentElement.classList.contains("sl-on")) { setTimeout(greet, 400); return; } /* the loader is still on stage */
    if (Date.now() < (state.hushUntil || 0)) { setTimeout(greet, state.hushUntil - Date.now() + 400); return; }
    var first = true;
    if (CONFIG.welcomeOncePerSession) { try { first = !sessionStorage.getItem("sunny:hello"); sessionStorage.setItem("sunny:hello", "1"); } catch (e) { /* ignore */ } }
    act("wave", PRI.event);
    if (first) { say(helloLine()); return; }
    if (isCase) { /* a case gets its one line the first time it is opened in this session */
      var key = "sunny:case:" + ctx.project, said = false;
      try { said = !!sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); } catch (e) { /* ignore */ }
      if (!said) say(caseLine());
    }
  }
  function deliverWelcome() {
    if (welcomed) return;
    welcomed = true; welcomedAt = Date.now(); unlocked = true;
    play("ding"); greet();
  }
  /* with sound on, the hello waits for the gesture that unlocks audio so the chime can play with it */
  function welcome() {
    if (welcomed) return;
    var ac = ctx_audio();
    if (!ac) return;
    if (ac.state === "running") { deliverWelcome(); return; }
    if (welcomeWaiting) return;
    welcomeWaiting = true;
    var done = function () { welcomeWaiting = false; if (ac.state === "running") deliverWelcome(); };
    try { ac.resume().then(done, function () { welcomeWaiting = false; }); } catch (e) { welcomeWaiting = false; }
    setTimeout(function () { if (welcomeWaiting) done(); }, 400);
  }

  /* ---------- Context: which page, which section, is the visitor reading ---------- */
  function pageInfo() {
    var p = location.pathname, m = p.match(/case-([a-z-]+)\.html/);
    if (m) { ctx.page = "case"; ctx.project = m[1]; return; }
    if (/\/(index\.html)?$/.test(p)) { ctx.page = "home"; return; }
    var s = p.match(/([a-z0-9-]+)\.html$/);
    ctx.page = s ? s[1] : "page";
  }
  function labelFor(el) {
    if (ctx.page === "case") {
      var a = document.querySelector('.cs-formula a[href="#' + el.id + '"]'); if (a) return a.textContent.replace(/^\d+\s*/, "").trim();
      var n = el.querySelector(".c2-num"); if (n) return n.textContent.replace(/^\d+\s*\/\s*/, "").trim();
      return el.id;
    }
    return el.getAttribute("data-layer") || el.id;
  }
  function titleFor(el) { var h = el.querySelector(".cs-h2, .c2-h2, .section__title, .contact__title, .hero__title, h2, h1"); return h ? h.textContent.trim() : null; }
  /* the section with the most of itself on screen is the current one */
  function watchSections(onEnter) {
    if (!global.IntersectionObserver) return;
    var nodes = ctx.page === "case" ? document.querySelectorAll(".cs-section[id]") : document.querySelectorAll("section[id], header[id], footer[id]");
    if (!nodes.length) return;
    var ratios = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { ratios[en.target.id] = en.isIntersecting ? Math.max(0.01, en.intersectionRatio) : 0; });
      var best = null, bestR = 0;
      Object.keys(ratios).forEach(function (id) { if (ratios[id] > bestR) { bestR = ratios[id]; best = id; } });
      if (best && best !== ctx.section) {
        var el = document.getElementById(best);
        ctx.section = best; ctx.sectionLabel = labelFor(el); ctx.sectionTitle = titleFor(el);
        if (onEnter) onEnter(best, el);
      }
    }, { threshold: [0, 0.2, 0.35, 0.5, 0.75] });
    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }
  /* reading = scrolled a moment ago and still now. Idle = no scroll for a while. */
  function senseTick(now) {
    var since = now - state.lastScroll;
    ctx.reading = !ctx.askOpen && since > CONFIG.readingAfter && since < CONFIG.idleAfter;
    ctx.idle = since >= CONFIG.idleAfter;
    if (ctx.reading && state.mood === "neutral" && since > 20000) setMood("relaxed", 15000);
  }

  /* ---------- Behaviour engine ----------
     Every tick: sense → eligible acts for this context and mood → weighted
     pick → act, line or glance → pause. `quiet` acts may run while the visitor
     reads; nothing speaks then. */
  var BEHAVIOURS = {
    wave:    { w: 2, cool: 90e3 },
    hop:     { w: 4, cool: 45e3 },
    peek:    { w: 4, cool: 70e3, quiet: true },
    dance:   { w: 2, cool: 150e3 },
    cycle:   { w: 2, cool: 150e3 },
    swim:    { w: 2, cool: 180e3 },
    drink:   { w: 3, cool: 150e3 },
    beer:    { w: 1, cool: 300e3 },
    smoke:   { w: 1, cool: 400e3 },
    joker:   { w: 2, cool: 200e3 },
    sing:    { w: 2, cool: 200e3 },
    read:    { w: 3, cool: 120e3, quiet: true },
    yoga:    { w: 3, cool: 150e3, quiet: true },
    skate:   { w: 2, cool: 180e3 },
    fish:    { w: 2, cool: 200e3, quiet: true },
    selfie:  { w: 2, cool: 180e3 },
    skip:    { w: 2, cool: 180e3 },
    stretch: { w: 3, cool: 90e3, quiet: true },
    quip:    { w: 5, cool: 40e3 },
    glance:  { w: 8, cool: 8e3, quiet: true }
  };
  /* what fits where: boosts by home section, case page and page end */
  var POOLS = {
    hey: { glance: 2, wave: 2, peek: 1 },
    work: { peek: 4, glance: 2, read: 1 },
    process: { hop: 3, cycle: 2, skate: 1, joker: 1 },
    story: { glance: 4, read: 2, stretch: 1 },
    gallery: { selfie: 4, peek: 1 },
    writing: { read: 5 },
    skills: { selfie: 2, dance: 2, sing: 1, joker: 1 },
    ai: { joker: 2, wave: 1, peek: 1 },
    contact: { wave: 5 },
    "case": { read: 3, peek: 2, glance: 2, stretch: 1 },
    end: { dance: 3, wave: 2, selfie: 1 }
  };
  var MOOD_POOLS = {
    happy: { hop: 2, dance: 1 }, curious: { peek: 3, read: 2, glance: 2 }, excited: { dance: 3, skate: 2, hop: 2, skip: 1 },
    proud: { selfie: 3, sing: 2 }, shy: { glance: 3, stretch: 1 }, sleepy: { stretch: 3, yoga: 3 },
    relaxed: { yoga: 3, fish: 2, read: 2, drink: 1 }, focused: { glance: 2 }, dizzy: { stretch: 2 }, confused: { glance: 2, peek: 1 }
  };
  function choose() {
    var now = Date.now(), boost = {}, k;
    var pool = ctx.atBottom ? "end" : ctx.page === "case" ? "case" : ctx.section;
    var p = POOLS[pool] || {}; for (k in p) boost[k] = (boost[k] || 0) + p[k];
    var m = MOOD_POOLS[state.mood] || {}; for (k in m) boost[k] = (boost[k] || 0) + m[k];
    var list = [], total = 0;
    for (k in BEHAVIOURS) {
      var b = BEHAVIOURS[k];
      if (ctx.reading && !b.quiet) continue;
      if (k === "quip" && state.proactive >= CONFIG.maxProactivePerPage) continue;
      if (state.lastAct[k] && now - state.lastAct[k] < (b.cool || CONFIG.actCooldown)) continue;
      if (k !== "glance" && state.recent.indexOf(k) > -1) continue;
      var w = b.w + (boost[k] || 0) * 2;
      list.push([k, w]); total += w;
    }
    if (!list.length) return null;
    var r = Math.random() * total;
    for (var i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; }
    return list[list.length - 1][0];
  }
  function quips() { var m = MOOD_QUIPS[state.mood], base = isCase ? CASE_QUIPS.concat(QUIPS) : QUIPS; return m ? m.concat(base) : base; }
  function glance() {
    state.lastAct.glance = Date.now();
    var gx = (Math.random() * 2 - 1).toFixed(2), gy = (Math.random() * 1.2 - 0.6).toFixed(2);
    look.style.transform = "translate(" + gx * 5 + "px," + gy * 4 + "px)";
    setTimeout(function () { if (Date.now() - lastInput > 1000) look.style.transform = ""; }, 800 + Math.random() * 600);
  }
  function direct() {
    var now = Date.now();
    moodTick(now); senseTick(now);
    if (mode === "puppy") return; /* sensing continues for the sidekick; Sunny itself rests */
    if (now < (state.hushUntil || 0)) return; /* hushed: the sidekick is running a scene */
    if (reduced || document.hidden || drag || root.classList.contains("is-carried")) return;
    var idleFor = now - lastInput;
    if (asleep) return;
    if (!ctx.askOpen && idleFor > CONFIG.sleepAfter) { act("sleep", PRI.sleep); return; }
    if (idleFor > CONFIG.sleepAfter * 0.6 && state.mood === "neutral") setMood("sleepy", 20000);
    if (ctx.askOpen) { if (Math.random() < 0.15) glance(); return; }
    if (now < state.nextAmbient) return;
    if (state.cur && now < state.cur.until) return;
    if (root.hasAttribute("data-emotion")) return;
    var what = choose(), gap = CONFIG.ambientGap;
    state.nextAmbient = now + (gap[0] + Math.random() * (gap[1] - gap[0])) * quietFactor() * (ctx.reading ? 1.6 : 1);
    if (!what) return;
    if (what === "quip") speak(pick(quips()));
    else if (what === "glance") glance();
    else act(what, PRI.ambient);
  }

  /* ---------- Interaction ---------- */
  var px = -1e4, py = -1e4, raf = 0, nearNow = false, taps = [], drag = null;
  function onPointer(e) {
    px = e.clientX; py = e.clientY; lastInput = Date.now(); wake();
    if (!raf) raf = requestAnimationFrame(update);
  }
  function update() {
    raf = 0;
    var r = charEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260) * 5;
    if (!drag) look.style.transform = "translate(" + (dx / d * k).toFixed(1) + "px," + (dy / d * k * 0.8).toFixed(1) + "px)";
    var near = d < r.width * 1.3;
    if (near !== nearNow) {
      nearNow = near;
      root.classList.toggle("is-near", near);
      if (near && !drag && !ctx.askOpen && Date.now() - state.lastNear > 12000) { state.lastNear = Date.now(); if (act("wave", PRI.event)) cue("bubble"); }
    }
  }
  function wireInput() {
    if (finePointer) global.addEventListener("pointermove", onPointer, { passive: true });
    global.addEventListener("keydown", function () { lastInput = Date.now(); wake(); });
    global.addEventListener("touchstart", function () { lastInput = Date.now(); wake(); }, { passive: true });
    function firstGesture() { gestured = true; if (!soundOn) return; ctx_audio(); welcome(); }
    global.addEventListener("pointerdown", firstGesture, { passive: true });
    global.addEventListener("keydown", firstGesture);
    global.addEventListener("touchstart", firstGesture, { passive: true });

    /* click, double, triple */
    svg.addEventListener("click", function () {
      if (drag && drag.moved) return;
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 1400; }); taps.push(now);
      noticed(); stopAct(); emit("click", taps.length);
      if (taps.length >= 3) { smileSound(); setMood("dizzy", 8000); emote("angry", 0, true); say(pick(["Okay, okay! Personal space.", "Hey! Not a button.", "That tickles. Stop. Don't stop."])); }
      else if (taps.length === 2) { smileSound(); setMood("excited", 15000); emote("dizzy", 0, true); act("hop", PRI.direct); say(pick(["Whee!", "Again! Again!", "Woo!"])); }
      else if ((tipTurn = !tipTurn)) { setMood("happy", 20000); emote("wink"); say("Tip: " + pick(TIPS), 4200); }
      else { setMood("happy", 20000); emote("blush"); say(pick(["Hey!", "Hi there!", "That tickles!", "Boop received.", "Oh! Hello.", "Aw, stop it."])); }
    });
    svg.addEventListener("contextmenu", function (e) { e.preventDefault(); noticed(); stopAct(); sfx("tick"); emote("cool"); say(pick(["Too cool for context menus.", "Shades on.", "Right-click? Bold."])); });

    /* drag along the edge */
    svg.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      drag = { x: e.clientX, startSx: sx, moved: false };
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or stale pointer */ }
      lastInput = Date.now(); wake();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; noticed(); stopAct(); state.cur = { name: "drag", pri: PRI.drag, until: Infinity }; sfx("pickup"); root.classList.add("is-carried"); setMood("dizzy", 10000); emit("drag", true); emote("surprised", 60000); say(pick(["Wheee, I'm flying!", "Careful, I'm fragile. Not really.", "Put me down! …no wait, this is fun."])); }
      if (drag.moved) setX(drag.startSx + dx, 0);
    });
    function endDrag() {
      if (!drag) return;
      var moved = drag.moved; drag = null;
      if (moved) {
        state.cur = null; emit("drag", false);
        root.classList.remove("is-carried");
        root.removeAttribute("data-emotion");
        root.classList.add("is-landing"); sfx("land"); setTimeout(function () { root.classList.remove("is-landing"); }, 500);
        emote("dizzy", 1000); say(pick(["Oof!", "Nice spot.", "Thanks for the lift."]));
      }
    }
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);

    /* nap button */
    napBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      stopAct(); sfx("pop"); emote("sleepy", 3000); say("Napping. Reload the page to wake me.", 2200);
      try { sessionStorage.setItem("sunny:nap", "1"); } catch (err) { /* ignore */ }
      setTimeout(function () { root.classList.add("is-gone"); document.documentElement.classList.remove("has-sunny"); }, 2300);
    });

    /* one scroll listener: speed, direction flips, page end, and the reading sense */
    var lastY = global.scrollY, lastT = 0, whoaAt = 0, bottomSaid = false, runTimer = 0, flips = [], dizzyAt = 0, lastDir = 0;
    global.addEventListener("scroll", function () {
      var now = performance.now(), y = global.scrollY;
      lastInput = state.lastScroll = Date.now(); wake();
      if (lastT) {
        var v = (y - lastY) / Math.max(8, now - lastT), dir = v > 0 ? 1 : v < 0 ? -1 : 0;
        if (Math.abs(v) > 0.9) { root.classList.add("is-running"); clearTimeout(runTimer); runTimer = setTimeout(function () { root.classList.remove("is-running"); }, 500); }
        if (Math.abs(v) > 2 && now - whoaAt > 4000 && !ctx.askOpen) { whoaAt = now; root.style.setProperty("--sy", v > 0 ? "1" : "-1"); emote("whoa"); cue("swoosh"); }
        if (dir && lastDir && dir !== lastDir) {
          flips.push(now); flips = flips.filter(function (t) { return now - t < 1500; });
          if (flips.length >= 4 && now - dizzyAt > 5000) { dizzyAt = now; flips = []; stopAct(); setMood("dizzy", 8000); emote("dizzy", 1600); say(pick(["Whoa. Slow down.", "Dizzy… which way is up?", "Pick a direction!"]), 1800); }
        }
        if (dir) lastDir = dir;
      }
      lastY = y; lastT = now;
      ctx.atTop = y < 200;
      ctx.atBottom = y + global.innerHeight >= document.documentElement.scrollHeight - 40;
      if (ctx.atBottom && !bottomSaid) {
        bottomSaid = true; setMood("proud", 20000); emit("end");
        if (act("dance", PRI.event)) { cue("ding"); say(isCase ? "End of the case! Next one's right there →" : "You made it to the end! Say hi to Ganesh."); }
      }
      if (!ctx.atBottom && ctx.atTop) bottomSaid = false;
    }, { passive: true });

    /* window, tab, theme */
    var wentOut = false, edgeAt = 0;
    document.documentElement.addEventListener("mouseleave", function () {
      if (busy || asleep || ctx.askOpen || Date.now() - edgeAt < 10000) return;
      edgeAt = Date.now(); wentOut = true; emote("sad"); speak(pick(["Come back…", "Bye for now.", "I'll be here."]), 2200, true);
    });
    document.documentElement.addEventListener("mouseenter", function () {
      if (!wentOut || asleep || ctx.askOpen) return;
      wentOut = false; setMood("happy", 15000); emote("happy"); speak(pick(["You're back!", "Hi again!", "Missed you."]), 2200, true);
    });
    document.addEventListener("visibilitychange", function () {
      root.classList.toggle("is-paused", document.hidden);
      if (document.hidden || asleep) return;
      setMood("excited", 10000); emit("visible");
      if (act("wave", PRI.event)) { speak(pick(["Welcome back!", "Oh hey, you're back."]), 2200, true); cue("pop"); }
    });
    if (global.MutationObserver) new MutationObserver(function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (Date.now() - welcomedAt < 2500 || ctx.askOpen) { sfx("tick"); return; }
      stopAct(); sfx("tick");
      if (dark) { setMood("relaxed", 20000); emote("sleepy", 2500); say(pick(["Dark mode. Cosy.", "Lights off. Nice."])); }
      else { setMood("happy", 15000); emote("cool"); say(pick(["Bright! Shades on.", "Light mode? Bold choice."])); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- Reactions: sections, visitor, site features, easter eggs ---------- */
  var tipTurn = false;
  var TIPS = [
    "Spacing is 80% of good UI. Small gap means together, big gap means new topic. ☀",
    "Pick one colour, make it light to dark, use it 60-30-10.",
    "UI lives in the frame. UX lives in time.",
    "You only need four buttons. Most files have nine.",
    "Fix the tokens first and the components fix themselves.",
    "Critique in order: goal, flow, hierarchy, component, pixel.",
    "Ship ugly, ship often. One real project beats ten tutorials.",
    "Related things closer, groups further apart. That is most of layout."
  ];
  /* home sections: one reaction each, the first time they come into view */
  var SECTIONS = {
    work: { emotion: "curious", mood: "curious", line: "Seven case studies. Open one, I'll peek over the edge." },
    process: { act: "hop", mood: "excited", line: "Tokens → components → code. I carry the chip to Ship.", then: { emotion: "proud", line: "Shipped. Zero drift." } },
    story: { emotion: "shy", mood: "shy", line: "That's him. I'm the sidekick." },
    gallery: { emotion: "love", mood: "happy", line: "Ooh, art. Click a piece and I'll hold the frame." },
    writing: { act: "read", mood: "curious", line: "Reading the carousels. Spacing is 80%, apparently." },
    skills: { emotion: "proud", mood: "proud", line: "skills.* All tokens, no fluff." },
    ai: { emotion: "proud", mood: "proud", line: "That's my section. Press A and ask me anything." },
    contact: { act: "wave", mood: "happy", line: "Say hi. He replies within a day." }
  };
  /* case studies: a nod at the parts that matter, keyed by the outline label */
  var CASE_SECTIONS = {
    "Exploration": { emotion: "curious", mood: "curious" },
    "Discovery": { emotion: "curious", mood: "curious" },
    "Decisions": { emotion: "curious", mood: "curious", line: "This is where the interesting decisions happened." },
    "Your thinking": { emotion: "curious", mood: "curious", line: "This is where the interesting decisions happened." },
    "Outcome": { emotion: "proud", mood: "proud", line: "The payoff." },
    "Impact": { emotion: "proud", mood: "proud", line: "The payoff." },
    "Output": { emotion: "proud", mood: "proud", line: "Counts he can stand behind." },
    "Takeaway": { emotion: "relaxed", mood: "relaxed", line: "One line worth remembering." },
    "Reflection": { emotion: "relaxed", mood: "relaxed", line: "One line worth remembering." }
  };
  var lastReact = 0;
  function react(r) {
    if (reduced || asleep || ctx.askOpen || Date.now() - lastReact < 2500) return;
    lastReact = Date.now();
    if (r.mood) setMood(r.mood, 25000);
    var ok = true;
    if (r.act) ok = act(r.act, PRI.section);
    else if (r.emotion) { if (state.cur && state.cur.pri > PRI.section && Date.now() < state.cur.until) ok = false; else emote(r.emotion); }
    if (ok && r.line) speak(r.line, 3200);
    if (ok && r.then) setTimeout(function () { if (!asleep && !ctx.askOpen) { emote(r.then.emotion); speak(r.then.line, 2600); } }, 3600);
  }
  function enterSection(id) {
    emit("section", { id: id, label: ctx.sectionLabel, title: ctx.sectionTitle, first: !ctx.seen[id] });
    if (!CONFIG.sectionLines || ctx.seen[id]) return;
    ctx.seen[id] = true;
    var r = ctx.page === "case" ? CASE_SECTIONS[ctx.sectionLabel] : SECTIONS[id];
    if (ctx.page === "case" && !ctx.seen._case) { ctx.seen._case = true; setMood("curious", 30000); }
    if (r) react(r);
  }
  function wireReactions() {
    if (ctx.page === "home") {
      /* the four steps of How I work: Sunny reacts when a visitor picks one */
      var STEPS = [
        { emotion: "curious", line: "Step one: understand the real problem first." },
        { act: "read", line: "Exploring ideas, workflows and what could be." },
        { emotion: "cool", line: "Systemize: patterns, components and tokens, kept consistent." },
        { emotion: "excited", line: "Build: design meets code and ships!" }
      ];
      var stepsSeen = {};
      document.addEventListener("how:step", function (e) {
        var i = e.detail; if (stepsSeen[i] || !STEPS[i]) return;
        stepsSeen[i] = true; noticed(); react(STEPS[i]);
      });
      /* opening a case card */
      Array.prototype.forEach.call(document.querySelectorAll("details.case"), function (d) {
        d.addEventListener("toggle", function () {
          if (d.open) react({ emotion: "curious", mood: "curious", line: pick(["Ooh, opening that one?", "Good pick. Every screen is recreated.", "Peeking over the edge…"]) });
        });
      });
      /* hovering the email actions */
      var excitedAt = 0;
      Array.prototype.forEach.call(document.querySelectorAll("#emailLink, .hero__cta .btn--ghost, .cs-cta .btn-sun"), function (a) {
        a.addEventListener("mouseenter", function () {
          if (busy || ctx.askOpen || Date.now() - excitedAt < 6000) return;
          excitedAt = Date.now(); emote("excited", 1200); speak(pick(["Yes! Do it.", "Go on, say hi.", "👍 He replies within a day."]), 2200, true);
        });
      });
    }

    /* dark mode: night cap · inspect mode: glasses and self-measurement */
    var isDark = function () { return document.documentElement.getAttribute("data-theme") === "dark"; };
    root.classList.toggle("is-night", isDark());
    if (global.MutationObserver) {
      new MutationObserver(function () { root.classList.toggle("is-night", isDark()); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      var wasInspecting = false;
      new MutationObserver(function () {
        var on = document.body.classList.contains("inspecting");
        if (on && !wasInspecting) { stopAct(); emote("curious", 2000); say("Sunny · " + Math.round(charW) + " × " + Math.round(charW) + " · color/sun", 2600); }
        wasInspecting = on;
      }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    /* resume download */
    Array.prototype.forEach.call(document.querySelectorAll(".nav__resume"), function (a) {
      a.addEventListener("click", function () { stopAct(); setMood("proud", 15000); emote("proud", 1800); say("📄 Carrying your PDF… there, it's yours.", 2600); });
    });

    /* typing "sunny" anywhere that is not a text field */
    var typed = "";
    global.addEventListener("keydown", function (e) {
      if (ctx.askOpen || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed === "sunny") { typed = ""; noticed(); stopAct(); setMood("excited", 15000); act("dance", PRI.direct); say("You found me! ☀", 2400); if (!reduced) sunRain(); }
    });
    function sunRain() {
      var layer = document.createElement("div"); layer.className = "sun-rain"; layer.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 28; i++) {
        var s = document.createElement("span");
        s.textContent = "☀"; s.style.left = (Math.random() * 100) + "%";
        s.style.animationDelay = (Math.random() * 0.9) + "s"; s.style.animationDuration = (2.2 + Math.random() * 1.4) + "s";
        s.style.fontSize = (14 + Math.random() * 18) + "px";
        layer.appendChild(s);
      }
      document.body.appendChild(layer);
      setTimeout(function () { layer.remove(); }, 4200);
    }

    /* evening tint; the time of day is part of the hello line */
    var h = new Date().getHours();
    if (h >= 17 && h < 21) root.classList.add("is-evening");
  }

  /* ---------- Boot ---------- */
  function init() {
    try { if (sessionStorage.getItem("sunny:nap")) return; } catch (e) { /* ignore */ }
    pageInfo();
    build();
    applyMode();
    document.documentElement.classList.add("has-sunny");
    state.lastScroll = Date.now(); /* the page opens on its first section: reading until proven idle */
    watchSections(enterSection);
    if (!reduced) {
      wireInput();
      setTimeout(function () { root.classList.add("is-in"); }, 300);
      setTimeout(function () {
        if (soundOn) welcome();
        if (!welcomed) { welcomed = true; welcomedAt = Date.now(); greet(); }
      }, 1100);
      wireReactions();
      setInterval(direct, CONFIG.tick);
    } else {
      root.classList.add("is-in", "is-static");
    }
    api.el = root;
  }
  /* API is available immediately; calls before the DOM is ready are ignored */
  var api = global.Sunny = {
    art: art, /* the character's SVG markup, for the loader's stand-in */
    act: function (n, pri) { return !!root && act(n, typeof pri === "string" ? (PRI[pri] != null ? PRI[pri] : PRI.direct) : (pri == null ? PRI.direct : pri)); },
    /* a sound cue that respects the visitor's sound setting (unlike sfx, which is for previews) */
    cue: function (n) { if (SFX[n]) cue(n); },
    /* a timed class on the root, for small poses the CSS defines: is-pat, is-sprout, is-lookdown */
    pose: function (name, ms) { if (!root) return; root.classList.add("is-" + name); setTimeout(function () { root.classList.remove("is-" + name); }, ms || 1500); },
    /* slide the character sideways for a moment (the stage is only as wide as Sunny, so this is the only way to step toward a friend) */
    shift: function (dx, ms) { if (!charEl) return; charEl.style.setProperty("--walk-ms", (ms || 700) + "ms"); charEl.style.setProperty("--shx", (dx || 0) + "px"); if (dx) { if (state.shiftFace == null) state.shiftFace = facingLeft; face(dx < 0); } else if (state.shiftFace != null) { face(state.shiftFace); state.shiftFace = null; } },
    wake: function () { if (root) wake(); },
    /* no proactive lines or ambient acts for a while: the sidekick is running a scene */
    hush: function (ms) { state.hushUntil = Date.now() + (ms || 5000); },
    PRI: PRI,
    emote: function (n, ms) { if (root) emote(n, ms); },
    emotionSounds: EMOTION_SFX,
    say: function (t, ms) { if (root) { state.sayForce = true; say(t, ms); state.sayForce = false; } },
    sfx: function (n) { if (SFX[n]) { try { SFX[n](); } catch (e) { /* silent */ } } },
    setSound: setSound, soundOn: function () { return soundOn; },
    setCues: setCues, cuesOn: function () { return extraCues; },
    setVoice: setVoice, voice: function () { return voiceName; }, voices: Object.keys(VOICES),
    audioState: function () { return { context: actx ? actx.state : "none", unlocked: unlocked, welcomed: welcomed }; },
    /* the Ask panel tells Sunny when it is open: no ambient acts, no bubbles, a focused face */
    setAskOpen: function (on) {
      ctx.askOpen = !!on; emit("ask", !!on);
      if (!root) return;
      if (on) { noticed(); if (state.cur && state.cur.pri <= PRI.ambient) stopAct(); setMood("focused", 120000); if (!reduced) emote("focused", 2000, true); }
      else setMood("happy", 10000);
    },
    /* where the visitor is: page, project and the section in view */
    context: function () { return { page: ctx.page, project: ctx.project, section: ctx.section, sectionLabel: ctx.sectionLabel, sectionTitle: ctx.sectionTitle }; },
    mood: function () { return state.mood; },
    setMood: function (n, ms) { setMood(n, ms); },
    /* companions */
    mode: function () { return mode; },
    setMode: function (m) {
      if (MODES.indexOf(m) < 0) m = "sunny";
      mode = m;
      try { localStorage.setItem("pref:companion", m); } catch (e) { /* ignore */ }
      applyMode(); emit("mode", m);
    },
    on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
    off: function (name, fn) { var l = listeners[name]; if (l) listeners[name] = l.filter(function (f) { return f !== fn; }); },
    emit: emit,
    /* what Sunny senses right now, for the sidekick */
    sense: function () { return { reading: ctx.reading, idle: ctx.idle, askOpen: ctx.askOpen, atBottom: ctx.atBottom, talking: !!root && root.classList.contains("is-talking"), asleep: asleep, busy: busy, mood: state.mood, lastInput: lastInput, section: ctx.section }; },
    /* turn the eyes: dx, dy in -1..1, back to the pointer after ms */
    look: function (dx, dy, ms) { if (!look) return; look.style.transform = "translate(" + (dx * 5).toFixed(1) + "px," + (dy * 4).toFixed(1) + "px)"; setTimeout(function () { look.style.transform = ""; }, ms || 1500); },
    config: CONFIG,
    debug: function () { return { state: state, ctx: ctx }; },
    acts: Object.keys(ACTS), emotions: Object.keys(EMOTIONS), moods: MOODS, sounds: Object.keys(SFX), el: null
  };
  /* mount after the page has loaded, in an idle slot, so the first paint is not waiting on the mascot */
  function whenIdle(fn) { if (global.requestIdleCallback) global.requestIdleCallback(fn, { timeout: 1200 }); else setTimeout(fn, 120); }
  if (document.readyState === "complete") whenIdle(init); else global.addEventListener("load", function () { whenIdle(init); });
})(window);
