# macOS Background Features for DropSentinel

## Overview

DropSentinel now includes comprehensive macOS background functionality, allowing the app to run seamlessly in the background while continuously monitoring your Downloads folder for new files. The app can operate as a true menu bar application, hidden from the dock when desired.

## Key Improvements

### 🎯 Background Operation
- **True Background Mode**: App can run completely hidden from the dock
- **Continuous Monitoring**: File watching works without window focus
- **Menu Bar Integration**: Access all features from the menu bar
- **System Dialog Integration**: Native macOS dialogs for file detection

### 🚀 Auto-Start Support
- **macOS Login Items**: Full support for auto-start on macOS
- **Cross-Platform**: Works on both Windows and macOS
- **Background Launch**: Can start hidden in menu bar
- **Smart Configuration**: Automatic platform-specific settings

### 📱 Enhanced User Experience
- **Dock Visibility Control**: Toggle dock visibility from menu bar
- **Native Notifications**: Enhanced macOS notification system
- **Seamless Window Management**: Smart show/hide behavior
- **System Integration**: Proper macOS app lifecycle management

## How It Works

### File Detection Workflow
1. **Background Monitoring**: App continuously watches Downloads folder
2. **File Detection**: New files trigger immediate detection
3. **System Dialog**: Native macOS dialog appears asking to scan
4. **Smart Window Management**: App appears in dock only when needed
5. **Background Return**: App returns to menu bar after scanning

### Dock Behavior
- **Window Closed**: App hides to menu bar automatically
- **File Detected**: App shows in dock when scanning is needed
- **Manual Control**: Toggle dock visibility via menu bar
- **Smart Defaults**: Intelligent behavior based on user actions

## Menu Bar Features

### Status Information
- **Monitoring Status**: Active/Paused indicator
- **Scan Statistics**: Today's scans and threats detected
- **Auto-Start Status**: Current auto-start configuration

### Quick Actions
- **Show Dashboard**: Open main window and show in dock
- **Quick Scan**: Open manual scan interface
- **Pause/Resume Monitoring**: Toggle file watching
- **Hide/Show in Dock**: Control dock visibility (macOS only)

### Settings & Controls
- **Auto-Start Toggle**: Enable/disable startup with macOS
- **Settings Access**: Open app settings
- **About Dialog**: App information
- **Quit Application**: Completely exit the app

## Configuration Options

### Auto-Start Configuration
```javascript
// Enable auto-start with background launch
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: true,
  args: ['--hidden', '--background']
})
```

### Dock Behavior Control
```javascript
// Hide from dock (menu bar only)
if (app.dock) {
  app.dock.hide()
}

// Show in dock (normal app)
if (app.dock) {
  app.dock.show()
}
```

### Enhanced Notifications
```javascript
// macOS-specific notifications with actions
const notification = new Notification({
  title: "File Detected",
  body: "New file ready for scanning",
  sound: 'default',
  actions: [{ type: 'button', text: 'Scan Now' }]
})
```

## Usage Scenarios

### Scenario 1: Pure Background Mode
1. Launch app normally
2. Close window (app hides to menu bar)
3. From menu bar: "Hide from Dock"
4. App runs invisibly, only menu bar icon visible
5. File detection shows system dialogs
6. Scanning temporarily shows app in dock

### Scenario 2: Auto-Start Background
1. Enable auto-start from menu bar
2. App starts with macOS login
3. Launches directly to menu bar (hidden)
4. Continuous background monitoring
5. System notifications for startup

### Scenario 3: On-Demand Visibility
1. App running in background
2. Click menu bar icon to show/hide window
3. Use "Show Dashboard" for full interface
4. "Quick Scan" for immediate file scanning
5. Window closes back to menu bar

## Technical Implementation

### Core Functions
- `setMacOSAppBehavior(backgroundMode)`: Control dock visibility
- `showMacOSNotification(title, body, options)`: Enhanced notifications
- `getAutoStartMenuLabel(enabled)`: Dynamic menu labels
- Cross-platform auto-start with macOS-specific arguments

### IPC Communication
- `get-macos-app-behavior`: Get current dock visibility state
- `set-macos-app-behavior`: Control dock visibility from renderer
- Enhanced auto-start APIs for cross-platform support

### App Lifecycle Management
- Proper window-all-closed handling for macOS
- Smart activate event handling
- Background-aware initialization
- Graceful shutdown with cleanup

## Benefits for macOS Users

### 🔒 Security
- **Always-On Protection**: Continuous monitoring without user intervention
- **Immediate Detection**: Instant alerts for new downloads
- **Non-Intrusive**: Works silently in background
- **System Integration**: Native macOS security dialogs

### 🎨 User Experience
- **Clean Interface**: No dock clutter when not needed
- **Quick Access**: Menu bar always available
- **Smart Behavior**: App appears only when necessary
- **Native Feel**: Follows macOS design patterns

### ⚡ Performance
- **Efficient Monitoring**: Low resource usage in background
- **Smart Notifications**: Context-aware alerts
- **Optimized Startup**: Fast launch with background mode
- **Memory Efficient**: Minimal footprint when hidden

## Troubleshooting

### Common Issues
1. **App not starting in background**: Check auto-start settings in System Preferences
2. **File detection not working**: Verify Downloads folder permissions
3. **Menu bar icon missing**: Restart app or check system tray settings
4. **Notifications not showing**: Check macOS notification preferences

### Permissions Required
- **Downloads Folder Access**: For file monitoring
- **Notifications**: For file detection alerts
- **Login Items**: For auto-start functionality
- **Accessibility** (if needed): For enhanced system integration

## Future Enhancements

### Planned Features
- **Custom Folder Monitoring**: Beyond Downloads folder
- **Advanced Notification Actions**: Direct scan from notification
- **Spotlight Integration**: Quick access via Spotlight
- **Touch Bar Support**: For MacBook Pro users
- **Dark Mode Optimization**: Enhanced dark mode support

This implementation provides a comprehensive macOS background experience that makes DropSentinel feel like a native macOS security application while maintaining cross-platform compatibility.
