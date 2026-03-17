# Antigravity Design System & Style Guide

Welcome to the official Antigravity Design System. This guide outlines the visual language, color palette, and styling principles for the Antigravity platform, ensuring a premium, cohesive, and modern user experience.

---

## 🎨 Color Palette
Our core theme is centered around a sophisticated **Ocean & Frost** palette, combining deep professional blues with clean, airy whites.

### Primary Colors
| Color | Hex | Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Antigravity Blue** | `#0066FF` | `--color-primary` | Primary buttons, active states, branding elements. |
| **Deep Azure**| `#004DCF` | `--color-primary-dark` | Hover states for primary elements. |
| **Sky Tint** | `#E6F0FF` | `--color-primary-light`| Subtle backgrounds, light accents. |

### Neutrals & Backgrounds
| Color | Hex | Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Pure White** | `#FFFFFF` | `--color-bg-white` | Main surface color, container backgrounds. |
| **Frost** | `#F8FAFC` | `--color-bg-soft` | Secondary backgrounds, input fields. |
| **Slate Gray** | `#64748B` | `--color-text-muted` | Body text, captions, inactive states. |
| **Deep Navy** | `#0F172A` | `--color-text-main` | Headings, primary text content. |

---

## ✍️ Typography
We prioritize clarity and modern aesthetics using high-quality sans-serif typefaces.

### Font Families
- **Primary:** `Outfit` (or `Inter`) - Used for headings and branding.
- **Secondary:** `Inter` - Used for body text and functional UI elements.

### Scale & Hierarchy
- **H1 (Display):** `3.5rem` / Bold / 1.1 Line Height
- **H2 (Section Header):** `2.25rem` / SemiBold / 1.2 Line Height
- **H3 (Sub-heading):** `1.5rem` / Medium / 1.4 Line Height
- **Body:** `1rem` (16px) / Regular / 1.6 Line Height
- **Small Detail:** `0.875rem` / Regular / 1.5 Line Height

---

## ✨ Style Instructions

### 1. Glassmorphism & Depth
Use subtle shadows and blur effects to create a sense of layering.
- **Shadow:** `0 10px 15px -3px rgba(0, 102, 255, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)`
- **Glass Effect:** `backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);`

### 2. Smooth Interactive States
All interactive elements must have smooth transitions.
- **Transition Duration:** `200ms` or `300ms`
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Micro-interactions:** Buttons should slightly scale up (`1.02`) on hover.

### 3. Spacing & Layout
Consistency is key. Use an 8px grid system.
- **Padding/Margin:** `8px`, `16px`, `24px`, `32px`, `48px`, `64px`.
- **Max Width:** Container max width should be `1280px` for desktop.

### 4. Borders & Radius
- **Border Radius:** Use `12px` for cards and `8px` for buttons/inputs for a modern, slightly rounded look.
- **Borders:** Subtle `1px` border using `#E2E8F0` for structure without visual clutter.

---

## 🏗️ Component Guidelines

### Buttons
- **Primary:** Solid `Antigravity Blue` with White text. Hover: `Deep Azure`.
- **Secondary:** Transparent with `Antigravity Blue` border and text. Hover: `Sky Tint` background.
- **Ghost:** No border, blue text. Hover: Lightest blue background.

### Cards
- White background.
- `12px` border radius.
- Subtle `Ocean Shadow` (Blue-tinted shadow).
- Clear hierarchy: Header -> Content -> Footer/CTAs.

### Inputs
- Background: `Frost` (`#F8FAFC`).
- Focus State: `2px` solid border with `Antigravity Blue`.
- Placeholder: `Slate Gray` at 50% opacity.

## 🛠️ Implementation Tips
1. **Accessibility First:** Ensure text contrast ratios meet WCAG AA standards (especially for white text on blue).
2. **Dynamic Hover:** Use `transform: translateY(-2px)` on cards when hovered to give a "lift" effect.
3. **Consistent Icons:** Use a single library (e.g., Lucide React) with a stroke width of `2px` for a balanced look.
4. **Whitespace:** Don't be afraid of empty space; it helps the user focus on the content.
