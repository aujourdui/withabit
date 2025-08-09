# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions
- **Auto-update this file**: When making significant changes to the codebase, architecture, or functionality, automatically update this CLAUDE.md file to reflect the changes
- **Keep documentation current**: Ensure this file always represents the current state of the application

## Commands

### Development
- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator  
- `npm run web` - Start web version

## Architecture

This is a React Native habit tracking app built with Expo and Firebase. The app is structured as a single-component application with cloud-based data persistence.

### Core Architecture
- **Single File App**: All functionality is contained in `App.js` with separate Firebase configuration (`firebase.js`)
- **Cloud Data Persistence**: Uses Firebase Firestore for cloud-based data storage with real-time synchronization
- **Anonymous Authentication**: Firebase Anonymous Auth provides user identification without signup requirements
- **State Management**: Uses React's built-in useState and useEffect hooks with Firebase real-time listeners

### Data Structure

**Firebase Firestore Collections:**

```
users/{uid}/
├── habits/{habitId}
│   ├── name: string - User-defined habit name
│   ├── totalCount: number - Running total of completions
│   └── createdAt: timestamp - Creation time
└── records/{habitId}_{date}
    ├── habitId: string - Reference to habit
    ├── date: string - ISO date (YYYY-MM-DD)
    └── completedAt: timestamp - Completion time
```

**Security Rules:**
- Each user can only access their own data (`users/{uid}/*`)
- Anonymous authentication provides secure user isolation

### Key Functionality
- **Daily Tracking**: Prevents multiple completions per day by storing completion records in Firestore
- **Real-time Completion Status**: Live tracking of habit completion with instant UI updates
- **Real-time Sync**: Automatic data synchronization across devices using Firestore listeners
- **Offline Support**: Basic offline functionality through Firebase Web SDK caching
- **Anonymous Auth**: Transparent user identification without registration requirements
- **Firebase Auth Persistence**: Session persistence using AsyncStorage for seamless user experience
- **Data Security**: User data isolation through Firebase security rules
- **Error Handling**: User-friendly Japanese error messages for network and data failures
- **Progress Display**: Shows daily progress statistics (completed/total habits with remaining count)
- **Completion Celebration**: Displays congratulatory message when all daily habits are completed
- **Cross-device Continuity**: Habit data persists across device changes and app reinstalls
- **Chronological Ordering**: Habits displayed in creation order (oldest to newest)
- **Japanese UI**: User interface text is in Japanese

### UI Components & Features
- **Loading Screen**: Initial app loading while authenticating and fetching data
- **Header**: App title and subtitle with progress statistics
- **Progress Stats**: Daily completion counter (e.g., "今日の進捗: 2/5 (残り3個)")
- **Completion Message**: Celebratory message with emoji when all habits are done
- **Habit List**: FlatList displaying each habit with real-time updates from Firestore
- **Add Habit Modal**: Simple form for creating new habits
- **Habit Actions**: Per-habit completion button and delete option
- **Empty State**: Guidance message when no habits exist
- **Error Handling**: User-friendly error messages for network issues

### Technical Stack

**Core Framework:**
- React Native with Expo (~53.0.11)
- Standard React Native components (FlatList, Modal, TouchableOpacity)
- No external UI libraries or state management frameworks

**Backend & Database:**
- Firebase Web SDK (v12.1.0+)
- Firebase Authentication (Anonymous)
- Cloud Firestore (asia-northeast1 region)
- Real-time listeners for data synchronization

**Files:**
- `App.js` - Main application component with Firestore integration and real-time completion tracking
- `firebase.js` - Firebase configuration with AsyncStorage persistence and authentication utilities
- `package.json` - Dependencies including Firebase SDK

**Security:**
- Firestore security rules restricting user data access
- Anonymous authentication for user identification
- No sensitive data exposure in client code
