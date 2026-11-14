/* Sunny: the site companion. A little sun with a sprout who lives in the
   bottom-right corner of every page, entertains itself with acts (walk, cycle,
   swim, skate, skip rope, drink, beer, smoke, juggle, sing, read, yoga, fish,
   selfie, dance, peek, sleep), wears the whole emotion set, talks
   in a speech bubble and reacts to the visitor (pointer, clicks, drag, scroll,
   theme, leaving the window). Plain JS, inline SVG, CSS animations.

   Sound: a welcome chime on the visitor's first click, tap or key (browsers
   block audio before that), a smile chirp on every click, a small sound for
   every emotion and quiet cues for the acts. Sunny.setSound / setCues.
   API: Sunny.act(name) · Sunny.emote(name) · Sunny.say(text) · Sunny.acts
*/
(function (global) {
  "use strict";
  if (global.Sunny) return;
  var reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = global.matchMedia && global.matchMedia("(pointer: fine)").matches;
  var INK = "#111111", SUN = "#FFC93C", DEEP = "#F2AE2E";

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
      '<g class="s-fx s-fx--notes" fill="' + INK + '" font-family="Fraunces, Georgia, serif"><text class="s-note s-note1" x="160" y="70" font-size="20">♪</text><text class="s-note s-note2" x="180" y="52" font-size="16">♫</text></g>' +
      '<g class="s-fx s-fx--stars" fill="' + SUN + '" stroke="' + INK + '" stroke-width="1.5"><g transform="translate(50 60)"><path class="s-star s-star1" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g><g transform="translate(172 52) scale(0.7)"><path class="s-star s-star2" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g><g transform="translate(60 150) scale(0.6)"><path class="s-star s-star3" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"/></g></g>' +
    '</svg>';
  }

  /* ---------- Lines ---------- */
  var isCase = /case-/.test(location.pathname);
  var QUIPS = [
    "Pssst. Try clicking me.", "You can drag me along the edge. I don't mind.",
    "Fun fact: I'm 100% SVG and a little JavaScript.", "I run on design tokens. And snacks.",
    "Scroll on, there's more below.", "My favourite colour? #FFC93C. Obviously.",
    "Why did the designer go broke? Too many free trials.", "I told a CSS joke. Nobody got it. It needed more context.",
    "I'd tell you a UX joke, but it's three screens deep.", "Ganesh built me from a Figma frame. No frameworks were harmed.",
    "Between you and me, the Zobot case is the good one.", "Did you know every button here is Code Connected?",
    "Hold on, stretching.", "I could do this all day. I literally do."
  ];
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

  /* ---------- DOM ---------- */
  var root, charEl, bubble, napBtn, svg, look, actTimer = 0, sayTimer = 0, emoteTimer = 0, busy = false, asleep = false;
  var sx = 0, stageW = 320, charW = 140, lastInput = Date.now(), facingLeft = false;

  function build() {
    root = document.createElement("div");
    root.className = "sunny";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = '<div class="sunny__char"><div class="sunny__bubble"></div><button type="button" class="sunny__nap" aria-label="Let Sunny nap" title="Let Sunny nap">zz</button>' + art() + '</div>';
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
  function say(text, ms) {
    clearTimeout(sayTimer);
    bubble.textContent = text;
    root.classList.add("is-talking");
    sayTimer = setTimeout(function () { root.classList.remove("is-talking"); }, ms || Math.max(1800, 900 + text.length * 55));
  }

  /* ---------- Sound: tiny synthesized cues, no audio files ----------
     Browsers only let audio start after a gesture (click, key, touch). Cues
     triggered by a gesture play right away; cues from Sunny's own acts play
     only once a gesture has unlocked audio. All of it is quiet. */
  var actx = null, unlocked = false, soundOn = true, extraCues = true;
  try {
    soundOn = localStorage.getItem("sunny:sound") !== "off";
    extraCues = localStorage.getItem("sunny:cues") !== "off";
  } catch (e) { /* ignore */ }
  function ctx() {
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    if (!actx) actx = new AC();
    if (actx.state === "suspended") actx.resume();
    if (actx.state === "running") unlocked = true;
    return actx;
  }
  function tone(notes, type, vol) {
    /* notes: [frequency, start, duration, glideTo] in seconds */
    var ac = ctx(); if (!ac) return;
    var t = ac.currentTime;
    notes.forEach(function (n) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(n[0], t + n[1]);
      if (n[3]) o.frequency.exponentialRampToValueAtTime(n[3], t + n[1] + n[2]);
      g.gain.setValueAtTime(0.0001, t + n[1]);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t + n[1] + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + n[2]);
      o.connect(g); g.connect(ac.destination);
      o.start(t + n[1]); o.stop(t + n[1] + n[2] + 0.03);
    });
  }
  function hiss(dur, from, to, vol, filterType) {
    /* a short filtered noise burst: splashes, swooshes, shutter clicks */
    var ac = ctx(); if (!ac) return;
    var len = Math.ceil(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    src.buffer = buf; f.type = filterType || "bandpass"; f.Q.value = 0.8;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
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
    sigh: function () { hiss(0.4, 1200, 300, 0.02, "lowpass"); tone([[300, 0, 0.4, 220]], "sine", 0.02); }
  };
  /* which cue each emotion makes; blush is the smile chirp and always plays */
  var EMOTION_SFX = { happy: "bubble", surprised: "gasp", curious: "hmm", wink: "ting", sleepy: "yawn", shy: "aww", excited: "whee", dizzy: "wobble", angry: "grumble", sad: "sadden", love: "heart", cool: "shwoop", laugh: "giggle", whoa: "swoosh", bored: "sigh", proud: "proud" };
  function play(name) { if (soundOn && SFX[name]) { try { SFX[name](); } catch (e) { /* silent */ } } }
  /* the one sound on by default: the smile chirp when Sunny is clicked */
  function smileSound() { play("boop"); }
  /* every other cue is opt-in (Sunny.setCues(true)); gesture cues play now,
     act cues only once an earlier gesture has unlocked audio */
  function sfx(name) { if (extraCues) play(name); }
  function cue(name) { if (extraCues && unlocked) play(name); }
  function setSound(on) {
    soundOn = !!on;
    try { localStorage.setItem("sunny:sound", soundOn ? "on" : "off"); } catch (e) { /* ignore */ }
  }
  function setCues(on) {
    extraCues = !!on;
    try { localStorage.setItem("sunny:cues", extraCues ? "on" : "off"); } catch (e) { /* ignore */ }
  }
  /* welcome: a chime with the wave. Browsers only allow sound after a click,
     tap or key press, so if the page opened without one we wait for the first. */
  var welcomed = false, welcomedAt = 0, welcomeWaiting = false;
  function deliverWelcome() {
    if (welcomed) return;
    welcomed = true; welcomedAt = Date.now(); unlocked = true;
    var line = isCase ? pick(["Ooh, a case study. Good pick!", "Welcome! Let me show you around."]) : pick(["Hi! I'm Sunny. Welcome!", "Hello there! Welcome to Ganesh's portfolio.", "Hi! Great to see you."]);
    stopAct(); act("wave");
    play("ding"); say(line);
  }
  function welcome() {
    if (welcomed) return;
    var ac = ctx();
    if (!ac) return;
    if (ac.state === "running") { deliverWelcome(); return; }
    /* resume() finishes a moment after the gesture: deliver when it does */
    if (welcomeWaiting) return;
    welcomeWaiting = true;
    var done = function () { welcomeWaiting = false; if (ac.state === "running") deliverWelcome(); };
    try { ac.resume().then(done, function () { welcomeWaiting = false; }); } catch (e) { welcomeWaiting = false; }
    setTimeout(function () { if (welcomeWaiting) done(); }, 400);
  }

  /* ---------- Emotions ---------- */
  var EMOTIONS = { happy: 1800, surprised: 1200, curious: 2000, wink: 900, sleepy: 3000, shy: 1800, excited: 1500, dizzy: 1800, angry: 1500, sad: 2400, love: 2200, cool: 2600, laugh: 1600, whoa: 900, bored: 2400, proud: 2000, blush: 1700 };
  function emote(name, ms, silent) {
    if (!EMOTIONS[name]) return;
    if (!silent) { if (name === "blush") smileSound(); else if (EMOTION_SFX[name]) cue(EMOTION_SFX[name]); }
    clearTimeout(emoteTimer);
    root.removeAttribute("data-emotion");
    void root.offsetWidth;
    root.setAttribute("data-emotion", name);
    emoteTimer = setTimeout(function () { root.removeAttribute("data-emotion"); }, ms || EMOTIONS[name]);
  }

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
  function act(name) {
    var a = ACTS[name];
    if (!a || reduced) return;
    clearTimeout(actTimer);
    actToken++;
    root.removeAttribute("data-act");
    root.classList.remove("is-catch");
    void root.offsetWidth;
    root.setAttribute("data-act", name);
    busy = true;
    var ms = a.ms;
    if (a.run) { var r = a.run(); if (r) ms = r; }
    if (ACT_LINES[name] && Math.random() < 0.8) say(pick(ACT_LINES[name]));
    if (name === "sleep") {
      asleep = true;
      var sn = setInterval(function () { if (!asleep) { clearInterval(sn); return; } cue("snore"); }, 3400);
      return;
    }
    actTimer = setTimeout(function () { root.removeAttribute("data-act"); busy = false; }, ms);
  }
  function stopAct() { clearTimeout(actTimer); actToken++; root.removeAttribute("data-act"); root.classList.remove("is-catch"); busy = false; }
  function wake() {
    if (!asleep) return;
    asleep = false; stopAct(); cue("pop");
    emote("surprised"); say(pick(["Huh? I'm awake!", "Was I snoring?", "Oh! Hi."]));
  }

  /* ---------- Director ---------- */
  var WEIGHTS = [["wave", 6], ["hop", 7], ["walk", 14], ["peek", 4], ["dance", 6], ["cycle", 7], ["swim", 5], ["drink", 6], ["beer", 5], ["smoke", 4], ["joker", 6], ["sing", 5], ["read", 5], ["yoga", 5], ["skate", 6], ["fish", 5], ["selfie", 5], ["skip", 5], ["stretch", 4], ["quip", 13], ["glance", 8]];
  function weighted() {
    var total = WEIGHTS.reduce(function (s, w) { return s + w[1]; }, 0), r = Math.random() * total;
    for (var i = 0; i < WEIGHTS.length; i++) { r -= WEIGHTS[i][1]; if (r <= 0) return WEIGHTS[i][0]; }
    return "hop";
  }
  function direct() {
    if (reduced || document.hidden || busy || asleep || root.classList.contains("is-carried") || root.hasAttribute("data-emotion")) return;
    var idleFor = Date.now() - lastInput;
    if (idleFor > 40000) { act("sleep"); return; }
    var what = weighted();
    if (what === "quip") say(pick(isCase ? CASE_QUIPS.concat(QUIPS) : QUIPS));
    else if (what === "glance") glance();
    else act(what);
  }
  function glance() {
    var gx = (Math.random() * 2 - 1).toFixed(2), gy = (Math.random() * 1.2 - 0.6).toFixed(2);
    look.style.transform = "translate(" + gx * 5 + "px," + gy * 4 + "px)";
    setTimeout(function () { if (Date.now() - lastInput > 1000) look.style.transform = ""; }, 800 + Math.random() * 600);
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
      if (near && !busy && !drag) { act("wave"); cue("bubble"); }
    }
  }
  function wireInput() {
    if (finePointer) global.addEventListener("pointermove", onPointer, { passive: true });
    global.addEventListener("keydown", function () { lastInput = Date.now(); wake(); });
    global.addEventListener("touchstart", function () { lastInput = Date.now(); wake(); }, { passive: true });
    function firstGesture() { if (!soundOn) return; ctx(); welcome(); }
    global.addEventListener("pointerdown", firstGesture, { passive: true });
    global.addEventListener("keydown", firstGesture);
    global.addEventListener("touchstart", firstGesture, { passive: true });

    /* click, double, triple */
    svg.addEventListener("click", function () {
      if (drag && drag.moved) return;
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 1400; }); taps.push(now);
      stopAct();
      if (taps.length >= 3) { smileSound(); emote("angry", 0, true); say(pick(["Okay, okay! Personal space.", "Hey! Not a button.", "That tickles. Stop. Don't stop."])); }
      else if (taps.length === 2) { smileSound(); emote("dizzy", 0, true); act("hop"); say(pick(["Whee!", "Again! Again!", "Woo!"])); }
      else { emote("blush"); say(pick(["Hey!", "Hi there!", "That tickles!", "Boop received.", "Oh! Hello.", "Aw, stop it."])); }
    });
    svg.addEventListener("contextmenu", function (e) { e.preventDefault(); stopAct(); sfx("tick"); emote("cool"); say(pick(["Too cool for context menus.", "Shades on.", "Right-click? Bold."])); });

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
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; stopAct(); sfx("pickup"); root.classList.add("is-carried"); emote("surprised", 60000); say(pick(["Wheee, I'm flying!", "Careful, I'm fragile. Not really.", "Put me down! …no wait, this is fun."])); }
      if (drag.moved) setX(drag.startSx + dx, 0);
    });
    function endDrag() {
      if (!drag) return;
      var moved = drag.moved; drag = null;
      if (moved) {
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

    /* scroll: whoa on fast scrolls, celebrate at the bottom */
    var lastY = global.scrollY, lastT = 0, whoaAt = 0, bottomSaid = false;
    global.addEventListener("scroll", function () {
      lastInput = Date.now(); wake();
      var now = performance.now(), y = global.scrollY;
      if (lastT) {
        var v = (y - lastY) / Math.max(8, now - lastT);
        if (Math.abs(v) > 2 && now - whoaAt > 2000) { whoaAt = now; root.style.setProperty("--sy", v > 0 ? "1" : "-1"); emote("whoa"); cue("swoosh"); }
      }
      lastY = y; lastT = now;
      var atBottom = y + global.innerHeight >= document.documentElement.scrollHeight - 40;
      if (atBottom && !bottomSaid) { bottomSaid = true; stopAct(); cue("ding"); act("dance"); say(isCase ? "End of the case! Next one's right there →" : "You made it to the end! Say hi to Ganesh."); }
      if (!atBottom && y < 200) bottomSaid = false;
    }, { passive: true });

    /* window, tab, theme */
    document.documentElement.addEventListener("mouseleave", function () { if (!busy) { emote("sad"); say(pick(["Come back…", "Bye for now.", "I'll be here."])); } });
    document.documentElement.addEventListener("mouseenter", function () { emote("happy"); say(pick(["You're back!", "Hi again!", "Missed you."])); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { stopAct(); act("wave"); say(pick(["Welcome back!", "Oh hey, you're back."])); cue("pop"); } });
    if (global.MutationObserver) new MutationObserver(function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (Date.now() - welcomedAt < 2500) { sfx("tick"); return; }
      stopAct(); sfx("tick");
      if (dark) { emote("sleepy", 2500); say(pick(["Dark mode. Cosy.", "Lights off. Nice."])); }
      else { emote("cool"); say(pick(["Bright! Shades on.", "Light mode? Bold choice."])); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- Boot ---------- */
  function init() {
    try { if (sessionStorage.getItem("sunny:nap")) return; } catch (e) { /* ignore */ }
    build();
    document.documentElement.classList.add("has-sunny");
    if (!reduced) {
      wireInput();
      setTimeout(function () { root.classList.add("is-in"); }, 300);
      setTimeout(function () {
        if (soundOn) welcome();
        if (!welcomed) { act("wave"); say(isCase ? "Oh, a case study. Good choice." : "Hi! I'm Sunny. I'll keep you company."); }
      }, 1100);
      setInterval(direct, 5200);
    } else {
      root.classList.add("is-in", "is-static");
    }
    api.el = root;
  }
  /* API is available immediately; calls before the DOM is ready are ignored */
  var api = global.Sunny = {
    act: function (n) { if (root) act(n); },
    emote: function (n, ms) { if (root) emote(n, ms); },
    emotionSounds: EMOTION_SFX,
    say: function (t, ms) { if (root) say(t, ms); },
    sfx: function (n) { if (SFX[n]) { try { SFX[n](); } catch (e) { /* silent */ } } },
    setSound: setSound, soundOn: function () { return soundOn; },
    setCues: setCues, cuesOn: function () { return extraCues; },
    audioState: function () { return { context: actx ? actx.state : "none", unlocked: unlocked, welcomed: welcomed }; },
    acts: Object.keys(ACTS), emotions: Object.keys(EMOTIONS), sounds: Object.keys(SFX), el: null
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window);
