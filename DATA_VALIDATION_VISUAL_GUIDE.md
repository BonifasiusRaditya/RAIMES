# Data Validation Page - Quick Visual Guide

## NEW Layout Structure

### Page Overview
```
┌─────────────────────────────────────────────────────────────────┐
│  [Company Name] Data Validation                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ AI Analysis                                             │    │
│  │ [Score Badge] AI Score: XX/100                          │    │
│  │ [Analysis text from AI engine...]                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Questionnaire Answers                                   │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ Exploration & Planning        Section 1 of 5     │  │    │
│  │  │                          [Previous] [Next]        │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ [1] Question text here...    [Max Points: 500]   │  │    │
│  │  │ ├──────────────────┬──────────────────────────┐  │  │    │
│  │  │ │ User's Answer    │ Reviewer Note            │  │  │    │
│  │  │ │ Answer text...   │ [Textarea for notes...]  │  │  │    │
│  │  │ └──────────────────┴──────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  [More question cards for current section...]           │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ [Previous Section]    1/5    [Next Section]      │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Overall Review Notes                                    │    │
│  │ [Large textarea for overall assessment...]              │    │
│  │ [Save All Notes] [Back to Dashboard]                    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Question Card Detailed View

### Desktop Layout (Wide Screen)
```
┌─────────────────────────────────────────────────────────────────┐
│  [1]  What mining permits does your company hold?               │
│                                          [Max Points: 500] ←─────┤ Score badge
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  User's Answer                    │  Reviewer Note              │
│  ┌────────────────────────────┐   │  ┌─────────────────────┐  │
│  │ We hold permits for:       │   │  │ [Click to add       │  │
│  │ - Mining Area A (expires   │   │  │  review notes...]   │  │
│  │   2026)                    │   │  │                     │  │
│  │ - Exploration permit B     │   │  │                     │  │
│  │ - Environmental clearance  │   │  │                     │  │
│  └────────────────────────────┘   │  └─────────────────────┘  │
│            ↑                       │           ↑                │
│       Green border               │     Reviewer can type here │
│     (answered question)          │                            │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Narrow Screen)
```
┌────────────────────────────────────┐
│ [1] What mining permits does...   │
│                [Max Points: 500]   │
├────────────────────────────────────┤
│ User's Answer                      │
│ ┌────────────────────────────────┐ │
│ │ We hold permits for:           │ │
│ │ - Mining Area A                │ │
│ │ - Exploration permit B         │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ Reviewer Note                      │
│ ┌────────────────────────────────┐ │
│ │ [Type notes here...]           │ │
│ │                                │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
     ↑
Stacks vertically on mobile
```

## Section Navigation Flow

### Section Progression
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Exploration │ →  │  Economic   │ →  │   Social    │
│  & Planning │    │ Development │    │    Impact   │
└─────────────┘    └─────────────┘    └─────────────┘
   Section 1          Section 2          Section 3
```

### Navigation States

**First Section (Section 1):**
```
[Previous] (DISABLED - grayed out)  [Next] (ACTIVE - purple)
```

**Middle Section (Section 2-4):**
```
[Previous] (ACTIVE - gray)  [Next] (ACTIVE - purple)
```

**Last Section (Section 5):**
```
[Previous] (ACTIVE - gray)  [Next] (DISABLED - grayed out)
```

## Key Features at a Glance

### 1. Score Weight Badge
```
┌─────────────────┐
│ Max Points: 500 │  ← Purple pill in top-right
└─────────────────┘
```
- Shows the maximum points for each question
- Taken from question's `weight` field
- Helps reviewers understand question importance

### 2. Two-Column Layout
```
┌─────────────┬─────────────┐
│   Answer    │    Note     │  ← Side by side on desktop
└─────────────┴─────────────┘

      vs.

┌─────────────┐
│   Answer    │  ← Stacked on mobile
├─────────────┤
│    Note     │
└─────────────┘
```

### 3. Section Pagination
- **Only shows ONE section at a time**
- Reduces cognitive load
- Easier to focus on specific topic area
- Clear navigation between sections

### 4. Visual Status Indicators

**Answered Question:**
```
┌────────────────────────┐
│ Answer text here...    │  ← Green left border
└────────────────────────┘
```

**Unanswered Question:**
```
┌────────────────────────┐
│ No answer provided     │  ← Gray left border
└────────────────────────┘
```

## Example Section: "Exploration & Planning"

```
╔═══════════════════════════════════════════════════════════════╗
║ Exploration & Planning                      Section 1 of 5    ║
║                                      [Previous] [Next]         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ [1] What mining permits...?       [Max Points: 500]      │ ║
║  │ ├────────────────────┬─────────────────────────────────┐ │ ║
║  │ │ We hold permits... │ Notes: Request copies of...     │ │ ║
║  │ └────────────────────┴─────────────────────────────────┘ │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ [2] Describe exploration activities [Max Points: 300]    │ ║
║  │ ├────────────────────┬─────────────────────────────────┐ │ ║
║  │ │ We conduct surveys │ Good detail provided            │ │ ║
║  │ └────────────────────┴─────────────────────────────────┘ │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [3 more questions in this section...]                        ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ [Previous Section]         1/5         [Next Section]    │ ║
║  └──────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

## Color Scheme Reference

- **Primary Purple:** `raimes-purple` - Main theme color
- **Purple 100:** Light purple for score badges
- **Gray 50:** Light gray for card backgrounds
- **Green 500:** Success indicator (answered questions)
- **Gray 300:** Neutral indicator (unanswered questions)
- **White:** Card content backgrounds

## Interaction Guide

### For Reviewers:

1. **Navigate Sections:**
   - Click "Next" to move to next topic
   - Click "Previous" to go back
   - Section title shows current topic

2. **Review Questions:**
   - See question text at top
   - See max points in top-right corner
   - Read user's answer on left
   - Add your notes on right

3. **Add Notes:**
   - Type directly in reviewer note textarea
   - Notes auto-save to state
   - Click "Save All Notes" when done

4. **Save Everything:**
   - Navigate through all sections
   - Add notes as needed
   - Click "Save All Notes" at bottom
   - All notes (all sections) saved together

---

**Pro Tip:** You can navigate between sections without saving - all notes remain in memory until you click "Save All Notes".
