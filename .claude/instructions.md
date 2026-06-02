# BMICalc – Project Instructions

## Overview
A premium, fully static health calculator web app with two pages:
1. **BMI Calculator** (`index.html`) – calculates Body Mass Index
2. **Calorie/TDEE Calculator** (`calories.html`) – calculates daily calorie needs

## Tech Stack
- **HTML5** – semantic markup, no framework
- **Vanilla CSS** – custom properties design system in `style.css`
- **Vanilla JavaScript** – `app.js` (BMI), `calories.js` (Calories)
- **Google Fonts** – Inter (300–900 weights)
- **No build step** – open HTML files directly in browser

## Architecture

### File Structure
```
bmi_calculator/
├── index.html        # BMI Calculator page
├── calories.html     # Calorie/TDEE Calculator page
├── style.css         # Shared design system & all component styles
├── app.js            # BMI calculator logic
├── calories.js       # Calories calculator logic
├── README.md         # Full project documentation
└── .claude/          # Claude configuration
    ├── instructions.md
    └── settings.json
```

### Cross-Page Data Flow
- BMI page saves user data (`age`, `gender`, `weightKg`, `heightM`, `bmi`, `categoryKey`, `unit`) to `localStorage` under key `bmiData`
- Calories page reads `bmiData` on load and auto-populates the form
- After BMI calculation, a CTA card prompts the user to check their calories

### Design System
- **BMI page theme**: Indigo/Violet (`#6366f1` → `#8b5cf6`)
- **Calories page theme**: Orange/Red (`#f97316` → `#ef4444`)
- **Dark mode**: `.dark` class on `<html>`, persisted to `localStorage` key `bmiTheme`
- All design tokens are CSS custom properties in `:root` and `.dark` blocks

## Key Conventions

### CSS
- Use CSS custom properties (`var(--name)`) for all colours and shadows
- Component styles grouped with comment headers (`/* ── Section Name ── */`)
- Responsive breakpoints: 768px (grid collapse), 640px (mobile), 480px (small mobile)
- `scroll-reveal` class for scroll-triggered animations via IntersectionObserver
- Respect `prefers-reduced-motion`

### JavaScript
- Theme initialisation runs as IIFE before DOM ready to avoid flash
- All form logic uses inline validation with `.form-error` elements
- `setUnit()`, `resetForm()`, `toggleFaq()` exposed on `window` for inline onclick handlers
- IntersectionObserver for scroll-reveal (fires once per element)

### Formulas
- **BMI**: `weight(kg) / height²(m²)`
- **BMR**: Mifflin-St Jeor equation
- **TDEE**: `BMR × activity multiplier`
- **Ideal Body Weight**: Devine formula
- **Macros**: 30% protein / 40% carbs / 30% fat

## Do's and Don'ts
- ✅ Keep both pages visually consistent (shared `style.css`)
- ✅ Update `README.md` changelog when making changes
- ✅ Use semantic HTML and unique IDs on interactive elements
- ✅ Test both light and dark modes
- ❌ Don't add build tools or frameworks – this is a static site
- ❌ Don't use inline styles for anything that belongs in the design system
- ❌ Don't break the `localStorage` data contract between pages
