# Per-Question Reviewer Notes Implementation

## Overview
Successfully implemented a per-question reviewer notes system to replace the single global reviewer notes textarea. This allows auditors/reviewers to add specific notes for each question in an assessment, while still maintaining an overall review notes section.

## Features Implemented

### Frontend Changes (`frontend/src/pages/auditor/DataValidation.jsx`)

1. **New State Management**
   - Added `questionNotes` state to track per-question notes as an object: `{ [questionId]: noteText }`
   - Kept `reviewerNotes` state for overall review notes

2. **Per-Question Note Fields**
   - Added a textarea under each question's answer display
   - Each textarea is bound to the specific question's ID
   - Placeholder text: "Add your review notes for this specific question..."
   - 2-row height for compact display
   - Full styling with focus states

3. **Enhanced Overall Notes Section**
   - Renamed from "Reviewer Notes" to "Overall Review Notes"
   - Added descriptive text explaining the distinction between per-question and overall notes
   - Reduced height from 200px to 150px since detailed notes are now per-question
   - Updated save button to "Save All Notes" with icon

4. **Data Loading**
   - Modified `fetchAssessmentDetail` to parse and load `questionReviewerNotes` from the backend
   - Handles both JSON string and object formats
   - Populates `questionNotes` state on page load

5. **Saving Logic**
   - Updated `handleSaveNotes` to send both `reviewerNotes` and `questionNotes` to the backend
   - Single button saves all notes (per-question + overall) at once

### Backend Changes

#### Database Migration (`backend/add_question_reviewer_notes.sql`)
- Added `questionreviewernotes` column to `Assessment` table
- Data type: JSONB (PostgreSQL native JSON type)
- Nullable: YES
- Format: `{ "questionId": "note text", ... }`

#### Controller Updates (`backend/src/controllers/assessmentController.ts`)

1. **saveReviewerNotes Function** (line ~1515)
   - Updated to accept both `reviewerNotes` and `questionReviewerNotes` from request body
   - Modified UPDATE query to save both fields:
     ```sql
     UPDATE Assessment
     SET reviewernotes = $1,
         questionreviewernotes = $2
     WHERE assessmentid = $3
     ```
   - Converts `questionReviewerNotes` object to JSON string before saving
   - Returns both fields in response

2. **getAssessmentDetail Function** (line ~872)
   - Added `a.questionreviewernotes` to SELECT query
   - Returns `questionReviewerNotes` in response data
   - Frontend can now load existing per-question notes

#### Service Updates (`frontend/src/services/assessmentService.js`)
- Modified `saveReviewerNotes` function signature:
  ```javascript
  saveReviewerNotes: async (assessmentId, reviewerNotes, questionReviewerNotes = {})
  ```
- Sends both overall and per-question notes to backend

### Migration Script
Created `backend/src/scripts/run_question_notes_migration.ts` to execute the database migration:
- Reads SQL from `add_question_reviewer_notes.sql`
- Executes migration using database pool
- Verifies column was created successfully

## Database Schema

### Assessment Table - New Column
```sql
questionreviewernotes JSONB NULL
```

**Storage Format:**
```json
{
  "123": "This answer needs more detail about safety procedures",
  "456": "Good explanation of environmental impact measures",
  "789": "Consider adding specific metrics for this response"
}
```
Where keys are `questionId` values.

## Testing Results

✅ Database migration executed successfully
✅ Backend compiled without errors
✅ Backend server running on http://localhost:3000
✅ Frontend running on http://localhost:5174
✅ New column verified in database: `questionreviewernotes` (JSONB type)

## How to Use

1. **Navigate to Data Validation Page**
   - As an admin/auditor, go to an assessment detail page
   - Each question now has a "Reviewer Note for this Question" textarea below it

2. **Add Per-Question Notes**
   - Enter specific feedback or observations for any question
   - Notes are tracked independently per question
   - Can leave notes empty for questions that don't need review comments

3. **Add Overall Notes**
   - Use the "Overall Review Notes" section at the bottom for summary comments
   - This is for general observations, final recommendations, or overall assessment

4. **Save All Notes**
   - Click "Save All Notes" button to save both per-question and overall notes
   - All notes are saved together in one API call
   - Success message confirms save completion

## API Endpoints

### PUT `/assessments/:assessmentId/reviewer-notes`
**Request Body:**
```json
{
  "reviewerNotes": "Overall assessment looks good. Company demonstrates strong commitment.",
  "questionReviewerNotes": {
    "123": "Answer could be more specific",
    "456": "Excellent detail provided"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reviewer notes saved successfully",
  "data": {
    "assessmentId": 3,
    "reviewerNotes": "Overall assessment looks good...",
    "questionReviewerNotes": { "123": "...", "456": "..." }
  }
}
```

### GET `/assessments/:assessmentId/detail`
**Response includes:**
```json
{
  "success": true,
  "data": {
    "assessmentId": 3,
    "reviewerNotes": "Overall notes...",
    "questionReviewerNotes": { "123": "...", "456": "..." },
    "questionsByCategory": { ... },
    ...
  }
}
```

## Files Modified

### Frontend
- `frontend/src/pages/auditor/DataValidation.jsx`
- `frontend/src/services/assessmentService.js`

### Backend
- `backend/src/controllers/assessmentController.ts`
- `backend/add_question_reviewer_notes.sql` (new)
- `backend/src/scripts/run_question_notes_migration.ts` (new)

## Backward Compatibility

✅ **Fully backward compatible:**
- Existing assessments without per-question notes will work normally
- `questionReviewerNotes` defaults to `null` if not provided
- Frontend handles missing data gracefully with `|| null` and `|| {}`
- Old overall notes in `reviewernotes` column remain unchanged

## Future Enhancements (Optional)

1. **Rich Text Notes**
   - Could upgrade textareas to rich text editors for formatted notes
   - Would require changing display logic to render HTML

2. **Note History**
   - Track when notes were last modified
   - Store modification history with timestamps

3. **Note Templates**
   - Provide common review comment templates
   - Allow reviewers to select from pre-defined phrases

4. **Export Notes**
   - Include per-question notes in PDF reports
   - Format nicely in exported documents

## Summary

The per-question reviewer notes system is now fully implemented and operational. Auditors can now provide specific feedback for each question while maintaining overall assessment notes. The system uses efficient JSONB storage in PostgreSQL and provides a clean, intuitive UI for entering and managing notes.
