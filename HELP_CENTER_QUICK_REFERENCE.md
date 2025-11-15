# Help Center Admin CRUD - Quick Reference Guide

## Component Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                HelpCenterManagementPage                         │
│         (URL-based state: /help-center/admin routes)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  LIST VIEW       │    │  FORM VIEW                          │
│  │  (/admin)        │◄──►│  (/admin/new,                       │
│  │                  │    │   /admin/:id/edit)                  │
│  │ ┌──────────────┐ │    │  ┌──────────────┐                  │
│  │ │  FAQTable    │ │    │  │  FAQForm     │                  │
│  │ │ - Data       │ │    │  │ - Question   │                  │
│  │ │ - Search     │ │    │  │ - Answer     │                  │
│  │ │ - Filter     │ │    │  │ - Category   │                  │
│  │ │ - Sort       │ │    │  │ - Order      │                  │
│  │ │ - Paginate   │ │    │  │ - Submit     │                  │
│  │ │ - Actions    │ │    │  │ - Validate   │                  │
│  │ └──────────────┘ │    │  └──────────────┘                  │
│  │                  │    │  ┌──────────────────┐              │
│  │ (Edit/Delete)    │    │  │ Delete Modal     │              │
│  │     triggers     │    │  └──────────────────┘              │
│  │     forms        │    │                                     │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │                          │                  │
         │ useFAQs()               │ useCreateFAQ()   │ useDeleteFAQ()
         │ useUpdateFAQ()          │                  │
         ▼                          ▼                  ▼
    ┌──────────────────────────────────────────────────────┐
    │         React Query Hooks Layer                      │
    │  (src/help-center/hooks/)                           │
    ├──────────────────────────────────────────────────────┤
    │ • useFAQData.js (read queries)                       │
    │ • useFAQDataMutations.js (write mutations)           │
    │ • Query key: ['helpCenter', 'faqs']                 │
    │ • Auto-invalidation on mutations                     │
    └──────────────────────────────────────────────────────┘
                          │
                          ▼
    ┌──────────────────────────────────────────────────────┐
    │         Firestore Backend                            │
    ├──────────────────────────────────────────────────────┤
    │ Collection Path:                                      │
    │   helpCenter/faqs/items/{faqId}                      │
    │                                                       │
    │ Document Fields:                                      │
    │   - id (String, auto)                               │
    │   - question (String, required)                      │
    │   - answer (String, required)                        │
    │   - category (String, optional)                      │
    │   - order (Number, for sorting)                      │
    │   - createdAt (Timestamp)                            │
    │   - updatedAt (Timestamp)                            │
    │   - createdBy (String, admin ID)                     │
    └──────────────────────────────────────────────────────┘
```

---

## Shared Components Used

| Component | Location | Purpose | Features |
|-----------|----------|---------|----------|
| **DataTable** | `shared/Components/UIElements/` | Display FAQs | Search, Filter, Sort, Pagination, Row Click |
| **DynamicForm** | `shared/Components/UIElements/` | Create/Edit form | Multi-field types, Validation, Error display |
| **NewModal** | `shared/Components/Modal/` | Confirmation dialogs | Type variants, Loading state, Animation |
| **Toast/ToastContainer** | `shared/Components/UIElements/` | Notifications | Success, Error, Warning, Info types |
| **LoadingCircle** | `shared/Components/UIElements/` | Loading spinner | Animated loader |
| **ErrorCard** | `shared/Components/UIElements/` | Error display | Error message rendering |
| **withRouteProtection** | `shared/Components/HOC/` | Route guard | Role-based access control |

---

## File Structure to Create

```
src/help-center/
├── components/
│   ├── FAQTable.jsx                  ✅ NEW
│   ├── FAQForm.jsx                   ✅ NEW
│   ├── DeleteConfirmationDialog.jsx   ✅ NEW
│   └── index.js                       ✅ NEW (exports)
│
├── hooks/
│   ├── useFAQData.js                 ✅ NEW (read queries)
│   └── useFAQDataMutations.js         ✅ NEW (write mutations)
│
├── pages/
│   ├── HelpCenterView.jsx             ✅ EXISTING (keep as-is)
│   └── HelpCenterManagementPage.jsx   ✅ NEW (admin interface)
│
└── styles/
    └── help-center.css                ✅ NEW (if needed)
```

---

## React Query Pattern

### Reading Data
```javascript
// useFAQData.js
export const useFAQs = () => {
  return useQuery({
    queryKey: ['helpCenter', 'faqs'],
    queryFn: async () => {
      // Fetch from Firestore
      // Return with fallback data if error
    },
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });
};
```

### Writing Data
```javascript
// useFAQDataMutations.js
export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      // Add to Firestore
    },
    onSuccess: () => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['helpCenter', 'faqs'] 
      });
    },
  });
};
```

---

## Form Field Configuration

```javascript
const faqFields = [
  {
    name: "question",
    type: "textarea",
    label: "Pertanyaan",
    placeholder: "Masukkan pertanyaan FAQ",
    required: true,
    textAreaRows: 3,
  },
  {
    name: "answer",
    type: "textarea",
    label: "Jawaban",
    placeholder: "Masukkan jawaban lengkap",
    required: true,
    textAreaRows: 6,
  },
  {
    name: "category",
    type: "select",
    label: "Kategori",
    options: [
      { value: "general", label: "Umum" },
      { value: "technical", label: "Teknis" },
      { value: "usage", label: "Penggunaan" },
    ],
  },
  {
    name: "order",
    type: "number",
    label: "Urutan Tampilan",
    min: 0,
    required: true,
  },
];
```

---

## DataTable Column Configuration

```javascript
const tableColumns = [
  {
    key: "question",
    label: "Pertanyaan",
    sortable: true,
    searchable: true,
  },
  {
    key: "category",
    label: "Kategori",
    sortable: true,
    render: (faq) => getCategoryLabel(faq.category),
  },
  {
    key: "order",
    label: "Urutan",
    sortable: true,
    headerAlign: "center",
  },
  {
    key: "actions",
    label: "Aksi",
    render: (faq) => (
      <div className="flex gap-2">
        <button onClick={() => onEdit(faq)}>Edit</button>
        <button onClick={() => onDelete(faq)}>Hapus</button>
      </div>
    ),
  },
];
```

---

## State Management Flow

```
User Action          Page Component          Hook                 Firestore
─────────────────────────────────────────────────────────────────────────────

[View List]    →    useFAQs()           →    useQuery         →   Read FAQs
                    <FAQTable/>

[Click Edit]   →    useParams()         →    Set location     →   (No DB call)
                    <FAQForm mode="edit"/>

[Submit Edit]  →    handleSubmit()      →    useUpdateFAQ()    →   Update FAQ
                    invalidateQueries() ←    onSuccess()    ←

[Click Delete] →    setPendingDelete()  →    <DeleteModal/>    →   (No DB call)

[Confirm Del]  →    handleDelete()      →    useDeleteFAQ()    →   Delete FAQ
                    invalidateQueries() ←    onSuccess()    ←

[Auto Refetch] ←    <FAQTable/>         ←    useFAQs()        ←   Fetch FAQs
```

---

## Permission Structure

```javascript
// Route Protection
withRouteProtection(HelpCenterManagementPage, {
  requireAuth: true,
  allowedRoles: ['admin', 'superAdmin'],
  redirectTo: '/info-portal'
})

// Firestore Security Rules
match /helpCenter/faqs/items/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    userRole in ['admin', 'superAdmin'];
}
```

---

## Navigation Paths

```
PUBLIC VIEW:
  /help-center               → HelpCenterView (display-only)

ADMIN MANAGEMENT:
  /help-center/admin         → HelpCenterManagementPage (list view)
  /help-center/admin/new     → HelpCenterManagementPage (create form)
  /help-center/admin/:faqId/edit  → HelpCenterManagementPage (edit form)

FALLBACK:
  Non-admin users accessing /help-center/admin
    → Redirected to /info-portal (via withRouteProtection)
```

---

## Error Handling Strategy

```
FETCH ERRORS (useFAQs):
  └─ Try Firestore query
     └─ If fails → Show fallback data
        └─ User sees existing FAQs

MUTATION ERRORS (Create/Update/Delete):
  └─ Try operation
     └─ If fails → catch error
        └─ showError() toast with message
        └─ onConfirm() returns false
        └─ Modal/Form stays open

VALIDATION ERRORS (DynamicForm):
  └─ React Hook Form validates
     └─ If invalid → Show field error
     └─ Submit button disabled

PERMISSION ERRORS:
  └─ User tries to access admin page
     └─ withRouteProtection detects non-admin
     └─ Redirect to /info-portal
```

---

## Toast Notifications

```javascript
// Create Success
showSuccess(
  "Pertanyaan berhasil ditambahkan",
  "FAQ baru telah disimpan ke sistem"
)

// Update Success
showSuccess(
  "Pertanyaan berhasil diperbarui",
  "Perubahan telah disimpan"
)

// Delete Success
showSuccess(
  "Pertanyaan berhasil dihapus",
  `FAQ "${question}" telah dihapus`
)

// Error
showError(
  "Operasi gagal",
  error?.message || "Terjadi kesalahan"
)
```

---

## Key Implementation Points

### 1. URL-Based State
- ✅ No useState for create/edit mode
- ✅ Use useLocation().pathname to detect view
- ✅ Use useParams() to get :faqId
- ✅ Use useNavigate() to change routes

### 2. Query Invalidation
- ✅ After mutation success, invalidate queries
- ✅ React Query auto-refetches with new data
- ✅ No manual state updates

### 3. Firestore Path
- ✅ Always use: `collection(db, 'helpCenter', 'faqs', 'items')`
- ✅ Document ID = FAQ ID
- ✅ Auto-set ID field on create

### 4. Form Validation
- ✅ Required fields marked with `required: true`
- ✅ Custom validations in field config
- ✅ Error messages shown per field
- ✅ Submit disabled until valid

### 5. Loading States
- ✅ Show skeleton in DataTable while loading
- ✅ Disable submit button while mutating
- ✅ Show spinner in modal during operation
- ✅ Proper isLoading prop threading

---

## Dependencies Already Available

✅ `@tanstack/react-query` - Data fetching  
✅ `firebase/firestore` - Firestore operations  
✅ `react-router-dom` - Routing  
✅ `react-hook-form` - Form validation  
✅ `lucide-react` - Icons  
✅ Tailwind CSS - Styling  

**No new dependencies needed!**

---

## Testing Endpoints

```javascript
// Test Firestore access
1. Open Firestore console
2. Navigate to: helpCenter > faqs > items
3. Add test document with fields:
   {
     id: "test-1",
     question: "Test Question?",
     answer: "Test Answer",
     category: "general",
     order: 1,
     createdAt: now,
     updatedAt: now,
     createdBy: "admin-id"
   }

4. Refresh admin page, should see in table
5. Test Edit: Click edit, modify, save
6. Test Delete: Click delete, confirm
7. Verify data changes in Firestore
```

---

## Summary Checklist

- [ ] **Hooks Ready**: React Query hooks for CRUD
- [ ] **Components Ready**: Table, Form, Modal
- [ ] **Page Ready**: Management page with URL state
- [ ] **Routing**: Admin routes configured
- [ ] **Protection**: Role-based access via HOC
- [ ] **Firestore**: Collection structure ready
- [ ] **Notifications**: Toast feedback integrated
- [ ] **Fallback**: Hardcoded FAQs as backup
- [ ] **Responsive**: Mobile/tablet design
- [ ] **Error Handling**: All error paths covered

This plan ensures **scalability, maintainability, and consistency** with the existing project architecture.
