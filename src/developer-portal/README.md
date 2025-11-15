# Info Portal Feature

## Overview
The Info Portal is a user-facing feature that provides transparency about platform development, releases, and announcements. It's accessible to all authenticated users across all roles.

## Structure

```
src/developer-portal/
├── pages/                          # Main portal pages
│   ├── InfoPortalPage.jsx         # Hub page with navigation cards
│   ├── CurrentFeaturesPage.jsx    # Features in development
│   ├── ReleaseNotesPage.jsx       # Version history
│   └── AnnouncementsPage.jsx      # Platform announcements
├── components/                     # Reusable UI components
│   ├── FeatureCard.jsx            # Feature display card
│   ├── ReleaseCard.jsx            # Release note card
│   ├── AnnouncementCard.jsx       # Announcement card
│   ├── PortalHeader.jsx           # Page header component
│   └── EmptyState.jsx             # Empty state placeholder
├── hooks/
│   └── usePortalData.js           # React Query hooks for data fetching
├── data/                          # Fallback JSON data
│   ├── currentFeatures.json       # Features fallback
│   ├── releaseNotes.json          # Releases fallback
│   └── announcements.json         # Announcements fallback
└── styles/
    └── portal.css                 # Custom portal styles
```

## Routes

All portal routes are accessible at `/info-portal/*`:

- `/info-portal` - Main hub page
- `/info-portal/features` - Current features in development
- `/info-portal/releases` - Release notes history
- `/info-portal/announcements` - Platform announcements

These routes are automatically included in all role-based route configurations.

## Data Sources

### Primary: Firestore
The portal reads from Firestore collections:
- `platformInfo/features/items` - Current features
- `platformInfo/releases/items` - Release notes
- `platformInfo/announcements/items` - Announcements

### Fallback: Static JSON
If Firestore is unavailable or returns no data, the portal falls back to static JSON files in `src/developer-portal/data/`.

### Data Hooks
Three React Query hooks manage data fetching:
- `useCurrentFeatures()` - Fetches features, 5-minute cache
- `useReleaseNotes()` - Fetches releases, 10-minute cache
- `useAnnouncements()` - Fetches announcements, 5-minute cache

## Exports

This folder re-exports components and pages for easier imports. Use:

```
import { Components, Pages } from 'src/developer-portal';
// or
import { PortalHeader } from 'src/developer-portal/components';
import { DashboardPortalPage } from 'src/developer-portal/pages';
```

## Features

### Feature Cards
Display development features with:
- Title and description
- Status badge (in-progress, planned, completed, deprecated)
- ETA and owner information
- Tags for categorization

### Release Cards
Show release information with:
- Version number and date
- Highlighted changes
- Released status badge

### Announcement Cards
Display announcements with:
- Type-based color coding (maintenance, beta, info, warning)
- Title and body text
- Publication date

## UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Loading States**: Shows loading spinner during data fetch
- **Error Handling**: Displays error cards with retry option
- **Empty States**: Shows friendly messages when no data available
- **Navigation**: Back buttons and breadcrumbs for easy navigation

## Firestore Setup (Optional)

To enable live data from Firestore:

1. Create collections in Firestore:
   ```
   platformInfo/
   ├── features/
   │   └── items/
   │       └── {featureId}
   ├── releases/
   │   └── items/
   │       └── {version}
   └── announcements/
       └── items/
           └── {announcementId}
   ```

2. Add documents with the following schema:

   **Feature Document:**
   ```json
   {
     "title": "Feature Name",
     "description": "Feature description",
     "status": "in-progress", // or "planned", "completed", "deprecated"
     "eta": "2025-12-01",
     "owner": "Team Name",
     "tags": ["tag1", "tag2"]
   }
   ```

   **Release Document:**
   ```json
   {
     "version": "1.5.57",
     "date": "2025-11-15",
     "highlights": [
       "Feature 1",
       "Feature 2",
       "Bug fix"
     ]
   }
   ```

   **Announcement Document:**
   ```json
   {
     "title": "Announcement Title",
     "body": "Announcement body text",
     "type": "maintenance", // or "beta", "info", "warning"
     "publishedAt": "2025-11-15T09:00:00+07:00"
   }
   ```

3. Set Firestore security rules (read-only for authenticated users):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /platformInfo/{doc=**} {
         allow read: if request.auth != null;
         allow write: if false; // Only admins via Firebase console
       }
     }
   }
   ```

## Future Enhancements

- Admin interface to manage portal content directly in the app
- Real-time notifications for new announcements
- Search and filter functionality
- User feedback/comment system
- Integration with GitHub issues/PRs for automated updates
- Version comparison tool
- Download release notes as PDF

## Development Notes

- All components use Tailwind CSS for styling
- React Query handles caching and automatic refetching
- Lazy loading enabled for all portal pages via React.lazy()
- No breaking changes to existing codebase
- Build verified successfully with no compilation errors
