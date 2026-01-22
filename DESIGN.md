# KirokuMD Design System

A comprehensive guide to the visual design language and UI patterns used in KirokuMD.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons](#icons)
7. [Dark & Light Mode](#dark--light-mode)
8. [UI Patterns](#ui-patterns)
9. [Constraints](#constraints)

---

## Design Philosophy

KirokuMD follows a **quiet documentation aesthetic** inspired by Japanese minimalism. The interface is designed to feel like writing in a physical notebook—calm, focused, and free from distraction.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Minimal Friction** | Every interaction should feel effortless |
| **Sustained Focus** | The UI should fade into the background while writing |
| **Visual Calm** | No jarring colors, animations, or visual noise |
| **Purposeful Design** | Every element has a clear reason for existing |

### What We Avoid

- Bright brand colors
- Emoji characters
- Animated icons or transitions
- Heavy drop shadows
- Cluttered toolbars
- Colorful badges or tags

---

## Color Palette

### CSS Custom Properties

All colors are defined as CSS custom properties in `globals.css` for easy theming:

```css
:root {
  /* Light Mode */
  --bg-primary: #F2F5F7;      /* Main background */
  --bg-secondary: #E8ECEF;    /* Secondary surfaces */
  --bg-tertiary: #DDE2E6;     /* Tertiary elements */
  
  --text-primary: #1A1A1B;    /* Main text */
  --text-secondary: #3D3D3F;  /* Secondary text */
  --text-muted: #6B6B6D;      /* Muted/hint text */
  --text-ghost: #9B9B9D;      /* Very subtle text */
  
  --border-primary: #D1D5D9;  /* Primary borders */
  --border-secondary: #E0E4E8; /* Subtle borders */
  
  --accent: #F25912;          /* Accent color (orange) */
  --accent-hover: #D94E0F;    /* Accent hover state */
}

.dark {
  /* Dark Mode */
  --bg-primary: #0B0B0C;      /* Main background */
  --bg-secondary: #141415;    /* Secondary surfaces */
  --bg-tertiary: #1E1E1F;     /* Tertiary elements */
  
  --text-primary: #E8E8E9;    /* Main text */
  --text-secondary: #B8B8BA;  /* Secondary text */
  --text-muted: #7A7A7C;      /* Muted/hint text */
  --text-ghost: #4A4A4C;      /* Very subtle text */
  
  --border-primary: #2A2A2C;  /* Primary borders */
  --border-secondary: #1F1F21; /* Subtle borders */
  
  --accent: #F25912;          /* Accent color (same) */
  --accent-hover: #FF6B2C;    /* Accent hover state */
}
```

### Color Usage Guidelines

| Color Variable | Usage |
|----------------|-------|
| `--bg-primary` | Page backgrounds, main content areas |
| `--bg-secondary` | Cards, modals, editor background |
| `--bg-tertiary` | Hover states, selected items |
| `--text-primary` | Headings, important text |
| `--text-secondary` | Body text, descriptions |
| `--text-muted` | Labels, hints, metadata |
| `--text-ghost` | Placeholders, disabled text |
| `--border-primary` | Dividers, input borders |
| `--border-secondary` | Subtle separators |
| `--accent` | CTAs, active states, links |

### Important Rules

- **No pure black (#000000)** - Use `--bg-primary` in dark mode
- **No pure white (#FFFFFF)** - Use `--bg-primary` in light mode
- **Accent sparingly** - Only for important interactive elements

---

## Typography

### Font Families

```css
/* UI Elements */
font-family: 'Inter', system-ui, sans-serif;

/* Editor (Monospace) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Preview (Serif) */
font-family: 'Noto Serif JP', 'Georgia', serif;
```

### Font Stack

| Context | Font | Weight | Size |
|---------|------|--------|------|
| UI Labels | Inter | 400-500 | 12-14px |
| Headings | Inter | 500-600 | 16-24px |
| Editor | JetBrains Mono | 400 | 14px |
| Preview Body | Noto Serif JP | 400 | 16px |
| Preview H1 | Noto Serif JP | 600 | 28px |
| Preview H2 | Noto Serif JP | 600 | 24px |
| Preview H3 | Noto Serif JP | 600 | 20px |

### Line Heights

- **UI Text**: 1.4 - 1.5
- **Editor**: 1.6
- **Preview Prose**: 1.7 - 1.8

---

## Spacing & Layout

### Spacing Scale

Based on a 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps, icon padding |
| `sm` | 8px | Button padding, small gaps |
| `md` | 12px | Component padding |
| `lg` | 16px | Section spacing |
| `xl` | 24px | Page margins |
| `2xl` | 32px | Large section gaps |
| `3xl` | 48px | Major sections |

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header (h-12, 48px)                                │
│  ┌─────────────────┬─────────────────────────────┐  │
│  │ Back + Title    │ Actions (Save, Share, etc.) │  │
│  └─────────────────┴─────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Main Content (flex-1)                              │
│  ┌──────────────────────┬──────────────────────┐   │
│  │                      │                      │   │
│  │    Editor Pane       │   Preview Pane       │   │
│  │    (w-1/2)           │   (w-1/2)            │   │
│  │                      │                      │   │
│  │                      │                      │   │
│  └──────────────────────┴──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Common Patterns

- **Full height layouts**: `h-screen flex flex-col`
- **Split panes**: `flex-1 flex` with `w-1/2` children
- **Scrollable content**: `overflow-auto` on content, `overflow-hidden` on parent
- **Fixed headers**: `shrink-0` to prevent compression

---

## Components

### Buttons

#### Primary Button (Accent)
```jsx
<button
  className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
  style={{
    background: "var(--accent)",
    color: "var(--bg-primary)",
  }}
>
  Action
</button>
```

#### Secondary Button
```jsx
<button
  className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"
  style={{
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
  }}
>
  Cancel
</button>
```

#### Icon Button
```jsx
<button
  className="p-2 transition-opacity hover:opacity-70"
  style={{ color: "var(--text-muted)" }}
>
  <Icon className="w-4 h-4" />
</button>
```

### Inputs

```jsx
<input
  type="text"
  className="w-full px-3 py-2 rounded border text-sm outline-none transition-colors focus:border-[var(--accent)]"
  style={{
    background: "var(--bg-primary)",
    borderColor: "var(--border-primary)",
    color: "var(--text-primary)",
  }}
/>
```

### Cards

```jsx
<div
  className="p-4 rounded-lg border"
  style={{
    background: "var(--bg-secondary)",
    borderColor: "var(--border-primary)",
  }}
>
  {/* Content */}
</div>
```

### Modals

```jsx
{/* Backdrop */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />
  
  {/* Modal */}
  <div
    className="relative w-full max-w-md rounded-lg shadow-lg"
    style={{ background: "var(--bg-secondary)" }}
  >
    {/* Header */}
    <div
      className="flex items-center justify-between p-4 border-b"
      style={{ borderColor: "var(--border-primary)" }}
    >
      <h2 style={{ color: "var(--text-primary)" }}>Title</h2>
      <button onClick={onClose}>
        <X className="w-5 h-5" />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-4">
      {/* ... */}
    </div>
    
    {/* Footer */}
    <div
      className="flex justify-end gap-2 p-4 border-t"
      style={{ borderColor: "var(--border-primary)" }}
    >
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  </div>
</div>
```

### Badges / Tags

```jsx
<span
  className="text-xs px-1.5 py-0.5 rounded"
  style={{
    background: "var(--accent)",
    color: "var(--bg-primary)",
  }}
>
  Latest
</span>
```

### Empty States

```jsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon
    className="w-12 h-12 mb-3"
    style={{ color: "var(--text-muted)", opacity: 0.5 }}
  />
  <p style={{ color: "var(--text-muted)" }}>No items found</p>
  <p
    className="text-sm mt-1"
    style={{ color: "var(--text-muted)", opacity: 0.7 }}
  >
    Create your first item to get started
  </p>
</div>
```

---

## Icons

### Icon Library

KirokuMD uses **Lucide React** for all icons.

```jsx
import { Save, Download, Share2, Moon, Sun } from "lucide-react";
```

### Icon Sizes

| Context | Size | Tailwind Class |
|---------|------|----------------|
| Small (inline) | 12px | `w-3 h-3` |
| Default | 16px | `w-4 h-4` |
| Medium | 20px | `w-5 h-5` |
| Large (empty states) | 48px | `w-12 h-12` |

### Icon Colors

- **Default**: `var(--text-muted)`
- **Active/Hover**: `var(--text-primary)` or `var(--accent)`
- **Disabled**: `var(--text-ghost)`

### Icon Guidelines

- ✅ Use Lucide icons only
- ✅ Keep icons subtle (muted color by default)
- ❌ Never use emoji characters as icons
- ❌ No animated icons
- ❌ No colorful/multi-color icons

---

## Dark & Light Mode

### Implementation

Theme is managed via React Context (`ThemeContext.tsx`) and CSS class:

```jsx
// ThemeContext provides:
const { theme, toggleTheme } = useTheme();
// theme: "light" | "dark"
```

```css
/* Tailwind v4 dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));
```

### Theme Toggle

The `.dark` class is applied to the root `<html>` element:

```jsx
useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
}, [theme]);
```

### Persistence

Theme preference is saved to `localStorage`:

```javascript
localStorage.getItem("kirokumd-theme")
localStorage.setItem("kirokumd-theme", theme)
```

### System Preference Detection

On first load, the app respects system preference:

```javascript
window.matchMedia("(prefers-color-scheme: dark)").matches
```

---

## UI Patterns

### Loading States

```jsx
<div 
  className="h-screen flex items-center justify-center"
  style={{ background: "var(--bg-primary)" }}
>
  <p style={{ color: "var(--text-muted)" }}>Loading...</p>
</div>
```

### Hover Effects

- Use `transition-opacity hover:opacity-70` for subtle hover
- Use `transition-colors` for background/border changes
- Avoid transform/scale animations

### Focus States

```css
outline-none focus:border-[var(--accent)]
/* or */
outline-none focus:ring-2 focus:ring-[var(--accent)]
```

### Disabled States

```jsx
<button
  disabled={isDisabled}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
```

### Status Indicators

| Status | Color |
|--------|-------|
| Success/Saved | `var(--accent)` with Check icon |
| Pending/Loading | `var(--text-muted)` |
| Error | Red (use sparingly) |
| Info | `var(--text-secondary)` |

### Toast Messages

Currently using inline status text (e.g., "Saving...", "Saved ✓") rather than toast notifications to maintain visual calm.

---

## Constraints

### What NOT to Do

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Use emoji 🎉 | Use Lucide icons |
| Pure black/white | Use palette colors |
| Bright colors | Use muted palette |
| Heavy shadows | Light or no shadows |
| Animated icons | Static icons |
| Gradient backgrounds | Solid colors |
| Rounded-full buttons | Subtle rounded corners |
| Colorful badges | Muted or accent only |
| Toolbar with many icons | Minimal essential actions |
| Multiple accent colors | Single accent (#F25912) |

### Accessibility

- Maintain sufficient color contrast (WCAG AA)
- Support keyboard navigation
- Use semantic HTML elements
- Provide title/aria-label for icon buttons

### Responsive Design

- Mobile-first approach
- Split view collapses to single pane on small screens
- Touch-friendly tap targets (min 44px)
- Readable font sizes (min 14px for body)

---

## File References

| File | Purpose |
|------|---------|
| `src/app/globals.css` | CSS variables, prose styles |
| `src/context/ThemeContext.tsx` | Theme state management |
| `src/components/ThemeToggle.tsx` | Theme switch component |
| `tailwind.config.ts` | Tailwind configuration |

---

## Quick Reference

### Copy-Paste Styles

```jsx
// Background
style={{ background: "var(--bg-primary)" }}
style={{ background: "var(--bg-secondary)" }}

// Text
style={{ color: "var(--text-primary)" }}
style={{ color: "var(--text-muted)" }}

// Border
style={{ borderColor: "var(--border-primary)" }}

// Accent
style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
```

### Common Class Combinations

```jsx
// Card
className="p-4 rounded-lg border"

// Button
className="px-4 py-2 text-sm rounded transition-opacity hover:opacity-80"

// Icon button
className="p-2 transition-opacity hover:opacity-70"

// Input
className="w-full px-3 py-2 rounded border text-sm outline-none"

// Flex center
className="flex items-center justify-center"

// Full height container
className="h-screen flex flex-col"
```
