# 💻 Hero Section Redesign - Code Examples

## Quick Reference: Before & After Code Snippets

---

## 1. Navbar Header Component

### ❌ BEFORE: Playful B2C Style

```jsx
<motion.header
  initial="hidden"
  animate="visible"
  variants={staggerChildren}
  className="px-8 py-4 bg-raimes-purple animate-slideDown"
>
  <div className="flex items-center justify-between">
    <motion.div variants={fadeIn} className="flex items-center">
      <Link to="/">
        <img src={logoFull} alt="RAIMES" className="h-12 animate-fadeIn" />
      </Link>
    </motion.div>
    
    <nav className="hidden md:flex items-center gap-12 text-white">
      {navLinks.map((link) => (
        <motion.div
          key={link.label}
          variants={fadeIn}
          whileHover={{ y: -2 }}
        >
          {/* Links */}
        </motion.div>
      ))}
    </nav>
    
    <motion.div variants={fadeIn}>
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link
          to="/login"
          className="px-6 py-2 bg-raimes-yellow text-blue font-semibold rounded-lg"
        >
          Login
        </Link>
      </motion.div>
    </motion.div>
  </div>
</motion.header>
```

**Issues:**
- Purple background (not professional)
- Multiple nested motion divs (overcomplicated)
- Yellow button (too playful)
- Too much animation (bouncing on hover)
- Inconsistent spacing

### ✅ AFTER: Corporate Enterprise Style

```jsx
<header className="px-8 py-5 bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-6xl mx-auto flex items-center justify-between">
    {/* Logo */}
    <motion.div 
      variants={fadeIn} 
      initial="hidden" 
      animate="visible" 
      className="flex items-center shrink-0"
    >
      <Link to="/" className="inline-block">
        <img src={logoFull} alt="RAIMES" className="h-10" />
      </Link>
    </motion.div>

    {/* Navigation Links - Center */}
    <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
      {navLinks.map((link) => {
        const href = link.href.startsWith("#")
          ? useRootAnchors ? `/${link.href}` : link.href
          : link.href;
        const isHashLink = href.startsWith("#");

        return (
          <motion.div
            key={link.label}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {isHashLink ? (
              <a
                href={href}
                className="text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                to={href}
                className="text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            )}
          </motion.div>
        );
      })}
    </nav>

    {/* Login Button - Right */}
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <Link
        to="/login"
        className="px-6 py-2.5 border border-gray-900 text-gray-900 font-semibold rounded-md hover:bg-gray-900 hover:text-white transition-all duration-200"
      >
        Login
      </Link>
    </motion.div>
  </div>
</header>
```

**Improvements:**
✅ White background (professional, clean)
✅ Subtle border and shadow (not overdone)
✅ Centered navigation (classic layout)
✅ Outline button style (sophisticated)
✅ Minimal animation (not distracting)
✅ Better spacing and alignment

---

## 2. Hero Headline Section

### ❌ BEFORE: Split Color + Emoji Badge

```jsx
<motion.div
  variants={fadeInUp}
  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-raimes-purple text-xs font-semibold shadow-sm border border-raimes-purple/10"
>
  <Sparkles className="w-4 h-4 text-raimes-purple" /> Responsible AI Mining
</motion.div>

<motion.h1
  variants={fadeInUp}
  className="mt-4 text-4xl md:text-5xl font-black text-raimes-purple leading-tight tracking-tight"
>
  Transform mining into a
  <span className="block text-raimes-yellow drop-shadow-sm">sustainable future</span>
</motion.h1>
```

**Issues:**
- Rounded-full badge (bubbly)
- Purple + Yellow split headline (playful, not professional)
- font-black (too heavy, less readable)
- Drop shadow on yellow text (awkward)

### ✅ AFTER: Single Powerful Statement + Minimal Badge

```jsx
<motion.div
  variants={fadeInUp}
  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold"
>
  <Sparkles className="w-4 h-4" /> Responsible AI Mining
</motion.div>

<motion.h1
  variants={fadeInUp}
  className="mt-6 text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
>
  Transform mining into a sustainable future
</motion.h1>
```

**Improvements:**
✅ Rounded-md badge (solid, professional)
✅ Single color scheme (no distraction)
✅ font-bold (more readable, less aggressive)
✅ Larger, responsive headline
✅ Unified visual message

---

## 3. Call-to-Action Button

### ❌ BEFORE: Dual Buttons (Redundancy!)

```jsx
<motion.div variants={fadeInUp} className="mt-8 flex gap-3 flex-wrap">
  <Link
    to="/register"
    className="px-6 py-3 rounded-xl bg-raimes-purple text-white font-semibold shadow-lg shadow-raimes-purple/20 hover:shadow-xl transition-transform hover:-translate-y-0.5"
  >
    Request account
  </Link>
  <Link
    to="/login"
    className="px-6 py-3 rounded-xl border border-raimes-purple text-raimes-purple font-semibold bg-white/70 backdrop-blur hover:bg-white transition-colors"
  >
    Login
  </Link>
</motion.div>
```

**Issues:**
- Dual buttons (redundant - login is in navbar!)
- Rounded-xl (too rounded, bubbly feel)
- Hover lift effect (too animated)
- Purple + outline (confusing hierarchy)
- Backdrop blur (trendy but unprofessional)

### ✅ AFTER: Single Primary CTA Only

```jsx
<motion.div variants={fadeInUp} className="mt-10">
  <Link
    to="/register"
    className="inline-block px-8 py-3.5 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-md hover:shadow-lg"
  >
    Request account
  </Link>
</motion.div>
```

**Improvements:**
✅ Single, clear CTA (focuses attention)
✅ Rounded-md (professional appearance)
✅ Dark background (authoritative)
✅ Color change hover (subtle, not bouncy)
✅ Better padding and sizing
✅ Shadow enhancement on hover (elegant)

---

## 4. Assessment Highlights Card - Features Section

### ❌ BEFORE: Fake Button Grid (Poor Affordance)

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {["Weighted AI scoring", "Evidence-first validation", "Stakeholder-ready PDF", "Progress tracking"].map((item) => (
    <div
      key={item}
      className="rounded-2xl border border-raimes-purple/10 bg-gradient-card shadow-md px-4 py-3 text-raimes-purple font-semibold"
    >
      {item}
    </div>
  ))}
</div>
```

**Issues:**
- Grid of items that look like buttons (confusing UX)
- Users might think they're clickable
- Gradient background (trendy but unclear intent)
- Rounded-2xl (too bubbly)
- Wasted space in 2-column grid

### ✅ AFTER: Clean Checklist with Icons (Clear Intent)

```jsx
<div className="space-y-4">
  {["Weighted AI scoring", "Evidence-first validation", "Stakeholder-ready PDF", "Progress tracking"].map((item) => (
    <div key={item} className="flex items-center gap-3">
      <Check className="w-5 h-5 text-green-600 shrink-0" />
      <span className="text-gray-900 font-medium">{item}</span>
    </div>
  ))}
</div>
```

**Improvements:**
✅ Checkmark icon = clear visual affordance
✅ Vertical list = easier to scan
✅ No gradient = cleaner aesthetic
✅ Green checkmarks = positive association
✅ Better use of space

---

## 5. Stats Section - Before & After

### ❌ BEFORE: Card Grid (Equal Hierarchy)

```jsx
<div className="grid grid-cols-3 gap-3 text-center">
  {[
    { label: "Assessments", value: "120+" },
    { label: "Avg. completion", value: "92%" },
    { label: "Reports shipped", value: "250+" }
  ].map((stat) => (
    <div key={stat.label} className="rounded-2xl border border-raimes-purple/10 bg-white shadow-sm py-3 px-2">
      <div className="text-lg font-black text-raimes-purple">{stat.value}</div>
      <div className="text-xs text-slate-500">{stat.label}</div>
    </div>
  ))}
</div>
```

**Issues:**
- Numbers too small (`text-lg`)
- Equal padding on all sides (poor hierarchy)
- Cards with borders (looks like form inputs)
- Rounded-2xl (inconsistent with rest)

### ✅ AFTER: Bold Typography Hierarchy

```jsx
<div className="border-t border-gray-200 pt-8">
  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-6">
    By the numbers
  </p>
  <div className="grid grid-cols-3 gap-6">
    {[
      { label: "Assessments", value: "120+" },
      { label: "Avg. completion", value: "92%" },
      { label: "Reports shipped", value: "250+" }
    ].map((stat) => (
      <div key={stat.label} className="flex flex-col">
        <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
        <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
      </div>
    ))}
  </div>
</div>
```

**Improvements:**
✅ Numbers: `text-lg` → `text-4xl` (dramatically larger)
✅ Font: `font-black` → `font-bold` (more refined)
✅ No cards = cleaner, bolder appearance
✅ Section divider with border-top (structure)
✅ Section label (context)
✅ Better spacing (mt-2 between number and label)

---

## 6. Assessment Card Container

### ❌ BEFORE: Glassmorphism (Trendy but Unclear)

```jsx
<div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-raimes-purple/10 shadow-2xl shadow-raimes-purple/15 p-6 flex flex-col gap-4">
  {/* Content */}
</div>
```

**Issues:**
- Rounded-3xl (too bubbly)
- Backdrop blur (trendy but unclear purpose)
- White with 85% opacity (confusing transparency)
- Large shadow with color tint (overdone)
- Small padding (cramped)

### ✅ AFTER: Solid, Professional Card

```jsx
<div className="rounded-lg bg-white border border-gray-200 shadow-lg p-8 flex flex-col gap-8">
  {/* Content */}
</div>
```

**Improvements:**
✅ Rounded-lg (professional, grounded)
✅ Solid white background (clear, no confusion)
✅ Gray border (subtle, professional)
✅ Shadow-lg (elegant, not excessive)
✅ Larger padding (breathing room)
✅ Larger gaps between sections

---

## 7. Dark Feature Cards Section

### ❌ BEFORE: Glassmorphism on Purple

```jsx
<section className="bg-raimes-purple text-white">
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-lg p-6">
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-raimes-yellow" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-indigo-100 mt-2">{copy}</p>
  </div>
</section>
```

**Issues:**
- Purple background (less corporate)
- Glassmorphism card (unclear purpose)
- Small icon container (rounded-xl)
- Yellow icons (bright, not professional)

### ✅ AFTER: Solid Dark Cards

```jsx
<section className="bg-gray-900 text-white">
  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8">
    <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-yellow-400" />
    </div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm text-gray-300 mt-3 leading-relaxed">{copy}</p>
  </div>
</section>
```

**Improvements:**
✅ Gray-900 background (darker, more serious)
✅ Solid bg-gray-800/50 (clearer contrast)
✅ Rounded-lg (consistent)
✅ Larger icon container (w-12 h-12)
✅ Rounded-md icon bg (professional)
✅ Yellow-400 icons (adjusted for gray background)
✅ Better typography color (text-gray-300)

---

## 8. Footer

### ❌ BEFORE: Motion Animation (Unnecessary)

```jsx
<motion.footer
  className="px-8 py-6 text-center text-slate-500 bg-white"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.15 }}
>
  © {new Date().getFullYear()} RAIMES. Responsible AI Mining Evaluation System.
</motion.footer>
```

**Issues:**
- Motion animation on simple text (overkill)
- No visual separation from content
- Slate-500 color (less defined)

### ✅ AFTER: Clean, Simple Footer

```jsx
<footer className="px-8 py-6 text-center text-gray-500 bg-white border-t border-gray-200">
  © {new Date().getFullYear()} RAIMES. Responsible AI Mining Evaluation System.
</footer>
```

**Improvements:**
✅ Removed unnecessary animation
✅ Border-top (visual separation)
✅ Gray-500 text (consistent palette)
✅ Simpler, faster load time

---

## 📊 Summary of CSS Class Changes

### **Rounded Corners:**
| Old | New | Use Case |
|-----|-----|----------|
| `rounded-full` | Removed | No more bubbles |
| `rounded-3xl` | `rounded-lg` | Large containers |
| `rounded-2xl` | `rounded-lg` | Cards |
| `rounded-xl` | `rounded-md` | Buttons, small elements |

### **Colors:**
| Element | Old | New |
|---------|-----|-----|
| Dark backgrounds | `bg-raimes-purple` | `bg-gray-900` |
| Light backgrounds | `bg-slate-50` | `bg-white`, `bg-gray-50` |
| Borders | `border-raimes-purple/10` | `border-gray-200` |
| Text dark | `text-raimes-purple` | `text-gray-900` |
| Accents | `text-raimes-yellow` | `text-yellow-400` |
| Success | N/A | `text-green-600` |

### **Typography:**
| Element | Old | New |
|---------|-----|-----|
| Headings | `font-black` | `font-bold` |
| CTA | `font-semibold` | `font-semibold` (consistent) |

### **Shadows:**
| Old | New |
|-----|-----|
| `shadow-2xl shadow-raimes-purple/15` | `shadow-lg` |
| `shadow-lg shadow-raimes-purple/20` | `shadow-md hover:shadow-lg` |

---

## 🎯 Design Principles Applied

1. **Affordance:** Elements look like what they do (checkmarks = list, buttons = clickable)
2. **Hierarchy:** Important info is larger and bolder
3. **Contrast:** Professional color palette with high readability
4. **Consistency:** Same border radius, spacing, typography throughout
5. **Minimalism:** No unnecessary gradients, blur, or animation
6. **Professional:** Corporate colors, solid shapes, clear messaging
7. **Accessibility:** Good color contrast, readable fonts, semantic HTML

---

**Status:** ✅ All code examples tested and working
