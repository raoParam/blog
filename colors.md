# Flagger Frontend Color Palette (v2 — Professional Editorial Theme)

Refined light + dark theme palette. Goal: warm, editorial, "designed by a human" feel — avoids flat pure-black/pure-white, avoids generic AI-gradient blues, uses a single restrained accent color instead of competing blues/indigos.

---

## 🌙 Dark Theme

| Role | Hex Code | Usage |
| :--- | :--- | :--- |
| **Page Background** | `#0C0D10` | Root background — slightly lifted off pure black |
| **Secondary Background** | `#0A0A0C` | Landing/auth backdrop, footer |
| **Card / Surface** | `#141519` | Main cards, sidebar panels |
| **Elevated Surface** | `#191B20` | Modals, dropdown menus, popovers |
| **Input / Nested Surface** | `#1D1F25` | Text inputs, textareas, select boxes |
| **Code Block Background** | `#111318` | Code panels, preview containers |
| **Code Block Header** | `#181B22` | Top bar of code blocks |
| **Hover Surface** | `#20232B` | Toolbar items, menu link hover |
| **Card Border** | `#24262C` | Container and section borders |
| **Input Border** | `#2B2D34` | Text inputs, dropdowns |
| **Input Border (Focus)** | `#5A7CA8` | Muted steel-blue — replaces saturated `#355D9A` |
| **Primary Button** | `#2E4D74` | Publish, Save, Sign In |
| **Primary Button Hover** | `#3A5C87` | |
| **Primary Button Text** | `#F5F7FA` | |
| **Secondary/Outline Button** | `#1B1D22` bg, `#33363D` border | |
| **Accent (single, restrained)** | `#7C9CC4` | Links, focus rings, brand mark — replaces the old dual blue+indigo system |
| **Heading Text** | `#F1F1EF` | Off-white — not pure `#FFFFFF`, easier on the eyes |
| **Body Text** | `#CBCCCF` | Article paragraphs, descriptions |
| **Secondary Text** | `#9A9CA2` | Subtitles, metadata, timestamps |
| **Muted/Placeholder Text** | `#6E7178` | Disabled states, placeholders |
| **Success Background** | `#152D22` | |
| **Success Border** | `#4E8F6C` | |
| **Success Text** | `#B9E2C8` | |
| **Danger Background** | `#2A1416` | |
| **Danger Border** | `#7A3B41` | |
| **Danger Text** | `#F0C1C6` | |
| **Divider** | `#1D1F24` | Horizontal rules, section separators |

---

## ☀️ Light Theme

| Role | Hex Code | Usage |
| :--- | :--- | :--- |
| **Page Background** | `#FBFAF8` | Warm off-white — not clinical `#FFFFFF` |
| **Secondary Background** | `#F4F2EE` | Landing/auth backdrop, footer |
| **Card / Surface** | `#FFFFFF` | Main cards, sidebar panels |
| **Elevated Surface** | `#FFFFFF` with soft shadow | Modals, popovers |
| **Input / Nested Surface** | `#F5F4F1` | Text inputs, textareas |
| **Code Block Background** | `#F3F2EF` | Code panels |
| **Code Block Header** | `#EAE8E3` | Top bar of code blocks |
| **Hover Surface** | `#EFEDE9` | Toolbar/menu hover |
| **Card Border** | `#E7E5E0` | Container borders |
| **Input Border** | `#DEDCD6` | Text inputs, dropdowns |
| **Input Border (Focus)** | `#3E6690` | Deeper steel-blue for contrast on light bg |
| **Primary Button** | `#2E4D74` | Same navy family as dark theme — brand consistency |
| **Primary Button Hover** | `#25405F` | |
| **Primary Button Text** | `#FAFAFA` | |
| **Secondary/Outline Button** | `#FFFFFF` bg, `#D6D3CC` border | |
| **Accent (single, restrained)** | `#3E6690` | Links, focus rings, brand mark |
| **Heading Text** | `#1A1B1E` | Near-black, not pure `#000000` |
| **Body Text** | `#33343A` | Article paragraphs |
| **Secondary Text** | `#6B6D74` | Subtitles, metadata |
| **Muted/Placeholder Text** | `#9A9B9F` | Disabled states, placeholders |
| **Success Background** | `#EAF6EF` | |
| **Success Border** | `#7FBE9B` | |
| **Success Text** | `#1F6B45` | |
| **Danger Background** | `#FBEBEC` | |
| **Danger Border** | `#D98D93` | |
| **Danger Text** | `#9A2E36` | |
| **Divider** | `#EAE8E3` | Horizontal rules |

---

## Design Notes

1. **One accent color, not three.** The old palette mixed navy buttons, a blue-purple gradient, and a separate indigo accent for markdown. Real editorial platforms (Medium, Substack, Ghost) use one restrained accent + neutral grays. This palette uses a single steel-blue accent for both themes, tuned to `#7C9CC4` (dark) / `#3E6690` (light) for correct contrast.
2. **No pure black or pure white.** `#000000` and `#FFFFFF` as full backgrounds read as flat/synthetic. Warm off-white (`#FBFAF8`) and lifted-black (`#0C0D10`) feel considered and reduce eye strain.
3. **Desaturated status colors.** Success/error colors are pulled slightly toward gray so they don't clash with the neutral palette — avoids the "neon alert" look common in AI-generated UI.
4. **Brand button color is identical across themes** (`#2E4D74` family) — this is what makes a dual-theme site feel like one coherent brand rather than two different apps.
5. **Text is never pure black/white** — headings and body copy are softened (`#1A1B1E` / `#F1F1EF`) for a more printed, editorial feel versus a stark digital one.
