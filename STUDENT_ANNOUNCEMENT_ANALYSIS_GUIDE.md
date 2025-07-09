# Student Announcement Analysis Guide

## Overview
This document explains how students can analyze specific information about job and internship opportunities after announcements are made by admins. The system is designed to provide students with comprehensive details about organizations, selection procedures, package details, job/intern profiles, and discipline requirements.

## System Flow

### 1. Admin Announcement Process
- Admins review job and internship posts submitted by recruiters
- Admins can toggle announcements using the `isAnnounced` field
- Only announced posts are visible to students
- Location: `/admin/dashboard` - Admin can click "Announce" or "Unannounce" buttons

### 2. Student Access to Announcements
Students can access announced opportunities through:
- **Main announcements page**: `/student/announcements`
- **Job details page**: `/student/announcements/jobs/[id]`
- **Internship details page**: `/student/announcements/internships/[id]`

## Information Available for Student Analysis

### A. Organization Information
Students can analyze the following organizational details:

```javascript
// Available fields from JobDetailsClient.jsx and InternshipDetailsPage
- Organization Name
- Website
- Organization Type (Private sector, Start-up, Govt. owned, Public sector, MNC, etc.)
- Industry Sector (Analytics, Consulting, Core Technical, Finance, IT, etc.)
- Contact Information (Person, Email, Phone, Address)
```

### B. Selection Procedure Details
Comprehensive selection process information:

```javascript
// From selectionProcess schema
- Preferred Dates for Campus Visit
- Number of Executives Visiting
- Number of Rooms Required
- Pre-Placement Talk Required
- Technical Presentation Required
- Aptitude Test (Yes/No)
- Technical Test (Yes/No)
- Group Discussion (Yes/No)
- Personal Interview (Yes/No)
- Number of Interview Rounds
- Provision for Waitlist
- Final Offer Announcement timing
```

### C. Package Details (Remuneration)
Program-wise compensation breakdown:

```javascript
// For Jobs (from JobPost model)
remuneration: {
    btech: { profile, basic, hra, other, gross, takeHome, ctc },
    mtech: { profile, basic, hra, other, gross, takeHome, ctc },
    msc: { profile, basic, hra, other, gross, takeHome, ctc },
    mba: { profile, basic, hra, other, gross, takeHome, ctc },
    mplan: { profile, basic, hra, other, gross, takeHome, ctc },
    phd: { profile, basic, hra, other, gross, takeHome, ctc }
}

// For Internships (from InternshipPost model)
remuneration: {
    btech: { other, stipend, ctcPPO },
    mtech: { other, stipend, ctcPPO },
    mba: { other, stipend, ctcPPO },
    // ... other programs
}

// Additional package details
- Company Accommodation Provided
- Service Agreement Required
- Service Agreement Duration
- Differential Pay for NITs
```

### D. Job/Intern Profile Information
Detailed role descriptions:

```javascript
// Job Profile
- Job Designation
- Job Description
- Tentative Date of Joining
- Place of Posting

// Internship Profile
- Internship Profile/Description
- Internship Duration
- Tentative Date of Joining
- Place of Posting
```

### E. Disciplines Required
Comprehensive eligibility criteria:

```javascript
// Academic requirements
- Required Programs (B.Tech, B.Arch, M.Tech, M.Plan, M.Sc, MBA, Ph.D)
- Branch-wise requirements:
  * B.Tech branches (Civil, Chemical, CSE, Electrical, ECE, Mechanical, MME)
  * B.Arch branches
  * M.Tech branches
  * M.Plan branches
  * M.Sc branches
  * MBA branches
  * Ph.D branches
  * Minor Specializations
  * All Branches Applicable (boolean flag)

// Performance requirements
- CGPA Requirements
- Medical Requirements (for jobs)
- Student Passing Year (for internships)
- Any Other Requirements
- Number of Positions Available
```

## Technical Implementation

### Current File Structure
```
src/
├── app/
│   ├── admin/
│   │   └── dashboard/page.jsx              # Admin announcement controls
│   ├── student/
│   │   └── announcements/
│   │       ├── page.jsx                    # Main announcements list
│   │       ├── jobs/[id]/
│   │       │   └── JobDetailsClient.jsx    # Job details view
│   │       └── internships/[id]/
│   │           └── page.jsx                # Internship details view
│   └── api/
│       ├── admin/posts/toggle-announcement/ # Admin toggle API
│       └── student/announcements/          # Student data APIs
├── lib/
│   └── models/
│       ├── JobPost.js                      # Job post schema
│       └── InternshipPost.js               # Internship post schema
```

### Database Schema Key Fields
```javascript
// JobPost & InternshipPost models include:
isAnnounced: Boolean                        // Controls visibility to students
applications: [{ student, appliedDate, status }] // Track applications
dateSubmitted: Date                         // When recruiter submitted
createdAt/updatedAt: Date                   // Automatic timestamps
```

## Student Analysis Capabilities

### 1. Browse All Announcements
- View grid of all announced opportunities
- Filter by job vs internship
- See basic info cards with key details
- Visual indicators for applied opportunities

### 2. Detailed Analysis
- Click any opportunity to view comprehensive details
- Organized sections for easy analysis:
  * About Organization
  * Job/Intern Profile
  * Eligibility Criteria
  * Remuneration Details
  * Selection Procedure
  * Contact Information

### 3. Application Tracking
- Apply directly from details page
- Track application status
- Prevent duplicate applications
- Visual feedback on applied opportunities

## Security & Access Control

### Admin Controls
- Only admins can toggle announcement status
- Proper authentication checks in API routes
- Session validation for admin operations

### Student Access
- Only authenticated students can view announcements
- Only announced posts are visible to students
- Students can only see their own application status

### API Security
```javascript
// All student announcement APIs check:
if (!session || session.user.role !== 'student') {
    router.replace('/login');
    return;
}

// Admin APIs check:
if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
```

## Conclusion

The current system provides comprehensive information analysis capabilities for students once admins make announcements. Students have access to all the critical information needed to make informed decisions about:

1. **Organization analysis** - Company background, type, sector
2. **Selection procedure** - Complete process breakdown
3. **Package details** - Program-wise compensation structure
4. **Job/Intern profile** - Role descriptions and requirements
5. **Discipline requirements** - Eligibility criteria by academic program

The system ensures that students can only access announced opportunities and provides a clean, organized interface for analyzing all relevant information before applying.
