# Eventify Dashboard

An admin dashboard for managing the Eventify event management application. This dashboard provides administrators with tools to manage users, events, and handle reports.

## Features

### 🔐 Authentication

- Secure admin login with Firebase Authentication
- Protected routes requiring authentication
- Session management

### 👥 User Management

- View all registered users
- Enable/disable user accounts
- Edit user information
- User status management (active, disabled, banned)
- Search and filter users

### 📅 Event Management

- View all events (public and private)
- Edit event details
- Delete events
- Event type filtering
- Search events by title, description, or location

### 📊 Reports & Moderation

- Review user reports
- Take moderation actions:
  - Send warnings to users
  - Ban users (30-day default)
  - Delete reported events
  - Reject reports
- Track report status and actions taken

### 📈 Dashboard Analytics

- User statistics
- Event statistics
- Report metrics
- Recent activity tracking

## Tech Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM
- **Backend**: Firebase (Authentication, Firestore)
- **Icons**: Lucide React
- **Styling**: CSS Modules

## Prerequisites

- Node.js 16+ installed
- Firebase project set up with:
  - Authentication enabled
  - Firestore database with collections: `users`, `events`, `reports`
  - Admin user account created

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eventify-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Firebase Collections Structure

### Users Collection

```javascript
{
  id: "user_id",
  name: "User Name",
  email: "user@example.com",
  status: "active" | "disabled" | "banned",
  createdAt: timestamp,
  updatedAt: timestamp,
  banUntil: timestamp // only for banned users
}
```

### Events Collection

```javascript
{
  id: "event_id",
  title: "Event Title",
  description: "Event description",
  location: "Event location",
  date: timestamp,
  type: "public" | "private",
  maxAttendees: number,
  attendees: ["user_id1", "user_id2"],
  organizerId: "user_id",
  organizerName: "Organizer Name",
  organizerEmail: "organizer@example.com",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Reports Collection

```javascript
{
  id: "report_id",
  reason: "Report reason",
  description: "Detailed description",
  reporterId: "user_id",
  reporterEmail: "reporter@example.com",
  reportedUserId: "user_id",
  reportedUserEmail: "reported@example.com",
  reportedEventId: "event_id",
  reportedEventTitle: "Event Title",
  status: "pending" | "resolved" | "rejected",
  action: "warning_sent" | "user_banned" | "event_deleted" | "no_action",
  createdAt: timestamp,
  updatedAt: timestamp,
  actionTakenAt: timestamp
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx
│   │   └── DashboardLayout.css
│   └── ProtectedRoute.jsx
├── hooks/
│   ├── useAuth.jsx
│   └── useAuthContext.js
├── pages/
│   └── dashboard/
│       ├── DashboardHome.jsx
│       ├── DashboardHome.css
│       ├── UsersManagement.jsx
│       ├── UsersManagement.css
│       ├── EventsManagement.jsx
│       ├── EventsManagement.css
│       ├── ReportsManagement.jsx
│       └── ReportsManagement.css
├── services/
│   ├── authService.js
│   └── firestoreService.js
├── firebase/
│   └── config.js
├── App.jsx
├── main.jsx
└── index.css
```

## Admin Setup

1. Create an admin user account in Firebase Authentication
2. Login to the dashboard using the admin credentials
3. The dashboard will automatically load data from your Firestore collections

## Security Rules

Make sure to set up proper Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admin users to read/write all documents
    match /{document=**} {
      allow read, write: if request.auth != null &&
        request.auth.token.email in ['admin@yourapp.com'];
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
