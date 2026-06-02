# BMICalc – BMI & Calorie Calculator

A premium, fully static health calculator web app with dark mode, metric/imperial support, animated gauges, and smart cross-page data sharing.

---

## 📁 File Structure

```
bmi_calculator/
├── index.html       # BMI Calculator page
├── calories.html    # Calories / TDEE Calculator page
├── style.css        # Shared design system & all component styles
├── app.js           # BMI calculator logic
├── calories.js      # Calories / TDEE calculator logic
└── README.md        # This file
```

---

## 🖥️ Pages

### 1. BMI Calculator (`index.html`)
The main page. Calculates Body Mass Index using WHO/CDC standards.

**Features:**
- Metric (cm/kg) and Imperial (ft-in/lbs) unit switching
- Animated SVG gauge meter with needle animation
- BMI category colour-coded badge (Underweight / Normal / Overweight / Obese)
- 4-stat grid: BMI value, healthy weight range, ideal body weight (Devine formula), BMI Prime
- Highlighted BMI classification table row
- Bar chart with a "You are here" position marker
- Post-BMI **Calories CTA card** that slides in after calculation, prompting the user to check their calorie needs
- Saves calculation data to `localStorage` so the Calories page can pre-fill the form
- FAQ accordion section
- Dark mode toggle (persisted to `localStorage`)

**Sections:** Calculator → About BMI → BMI Chart → FAQ

---

### 2. Calories Calculator (`calories.html`)
TDEE and daily calorie calculator. Orange accent theme to visually distinguish it from the BMI page.

**Features:**
- Metric / Imperial unit switching
- **Smart pre-fill** — reads BMI data from `localStorage`, auto-populates age, gender, height, weight and suggests a goal based on BMI category
- Green notice bar confirms what was pre-filled
- 5 activity levels (Sedentary → Super Active) with Harris multipliers
- 6 goal options (Fast Loss / Mild Loss / Maintain / Mild Gain / Muscle Gain / Aggressive Loss)
- Results panel:
  - **TDEE hero** — large animated calorie target
  - **BMR** — Basal Metabolic Rate (Mifflin-St Jeor formula)
  - **All-goals strip** — shows calories for every goal at once
  - **Macronutrient breakdown** — animated bar chart (Protein 30% / Carbs 40% / Fat 30%)
  - **Personalised health tip** per goal

---

## 🔗 Page Interconnection

```
index.html  ──[BMI calculated]──► localStorage.bmiData ──► calories.html pre-fills form
                │
                └──[Calories CTA card]──► link to calories.html
```

The `bmiData` key stored in `localStorage` contains:

| Field        | Type    | Description                        |
|--------------|---------|------------------------------------|
| `age`        | number  | User's age in years                |
| `gender`     | string  | `"male"` or `"female"`             |
| `weightKg`   | number  | Weight in kilograms                |
| `heightM`    | number  | Height in metres                   |
| `bmi`        | number  | Calculated BMI                     |
| `categoryKey`| string  | `underweight / normal / overweight / obese` |
| `unit`       | string  | `"metric"` or `"imperial"`         |

---

## 🧮 Formulas Used

### BMI
```
BMI = weight (kg) / height² (m²)
```
Imperial: `BMI = (weight (lbs) × 703) / height² (in²)`

### Ideal Body Weight (Devine Formula)
```
Men:   IBW = 50 + 2.3 × (height in inches − 60)
Women: IBW = 45.5 + 2.3 × (height in inches − 60)
```

### BMR (Mifflin-St Jeor)
```
Men:   BMR = 10W + 6.25H − 5A + 5
Women: BMR = 10W + 6.25H − 5A − 161
```
where W = weight (kg), H = height (cm), A = age (years)

### TDEE
```
TDEE = BMR × Activity Multiplier
```

| Activity Level   | Multiplier |
|------------------|-----------|
| Sedentary        | 1.2       |
| Lightly Active   | 1.375     |
| Moderately Active| 1.55      |
| Very Active      | 1.725     |
| Super Active     | 1.9       |

### Calorie Goal Offsets
| Goal            | Offset       |
|-----------------|-------------|
| Aggressive loss | −750 kcal/day |
| Lose weight     | −500 kcal/day |
| Mild loss       | −250 kcal/day |
| Maintain        | 0            |
| Mild gain       | +250 kcal/day |
| Gain muscle     | +500 kcal/day |

### Macronutrient Split (of target calories)
| Macro   | % of Calories | Calories per gram |
|---------|---------------|-------------------|
| Protein | 30%           | 4 kcal/g          |
| Carbs   | 40%           | 4 kcal/g          |
| Fat     | 30%           | 9 kcal/g          |

---

## 🎨 Design System

All design tokens are CSS custom properties defined in `style.css`.

### Colour Themes
- **BMI page** — Indigo/Violet brand (`#6366f1` → `#8b5cf6`)
- **Calories page** — Orange/Red brand (`#f97316` → `#ef4444`)
- **Light mode** and **Dark mode** support via `.dark` class on `<html>`

### Key CSS Variables
```css
--brand-primary      /* Main accent colour */
--brand-gradient     /* Gradient for buttons & highlights */
--background         /* Page background */
--foreground         /* Primary text */
--card               /* Card surface */
--border             /* Border colour */
--muted              /* Subtle background tint */
--muted-foreground   /* Secondary text */
--shadow-brand       /* Coloured glow shadow */
```

### Typography
- **Font:** Inter (Google Fonts) — weights 300–900
- Fallback: `ui-sans-serif, system-ui, -apple-system`

---

## ♿ Accessibility & SEO

- Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Single `<h1>` per page with descriptive title
- `aria-label` on icon buttons
- `aria-expanded` on FAQ accordion buttons
- Unique `id` attributes on all interactive elements
- Meta description tags on both pages
- Keyboard navigable form controls

---

## 🚀 Usage

No build step required. Open directly in a browser:

```
index.html     → BMI Calculator
calories.html  → Calorie / TDEE Calculator
```

Or serve with any static file server:
```bash
npx serve .
# or
python -m http.server 8080
```

---

## 📝 Changelog

| Date       | Change |
|------------|--------|
| 2026-06-02 | Initial build — BMI Calculator with gauge, table, chart, FAQ |
| 2026-06-02 | Added Calories Calculator page (TDEE, BMR, macros, goal strip) |
| 2026-06-02 | Added post-BMI CTA card prompting calorie check |
| 2026-06-02 | localStorage cross-page data sharing & smart pre-fill |
| 2026-06-02 | Footer nav, calories nav link, README |
| 2026-06-02 | Auto-scroll result card into view after calculation (both pages) |
| 2026-06-02 | Removed hero section from calories page; added compact inline page header |
| 2026-06-02 | Scroll-reveal animations on all sections/cards (IntersectionObserver, respects prefers-reduced-motion) |
| 2026-06-02 | Removed hero section from BMI page too; both pages now start directly at the calculator |

---

> **Disclaimer:** These calculators are for informational purposes only. Always consult a qualified healthcare professional or registered dietitian for personalised medical and nutritional advice.
