#!/bin/bash

# DropSentinel Comprehensive Linux Build Script
# Builds all Linux package formats with enhanced features and optimizations

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

# Linux package targets (supported by electron-builder 26.0+)
# Only include formats that are confirmed working
LINUX_TARGETS=(
    "AppImage"
    "deb"
    "tar.gz"
    "snap"
)

# Architecture support
ARCHITECTURES=("x64" "arm64")

# Functions
log() {
    echo -e "${WHITE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_step() {
    echo -e "\n${PURPLE}▶${NC} ${WHITE}$1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_DIR/linux-build-$TIMESTAMP.log"
}

show_help() {
    echo -e "${WHITE}DropSentinel Comprehensive Linux Build Script${NC}"
    echo -e "${WHITE}=============================================${NC}\n"
    echo "Usage: $0 [OPTIONS] [TARGETS...]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -c, --clean         Clean all build artifacts before building"
    echo "  -v, --verbose       Enable verbose output"
    echo "  -f, --fast          Fast build (AppImage x64 only)"
    echo "  --x64-only          Build only x64 architecture"
    echo "  --arm64-only        Build only ARM64 architecture"
    echo "  --no-deps           Skip dependency installation"
    echo "  --parallel          Build targets in parallel"
    echo ""
    echo "Available Targets:"
    echo "  AppImage            Universal Linux application format"
    echo "  deb                 Debian/Ubuntu package"
    echo "  tar.gz              Compressed archive"
    echo "  snap                Snap package (Ubuntu/derivatives)"
    echo "  all                 Build all working targets (default)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Build all targets for all architectures"
    echo "  $0 deb snap                 # Build only DEB and Snap packages"
    echo "  $0 --x64-only AppImage      # Build AppImage for x64 only"
    echo "  $0 --clean --verbose all    # Clean build with verbose output"
    exit 0
}

setup_logging() {
    mkdir -p "$LOG_DIR"
    log "Starting comprehensive Linux build process"
    log "Version: $VERSION"
    log "Timestamp: $TIMESTAMP"
    log "Targets: ${TARGETS[*]}"
    log "Architectures: ${ARCHITECTURES[*]}"
}

check_system_dependencies() {
    log_step "Checking system dependencies..."
    
    # Check essential tools
    local missing_tools=()
    
    # Basic build tools
    command -v node >/dev/null || missing_tools+=("node")
    command -v npm >/dev/null || missing_tools+=("npm")

    # Check for electron-builder (can be local or global)
    if ! command -v electron-builder >/dev/null 2>&1; then
        # Check if it's available locally in node_modules
        if [ ! -f "node_modules/.bin/electron-builder" ]; then
            missing_tools+=("electron-builder")
        fi
    fi
    
    # Package-specific tools
    command -v dpkg-deb >/dev/null || log_warning "dpkg-deb not found - DEB builds may fail"
    command -v rpmbuild >/dev/null || log_warning "rpmbuild not found - RPM builds may fail"
    command -v snapcraft >/dev/null || log_warning "snapcraft not found - Snap builds may fail"
    command -v flatpak-builder >/dev/null || log_warning "flatpak-builder not found - Flatpak builds may fail"
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    log_success "System dependencies check completed"
}

install_build_dependencies() {
    if [[ "$SKIP_DEPS" != "true" ]]; then
        log_step "Installing/updating build dependencies..."
        
        # Install Node.js dependencies
        npm ci --legacy-peer-deps
        
        # Install system packages based on distribution
        if command -v apt-get >/dev/null 2>&1; then
            log "Installing Debian/Ubuntu build dependencies..."
            sudo apt-get update
            sudo apt-get install -y \
                build-essential \
                libnss3-dev \
                libgtk-3-dev \
                libasound2-dev \
                libxtst6 \
                libasound2 \
                libgtk-3-0 \
                rpm \
                fakeroot
        elif command -v yum >/dev/null 2>&1; then
            log "Installing RHEL/CentOS build dependencies..."
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y \
                nss-devel \
                gtk3-devel \
                alsa-lib-devel \
                libXtst \
                alsa-lib \
                gtk3 \
                rpm-build \
                snapcraft \
                flatpak-builder
        elif command -v pacman >/dev/null 2>&1; then
            log "Installing Arch Linux build dependencies..."
            sudo pacman -S --needed --noconfirm \
                base-devel \
                nss \
                gtk3 \
                alsa-lib \
                libxtst
        fi
        
        log_success "Build dependencies installed"
    else
        log "Skipping dependency installation"
    fi
}

validate_build_environment() {
    log_step "Validating build environment..."

    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi

    # Check if electron-builder is configured
    if ! grep -q '"electron-builder"' package.json; then
        log_error "electron-builder not found in package.json"
        exit 1
    fi

    # Check available disk space (need at least 2GB)
    local available_space=$(df . | tail -1 | awk '{print $4}')
    local required_space=2097152  # 2GB in KB
    if [[ $available_space -lt $required_space ]]; then
        log_warning "Low disk space detected. Build may fail."
    fi

    log_success "Build environment validation completed"
}

prepare_build_environment() {
    log_step "Preparing build environment..."

    # Create necessary directories
    mkdir -p "$DIST_DIR"
    mkdir -p "$BUILD_DIR"
    mkdir -p "public/assets"
    mkdir -p "$LOG_DIR"

    # Ensure build scripts are executable
    chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true
    chmod +x "$BUILD_DIR"/*.sh 2>/dev/null || true

    # Set environment variables for optimized builds
    export NODE_ENV=production
    export ELECTRON_BUILDER_COMPRESSION_LEVEL=9
    export ELECTRON_BUILDER_CACHE=true
    export DEBUG=${VERBOSE:+electron-builder}
    export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

    log_success "Build environment prepared"
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

build_next_application() {
    log_step "Building Next.js application..."
    
    if npm run build; then
        log_success "Next.js build completed"
    else
        log_error "Next.js build failed"
        exit 1
    fi
}

build_linux_target() {
    local target=$1
    local arch=$2

    log_step "Building Linux $target for $arch..."

    # Skip known problematic combinations
    if [[ "$target" == "snap" && "$arch" == "arm64" ]]; then
        log_warning "Skipping Snap ARM64 build (not commonly supported)"
        return 0
    fi

    # Build command - prefer local electron-builder, fallback to npx
    local cmd=""
    if [ -f "node_modules/.bin/electron-builder" ]; then
        cmd="./node_modules/.bin/electron-builder --linux $target --$arch --publish never"
    elif command -v electron-builder >/dev/null 2>&1; then
        cmd="electron-builder --linux $target --$arch --publish never"
    else
        cmd="npx --yes electron-builder --linux $target --$arch --publish never"
    fi

    if [[ "$VERBOSE" == "true" ]]; then
        cmd="$cmd --verbose"
    fi

    # Execute build with timeout and error handling
    local timeout_duration=600  # 10 minutes
    if timeout "$timeout_duration" bash -c "$cmd"; then
        log_success "Linux $target ($arch) build completed"
        return 0
    else
        local exit_code=$?
        if [[ $exit_code -eq 124 ]]; then
            log_error "Linux $target ($arch) build timed out after ${timeout_duration}s"
        else
            log_error "Linux $target ($arch) build failed with exit code $exit_code"
        fi
        return 1
    fi
}

build_all_targets() {
    log_step "Building all Linux targets..."
    
    local failed_builds=()
    local successful_builds=()
    local total_builds=0
    
    for target in "${TARGETS[@]}"; do
        for arch in "${ARCHITECTURES[@]}"; do
            total_builds=$((total_builds + 1))
            
            if build_linux_target "$target" "$arch"; then
                successful_builds+=("$target-$arch")
            else
                failed_builds+=("$target-$arch")
            fi
        done
    done
    
    # Report results
    echo
    log_step "BUILD SUMMARY"
    echo "=============="
    log "Total builds attempted: $total_builds"
    log "Successful builds: ${#successful_builds[@]}"
    log "Failed builds: ${#failed_builds[@]}"
    
    if [[ ${#successful_builds[@]} -gt 0 ]]; then
        log_success "Successful builds: ${successful_builds[*]}"
    fi
    
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log_error "Failed builds: ${failed_builds[*]}"
        return 1
    fi
    
    return 0
}

generate_build_report() {
    log_step "Generating comprehensive build report..."
    
    local report_file="$DIST_DIR/linux-build-report-$TIMESTAMP.json"
    local artifacts=()
    
    # Scan for artifacts
    if [[ -d "$DIST_DIR" ]]; then
        while IFS= read -r -d '' file; do
            local filename=$(basename "$file")
            local size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            local size_formatted=$(numfmt --to=iec-i --suffix=B "$size" 2>/dev/null || echo "${size}B")

            artifacts+=("{\"name\":\"$filename\",\"size\":$size,\"sizeFormatted\":\"$size_formatted\"}")
        done < <(find "$DIST_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.tar.gz" -o -name "*.snap" -o -name "*.flatpak" \) -print0)
    fi
    
    # Generate JSON report
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "$VERSION",
  "platform": "linux",
  "buildId": "$TIMESTAMP",
  "targets": [$(printf '"%s",' "${TARGETS[@]}" | sed 's/,$//')]",
  "architectures": [$(printf '"%s",' "${ARCHITECTURES[@]}" | sed 's/,$//')]",
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
    log_step "LINUX BUILD SUMMARY"
    echo "==================="
    log "Version: $VERSION"
    log "Build ID: $TIMESTAMP"
    log "Targets: ${TARGETS[*]}"
    log "Architectures: ${ARCHITECTURES[*]}"
    log "Artifacts: ${#artifacts[@]}"
    
    if [[ ${#artifacts[@]} -gt 0 ]]; then
        echo
        log "Generated Linux packages:"
        find "$DIST_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.tar.gz" -o -name "*.snap" -o -name "*.flatpak" \) -exec basename {} \; | sort | while read -r file; do
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
    PARALLEL=false
    X64_ONLY=false
    ARM64_ONLY=false
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
            -f|--fast)
                FAST_BUILD=true
                X64_ONLY=true
                shift
                ;;
            --x64-only)
                X64_ONLY=true
                shift
                ;;
            --arm64-only)
                ARM64_ONLY=true
                shift
                ;;
            --no-deps)
                SKIP_DEPS=true
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
    
    # Determine targets
    if [[ "$FAST_BUILD" == "true" ]]; then
        TARGETS=("AppImage")
    elif [[ $# -eq 0 ]] || [[ "$1" == "all" ]]; then
        TARGETS=("${LINUX_TARGETS[@]}")
    else
        TARGETS=("$@")
    fi
    
    # Determine architectures
    if [[ "$X64_ONLY" == "true" ]]; then
        ARCHITECTURES=("x64")
    elif [[ "$ARM64_ONLY" == "true" ]]; then
        ARCHITECTURES=("arm64")
    fi
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Setup and build
    setup_logging
    validate_build_environment
    check_system_dependencies
    clean_build_artifacts
    prepare_build_environment
    install_build_dependencies
    build_next_application
    build_all_targets
    generate_build_report
    
    log_success "🎉 Comprehensive Linux build process completed!"
    log "📁 Artifacts available in: $DIST_DIR"
    log "📋 Build log: $LOG_DIR/linux-build-$TIMESTAMP.log"
}

# Execute main function with all arguments
main "$@"
