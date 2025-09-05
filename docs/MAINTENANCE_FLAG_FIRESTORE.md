# Maintenance Mode via Firestore

This app reads a Firestore flag to decide whether to show a global Maintenance view without rebuilding or redeploying.

## 1) Enable Firestore
- In Firebase Console > Build > Firestore Database > Create database (Production mode).

## 2) Add a settings document
- Collection: `settings`
- Document: `flags`
- Fields:
  - `maintenance` (boolean) — set `true` to enable maintenance; `false` to disable.
  - Optional: `updatedAt` (timestamp) — for your own tracking.

## 3) Security rules (read-only doc)
If you want anyone (even signed-out users) to read only this single doc:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/flags {
      allow read: if true; // public read
      allow write: if false;
    }
  }
}
```

Alternatively, restrict read access to authenticated users or your own admin tool.

## 4) Configure Firebase in Vite
Copy `.env.example` to `.env.local` and fill values from Firebase project settings:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## 5) Service Worker caching note
The flag is fetched via Firestore SDK and updates in real-time. No extra HTTP caching steps are required, but ensure your SW doesn't aggressively cache `https://firestore.googleapis.com/` traffic. The SDK handles freshness; we also subscribe with `onSnapshot`.

## 6) How to toggle
- Open the `settings/flags` doc and set `maintenance` to `true` or `false`.
- Changes appear in the app in real-time without redeploying.
