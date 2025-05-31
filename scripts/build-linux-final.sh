#!/bin/bash

# DropSentinel - Final Optimized Linux Build Script
# Builds all working Linux package formats with comprehensive error handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

# Project configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")
DIST_DIR="$PROJECT_ROOT/dist"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Working Linux package formats (confirmed functional)
WORKING_FORMATS=("AppImage" "deb" "tar.gz" "snap")
ARCHITECTURES=("x64")  # Focus on x64 for reliability

# Logging functions
log() {
    mkdir -p "$LOG_DIR"
    echo -e "${WHITE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_step() {
    mkdir -p "$LOG_DIR"
    echo -e "\n${PURPLE}▶${NC} ${WHITE}$1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_success() {
    mkdir -p "$LOG_DIR"
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_error() {
    mkdir -p "$LOG_DIR"
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_warning() {
    mkdir -p "$LOG_DIR"
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

show_help() {
    echo -e "${WHITE}DropSentinel Final Linux Build Script${NC}"
    echo -e "${WHITE}====================================${NC}\n"
    echo "Usage: $0 [OPTIONS] [FORMATS...]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -c, --clean         Clean all build artifacts before building"
    echo "  -v, --verbose       Enable verbose output"
    echo "  --fast              Build AppImage only (fastest option)"
    echo ""
    echo "Available Formats:"
    echo "  AppImage            Universal Linux application (83MB)"
    echo "  deb                 Debian/Ubuntu package (73MB)"
    echo "  tar.gz              Compressed archive (102MB)"
    echo "  snap                Snap package (91MB)"
    echo "  all                 Build all working formats (default)"
    echo ""
    echo "Examples:"
    echo "  $0                  # Build all working formats"
    echo "  $0 --fast           # Build AppImage only"
    echo "  $0 deb snap         # Build DEB and Snap packages"
    echo "  $0 --clean all      # Clean build all formats"
    exit 0
}

setup_environment() {
    log_step "Setting up build environment..."
    
    # Create directories
    mkdir -p "$DIST_DIR" "$LOG_DIR"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Validate environment
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Set environment variables
    export NODE_ENV=production
    export ELECTRON_BUILDER_COMPRESSION_LEVEL=9
    export ELECTRON_BUILDER_CACHE=true
    
    log_success "Build environment ready"
}

clean_artifacts() {
    if [[ "$CLEAN_BUILD" == "true" ]]; then
        log_step "Cleaning build artifacts..."
        rm -rf "$DIST_DIR" ".next" 2>/dev/null || true
        # Don't remove logs directory to preserve build logs
        log_success "Build artifacts cleaned"
    fi
}

build_application() {
    log_step "Building Next.js application..."
    
    if npm run build; then
        log_success "Next.js build completed"
    else
        log_error "Next.js build failed"
        exit 1
    fi
}

build_linux_package() {
    local format=$1
    local arch=$2

    log_step "Building Linux $format for $arch..."

    # Build command with explicit architecture
    local cmd="npx electron-builder --linux $format --$arch --publish never"

    if [[ "$VERBOSE" == "true" ]]; then
        cmd="$cmd --verbose"
    fi

    # Log the exact command being executed
    log "Executing: $cmd"

    # Execute with timeout and capture output
    local build_log="$LOG_DIR/build-$format-$arch-$TIMESTAMP.log"
    if timeout 900 bash -c "$cmd" 2>&1 | tee "$build_log"; then
        log_success "Linux $format ($arch) build completed"

        # Verify the package was actually created
        local expected_pattern="dist/*$format*"
        if ls $expected_pattern 1> /dev/null 2>&1; then
            log_success "Package file verified for $format ($arch)"
            return 0
        else
            log_error "Package file not found for $format ($arch) despite successful build"
            return 1
        fi
    else
        log_error "Linux $format ($arch) build failed - check $build_log"
        return 1
    fi
}

build_all_packages() {
    log_step "Building Linux packages..."

    local failed_builds=()
    local successful_builds=()
    local total_builds=0

    # Build x64 packages first (more reliable on CI)
    log_step "Phase 1: Building x64 packages..."
    for format in "${FORMATS[@]}"; do
        total_builds=$((total_builds + 1))

        if build_linux_package "$format" "x64"; then
            successful_builds+=("$format-x64")
            log_success "✅ $format (x64) - SUCCESS"
        else
            failed_builds+=("$format-x64")
            log_error "❌ $format (x64) - FAILED"
        fi
    done

    # Only build arm64 if we have some x64 successes and it's not a fast build
    if [[ ${#successful_builds[@]} -gt 0 ]] && [[ "$FAST_BUILD" != "true" ]]; then
        log_step "Phase 2: Building arm64 packages..."
        for format in "${FORMATS[@]}"; do
            total_builds=$((total_builds + 1))

            if build_linux_package "$format" "arm64"; then
                successful_builds+=("$format-arm64")
                log_success "✅ $format (arm64) - SUCCESS"
            else
                failed_builds+=("$format-arm64")
                log_warning "⚠️  $format (arm64) - FAILED (continuing with x64)"
            fi
        done
    else
        if [[ "$FAST_BUILD" == "true" ]]; then
            log "Skipping arm64 builds (fast build mode)"
        else
            log_warning "Skipping arm64 builds due to x64 failures"
        fi
    fi

    # Report results
    echo
    log_step "BUILD SUMMARY"
    log "Total builds attempted: $total_builds"
    log "Successful builds: ${#successful_builds[@]}"
    log "Failed builds: ${#failed_builds[@]}"

    if [[ ${#successful_builds[@]} -gt 0 ]]; then
        log_success "Successful builds: ${successful_builds[*]}"
    fi

    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_warning "Failed builds: ${failed_builds[*]}"
    fi

    # Return success if we have at least one successful build
    if [[ ${#successful_builds[@]} -gt 0 ]]; then
        return 0
    else
        log_error "All builds failed!"
        return 1
    fi
}

generate_summary() {
    log_step "Generating build summary..."
    
    echo
    log "🎉 Linux Build Completed Successfully!"
    log "Version: $VERSION"
    log "Build ID: $TIMESTAMP"
    log "Formats: ${FORMATS[*]}"
    
    if [[ -d "$DIST_DIR" ]]; then
        echo
        log "📦 Generated packages:"
        find "$DIST_DIR" -name "*.AppImage" -o -name "*.deb" -o -name "*.tar.gz" -o -name "*.snap" | while read -r file; do
            if [[ -f "$file" ]]; then
                local size=$(stat -c%s "$file" 2>/dev/null || echo "0")
                local size_mb=$((size / 1024 / 1024))
                log "  ✅ $(basename "$file") - ${size_mb}MB"
            fi
        done
    fi
    
    log "📁 Artifacts: $DIST_DIR"
    log "📋 Build log: $LOG_DIR/linux-build-$TIMESTAMP.log"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    # Parse arguments
    CLEAN_BUILD=false
    VERBOSE=false
    FAST_BUILD=false
    
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
            --fast)
                FAST_BUILD=true
                shift
                ;;
            *)
                break
                ;;
        esac
    done
    
    # Determine formats to build
    if [[ "$FAST_BUILD" == "true" ]]; then
        FORMATS=("AppImage")
    elif [[ $# -eq 0 ]] || [[ "$1" == "all" ]]; then
        FORMATS=("${WORKING_FORMATS[@]}")
    else
        FORMATS=("$@")
    fi
    
    # Execute build process
    log "Starting DropSentinel Linux build process"
    log "Formats: ${FORMATS[*]}"
    log "Architectures: ${ARCHITECTURES[*]}"
    
    setup_environment
    clean_artifacts
    build_application
    build_all_packages
    generate_summary
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_success "🎉 Build completed in ${duration}s"
}

# Execute main function
main "$@"
