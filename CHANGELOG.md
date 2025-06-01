# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2025-01-28

### Added
- **Docker Container Support**
  - Pre-configured development environment with Node.js 20 and all dependencies
  - Automated container publishing to GitHub Container Registry (ghcr.io)
  - Health check API endpoint for container monitoring and status validation
  - Docker scripts in package.json for local development and testing
  - Comprehensive container documentation and usage instructions
- **Enhanced Development Tools**
  - Container health checks in repository health monitoring system
  - Optimized .dockerignore for efficient container builds
  - Docker container section added to website download page
  - Container registry integration with release analytics system
- **Workflow Reliability Improvements**
  - Comprehensive workflow failure analysis and resolution system
  - Enhanced error handling and debugging capabilities
  - Automated workflow health monitoring and validation

### Changed
- **Package Publishing System Optimization**
  - Replaced failing NPM package publishing with working Docker container system
  - Enhanced container workflow with proper development environment setup
  - Updated release analytics to include container metrics and registry links
  - Improved workflow summaries with comprehensive container information
- **Website and Documentation Updates**
  - Added Docker container download option to website with quick start commands
  - Enhanced README with comprehensive container usage instructions
  - Updated download page with container registry links and usage examples
  - Improved documentation accuracy and completeness
- **Build System Enhancements**
  - Optimized Docker build process with better dependency management
  - Enhanced container build caching and performance
  - Improved script inclusion strategy for container builds

### Fixed
- **Critical Workflow Failures**
  - Resolved Docker build failures due to missing essential build scripts
  - Fixed rimraf dependency issues in container build process
  - Corrected script inclusion in .dockerignore for proper container functionality
  - Fixed version extraction logic for analytics generation in push events
- **Container Build System**
  - Fixed missing create-pkg-background.js script in Docker container
  - Resolved fix-electron-paths.js script exclusion causing build failures
  - Enhanced .dockerignore patterns to include essential build scripts while excluding unnecessary ones
  - Optimized container size by pruning dev dependencies after build
- **Analytics and Monitoring**
  - Fixed invalid file path generation in release analytics
  - Enhanced version validation and sanitization for file paths
  - Improved error handling for invalid version formats
  - Added comprehensive logging for debugging workflow issues

### Technical
- Container publishing now triggers on pushes to main branch for continuous deployment
- Enhanced container configuration with health checks and proper user permissions
- Improved container registry integration with automated tagging and versioning
- Added comprehensive container validation to repository health check system
- Resolved all workflow failures through systematic analysis and targeted fixes
- Enhanced build process reliability with better error recovery and validation

## [1.0.2] - 2025-06-01

### Fixed
- **Version Consistency Issues**
  - Fixed buildVersion and bundleVersion inconsistencies in package.json
  - Corrected artifact naming to properly reflect release version
  - Updated all version references to maintain consistency
- **Workflow Compatibility**
  - Updated docker/build-push-action from v5 to v6 in publish-packages workflow
  - Fixed workflow failures caused by version mismatches
  - Enhanced workflow reliability and error handling
- **Release Artifact Issues**
  - Resolved v1.0.1 release having artifacts named with v1.0.0
  - Ensured proper version propagation through build system
  - Fixed package naming inconsistencies across all platforms

### Technical
- Comprehensive version synchronization across all configuration files
- Enhanced build system reliability and consistency
- Improved release workflow error handling and validation

## [1.0.1] - 2025-06-01

### Added
- **Release System Overhaul**
  - Comprehensive release automation with multiple trigger methods
  - Automated download link updates for website
  - Enhanced macOS build system with DMG/PKG creation
  - Release creation scripts (`npm run create-release`)
  - macOS build diagnostics and testing tools
- **Build System Improvements**
  - Enhanced error handling and logging across all platforms
  - Improved artifact verification and build result reporting
  - Better fallback strategies for failed builds
  - Comprehensive build dependencies for macOS (create-dmg, Xcode tools)
- **Developer Tools**
  - Release guide documentation with step-by-step instructions
  - Build diagnostic scripts for troubleshooting
  - Automated version management and changelog updates

### Changed
- **Release Process Simplification**
  - Streamlined release creation to simple Git tag workflow
  - Enhanced release workflow reliability and error handling
  - Improved GitHub token permissions for package publishing
  - Updated website download links for accuracy and consistency
- **Build System Enhancements**
  - Better macOS build dependencies and tool installation
  - Enhanced logging and debugging capabilities
  - Improved cross-platform build reliability
  - Optimized artifact handling and verification

### Fixed
- **Critical Release Issues**
  - GitHub token permissions for package publishing (GH_TOKEN vs GITHUB_TOKEN)
  - macOS build missing DMG and PKG packages
  - Website download links pointing to incorrect file names
  - Package naming inconsistencies across releases
- **Build System Fixes**
  - macOS build dependencies and tool availability
  - Download link version synchronization
  - Build artifact verification and error detection
  - Workflow failure handling and recovery

### Technical
- Enhanced release workflow with comprehensive build logic
- Improved error boundaries and crash reporting
- Better artifact naming and version management
- Streamlined CI/CD pipeline with enhanced reliability

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
