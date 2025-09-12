# Users Module Structure

This document describes the refactored structure of the `src/users` folder for better code manageability and maintainability.

## 📁 Folder Structure

```
src/users/
├── components/           # Reusable UI components
│   ├── AccountRequestTable.tsx
│   ├── QRScanner.jsx
│   ├── RoleGroup.jsx
│   └── TableColumns.jsx
├── config/              # Configuration and constants  
│   ├── index.js         # Barrel export for configs
│   ├── requestAccountConfig.ts
│   └── userConstants.js
├── hooks/               # Custom React hooks
│   ├── index.js         # Barrel export for hooks
│   ├── useUserDeletion.js
│   ├── useUserSelection.js
│   ├── useUsers.js      # Main composed hook
│   └── useUsersData.js
├── pages/               # Page components organized by functionality
│   ├── account-requests/ # Account request related pages
│   │   ├── RequestAccountForm.jsx
│   │   ├── RequestAccountTicketDetail.jsx
│   │   ├── RequestAccountView.jsx
│   │   ├── RequestedAccountView.jsx
│   │   ├── StudentRequestAccountForm.tsx
│   │   └── TeacherRequestAccountForm.tsx
│   ├── auth/            # Authentication related pages
│   │   ├── AuthView.jsx
│   │   ├── EmailVerifyView.jsx
│   │   └── PasswordResetView.jsx
│   ├── profile/         # User profile pages
│   │   └── ProfileView.jsx
│   └── user-management/ # User CRUD operations
│       ├── BulkNewUsersAndStudentsView.jsx
│       ├── NewUserView.jsx
│       ├── UpdateUserView.jsx
│       └── UsersView.jsx
└── utilities/           # Utility functions
    └── userUtils.js
```

## 🎯 Key Improvements

### 1. **Logical Page Organization**
Pages are now grouped by functionality into clear categories:
- **Authentication** - Login, email verification, password reset
- **User Management** - CRUD operations for users
- **Account Requests** - Account registration workflow
- **Profile** - User profile management

### 2. **Hook Separation**
The large `useUsers` hook has been split into focused, single-purpose hooks:

- **`useUsersData`** - Handles data fetching
- **`useUserDeletion`** - Manages delete operations
- **`useUserSelection`** - Handles UI selection state
- **`useUsers`** - Main composed hook that combines all functionality

### 3. **Better Imports**
Barrel exports (`index.js`) provide cleaner imports:

```javascript
// Before
import { useUsers } from "../../hooks/useUsers";
import { USER_ROLE_ORDER } from "../config/userConstants";

// After  
import { useUsers } from "../../hooks";
import { USER_ROLE_ORDER } from "../config";
```

### 4. **Removed Dead Code**
- **`UsersList.jsx`** - 100% commented out code
- **`tableColumns.js`** - Empty file
- **`ModalFooter.jsx`** - Redundant component (already exists in shared)

## 🔧 Usage Examples

### Using the Main Hook
```javascript
import { useUsers } from "../../hooks";

const UsersView = () => {
    const {
        users,
        selectedUserIds,
        setSelectedUserIds,
        roleOrder,
        isLoading,
        error,
        setError,
        handleDeleteUser,
        handleBulkDelete,
        navigate,
    } = useUsers();
    
    // Component logic...
};
```

### Using Individual Hooks
```javascript
import { useUsersData, useUserDeletion } from "../../hooks";

const CustomComponent = () => {
    const { users, setUsers, isLoading } = useUsersData();
    const { handleDeleteUser } = useUserDeletion(setUsers);
    
    // Component logic...
};
```

### Using Configuration
```javascript
import { USER_ROLE_ORDER, teacherFields } from "../../config";

const FormComponent = () => {
    // Use constants and configurations...
};
```

## 🏗️ Architecture Benefits

1. **Improved Discoverability** - Related functionality is grouped together
2. **Better Maintainability** - Smaller, focused files are easier to understand and modify
3. **Enhanced Reusability** - Separated hooks can be used independently
4. **Cleaner Imports** - Barrel exports reduce import verbosity
5. **Reduced Cognitive Load** - Clear folder structure makes navigation intuitive
6. **Future-Proof** - Modular structure supports easy expansion

## 🔄 Migration Notes

All existing functionality has been preserved. The refactoring is purely structural and does not change any business logic or component behavior. All imports have been updated to maintain compatibility.