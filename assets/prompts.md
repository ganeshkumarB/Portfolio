# Prompt library · Claude + Figma MCP

Starter prompts for the design-system workflow on ganeshuxcraft.in: tokens first, then components, then the mapping to code. Paste one, swap the bracketed parts, and adjust to your own system. Treat every output as a draft: check it against your tokens before it ships.

---

## 1. Token setup from an existing stylesheet

> You are helping me set up Figma variables from an existing product. Here is the stylesheet: [paste CSS or a link]. Extract every colour, type size, spacing and radius value that appears more than once. Group them into collections (color, type, space, radius), propose a name for each in the form `color/ink`, `space/4`, `radius/md`, and show me the values that look like one-offs so I can decide whether to keep or merge them. Do not invent values that are not in the file.

## 2. Light and dark modes without drift

> Here are my light-mode colour tokens: [paste]. Propose a dark-mode value for each that keeps the same role (background, surface, text, muted, line, accent) and the same contrast ratios against the text tokens, within ±0.3. Flag any pair that cannot reach 4.5:1 and suggest the smallest change that fixes it. Output as a two-column table: token, light, dark, contrast.

## 3. Generate a component through Figma MCP

> Using the connected Figma file, build a [Button] component with variants for [primary, ghost, danger] × [sm, md, lg] × [default, hover, disabled]. Bind every fill, text colour, radius and padding to the existing variables; never type a raw hex or pixel value. Name layers the way the rest of the library does. When you are done, list every variable you bound so I can review the mapping before I publish.

## 4. Code Connect mapping

> Map the Figma component [Button] to the React component at [path/to/Button.tsx]. Match each Figma variant property to a prop (variant, size, state) and each boolean property to an optional prop. Write the Code Connect file so Dev Mode shows a real, copy-pasteable usage example for the selected variant. Then tell me which props exist in code but have no Figma property, and which Figma properties have no prop.

## 5. Audit a generated component against the system

> Here is a component you generated: [paste or select in Figma]. Check it against the design system: every colour, radius, space and type value must be a variable. List anything hard-coded, anything bound to the wrong token (for example a surface colour used as text), and any spacing that is not on the 4-point scale. Fix only what you listed and show me a before/after table.

## 6. Critique in order

> Review this screen the way a senior designer runs a critique: goal, flow, hierarchy, component, pixel, in that order. For each layer, say what you see, what it costs the user, and ask one question. Do not start with spacing or colour. If the goal is unclear, stop there and tell me what you would need to know.

## 7. Turn research notes into a case-study outline

> Here are my notes on a project: [paste]. Draft a case-study outline with six sections: the problem as the user felt it, what we tried first, the design decisions (three, each with the trade-off), what shipped, what changed for users, and what I would do differently. Keep my numbers exactly as written; where I have no number, leave a marker rather than inventing one.

---

Written for the way I work on Zoho SalesIQ's design system. Use them freely; credit is nice but not required.
