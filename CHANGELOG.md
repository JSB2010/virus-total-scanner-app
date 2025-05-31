# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation updates for 1.0 release
- User guide and installation documentation
- Security policy and roadmap documentation
- Proper scan history clearing functionality

### Changed
- Updated repository name from virus-total-scanner-app to DropSentinel
- Fixed deprecated Github icon usage across website components
- Enhanced documentation accuracy and completeness
- Improved 1.0 release preparation

## [1.0.0] - 2025-01-28

### Added
- **Core Security Features**
  - Real-time file scanning with VirusTotal API integration
  - Background monitoring of Downloads folder with intelligent file detection
  - Smart threat detection with advanced classification and detailed analysis
  - Quarantine system with safe isolation and metadata tracking
- **Windows-Specific Features**
  - System tray integration with dynamic status updates and context menu
  - Auto-start on boot functionality (configurable in settings)
  - Native Windows 10/11 notification system integration
  - Multiple installer options (NSIS, MSI, Portable executable)
  - Windows file associations and context menu integration
- **Modern User Interface**
  - Ultra-modern design with clean, responsive UI and glass morphism effects
  - Dark/light mode with automatic detection and manual override
  - Intuitive UX with streamlined workflows and minimal user interaction
  - Real-time progress tracking with detailed status updates
  - Comprehensive dashboard with analytics, scan history, and threat management
- **Performance & Reliability**
  - Comprehensive error boundaries with crash reporting
  - Detailed logging system for debugging and issue identification
  - Memory optimization for efficient background operation
  - Fast scanning with optimized VirusTotal API integration
- **Technical Infrastructure**
  - Comprehensive cross-platform build system with multiple output formats
  - Automated path fixing script for Electron static exports
  - Enhanced notification system with proper app naming
  - Native system dialogs for file scan prompts
  - Jest testing framework integration
  - Error boundary components for better error handling
  - Crash reporting system with detailed logging

### Changed
- Updated build system to use electron-builder with platform-specific configurations
- Enhanced UI/UX with better modal padding and background dimming
- Improved file detection workflow with streamlined user interactions
- Optimized bundle sizes and build performance
- Updated version to 1.0.0 for stable release
- Enhanced error handling throughout the application
- Improved publisher name in Windows build configuration

### Fixed
- Resolved blank screen issue in Electron production builds
- Fixed asset path resolution in asar files for proper resource loading
- Corrected notification app name from "electron.App.DropSentinel" to "DropSentinel"
- Fixed tray icon path resolution issues
- Resolved build system path conflicts

### Security
- Enhanced secure API key storage using electron-store
- Improved input validation and sanitization
- Added comprehensive audit logging for security events
- Implemented rate limiting for VirusTotal API calls
- Added secure error reporting with privacy protection

## [0.1.0] - 2025-05-27

### Added
- Initial release
- Core file scanning functionality
- VirusTotal API integration
- Electron desktop application
- Modern React/Next.js UI
- Real-time file monitoring
- Quarantine system
- Basic settings and configuration

---

## Template for Future Releases

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes
