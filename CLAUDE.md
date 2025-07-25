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

This is a React Native habit tracking app built with Expo. The app is structured as a single-component application with the following key features:

### Core Architecture
- **Single File App**: All functionality is contained in `App.js` with no separate components or modules
- **Data Persistence**: Uses AsyncStorage for local data storage - habits are saved/loaded from device storage
- **State Management**: Uses React's built-in useState and useEffect hooks for all state management

### Data Structure
Habits are stored as objects with:
- `id`: Unique identifier (timestamp string)
- `name`: User-defined habit name
- `totalCount`: Running total of completions
- `completionDates`: Array of ISO date strings for tracking daily completions

### Key Functionality
- **Daily Tracking**: Prevents multiple completions per day by checking completion dates
- **Persistent Storage**: All habit data is automatically saved to AsyncStorage on state changes
- **Error Handling**: User-friendly Japanese error messages for AsyncStorage failures (data loading/saving)
- **Japanese UI**: User interface text is in Japanese

### Technical Stack

- React Native with Expo (~53.0.11)
- AsyncStorage for data persistence
- Standard React Native components (FlatList, Modal, TouchableOpacity)
- No external UI libraries or state management frameworks
