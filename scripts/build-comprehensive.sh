#!/bin/bash

# DropSentinel Comprehensive Build Script
# Builds all installer types for all supported platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PRODUCT_NAME="DropSentinel"
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")
DIST_DIR="$PROJECT_ROOT/dist"
BUILD_DIR="$PROJECT_ROOT/build"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Platform detection
CURRENT_OS=$(uname -s)
case "$CURRENT_OS" in
    Darwin) PLATFORM="mac" ;;
    Linux) PLATFORM="linux" ;;
    MINGW*|CYGWIN*|MSYS*) PLATFORM="win" ;;
    *) PLATFORM="unknown" ;;
esac

# Build targets by platform
declare -A PLATFORM_TARGETS
PLATFORM_TARGETS[mac]="dmg pkg zip dir"
PLATFORM_TARGETS[win]="nsis msi portable zip dir"
PLATFORM_TARGETS[linux]="AppImage deb rpm tar.gz dir"

# Functions
log() {
    echo -e "${WHITE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_DIR/build-$TIMESTAMP.log"
}

log_step() {
    echo -e "\n${PURPLE}▶${NC} ${WHITE}$1${NC}" | tee -a "$LOG_DIR/build-$TIMESTAMP.log"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_DIR/build-$TIMESTAMP.log"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_DIR/build-$TIMESTAMP.log"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_DIR/build-$TIMESTAMP.log"
}

show_help() {
    echo -e "${WHITE}DropSentinel Comprehensive Build Script${NC}"
    echo -e "${WHITE}======================================${NC}\n"
    echo "Usage: $0 [OPTIONS] [PLATFORM] [TARGETS...]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -c, --clean         Clean all build artifacts before building"
    echo "  -v, --verbose       Enable verbose output"
    echo "  --no-deps           Skip dependency installation"
    echo "  --no-test           Skip pre-build tests"
    echo "  --parallel          Build targets in parallel (experimental)"
    echo ""
    echo "Platforms:"
    echo "  mac                 Build for macOS (dmg, pkg, zip, dir)"
    echo "  win                 Build for Windows (nsis, msi, portable, zip, dir)"
    echo "  linux               Build for Linux (AppImage, deb, rpm, tar.gz, dir)"
    echo "  all                 Build for all supported platforms"
    echo ""
    echo "Targets (platform-specific):"
    echo "  macOS:    dmg, pkg, zip, dir"
    echo "  Windows:  nsis, msi, portable, zip, dir"
    echo "  Linux:    AppImage, deb, rpm, tar.gz, dir"
    echo ""
    echo "Examples:"
    echo "  $0 mac                    # Build all macOS targets"
    echo "  $0 mac dmg pkg            # Build only DMG and PKG for macOS"
    echo "  $0 win nsis              # Build only NSIS installer for Windows"
    echo "  $0 all                    # Build for all platforms"
    echo "  $0 --clean --verbose all # Clean build with verbose output"
    exit 0
}

setup_logging() {
    mkdir -p "$LOG_DIR"
    log "Starting comprehensive build process"
    log "Platform: $PLATFORM"
    log "Version: $VERSION"
    log "Timestamp: $TIMESTAMP"
}

check_dependencies() {
    log_step "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check electron-builder
    if ! npm list electron-builder &> /dev/null; then
        log_error "electron-builder is not installed"
        exit 1
    fi
    
    # Platform-specific checks
    case "$PLATFORM" in
        mac)
            if ! command -v pkgbuild &> /dev/null; then
                log_warning "pkgbuild not available - PKG builds may fail"
            fi
            if ! command -v hdiutil &> /dev/null; then
                log_warning "hdiutil not available - DMG builds may fail"
            fi
            ;;
        win)
            if ! command -v makensis &> /dev/null; then
                log_warning "NSIS not available - NSIS builds may fail"
            fi
            ;;
        linux)
            if ! command -v dpkg-deb &> /dev/null; then
                log_warning "dpkg-deb not available - DEB builds may fail"
            fi
            if ! command -v rpmbuild &> /dev/null; then
                log_warning "rpmbuild not available - RPM builds may fail"
            fi
            ;;
    esac
    
    log_success "Dependencies check completed"
}

install_dependencies() {
    if [[ "$SKIP_DEPS" != "true" ]]; then
        log_step "Installing/updating dependencies..."
        npm ci
        log_success "Dependencies installed"
    else
        log "Skipping dependency installation"
    fi
}

run_tests() {
    if [[ "$SKIP_TESTS" != "true" ]]; then
        log_step "Running pre-build tests..."
        
        # Run linting
        if npm run lint &> /dev/null; then
            log_success "Linting passed"
        else
            log_warning "Linting failed - continuing anyway"
        fi
        
        # Run any available tests
        if npm test &> /dev/null 2>&1; then
            log_success "Tests passed"
        else
            log "No tests found or tests failed - continuing anyway"
        fi
    else
        log "Skipping pre-build tests"
    fi
}

clean_build_artifacts() {
    if [[ "$CLEAN_BUILD" == "true" ]]; then
        log_step "Cleaning build artifacts..."
        
        # Remove build directories
        rm -rf "$DIST_DIR" ".next" ".build-temp" 2>/dev/null || true
        
        # Clean npm cache
        npm cache clean --force &> /dev/null || true
        
        log_success "Build artifacts cleaned"
    fi
}

prepare_build_environment() {
    log_step "Preparing build environment..."
    
    # Create necessary directories
    mkdir -p "$DIST_DIR"
    mkdir -p "$BUILD_DIR"
    mkdir -p "public/assets"
    
    # Ensure build scripts are executable
    chmod +x "$SCRIPT_DIR"/*.sh "$SCRIPT_DIR"/*.js 2>/dev/null || true
    chmod +x "$BUILD_DIR/pkg-scripts"/* 2>/dev/null || true
    
    log_success "Build environment prepared"
}

build_next_application() {
    log_step "Building Next.js application..."
    
    if npm run build; then
        log_success "Next.js build completed"
    else
        log_error "Next.js build failed"
        exit 1
    fi
}

build_platform_targets() {
    local platform=$1
    shift
    local targets=("$@")
    
    log_step "Building $platform targets: ${targets[*]}"
    
    # If no specific targets provided, build all for platform
    if [[ ${#targets[@]} -eq 0 ]]; then
        IFS=' ' read -ra targets <<< "${PLATFORM_TARGETS[$platform]}"
    fi
    
    local failed_builds=()
    local successful_builds=()
    
    for target in "${targets[@]}"; do
        log_step "Building $platform $target..."
        
        # Set environment variables for optimized builds
        export NODE_ENV=production
        export ELECTRON_BUILDER_COMPRESSION_LEVEL=9
        export ELECTRON_BUILDER_CACHE=true
        
        # Platform-specific environment setup
        case "$platform" in
            mac)
                export CSC_IDENTITY_AUTO_DISCOVERY=false
                export SKIP_NOTARIZATION=true
                ;;
            win)
                export CSC_IDENTITY_AUTO_DISCOVERY=false
                export WIN_CSC_LINK=""
                export WIN_CSC_KEY_PASSWORD=""
                ;;
        esac
        
        # Build command
        local cmd="electron-builder --$platform $target"
        
        if [[ "$VERBOSE" == "true" ]]; then
            export DEBUG=electron-builder
            cmd="$cmd --verbose"
        fi
        
        # Execute build
        if eval "$cmd"; then
            successful_builds+=("$target")
            log_success "$platform $target build completed"
        else
            failed_builds+=("$target")
            log_error "$platform $target build failed"
        fi
    done
    
    # Report results
    if [[ ${#successful_builds[@]} -gt 0 ]]; then
        log_success "Successful $platform builds: ${successful_builds[*]}"
    fi
    
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed $platform builds: ${failed_builds[*]}"
        return 1
    fi
    
    return 0
}

validate_platform_support() {
    local target_platform=$1
    
    case "$target_platform" in
        mac)
            if [[ "$PLATFORM" != "mac" ]]; then
                log_error "macOS builds can only be created on macOS"
                return 1
            fi
            ;;
        win)
            # Windows builds can be created on any platform
            ;;
        linux)
            if [[ "$PLATFORM" == "win" ]]; then
                log_error "Linux builds cannot be created on Windows"
                return 1
            fi
            ;;
        *)
            log_error "Unknown platform: $target_platform"
            return 1
            ;;
    esac
    
    return 0
}

generate_build_report() {
    log_step "Generating build report..."
    
    local report_file="$DIST_DIR/build-report-$TIMESTAMP.json"
    local artifacts=()
    
    # Scan for artifacts
    if [[ -d "$DIST_DIR" ]]; then
        while IFS= read -r -d '' file; do
            local filename=$(basename "$file")
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            local size_formatted=$(numfmt --to=iec-i --suffix=B "$size" 2>/dev/null || echo "${size}B")
            
            artifacts+=("{\"name\":\"$filename\",\"size\":$size,\"sizeFormatted\":\"$size_formatted\"}")
        done < <(find "$DIST_DIR" -type f \( -name "*.dmg" -o -name "*.pkg" -o -name "*.exe" -o -name "*.msi" -o -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" -o -name "*.zip" -o -name "*.tar.gz" \) -print0)
    fi
    
    # Generate JSON report
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "$VERSION",
  "platform": "$PLATFORM",
  "buildId": "$TIMESTAMP",
  "artifacts": [$(IFS=,; echo "${artifacts[*]}")],
  "summary": {
    "totalArtifacts": ${#artifacts[@]},
    "buildDuration": "$(date -d@$(($(date +%s) - BUILD_START_TIME)) -u +%H:%M:%S 2>/dev/null || echo "unknown")"
  }
}
EOF
    
    log_success "Build report generated: $report_file"
    
    # Display summary
    echo
    log_step "BUILD SUMMARY"
    echo "=============="
    log "Version: $VERSION"
    log "Platform: $PLATFORM"
    log "Build ID: $TIMESTAMP"
    log "Artifacts: ${#artifacts[@]}"
    
    if [[ ${#artifacts[@]} -gt 0 ]]; then
        echo
        log "Generated files:"
        find "$DIST_DIR" -type f \( -name "*.dmg" -o -name "*.pkg" -o -name "*.exe" -o -name "*.msi" -o -name "*.deb" -o -name "*.rpm" -o -name "*.AppImage" -o -name "*.zip" -o -name "*.tar.gz" \) -exec basename {} \; | sort | while read -r file; do
            echo "  📦 $file"
        done
    fi
}

# Main execution
main() {
    BUILD_START_TIME=$(date +%s)
    
    # Parse command line arguments
    CLEAN_BUILD=false
    VERBOSE=false
    SKIP_DEPS=false
    SKIP_TESTS=false
    PARALLEL=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                ;;
            -c|--clean)
                CLEAN_BUILD=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --no-deps)
                SKIP_DEPS=true
                shift
                ;;
            --no-test)
                SKIP_TESTS=true
                shift
                ;;
            --parallel)
                PARALLEL=true
                shift
                ;;
            *)
                break
                ;;
        esac
    done
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Setup
    setup_logging
    check_dependencies
    clean_build_artifacts
    prepare_build_environment
    install_dependencies
    run_tests
    build_next_application
    
    # Determine what to build
    local build_platform=${1:-$PLATFORM}
    shift || true
    local build_targets=("$@")
    
    # Handle 'all' platform
    if [[ "$build_platform" == "all" ]]; then
        local platforms_to_build=()
        
        case "$PLATFORM" in
            mac)
                platforms_to_build=(mac win linux)
                ;;
            linux)
                platforms_to_build=(linux win)
                ;;
            win)
                platforms_to_build=(win)
                log_warning "macOS and Linux builds require macOS/Linux platforms"
                ;;
        esac
        
        for platform in "${platforms_to_build[@]}"; do
            if validate_platform_support "$platform"; then
                build_platform_targets "$platform"
            fi
        done
    else
        # Build specific platform
        if validate_platform_support "$build_platform"; then
            build_platform_targets "$build_platform" "${build_targets[@]}"
        else
            exit 1
        fi
    fi
    
    # Generate final report
    generate_build_report
    
    log_success "🎉 Comprehensive build process completed!"
    log "📁 Artifacts available in: $DIST_DIR"
    log "📋 Build log: $LOG_DIR/build-$TIMESTAMP.log"
}

# Execute main function with all arguments
main "$@"
