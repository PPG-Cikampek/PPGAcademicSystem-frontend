# Help Center Admin CRUD Feature - Implementation Plan

## Overview
Implement a comprehensive admin management interface for Help Center content (FAQ questions/answers) following the existing project patterns established in the developer portal and other admin modules.

---

## Project Analysis

### Current State
- **Help Center View**: `src/help-center/pages/HelpCenterView.jsx` - Display-only component with hardcoded FAQ data and contact information
- **Routing**: Help center is accessible via `/help-center` in admin routes
- **Data Structure**: FAQs stored as array objects with `id`, `question`, `answer` fields

### Reusable Components Available

#### UI Components (in `src/shared/Components/UIElements/`)
- **DataTable**: Full-featured table with search, filter, sort, pagination, and row click handling
- **DynamicForm**: Flexible form component supporting multiple field types (text, textarea, select, date, etc.)
- **NewModal**: Modal dialog for confirmations, notifications with type variants (success, error, warning, confirmation)
- **Toast/ToastContainer**: Toast notifications for user feedback
- **LoadingCircle**: Loading spinner component
- **ErrorCard**: Error display component
- **SkeletonLoader**: Loading placeholder

#### Context & Hooks (in `src/shared/Components/Context/` and `src/shared/hooks/`)
- **AuthContext**: Provides user role and authentication state
- **useToast**: Hook for displaying toast notifications (success, error, warning, info)
- **useNewModal**: Hook for managing modal state
- **withRouteProtection**: HOC for role-based route protection

#### Query & API (in `src/shared/queries/`)
- **React Query**: `@tanstack/react-query` for data fetching and mutations
- **Firebase**: Firestore already configured in `src/shared/firebase/firebase.js`
- **Pattern**: Query hooks with `useQuery` for fetching and `useMutation` for CRUD operations

### Existing Patterns to Follow

#### Developer Portal Pattern (Best Model)
Location: `src/developer-portal/`

**Architecture:**
1. **Data Hooks** (`usePortalData.js`):
   - Query hooks that fetch from Firestore with fallback data
   - Cache strategy with staleTime and retry options
   - Collection path resolution utilities

2. **Mutation Hooks** (`usePortalDataMutations.js`):
   - Separate create, update, delete mutation hooks
   - QueryClient invalidation on success for automatic re-fetching
   - Structured error handling

3. **Page Component** (`AnnouncementManagementPage.jsx`):
   - URL-based state management (creating, editing, viewing)
   - useParams for route parameters
   - Modal/form display based on location pathname
   - Toast notifications for feedback

4. **UI Components** (`components/`):
   - **ManagementTable**: DataTable wrapper with row actions (edit, delete)
   - **Form**: DynamicForm wrapper with validation
   - **DeleteConfirmationDialog**: Modal for deletion confirmation

#### Firestore Collection Structure
```
platformInfo/
  announcements/
    items/
      {id}/
        - id
        - title
        - message
        - publishedAt
        - createdAt
```

---

## Implementation Plan

### Phase 1: Folder Structure & Setup

**Create new folder structure:**
```
src/help-center/
├── components/
│   ├── FAQTable.jsx
│   ├── FAQForm.jsx
│   ├── DeleteConfirmationDialog.jsx
│   └── index.js
├── hooks/
│   ├── useFAQData.js           (Read queries)
│   └── useFAQDataMutations.js  (Write mutations)
├── pages/
│   ├── HelpCenterView.jsx      (Keep existing - public view)
│   └── HelpCenterManagementPage.jsx (NEW - Admin management)
└── styles/
    └── help-center.css
```

---

### Phase 2: Firestore Data Model

**Collection Structure:**
```
helpCenter/
  faqs/
    items/
      {autoId}/
        - id (String) - Auto-set to docId
        - question (String) - Required
        - answer (String) - Required
        - category (String) - Optional: 'technical', 'general', 'usage'
        - order (Number) - For sorting
        - createdAt (Timestamp)
        - updatedAt (Timestamp)
        - createdBy (String) - Admin user ID
```

**Benefits:**
- Mirrored from existing announcements structure
- Supports future categorization
- Timestamps for audit trail
- Order field for manual sorting

---

### Phase 3: React Query Hooks

#### 3A. Read Hooks (`useFAQData.js`)
**Exports:**
- `useFAQs()` - Fetch all FAQs, ordered by `order` field
  - Query key: `['helpCenter', 'faqs']`
  - Fallback: Current hardcoded FAQ data
  - staleTime: 5 minutes
  - Auto-retry on failure

**Requirements:**
- Handle Firestore collection path: `helpCenter/faqs/items`
- orderBy `order` ascending
- Error handling with fallback data
- Type: useQuery

#### 3B. Mutation Hooks (`useFAQDataMutations.js`)
**Exports:**
- `useCreateFAQ()` - Create new FAQ
  - Input: `{ question, answer, category, order }`
  - Auto-generate ID using docRef.id
  - Invalidate queries on success
  - Type: useMutation

- `useUpdateFAQ()` - Update existing FAQ
  - Input: `{ faqId, data }`
  - Preserve createdAt, update updatedAt
  - Type: useMutation

- `useDeleteFAQ()` - Delete FAQ
  - Input: `{ faqId }`
  - Type: useMutation

**Requirements:**
- Use useQueryClient for invalidation
- Query key: `['helpCenter', 'faqs']`
- Proper error handling
- Firestore operations: `addDoc`, `updateDoc`, `deleteDoc`, `collection`, `doc`

---

### Phase 4: UI Components

#### 4A. FAQTable.jsx
**Purpose:** Display FAQs in table format with admin actions

**Props:**
```jsx
{
  data: Array,           // FAQ items
  isLoading: Boolean,
  onEdit: Function,      // (faq) => navigate to edit
  onDelete: Function,    // (faq) => setPendingDelete
}
```

**Columns:**
- `question` (sortable, searchable)
- `category` (filterable)
- `order` (sortable)
- `actions` (Edit, Delete buttons)

**Implementation:**
- Use shared `DataTable` component
- Configure columns with proper renderers
- Enable search on question field
- Enable filter on category
- Row click handlers for actions

#### 4B. FAQForm.jsx
**Purpose:** Form for creating/editing FAQs

**Props:**
```jsx
{
  mode: 'create' | 'edit',
  initialValues?: Object,  // Populated when editing
  onSubmit: Function,      // (formData) => mutate
  onCancel: Function,      // () => navigate back
  isSubmitting: Boolean,
}
```

**Fields:**
1. `question` (textarea, required)
   - Min length: 10
   - Max length: 200
   
2. `answer` (textarea, required)
   - Min length: 20
   - Max length: 2000
   
3. `category` (select, optional)
   - Options: technical, general, usage
   
4. `order` (number, required)
   - Min: 0
   - Used for display ordering

**Implementation:**
- Use shared `DynamicForm` component
- Validation using react-hook-form
- Submit button states (loading, disabled)
- Cancel button to go back

#### 4C. DeleteConfirmationDialog.jsx
**Purpose:** Confirmation modal before deletion

**Props:**
```jsx
{
  isOpen: Boolean,
  faqData: Object,         // { question, answer }
  onConfirm: Function,
  onCancel: Function,
  isLoading: Boolean,
}
```

**Implementation:**
- Use shared `NewModal` component
- Type: 'warning' for delete confirmation
- Show FAQ question in confirmation message
- Loading state during deletion

#### 4D. index.js
**Exports:** FAQTable, FAQForm, DeleteConfirmationDialog

---

### Phase 5: Admin Management Page

#### HelpCenterManagementPage.jsx
**Location:** `src/help-center/pages/HelpCenterManagementPage.jsx`

**Features:**
- Route protection (admin role only)
- Three views: List, Create, Edit
- URL-based state: `/help-center/admin`, `/help-center/admin/new`, `/help-center/admin/:faqId/edit`

**State Management:**
```jsx
- useParams() for :faqId
- useLocation() for pathname detection
- useNavigate() for routing
- useMemo() to find selected FAQ from list
```

**Layout:**
1. **Header Section:**
   - Title: "Manajemen Pusat Bantuan"
   - Subtitle: "Kelola pertanyaan yang sering diajukan"
   - "Pertanyaan Baru" button (when viewing list)

2. **Content Area:**
   - **List View** (default):
     - FAQTable with data
     - Loading skeleton on fetch
     - Error state with ErrorCard
   
   - **Create View** (/new):
     - FAQForm in create mode
     - Empty initialValues
   
   - **Edit View** (/:faqId/edit):
     - FAQForm in edit mode
     - Pre-populated from selected FAQ
     - Error if FAQ not found

3. **Toast Notifications:**
   - Create: "Pertanyaan berhasil ditambahkan"
   - Update: "Pertanyaan berhasil diperbarui"
   - Delete: "Pertanyaan berhasil dihapus"
   - Error handling with showError()

**Permission Check:**
- Wrap with `withRouteProtection` HOC
- Allowed roles: 'admin' or 'superAdmin'
- Redirect to `/info-portal` if not admin

---

### Phase 6: Routing Setup

#### Update: `src/routes/adminRoutes.jsx`

**Add these routes:**
```jsx
const HelpCenterManagementPage = lazy(() => 
  import('../help-center/pages/HelpCenterManagementPage')
);

// Add to adminRoutes array:
{ path: '/help-center/admin', element: <HelpCenterManagementPage /> },
{ path: '/help-center/admin/new', element: <HelpCenterManagementPage /> },
{ path: '/help-center/admin/:faqId/edit', element: <HelpCenterManagementPage /> },
```

---

### Phase 7: Styling

#### Create: `src/help-center/styles/help-center.css`

**Classes to define:**
- `.faq-management-container` - Main container
- `.faq-form-section` - Form wrapper
- `.faq-table-section` - Table wrapper
- `.faq-actions` - Action buttons styling

**Pattern:** Follow existing project CSS (Tailwind-based, minimal custom CSS)

---

### Phase 8: Navigation Integration

#### Update: DashboardNav/Sidebar (if applicable)

**Add menu item:**
```
Label: "Pusat Bantuan"
Icon: HelpCircle (lucide-react)
Path: "/help-center/admin"
Visibility: Admin role only
```

---

## Implementation Order (Recommended)

1. **Phase 3** - React Query Hooks (backend integration)
   - `useFAQData.js`
   - `useFAQDataMutations.js`
   - Test with Firestore queries

2. **Phase 4** - UI Components (reusable parts)
   - `FAQTable.jsx`
   - `FAQForm.jsx`
   - `DeleteConfirmationDialog.jsx`

3. **Phase 5** - Management Page (integration)
   - `HelpCenterManagementPage.jsx`
   - URL-based state management
   - Error handling

4. **Phase 6** - Routing (make it accessible)
   - Update `adminRoutes.jsx`
   - Test navigation

5. **Phase 7** - Styling (polish)
   - Create CSS file if needed
   - Responsive design adjustments

6. **Phase 8** - Navigation (UI polish)
   - Update sidebar/nav (if needed)

---

## Key Design Patterns

### 1. URL-Based State
- Use React Router params/location for view switching
- No component state for create/edit mode
- Benefits: Bookmarkable URLs, back button support, browser history

### 2. Query Invalidation
- On successful mutation, invalidate `['helpCenter', 'faqs']`
- React Query auto-refetches list after CRUD
- No manual state updates needed

### 3. Fallback Data
- Keep hardcoded FAQs as fallback in Firestore read hook
- If Firestore fetch fails, show fallback data
- Users can still see FAQ content even if admin features fail

### 4. Role-Based Access
- Use `withRouteProtection` HOC with `allowedRoles: ['admin', 'superAdmin']`
- Redirect to `/info-portal` if unauthorized
- Check `auth.userRole` context in component

### 5. Consistent Error Handling
- Try-catch in mutation handlers
- showError() toast for user feedback
- Return false from onConfirm to keep modal open on error

---

## Data Flow Diagram

```
HelpCenterManagementPage
├── Fetch: useFAQs() → React Query → Firestore
├── Display: FAQTable (List)
│   └── Actions: Edit/Delete
├── Create: FAQForm (Create) → useCreateFAQ() → Firestore
├── Update: FAQForm (Edit) → useUpdateFAQ() → Firestore
├── Delete: Modal → useDeleteFAQ() → Firestore
└── Feedback: useToast() → Notifications
```

---

## Firestore Security Rules (Reference)

```firestore
match /helpCenter/faqs/items/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superAdmin'];
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superAdmin'];
  allow delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superAdmin'];
}
```

---

## Testing Checklist

- [ ] FAQs load from Firestore (or fallback if unavailable)
- [ ] Create new FAQ and verify it appears in table
- [ ] Edit existing FAQ and verify updates
- [ ] Delete FAQ with confirmation dialog
- [ ] Search functionality in table
- [ ] Filter by category
- [ ] Sort by column
- [ ] Pagination works
- [ ] Toast notifications display correctly
- [ ] Form validation (required fields, length limits)
- [ ] Non-admin users cannot access admin page
- [ ] Loading states display during operations
- [ ] Error handling for failed operations
- [ ] Responsive design on mobile/tablet

---

## Future Enhancements

1. **Bulk Operations**: Import/export FAQs as CSV
2. **Rich Text Editor**: Replace textarea with editor for formatted answers
3. **FAQ Analytics**: Track which FAQs are most viewed
4. **Scheduling**: Schedule FAQ visibility (date ranges)
5. **Translations**: Multi-language support
6. **FAQ Grouping**: Group by categories with collapsible sections
7. **Search Analytics**: Track user searches in help center
8. **Related FAQs**: Link related questions for better UX

---

## Summary

This plan follows the **established developer portal pattern** in the codebase:
- ✅ React Query with Firestore backend
- ✅ Separated concerns (hooks, components, pages)
- ✅ Reusable shared components
- ✅ URL-based state management
- ✅ Role-based access control
- ✅ Toast notifications for feedback
- ✅ Fallback data for resilience

The implementation will be **maintainable, scalable, and consistent** with project conventions.
