#!/bin/bash

# DropSentinel macOS Build Script
# Builds .app, .dmg, and .pkg installers for macOS

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
PRODUCT_NAME="DropSentinel"
VERSION=$(node -p "require('./package.json').version")
DIST_DIR="dist"
BUILD_DIR="build"
ARCHITECTURES=("x64" "arm64" "universal")
TARGETS=("dmg" "pkg" "zip" "dir")
DEFAULT_ARCH="universal"  # Build universal binaries by default for better compatibility

# Functions
log() {
    echo -e "${WHITE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_step() {
    echo -e "\n${PURPLE}▶${NC} ${WHITE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_platform() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "This script must be run on macOS to build macOS applications"
        exit 1
    fi
    log_success "Running on macOS - platform check passed"
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

    # Check if electron-builder is available
    if ! npm list electron-builder &> /dev/null; then
        log_error "electron-builder is not installed"
        exit 1
    fi

    log_success "All dependencies are available"
}

check_assets() {
    log_step "Checking required assets..."

    local required_assets=(
        "public/assets/app-icon.icns"
        "public/assets/app-icon.png"
        "build/entitlements.mac.plist"
    )

    local missing_assets=()

    for asset in "${required_assets[@]}"; do
        if [[ ! -f "$asset" ]]; then
            missing_assets+=("$asset")
        fi
    done

    if [[ ${#missing_assets[@]} -gt 0 ]]; then
        log_warning "Missing assets:"
        for asset in "${missing_assets[@]}"; do
            echo "  - $asset"
        done
        log_warning "Some features may not work correctly"
    else
        log_success "All required assets are present"
    fi
}

clean_build() {
    log_step "Cleaning previous builds..."

    # Remove previous builds
    if [[ -d "$DIST_DIR" ]]; then
        rm -rf "$DIST_DIR"
        log "Removed $DIST_DIR"
    fi

    if [[ -d ".next" ]]; then
        rm -rf ".next"
        log "Removed .next"
    fi

    # Create output directory
    mkdir -p "$DIST_DIR"
    mkdir -p "$BUILD_DIR"

    log_success "Build directories cleaned"
}

build_next_app() {
    log_step "Building Next.js application..."

    npm run build

    if [[ $? -eq 0 ]]; then
        log_success "Next.js build completed"
    else
        log_error "Next.js build failed"
        exit 1
    fi
}

build_electron_app() {
    local target=$1
    local arch=$2

    log_step "Building Electron app for macOS ($target, $arch)..."

    # Set environment variables for macOS builds
    export CSC_IDENTITY_AUTO_DISCOVERY=false
    export SKIP_NOTARIZATION=true
    export ELECTRON_BUILDER_COMPRESSION_LEVEL=9
    export DEBUG=electron-builder
    export ELECTRON_CACHE="$HOME/.cache/electron"
    export ELECTRON_BUILDER_CACHE="$HOME/.cache/electron-builder"

    # Build command using npx to ensure electron-builder is found
    local cmd="npx electron-builder --mac $target"

    if [[ -n "$arch" ]]; then
        cmd="$cmd --$arch"
    fi

    # Add universal build support for better compatibility
    if [[ "$arch" == "universal" ]]; then
        cmd="npx electron-builder --mac $target --universal"
    fi

    log "Executing: $cmd"

    # Run the build with better error handling
    if eval "$cmd" 2>&1 | tee -a build.log; then
        log_success "macOS $target build completed successfully"
        return 0
    else
        log_error "macOS $target build failed"
        log_error "Check build.log for detailed error information"
        return 1
    fi
}

build_all_targets() {
    log_step "Building all macOS targets with $DEFAULT_ARCH architecture..."

    local failed_builds=()
    local successful_builds=()

    for target in "${TARGETS[@]}"; do
        log_step "Building $target ($DEFAULT_ARCH)..."

        if build_electron_app "$target" "$DEFAULT_ARCH"; then
            successful_builds+=("$target")
        else
            failed_builds+=("$target")
        fi
    done

    # Report results
    echo
    log_step "Build Summary"

    if [[ ${#successful_builds[@]} -gt 0 ]]; then
        log_success "Successful builds:"
        for build in "${successful_builds[@]}"; do
            echo "  ✅ $build ($DEFAULT_ARCH)"
        done
    fi

    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed builds:"
        for build in "${failed_builds[@]}"; do
            echo "  ❌ $build ($DEFAULT_ARCH)"
        done
        return 1
    fi

    return 0
}

list_artifacts() {
    log_step "Generated artifacts:"

    if [[ -d "$DIST_DIR" ]]; then
        find "$DIST_DIR" -type f \( -name "*.dmg" -o -name "*.pkg" -o -name "*.zip" -o -name "*.app" \) -exec ls -lh {} \; | while read -r line; do
            filename=$(echo "$line" | awk '{print $9}')
            size=$(echo "$line" | awk '{print $5}')
            echo "  📦 $(basename "$filename") ($size)"
        done
    else
        log_warning "No artifacts found in $DIST_DIR"
    fi
}

create_checksums() {
    log_step "Creating checksums..."

    if [[ -d "$DIST_DIR" ]]; then
        cd "$DIST_DIR"

        # Create checksums for all installer files
        find . -type f \( -name "*.dmg" -o -name "*.pkg" -o -name "*.zip" \) -exec shasum -a 256 {} \; > checksums.txt

        if [[ -f "checksums.txt" ]]; then
            log_success "Checksums created: $DIST_DIR/checksums.txt"
        fi

        cd - > /dev/null
    fi
}

optimize_builds() {
    log_step "Optimizing builds..."

    # Remove unnecessary files from .app bundles
    find "$DIST_DIR" -name "*.app" -type d | while read -r app_path; do
        if [[ -d "$app_path/Contents/Resources" ]]; then
            # Remove development files
            find "$app_path/Contents/Resources" -name "*.map" -delete 2>/dev/null || true
            find "$app_path/Contents/Resources" -name "*.ts" -delete 2>/dev/null || true
            find "$app_path/Contents/Resources" -name "*.tsx" -delete 2>/dev/null || true

            # Remove system files
            find "$app_path" -name "*.DS_Store" -delete 2>/dev/null || true
            find "$app_path" -name "Thumbs.db" -delete 2>/dev/null || true
            find "$app_path" -name "*.log" -delete 2>/dev/null || true

            # Optimize permissions
            chmod -R 755 "$app_path/Contents/MacOS" 2>/dev/null || true
            chmod 644 "$app_path/Contents/Info.plist" 2>/dev/null || true

            log "Optimized: $(basename "$app_path")"
        fi
    done

    # Optimize other build artifacts
    for file in "$DIST_DIR"/*.dmg "$DIST_DIR"/*.pkg "$DIST_DIR"/*.zip; do
        if [[ -f "$file" ]]; then
            # Set proper permissions
            chmod 644 "$file"
        fi
    done

    log_success "Build optimization completed"
}

# Main execution
main() {
    echo -e "${WHITE}🍎 DropSentinel macOS Build Script${NC}"
    echo -e "${WHITE}===================================${NC}\n"

    # Parse command line arguments
    local target_filter=""
    local arch_filter="$DEFAULT_ARCH"
    local verbose=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --target)
                target_filter="$2"
                shift 2
                ;;
            --arch)
                arch_filter="$2"
                shift 2
                ;;
            --verbose|-v)
                verbose=true
                export DEBUG=electron-builder
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --target TARGET    Build specific target (dmg, pkg, zip, dir, all)"
                echo "  --arch ARCH        Build for specific architecture (x64, arm64, universal)"
                echo "  --verbose, -v      Enable verbose output"
                echo "  --help, -h         Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                           # Build all targets with universal architecture"
                echo "  $0 --target dmg              # Build only DMG with universal architecture"
                echo "  $0 --target all --arch x64   # Build all targets for x64 only"
                echo "  $0 --target pkg --arch arm64 # Build only PKG for ARM64"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Pre-build checks
    check_platform
    check_dependencies
    check_assets

    # Build process
    clean_build
    build_next_app

    # Build specific target or all targets
    if [[ -n "$target_filter" && "$target_filter" != "all" ]]; then
        log_step "Building single target: $target_filter ($arch_filter)"
        if build_electron_app "$target_filter" "$arch_filter"; then
            log_success "Target $target_filter ($arch_filter) built successfully"
        else
            log_error "Target $target_filter ($arch_filter) build failed"
            exit 1
        fi
    else
        # Override DEFAULT_ARCH if specified
        if [[ "$arch_filter" != "$DEFAULT_ARCH" ]]; then
            DEFAULT_ARCH="$arch_filter"
        fi

        if ! build_all_targets; then
            log_error "Some builds failed"
            exit 1
        fi
    fi

    # Post-build tasks
    optimize_builds
    create_checksums
    list_artifacts

    echo
    log_success "🎉 macOS build process completed successfully!"
    log "📁 Artifacts are available in: $DIST_DIR"

    # Show final summary
    echo
    log_step "Final Summary:"
    log "Product: $PRODUCT_NAME v$VERSION"
    log "Architecture: $arch_filter"
    log "Build directory: $DIST_DIR"
    if [[ -f "build.log" ]]; then
        log "Build log: build.log"
    fi
}

# Execute main function with all arguments
main "$@"
