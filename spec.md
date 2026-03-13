# Tech Talk With Alayna

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- App title: "Tech Talk With Alayna"
- Two roles: admin (hardcoded: username=alayna, password=140693) and student
- Student registration: name, username, password, grade/reading level
- Student login by username + password
- Admin dashboard:
  - Upload PDFs with metadata: title, grade/reading level
  - Edit PDF metadata (title, grade/reading level)
  - Delete PDFs
  - Send broadcast messages to all students
- Student dashboard:
  - View list of all uploaded PDFs, filterable/searchable by grade/reading level
  - View messages from admin
  - Open/download PDFs
- Data accessible across devices (stored on-chain via blob-storage)

### Modify
- None

### Remove
- None

## Implementation Plan
1. Use `authorization` component for role-based access (admin role + student role)
2. Use `blob-storage` component for PDF file uploads
3. Backend actors:
   - Store student profiles (name, username, hashed password, grade)
   - Store PDF metadata (id, title, grade, blobId, uploadedAt)
   - Store admin messages (id, content, sentAt)
   - Admin hardcoded credentials check
4. Frontend pages:
   - Landing/login page with tabs: Admin Login | Student Login | Student Register
   - Admin dashboard: PDF management table + upload form + messages panel
   - Student dashboard: PDF list with search/filter + messages section
