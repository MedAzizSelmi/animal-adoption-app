# Firebase Setup Instructions

## Prerequisites
Before running this application, you need to set up Firebase:

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Name your project (e.g., "animal-adoption-app")

### 2. Enable Firebase Services

#### Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

#### Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode" (we'll configure security rules)
4. Select a location close to your users
5. Click "Enable"

#### Security Rules
After creating Firestore, set up these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /animals/{animalId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.refugeId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.refugeId;
    }

    match /adoptionRequests/{requestId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId || request.auth.uid == resource.data.refugeId);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Storage
1. In Firebase Console, go to **Storage**
2. Click "Get Started"
3. Choose "Start in production mode"
4. Click "Done"

#### Storage Rules
Set up these storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /animals/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Update Environment Files
Replace the placeholder values in these files with your Firebase config:

**src/environments/environment.ts** (for development)
**src/environments/environment.prod.ts** (for production)

```typescript
export const environment = {
  production: false, // set to true for production
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

## Installation & Running

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will open in your browser at http://localhost:8100

### Build for Production
```bash
npm run build
```

### Add iOS/Android Platforms (Optional)
To run on mobile devices:

```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync assets
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android
```

## Features

### User Roles
- **Adoptant (User)**: Browse animals, add favorites, request adoptions
- **Refuge (Shelter)**: Add animals, manage listings, receive adoption requests

### Key Features
- Firebase Authentication with role-based access
- Real-time animal listings with Firestore
- Camera integration for animal photos
- Geolocation for shelter addresses
- Local storage for favorites
- Push notifications for adoption requests
- Responsive design with pastel green theme

## Project Structure
```
src/
├── app/
│   ├── pages/          # All page components
│   ├── services/       # Firebase and business logic services
│   ├── guards/         # Authentication guards
│   └── app.module.ts   # Main module with Firebase config
├── environments/       # Environment configurations
├── theme/             # Ionic theme and variables
└── index.html         # Entry point
```

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config is correct
- Check that all Firebase services are enabled
- Ensure security rules are properly configured

### Camera Not Working
- Camera requires HTTPS or localhost
- Grant camera permissions when prompted
- For web, use Chrome/Safari (Firefox may have issues)

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if needed
- Check that TypeScript version matches project requirements
