# Spesifikasi Aplikasi Laboserve

## 1. Gambaran Umum Aplikasi

Laboserve adalah aplikasi manajemen reservasi laboratorium untuk Universitas Singaperbmaangsa Karawang (UNSIKA). Aplikasi ini memfasilitasi mahasiswa dan dosen untuk memesan laboratorium, serta memberikan admin kemampuan untuk mengelola reservasi dan laboratorium.

### Teknologi Stack
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Storage, Cloud Messaging)
- **Routing**: React Router v6
- **State Management**: React Context API + Custom Hooks

---

## 2. Sistem Autentikasi

### 2.1 Login
**File terkait**: `client/pages/Index.tsx`, `client/hooks/useAuth.tsx`

#### Metode Login
1. **Google Sign-In**
   - Login menggunakan akun Google
   - Validasi domain email: harus `@unsika.ac.id` atau `@student.unsika.ac.id`
   
2. **Email & Password**
   - Login menggunakan email dan password yang sudah di-set
   - Validasi credentials melalui Firebase Authentication

#### Validasi Email
- Email harus berakhiran `@unsika.ac.id` (dosen) atau `@student.unsika.ac.id` (mahasiswa)
- Email yang tidak sesuai akan ditolak dan user di-sign out otomatis

### 2.2 Role System
**File terkait**: `client/hooks/useAuth.tsx`

#### User Roles
1. **Admin**
   - Email khusus: `adminlaboserve@student.unsika.ac.id`
   - Akses ke Admin Dashboard
   - Dapat mengelola reservasi dan laboratorium

2. **User** (Mahasiswa/Dosen)
   - Semua user selain admin
   - Akses ke User Dashboard, reservasi, history, dan jadwal

#### User Types
1. **Mahasiswa**
   - Email format: `[NPM]@student.unsika.ac.id`
   - NPM otomatis di-parse dari email
   - Wajib mengisi kelas saat onboarding

2. **Dosen**
   - Email format: `[username]@unsika.ac.id`
   - Wajib mengisi NIDN saat onboarding

### 2.3 Onboarding Flow
**File terkait**: `client/pages/Onboarding.tsx`

#### Step 1: Set Password
- User yang login via Google harus set password terlebih dahulu
- Password akan di-link ke akun Firebase
- Setelah set password, flag `passwordSet: true` disimpan di Firestore

#### Step 2: Complete Profile
- **Mahasiswa**: Input kelas (contoh: "7A", "6C")
- **Dosen**: Input NIDN

---

## 3. Fitur User (Mahasiswa/Dosen)

### 3.1 Dashboard
**File terkait**: `client/pages/Dashboard.tsx`

#### Fitur Dashboard
1. **List Laboratorium**
   - Menampilkan semua lab dengan card
   - Informasi: nama, lokasi, gambar, status
   - Status badge dengan color coding:
     - Tersedia: hijau
     - Tidak Tersedia: merah
     - Maintenance: kuning
     - Penuh Hari Ini: merah (otomatis jika semua slot terisi)

2. **Search Laboratorium**
   - Search bar untuk filter lab berdasarkan nama
   - Real-time filtering

3. **Sidebar Navigation** (Desktop)
   - Home
   - Jadwal
   - History Reservation

4. **Bottom Navigation** (Mobile)
   - Home
   - Jadwal
   - History
   - Menu

5. **Header**
   - Notification bell (untuk notifikasi status reservasi)
   - User profile dropdown (Profile, Settings, Logout)

### 3.2 Detail Laboratorium
**File terkait**: `client/pages/LabDetail.tsx`

#### Informasi Lab
1. **Header**
   - Nama lab
   - Lokasi
   - Status kelas
   - Gambar lab (full width)

2. **Spesifikasi Lab**
   - Daftar fasilitas (contoh: Komputer: 30, Proyektor: 2)
   - Dynamic specifications dari Firestore

3. **Jadwal Terdekat** (Mock Data - perlu implementasi)
   - Menampilkan jadwal kelas berikutnya
   - Informasi: kelas, dosen, mata kuliah, waktu

4. **Tombol Reservasi**
   - Floating button (desktop: bottom-right)
   - Fixed button (mobile: bottom)
   - Membuka Reservation Sheet

### 3.3 Reservasi Laboratorium
**File terkait**: `client/components/reservasi/ReservationSheet.tsx`

#### Step 1: Informasi Reservasi
1. **Nama** (auto-filled, disabled)
2. **Tanggal** (date picker)
3. **Jam** (4 time slots)
   - 07.30 - 10.00
   - 10.00 - 12.30
   - 12.30 - 15.00
   - 15.00 - 18.00
   - Slot yang sudah di-approve untuk tanggal tersebut akan disabled
4. **Kegiatan** (radio buttons)
   - Akademik
   - Non Akademik
5. **Kategori** (dropdown)
   - Kelas Pengganti
   - Praktikum
   - Acara Himpunan
   - Lainnya
6. **Conditional Fields** (jika kategori = Kelas Pengganti)
   - Nama Dosen
   - Nama Mata Kuliah
7. **Deskripsi** (textarea, wajib)

#### Step 2: Upload File Pendukung
1. **File Upload**
   - Drag & drop atau browse file
   - Format: JPEG, PNG, PDF
   - Max size: 1MB
   - File disimpan di Firebase Storage

#### Submission
- Status awal: "pending"
- Notifikasi dikirim ke admin
- Data disimpan di Firestore collection `reservations`

### 3.4 History Reservation
**File terkait**: `client/pages/HistoryReservation.tsx`

#### Fitur
1. **List Reservasi User**
   - Filtered by current user ID
   - Sorted by creation date (newest first)
   - Real-time updates via Firestore listener

2. **Informasi Ditampilkan**
   - Nama lab
   - Tanggal
   - Time slot
   - Kategori
   - Activity type
   - Status badge (pending/approved/rejected)

3. **Detail Dialog**
   - Button untuk melihat detail lengkap
   - Menampilkan semua informasi reservasi
   - Link ke supporting file (jika ada)

#### Status Badge Colors
- Pending: secondary (abu-abu/kuning)
- Approved: default (hijau)
- Rejected: destructive (merah)

### 3.5 Jadwal (Perlu Implementasi Lengkap)
**File terkait**: `client/pages/Jadwal.tsx` (currently placeholder)

#### Fitur yang Diperlukan

**IMPORTANT: Ini adalah fitur baru yang belum diimplementasi secara lengkap**

1. **Sidebar Navigation**
   - Sama seperti Dashboard
   - Desktop: sidebar kiri dengan menu Home, Jadwal, History
   - Mobile: bottom navigation dengan Home, Jadwal, History, Menu

2. **Filter Fakultas**
   - Dropdown untuk memilih fakultas
   - Default: menampilkan jadwal dari fakultas user
   - Fakultas di-detect dari email user atau profile

3. **Calendar View**
   - Weekly/monthly calendar
   - Menampilkan jadwal reguler dari fakultas (default schedule)
   - Overlay dengan reservasi yang sudah approved
   
4. **Kombinasi Data Jadwal**
   - **Jadwal Fakultas (Default)**:
     - Data jadwal rutin dari database
     - Contoh: Senin 07.30-10.00 - RPL - Dosen X
   - **Reservasi Approved**:
     - Reservasi yang statusnya "approved"
     - Ditampilkan overlap dengan jadwal fakultas
     - Beda visual (warna/pattern) untuk membedakan

5. **Detail View**
   - Click pada slot jadwal untuk melihat detail
   - Info: mata kuliah, dosen, kelas, kategori (jika reservasi)
   - Indikator jika slot adalah reservasi vs jadwal reguler

6. **Color Coding**
   - Jadwal reguler fakultas: warna primary
   - Reservasi approved: warna secondary/accent
   - Available slot: abu-abu muda

---

## 4. Fitur Admin

### 4.1 Admin Dashboard
**File terkait**: `client/pages/AdminDashboard.tsx`

#### Layout
- Tabs interface dengan 2 tabs:
  1. Manajemen Reservasi
  2. Manajemen Laboratorium
- Header dengan user dropdown (Logout)

### 4.2 Manajemen Reservasi
**File terkait**: `client/pages/admin/ReservationManagement.tsx`

#### Fitur
1. **Table Reservasi**
   - Menampilkan semua reservasi (all users)
   - Sorted by creation date (newest first)
   - Real-time updates

2. **Kolom Table**
   - Nama Pengguna
   - Lab
   - Tanggal & Waktu
   - Status badge
   - Lampiran (button untuk view)
   - Aksi (Approve/Reject untuk pending)

3. **Approve/Reject**
   - Button untuk approve atau reject reservasi pending
   - Update status di Firestore
   - Kirim notifikasi ke user melalui FCM

4. **File Preview**
   - Dialog untuk melihat supporting file
   - Support image (JPEG, PNG) dan PDF
   - Full screen preview

### 4.3 Manajemen Laboratorium
**File terkait**: `client/pages/admin/LabManagement.tsx`

#### Fitur CRUD Lab
1. **List Labs**
   - Table dengan semua lab
   - Kolom: Nama, Lokasi, Status
   - Action buttons: Edit, Delete

2. **Add Lab**
   - Button "Tambah Lab" membuka dialog
   - Form fields:
     - Nama lab
     - Lokasi
     - Status (dropdown: Tersedia/Tidak Tersedia/Maintenance)
     - Spesifikasi (dynamic key-value pairs)
     - Upload gambar

3. **Edit Lab**
   - Dialog pre-filled dengan data lab
   - Dapat update semua fields
   - Dapat replace gambar

4. **Delete Lab**
   - Confirmation dialog
   - Hapus lab dari Firestore

5. **Dynamic Specifications**
   - Add/remove specification fields
   - Key-value pairs (contoh: "Komputer": 30)
   - Support string dan number values

---

## 5. Sistem Notifikasi

### 5.1 Firebase Cloud Messaging (FCM)
**File terkait**: `client/lib/notifications.ts`

#### Setup
- Request notification permission saat user login
- Generate FCM token
- Simpan token di Firestore (user document)
- Service worker untuk handle background notifications

#### Notifikasi Events
1. **Admin Notifikasi**
   - New booking request (ketika user submit reservasi)
   - Endpoint: `/api/notify-admin-new-booking`

2. **User Notifikasi**
   - Booking approved/rejected (ketika admin update status)
   - Endpoint: `/api/notify-user-booking-status`

### 5.2 Notification Bell
**File terkait**: `client/components/ui/NotificationBell.tsx`

#### Fitur
- Bell icon di header
- Badge untuk unread notifications
- Dropdown list notifikasi
- Mark as read functionality

---

## 6. Database Structure (Firestore)

### 6.1 Collections

#### users
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // User email
  displayName: string;      // Full name
  role: "user" | "admin";   // User role
  type: "mahasiswa" | "dosen"; // User type
  npm: string | null;       // NPM for mahasiswa
  nidn: string | null;      // NIDN for dosen
  kelas: string | null;     // Class for mahasiswa
  passwordSet: boolean;     // Flag for onboarding
  fcmToken?: string;        // Firebase Cloud Messaging token
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### labs
```typescript
{
  name: string;             // Lab name
  location: string;         // Lab location
  status: "Tersedia" | "Tidak Tersedia" | "Maintenance"; // Lab status
  image: string;            // Image URL from Storage
  specifications: {         // Dynamic key-value pairs
    [key: string]: string | number;
  };
}
```

#### reservations
```typescript
{
  labId: string;            // Reference to lab
  labName: string;          // Lab name (denormalized)
  userId: string;           // User ID
  userName: string;         // User name (denormalized)
  date: Timestamp;          // Reservation date
  timeSlot: string;         // Time slot
  activityType: "akademik" | "non-akademik"; // Activity type
  category: string;         // Category
  description: string;      // Description
  lecturerName?: string;    // For kelas-pengganti
  courseName?: string;      // For kelas-pengganti
  supportingFileUrl?: string; // File URL from Storage
  status: "pending" | "approved" | "rejected"; // Status
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### notifications (untuk implementasi)
```typescript
{
  userId: string;           // Target user
  title: string;            // Notification title
  message: string;          // Notification message
  type: string;             // Notification type
  read: boolean;            // Read status
  reservationId?: string;   // Related reservation
  createdAt: Timestamp;
}
```

---

## 7. API Endpoints (Netlify Functions)

### 7.1 Demo Endpoint
**File**: `netlify/functions/api.ts`
**Route**: `/api/demo`

### 7.2 Admin Notifications
**Route**: `/api/notify-admin-new-booking`
**Method**: POST
**Purpose**: Send FCM notification to all admins when new reservation created

### 7.3 User Notifications
**Route**: `/api/notify-user-booking-status`
**Method**: POST
**Purpose**: Send FCM notification to user when reservation status changes

---

## 8. File Storage (Firebase Storage)

### 8.1 Structure
```
storage/
├── labs/
│   └── {labId}/
│       └── {filename}       # Lab images
└── reservations/
    └── {userId}/
        └── {labId}_{timestamp}_{filename}  # Supporting files
```

### 8.2 Upload Rules
- Max file size: 1MB
- Allowed formats: JPEG, PNG, PDF
- Files uploaded via Firebase SDK

---

## 9. UI/UX Design

### 9.1 Design System
- **Color Scheme**:
  - Primary: Blue (#2563EB)
  - Success: Green (#16A34A)
  - Warning: Yellow/Orange
  - Danger: Red (#DC2626)
  - Gray scale for backgrounds and text

- **Components**: shadcn/ui
  - Button
  - Card
  - Input
  - Select
  - Dialog/Sheet
  - Table
  - Badge
  - Calendar
  - Sidebar
  - Toast/Sonner

### 9.2 Responsive Design
- **Mobile First**: Bottom navigation, simplified layouts
- **Desktop**: Sidebar navigation, multi-column layouts
- **Breakpoints**: md (768px), lg (1024px), xl (1280px)

### 9.3 Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

---

## 10. Fitur yang Perlu Diimplementasi

### 10.1 Priority High

#### 1. Jadwal Page - Complete Implementation
**Status**: Currently placeholder
**Requirements**:
- Sidebar navigation (sama seperti Dashboard)
- Filter fakultas dengan dropdown
- Calendar view (weekly/monthly)
- Kombinasi jadwal fakultas default dengan reservasi approved
- Visual differentiation antara jadwal reguler dan reservasi
- Detail view untuk setiap slot
- Color coding untuk status slot

#### 2. Jadwal Fakultas Database
**New Collection**: `faculty_schedules`
```typescript
{
  facultyId: string;        // Faculty ID
  facultyName: string;      // Faculty name
  labId: string;            // Lab ID
  day: string;              // Day of week (Senin, Selasa, etc.)
  timeSlot: string;         // Time slot
  courseName: string;       // Course name
  lecturerName: string;     // Lecturer name
  className: string;        // Class name
  semester: string;         // Semester
  academicYear: string;     // Academic year
}
```

#### 3. Faculty Detection System
- Parse faculty dari email atau profile
- Default filter berdasarkan faculty user
- Allow admin untuk melihat semua faculty schedules

### 10.2 Priority Medium

#### 1. Notification System Enhancement
- In-app notification center
- Mark as read/unread
- Notification history
- Notification preferences

#### 2. Advanced Search & Filtering
- Filter labs by status, location, capacity
- Filter reservations by date range, status
- Sort options

#### 3. Calendar Integration
- Export jadwal ke Google Calendar
- iCal format support
- Reminder notifications

#### 4. Reporting & Analytics
- Lab utilization reports
- Popular time slots
- User activity statistics
- Export to Excel/PDF

### 10.3 Priority Low

#### 1. Profile Management
- Edit profile page
- Change password
- Update photo

#### 2. Settings Page
- Notification preferences
- Language selection
- Theme toggle (light/dark)

#### 3. Bulk Operations (Admin)
- Bulk approve/reject reservations
- Bulk import labs
- Bulk delete

---

## 11. Security & Validation

### 11.1 Authentication
- Firebase Auth token validation
- Email domain verification
- Role-based access control (RBAC)

### 11.2 Authorization
- Admin-only routes protected
- User can only see their own reservations
- Firestore security rules

### 11.3 Input Validation
- Client-side form validation
- Server-side validation di API endpoints
- File type and size validation
- XSS prevention

### 11.4 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Labs collection
    match /labs/{labId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reservations collection
    match /reservations/{reservationId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 12. Testing Strategy

### 12.1 Unit Testing
- Custom hooks testing
- Utility functions testing
- Component testing

### 12.2 Integration Testing
- Auth flow testing
- Reservation flow testing
- Admin actions testing

### 12.3 E2E Testing
- User journey testing
- Admin workflow testing
- Cross-browser testing

---

## 13. Deployment

### 13.1 Netlify Configuration
**File**: `netlify.toml`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Redirects for SPA routing

### 13.2 Environment Variables
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_VAPID_KEY
```

### 13.3 CI/CD
- Auto-deploy on push to main branch
- Preview deployments for pull requests
- Build status checks

---

## 14. Performance Optimization

### 14.1 Code Splitting
- Route-based code splitting
- Lazy loading components
- Dynamic imports

### 14.2 Caching
- Firebase SDK caching
- Service worker for offline support
- Browser caching headers

### 14.3 Image Optimization
- WebP format support
- Lazy loading images
- Responsive images

---

## 15. Maintenance & Monitoring

### 15.1 Error Tracking
- Console error logging
- Error boundaries in React
- Firebase Analytics

### 15.2 Performance Monitoring
- Firebase Performance Monitoring
- Lighthouse scores
- Core Web Vitals

### 15.3 User Feedback
- In-app feedback form
- Bug reporting
- Feature requests

---

## 16. Documentation

### 16.1 Code Documentation
- TSDoc comments
- README files
- API documentation

### 16.2 User Documentation
- User manual
- FAQ page
- Tutorial videos

### 16.3 Admin Documentation
- Admin guide
- Configuration guide
- Troubleshooting guide

---

## Changelog

### Version 1.0 (Current)
- ✅ Authentication system
- ✅ User onboarding
- ✅ Dashboard with lab listing
- ✅ Lab detail page
- ✅ Reservation system
- ✅ History reservation
- ✅ Admin dashboard
- ✅ Lab management (CRUD)
- ✅ Reservation management
- ✅ FCM notifications
- ⚠️ Jadwal page (placeholder - needs full implementation)

### Version 1.1 (Planned)
- 🔲 Complete Jadwal page implementation
- 🔲 Faculty schedules database
- 🔲 Schedule combination logic
- 🔲 Enhanced notification center
- 🔲 Profile management
- 🔲 Advanced search & filters

### Version 2.0 (Future)
- 🔲 Reporting & analytics
- 🔲 Calendar integration
- 🔲 Bulk operations
- 🔲 Multi-language support
- 🔲 Dark mode

---

## Kontak & Support

**Project Repository**: [GitHub URL]
**Issue Tracker**: [GitHub Issues URL]
**Documentation**: [Docs URL]
**Support Email**: support@laboserve.unsika.ac.id
