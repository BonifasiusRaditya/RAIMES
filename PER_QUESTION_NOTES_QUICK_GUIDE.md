# Per-Question Reviewer Notes - Quick Reference

## What Changed?

### BEFORE: Single Global Notes
```
┌─────────────────────────────────────┐
│ Question 1: Mining permit status?   │
│ Answer: We have all required...     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Question 2: Safety procedures?      │
│ Answer: Monthly safety training...  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Reviewer Notes:                     │
│ ┌─────────────────────────────────┐ │
│ │ [Large textarea for all notes]  │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### AFTER: Per-Question Notes + Overall Notes
```
┌─────────────────────────────────────┐
│ Question 1: Mining permit status?   │
│ Answer: We have all required...     │
│                                     │
│ Reviewer Note for this Question:   │
│ ┌─────────────────────────────────┐ │
│ │ [Note specific to Q1]           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Question 2: Safety procedures?      │
│ Answer: Monthly safety training...  │
│                                     │
│ Reviewer Note for this Question:   │
│ ┌─────────────────────────────────┐ │
│ │ [Note specific to Q2]           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Overall Review Notes:               │
│ Add your overall assessment notes   │
│ here. Individual question notes     │
│ are provided above each question.   │
│ ┌─────────────────────────────────┐ │
│ │ [Overall summary notes]         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

[Save All Notes] [Back to Dashboard]
```

## Key Features

### ✅ Each Question Has Its Own Note Field
- Every question displays with a dedicated textarea underneath
- Notes are saved with the question ID for easy retrieval
- Can add notes to any question independently

### ✅ Overall Notes Still Available
- The overall notes section remains at the bottom
- Renamed to "Overall Review Notes" for clarity
- Use for summary comments, final recommendations

### ✅ Single Save Action
- Click "Save All Notes" once to save everything
- Saves all per-question notes + overall notes together
- No need to save each note individually

### ✅ Data Persistence
- All notes stored in database (JSONB format)
- Notes load automatically when you open the page
- Each question's note appears in its own field

## Technical Implementation

### Database Storage
```
Assessment Table:
├── reviewernotes (TEXT) ──────────► Overall notes
└── questionreviewernotes (JSONB) ─► Per-question notes
```

### Data Format
```json
{
  "123": "This answer needs more specificity",
  "456": "Good detail on environmental measures",
  "789": "Consider adding quantitative metrics"
}
```

### State Management (Frontend)
```javascript
const [reviewerNotes, setReviewerNotes] = useState("");  // Overall
const [questionNotes, setQuestionNotes] = useState({});  // Per-question

// Update a specific question's note:
setQuestionNotes(prev => ({
  ...prev,
  [questionId]: noteText
}))
```

## Usage Example

### Scenario: Reviewing Assessment #3

**Question 1:** "What mining permits does your company hold?"
- **Answer:** "We hold permits A, B, and C"
- **Your Note:** "Request copies of permits B and C for verification"

**Question 2:** "Describe your safety training program"
- **Answer:** "Monthly safety meetings with all staff"
- **Your Note:** "Excellent frequency. Ask about training materials used"

**Question 3:** "How do you measure environmental impact?"
- **Answer:** "Annual environmental audits"
- **Your Note:** "" (leave empty - no specific comment needed)

**Overall Notes:**
"Strong compliance overall. Follow up on permits B and C documentation. Safety program well-established."

Click **[Save All Notes]** → All notes saved to database

### When You Return Later:
- Question 1 shows: "Request copies of permits B and C for verification"
- Question 2 shows: "Excellent frequency. Ask about training materials used"
- Question 3 shows: (empty)
- Overall shows: "Strong compliance overall. Follow up..."

## Benefits

1. **Organized Feedback** - Notes directly tied to specific questions
2. **Better Context** - Easy to see which question each note refers to
3. **Flexible** - Can add notes to all, some, or no questions
4. **Efficient** - One save action for all notes
5. **Persistent** - All notes stored and retrieved automatically

## Migration Status

✅ Database column added: `questionreviewernotes JSONB`
✅ Backend updated to save/load per-question notes
✅ Frontend updated with note fields under each question
✅ API endpoints modified to handle new data structure
✅ Testing completed - all systems operational

---

**Ready to Use!** Navigate to any assessment's Data Validation page to start adding per-question notes.
