# Builds the puppy artwork string used by puppy.js from the Figma export of
# "Puppy · clean (final)" (file ju6DxHGCd699J8mAi2yc7h, node 968:2005).
# Download the node as SVG to assets/puppy/puppy-source.svg, run this, then paste the
# printed ART into puppy.js. Simplifies the traced layers to ~10% of their points and
# splits the eye layers into left and right groups so they can blink and look.

import re, json, math
src = open("/Users/ganesh-7319/Documents/GitHub/Portfolio/assets/puppy/puppy-source.svg").read()
layers = []
for tag in re.findall(r'<path[^>]*>', src):
    pid = re.search(r'id="([^"]*)"', tag).group(1); d = re.search(r' d="([^"]*)"', tag).group(1); fill = re.search(r'fill="([^"]*)"', tag).group(1)
    layers.append((pid, d, fill))
assert len(layers) == 14, len(layers)

def parse(d):
    toks = re.findall(r'[MLHVZ]|-?\d+\.?\d*', d)
    subs, cur, i, x, y = [], [], 0, 0.0, 0.0
    while i < len(toks):
        t = toks[i]
        if t == 'M': x, y = float(toks[i+1]), float(toks[i+2]); i += 3; cur = [(x, y)]; subs.append(cur)
        elif t == 'L': x, y = float(toks[i+1]), float(toks[i+2]); i += 3; cur.append((x, y))
        elif t == 'H': x = float(toks[i+1]); i += 2; cur.append((x, y))
        elif t == 'V': y = float(toks[i+1]); i += 2; cur.append((x, y))
        elif t == 'Z': i += 1
        else: raise SystemExit("unexpected " + t)
    return subs

def rdp(pts, eps):
    if len(pts) < 3: return pts
    def perp(p, a, b):
        ax, ay = a; bx, by = b; px, py = p
        dx, dy = bx - ax, by - ay
        if dx == dy == 0: return math.hypot(px - ax, py - ay)
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))
    # iterative
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        if b - a < 2: continue
        dmax, idx = 0, -1
        for k in range(a + 1, b):
            dd = perp(pts[k], pts[a], pts[b])
            if dd > dmax: dmax, idx = dd, k
        if dmax > eps: keep[idx] = True; stack.append((a, idx)); stack.append((idx, b))
    return [p for p, k in zip(pts, keep) if k]

def fmt(v): s = f"{v:.1f}".rstrip("0").rstrip("."); return s
def to_d(subs):
    out = []
    for pts in subs:
        out.append("M" + " ".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + "Z")
    return "".join(out).replace(" -", "-")
def bbox(pts):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]; return (min(xs), min(ys), max(xs), max(ys))
def centroid(pts): return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))

EPS = 1.1
simp = {}
total_before = total_after = 0
for name, d, fill in layers:
    subs = parse(d)
    total_before += sum(len(s) for s in subs)
    ss = [rdp(s, EPS) for s in subs]
    total_after += sum(len(s) for s in ss)
    simp[name] = (ss, fill)
print("points", total_before, "->", total_after)

# eye layers: split each subpath into left/right eye by centroid x
eye_layers = ["White", "Eye white shade", "Iris dark", "Iris mid", "Iris orange", "Iris light"]
whites = simp["White"][0]
big = sorted(whites, key=lambda s: -(bbox(s)[2] - bbox(s)[0]))[:2]
cL, cR = sorted([centroid(s) for s in big], key=lambda c: c[0])
mid = (cL[0] + cR[0]) / 2
print("eye centres", cL, cR, "split x", mid)
eyes = {"L": [], "R": []}
for name in eye_layers:
    ss, fill = simp[name]
    for s in ss:
        side = "L" if centroid(s)[0] < mid else "R"
        eyes[side].append((name, s, fill))
for side in "LR":
    allpts = [p for _, s, _ in eyes[side] for p in s]
    print(side, "bbox", [round(v) for v in bbox(allpts)], "parts", len(eyes[side]))

base_layers = ["Silhouette base", "Fur", "Shade", "Shade dark", "Light fur", "Outline", "Nose shine"]
def path_el(cls, subs, fill, extra=""):
    return f'<path{(" class=" + chr(34) + cls + chr(34)) if cls else ""} d="{to_d(subs)}" fill="{fill}"{extra}/>'
base = "".join(path_el("", simp[n][0], simp[n][1]) for n in base_layers)
def eye_group(side):
    # whites and shade first, then iris layers inside .p-look so the pupil can move
    outer = "".join(path_el("", [s], f) for n, s, f in eyes[side] if n in ("White", "Eye white shade"))
    inner = "".join(path_el("", [s], f) for n, s, f in eyes[side] if n not in ("White", "Eye white shade"))
    return f'<g class="p-eye p-eye--{side.lower()}">{outer}<g class="p-look">{inner}</g></g>'
bolt = path_el("p-bolt", simp["Lightning"][0], simp["Lightning"][1])
art = f'<g class="p-base">{base}</g><g class="p-eyes">{eye_group("L")}{eye_group("R")}</g>{bolt}'
# figure bbox and the mapping into the 220 box
allpts = [p for n in simp for s in simp[n][0] for p in s]
fb = bbox(allpts); print("figure bbox", [round(v) for v in fb])
fw, fh = fb[2] - fb[0], fb[3] - fb[1]
scale = 196 / fh
tx = 110 - (fb[0] + fw / 2) * scale
ty = 202 - fb[3] * scale
print("scale", round(scale, 4), "translate", round(tx, 2), round(ty, 2), "scaled size", round(fw * scale), round(fh * scale))
def to220(p): return (round(p[0] * scale + tx, 1), round(p[1] * scale + ty, 1))
info = {"scale": round(scale, 5), "tx": round(tx, 2), "ty": round(ty, 2),
        "eyeL": {"c": to220(cL), "bb": [to220((bbox(big[0])[0], bbox(big[0])[1])), to220((bbox(big[0])[2], bbox(big[0])[3]))]},
        "eyeR": {"c": to220(cR), "bb": [to220((bbox(big[1])[0], bbox(big[1])[1])), to220((bbox(big[1])[2], bbox(big[1])[3]))]},
        "bolt": [to220((bbox(simp["Lightning"][0][0])[0], bbox(simp["Lightning"][0][0])[1])), to220((bbox(simp["Lightning"][0][0])[2], bbox(simp["Lightning"][0][0])[3]))],
        "nose": to220(centroid(simp["Nose shine"][0][0]))}
# fix L/R eye bbox mapping (big is sorted by width not x)
bL, bR = sorted(big, key=lambda s: centroid(s)[0])
info["eyeL"]["bb"] = [to220((bbox(bL)[0], bbox(bL)[1])), to220((bbox(bL)[2], bbox(bL)[3]))]
info["eyeR"]["bb"] = [to220((bbox(bR)[0], bbox(bR)[1])), to220((bbox(bR)[2], bbox(bR)[3]))]
print(json.dumps(info))
open("/private/tmp/claude-502/-Users-ganesh-7319-Documents-GitHub-Portfolio/4a659054-900a-4a2d-8b12-c2bbad3f22df/scratchpad/puppy_art.txt", "w").write(art)
open("/private/tmp/claude-502/-Users-ganesh-7319-Documents-GitHub-Portfolio/4a659054-900a-4a2d-8b12-c2bbad3f22df/scratchpad/puppy_info.json", "w").write(json.dumps(info))
print("art chars", len(art))
# a standalone preview svg
open("/Users/ganesh-7319/Documents/GitHub/Portfolio/assets/puppy/puppy.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1078 1189">{art}</svg>')
