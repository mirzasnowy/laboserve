# Laboserve Frontend Knowledge

## PWA Push Notifications Setup

### Service Worker Configuration
- **Location**: `public/firebase-messaging-sw.js` (must be at root)
- **Purpose**: Handles background push notifications when app is closed
- Uses Firebase Messaging compat version (v9 compat syntax)
- Automatically displays notifications via `showNotification()`
- Includes click handler to open app when notification is clicked

### FCM Token Management
- Tokens are registered via `/api/register-fcm-token` endpoint
- Stored in Firestore `fcmTokens` collection with userId and role
- Automatically requested on login via `requestForToken()` in `client/lib/notifications.ts`

### Notification Flow
1. **New Booking**: User creates reservation → Admin receives push notification
2. **Status Update**: Admin approves/rejects → User receives push notification
3. **Foreground**: Handled by `onMessage` listener in App.tsx
4. **Background**: Handled by service worker in `firebase-messaging-sw.js`

### Testing Notifications
- Test on actual mobile device (not just desktop browser)
- Verify service worker registration in DevTools → Application → Service Workers
- Check notification permissions in browser settings
- Test both foreground (app open) and background (app closed) scenarios

## Sidebar Navigation

### Implementation Pattern
All user pages (Dashboard, Jadwal, HistoryReservation) follow this structure:

```tsx
const PageContent = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex">
        {/* Navigation items with isActive prop */}
      </Sidebar>
      
      {/* Main Content */}
      <SidebarInset>
        {/* Page content */}
      </SidebarInset>
      
      {/* Mobile Bottom Navigation */}
      <footer className="md:hidden fixed bottom-0">
        {/* Navigation links */}
      </footer>
    </div>
  );
};

export default function Page() {
  return (
    <SidebarProvider>
      <PageContent />
    </SidebarProvider>
  );
}
```

### Key Points
- Always wrap page in `SidebarProvider`
- Use `useSidebar()` hook to access `toggleSidebar`
- Desktop: sidebar visible, bottom nav hidden (`hidden md:flex`)
- Mobile: sidebar in sheet, bottom nav visible (`md:hidden`)
- Mark current page with `isActive` prop on `SidebarMenuButton`

## Firebase Configuration

### Environment Variables Required
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID
- VITE_FIREBASE_VAPID_KEY (for push notifications)

## Common Issues

### Notifications Not Working
1. Check if service worker is registered: DevTools → Application → Service Workers
2. Verify notification permissions are granted
3. Ensure VAPID key is correct in both places:
   - `client/lib/notifications.ts`
   - Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
4. Check browser console for FCM errors
5. Test on actual device (some features don't work in emulators)

### Sidebar Not Showing
1. Verify page is wrapped in `SidebarProvider`
2. Check responsive classes: `hidden md:flex` for desktop sidebar
3. Ensure `useSidebar()` is called within `SidebarProvider` context

## API Endpoints

### `/api/register-fcm-token` (POST)
Registers FCM token for push notifications
- Body: `{ token, userId, role }`

### `/api/notify-admin-new-booking` (POST)
Sends push notification to all admins about new booking
- Body: `{ reservation: { ...reservationData } }`

### `/api/notify-user-booking-status` (POST)
Sends push notification to user when booking status changes
- Body: `{ reservationId, userId, status, labName, date, timeSlot }`

## Lab Images Setup

### Firebase Storage Structure
Lab images are stored in Firebase Storage under the path: `labs/[lab-id]`

Example URLs:
- lab-dasar-1: `https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-dasar-1?alt=media`
- lab-dasar-2: `https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-dasar-2?alt=media`
- lab-lanjut-1: `https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-lanjut-1?alt=media`
- lab-lanjut-2: `https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-lanjut-2?alt=media`

### How It Works
1. Images are defined in `client/lib/seed.ts`
2. On first run, `seedDatabase()` creates labs with correct image URLs
3. `updateLabImages()` updates existing labs to use Firebase Storage URLs (runs once, tracked via localStorage)

### Adding New Lab Images
1. Upload image to Firebase Storage under `labs/[lab-id]`
2. Get the download URL with `?alt=media` parameter
3. Update the URL in both:
   - `client/lib/seed.ts` (for new installations)
   - `client/lib/update-lab-images.ts` (for existing installations)

## Style Guidelines

- Use Tailwind utility classes
- Follow existing color scheme (blue-600 primary, gray scales)
- Mobile-first responsive design
- Use shadcn/ui components consistently
- Maintain spacing: `gap-2`, `gap-4`, `p-4` for consistency