#!/bin/bash

# DropSentinel Linux Build Test Script
# Tests the comprehensive Linux build system and verifies package integrity

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
DIST_DIR="$PROJECT_ROOT/dist"
TEST_DIR="$PROJECT_ROOT/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Test configuration
TEST_FORMATS=("AppImage" "deb" "rpm" "tar.gz")
TEST_ARCHITECTURES=("x64")  # Start with x64 for faster testing

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

show_help() {
    echo -e "${WHITE}DropSentinel Linux Build Test Script${NC}"
    echo -e "${WHITE}===================================${NC}\n"
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -f, --fast          Fast test (AppImage only)"
    echo "  -v, --verbose       Enable verbose output"
    echo "  --clean             Clean before testing"
    echo ""
    echo "This script tests the Linux build system by:"
    echo "  1. Building packages for specified formats"
    echo "  2. Verifying package integrity"
    echo "  3. Testing installation scripts"
    echo "  4. Generating test reports"
    exit 0
}

setup_test_environment() {
    log_step "Setting up test environment..."
    
    # Create test directories
    mkdir -p "$TEST_DIR"
    mkdir -p "$DIST_DIR"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    log_success "Test environment ready"
}

check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check essential tools
    command -v node >/dev/null || missing_tools+=("node")
    command -v npm >/dev/null || missing_tools+=("npm")
    
    # Check package verification tools
    command -v dpkg-deb >/dev/null || log_warning "dpkg-deb not found - DEB verification will be skipped"
    command -v rpm >/dev/null || log_warning "rpm not found - RPM verification will be skipped"
    command -v file >/dev/null || log_warning "file not found - AppImage verification will be limited"
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

test_package_scripts() {
    log_step "Testing package.json scripts..."
    
    # Test that all Linux build scripts are defined
    local scripts=(
        "dist:linux:appimage"
        "dist:linux:deb"
        "dist:linux:rpm"
        "dist:linux:tar"
        "dist:linux:all"
        "dist:linux:comprehensive"
    )
    
    for script in "${scripts[@]}"; do
        if npm run "$script" --silent 2>/dev/null | grep -q "Missing script"; then
            log_error "Script '$script' is not defined in package.json"
            return 1
        else
            log_success "Script '$script' is defined"
        fi
    done
    
    log_success "All package scripts are properly defined"
}

test_build_scripts() {
    log_step "Testing build scripts..."
    
    # Test comprehensive build script
    if [ -f "$SCRIPT_DIR/build-linux-comprehensive.sh" ]; then
        if [ -x "$SCRIPT_DIR/build-linux-comprehensive.sh" ]; then
            log_success "Comprehensive build script is executable"
        else
            log_error "Comprehensive build script is not executable"
            return 1
        fi
    else
        log_error "Comprehensive build script not found"
        return 1
    fi
    
    # Test post-install scripts
    local install_scripts=(
        "build/deb-postinstall.sh"
        "build/deb-preremove.sh"
        "build/deb-postremove.sh"
        "build/rpm-postinstall.sh"
        "build/rpm-preremove.sh"
        "build/rpm-postremove.sh"
    )
    
    for script in "${install_scripts[@]}"; do
        if [ -f "$PROJECT_ROOT/$script" ]; then
            if [ -x "$PROJECT_ROOT/$script" ]; then
                log_success "$(basename "$script") is executable"
            else
                log_warning "$(basename "$script") is not executable"
            fi
        else
            log_error "$(basename "$script") not found"
            return 1
        fi
    done
    
    log_success "All build scripts are present and properly configured"
}

build_test_packages() {
    log_step "Building test packages..."
    
    # Clean previous builds if requested
    if [[ "$CLEAN_BUILD" == "true" ]]; then
        rm -rf "$DIST_DIR"/* 2>/dev/null || true
    fi
    
    # Build Next.js application first
    log "Building Next.js application..."
    if ! npm run build; then
        log_error "Next.js build failed"
        return 1
    fi
    
    # Build packages for each format
    local build_results=()
    
    for format in "${TEST_FORMATS[@]}"; do
        log "Building $format package..."
        
        case "$format" in
            "AppImage")
                if npm run dist:linux:appimage; then
                    build_results+=("$format:SUCCESS")
                    log_success "$format build completed"
                else
                    build_results+=("$format:FAILED")
                    log_error "$format build failed"
                fi
                ;;
            "deb")
                if npm run dist:linux:deb; then
                    build_results+=("$format:SUCCESS")
                    log_success "$format build completed"
                else
                    build_results+=("$format:FAILED")
                    log_error "$format build failed"
                fi
                ;;
            "rpm")
                if npm run dist:linux:rpm; then
                    build_results+=("$format:SUCCESS")
                    log_success "$format build completed"
                else
                    build_results+=("$format:FAILED")
                    log_error "$format build failed"
                fi
                ;;
            "tar.gz")
                if npm run dist:linux:tar; then
                    build_results+=("$format:SUCCESS")
                    log_success "$format build completed"
                else
                    build_results+=("$format:FAILED")
                    log_error "$format build failed"
                fi
                ;;
        esac
    done
    
    # Report build results
    echo
    log_step "BUILD RESULTS"
    for result in "${build_results[@]}"; do
        format="${result%%:*}"
        status="${result##*:}"
        if [[ "$status" == "SUCCESS" ]]; then
            log_success "$format: Build successful"
        else
            log_error "$format: Build failed"
        fi
    done
    
    return 0
}

verify_packages() {
    log_step "Verifying generated packages..."
    
    if [ ! -d "$DIST_DIR" ]; then
        log_error "Distribution directory not found"
        return 1
    fi
    
    local verification_results=()
    
    # Verify DEB packages
    for deb in "$DIST_DIR"/*.deb; do
        if [ -f "$deb" ]; then
            log "Verifying DEB package: $(basename "$deb")"
            if command -v dpkg-deb >/dev/null 2>&1; then
                if dpkg-deb --info "$deb" >/dev/null 2>&1; then
                    verification_results+=("DEB:SUCCESS")
                    log_success "DEB package verification passed"
                else
                    verification_results+=("DEB:FAILED")
                    log_error "DEB package verification failed"
                fi
            else
                verification_results+=("DEB:SKIPPED")
                log_warning "DEB verification skipped (dpkg-deb not available)"
            fi
        fi
    done
    
    # Verify RPM packages
    for rpm in "$DIST_DIR"/*.rpm; do
        if [ -f "$rpm" ]; then
            log "Verifying RPM package: $(basename "$rpm")"
            if command -v rpm >/dev/null 2>&1; then
                if rpm -qip "$rpm" >/dev/null 2>&1; then
                    verification_results+=("RPM:SUCCESS")
                    log_success "RPM package verification passed"
                else
                    verification_results+=("RPM:FAILED")
                    log_error "RPM package verification failed"
                fi
            else
                verification_results+=("RPM:SKIPPED")
                log_warning "RPM verification skipped (rpm not available)"
            fi
        fi
    done
    
    # Verify AppImage packages
    for appimage in "$DIST_DIR"/*.AppImage; do
        if [ -f "$appimage" ]; then
            log "Verifying AppImage: $(basename "$appimage")"
            if command -v file >/dev/null 2>&1; then
                if file "$appimage" | grep -q "ELF"; then
                    verification_results+=("AppImage:SUCCESS")
                    log_success "AppImage verification passed"
                else
                    verification_results+=("AppImage:FAILED")
                    log_error "AppImage verification failed"
                fi
            else
                verification_results+=("AppImage:SKIPPED")
                log_warning "AppImage verification skipped (file command not available)"
            fi
        fi
    done
    
    # Verify TAR.GZ packages
    for tar in "$DIST_DIR"/*.tar.gz; do
        if [ -f "$tar" ]; then
            log "Verifying TAR.GZ archive: $(basename "$tar")"
            if tar -tzf "$tar" >/dev/null 2>&1; then
                verification_results+=("TAR.GZ:SUCCESS")
                log_success "TAR.GZ verification passed"
            else
                verification_results+=("TAR.GZ:FAILED")
                log_error "TAR.GZ verification failed"
            fi
        fi
    done
    
    # Report verification results
    echo
    log_step "VERIFICATION RESULTS"
    for result in "${verification_results[@]}"; do
        format="${result%%:*}"
        status="${result##*:}"
        case "$status" in
            "SUCCESS") log_success "$format: Verification passed" ;;
            "FAILED") log_error "$format: Verification failed" ;;
            "SKIPPED") log_warning "$format: Verification skipped" ;;
        esac
    done
    
    return 0
}

generate_test_report() {
    log_step "Generating test report..."
    
    local report_file="$TEST_DIR/linux-build-test-$TIMESTAMP.json"
    local packages=()
    
    # Scan for generated packages
    if [ -d "$DIST_DIR" ]; then
        while IFS= read -r -d '' file; do
            local filename=$(basename "$file")
            local size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            packages+=("{\"name\":\"$filename\",\"size\":$size}")
        done < <(find "$DIST_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.tar.gz" \) -print0)
    fi
    
    # Generate JSON report
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "testId": "$TIMESTAMP",
  "testedFormats": [$(printf '"%s",' "${TEST_FORMATS[@]}" | sed 's/,$//')]",
  "testedArchitectures": [$(printf '"%s",' "${TEST_ARCHITECTURES[@]}" | sed 's/,$//')]",
  "packages": [$(IFS=,; echo "${packages[*]}")],
  "summary": {
    "totalPackages": ${#packages[@]},
    "testDuration": "$(date -d@$(($(date +%s) - TEST_START_TIME)) -u +%H:%M:%S 2>/dev/null || echo "unknown")"
  }
}
EOF
    
    log_success "Test report generated: $report_file"
    
    # Display summary
    echo
    log_step "TEST SUMMARY"
    echo "============"
    log "Test ID: $TIMESTAMP"
    log "Tested formats: ${TEST_FORMATS[*]}"
    log "Generated packages: ${#packages[@]}"
    
    if [ ${#packages[@]} -gt 0 ]; then
        echo
        log "Generated packages:"
        find "$DIST_DIR" -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.tar.gz" \) -exec basename {} \; | sort | while read -r file; do
            echo "  📦 $file"
        done
    fi
}

# Main execution
main() {
    TEST_START_TIME=$(date +%s)
    
    # Parse command line arguments
    FAST_TEST=false
    VERBOSE=false
    CLEAN_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                ;;
            -f|--fast)
                FAST_TEST=true
                TEST_FORMATS=("AppImage")
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --clean)
                CLEAN_BUILD=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                ;;
        esac
    done
    
    # Run tests
    log_step "🧪 Starting DropSentinel Linux Build Tests"
    log "Test configuration:"
    log "  Formats: ${TEST_FORMATS[*]}"
    log "  Architectures: ${TEST_ARCHITECTURES[*]}"
    log "  Fast test: $FAST_TEST"
    log "  Clean build: $CLEAN_BUILD"
    
    setup_test_environment
    check_prerequisites
    test_package_scripts
    test_build_scripts
    build_test_packages
    verify_packages
    generate_test_report
    
    log_success "🎉 Linux build tests completed!"
    log "📁 Test results: $TEST_DIR"
    log "📦 Generated packages: $DIST_DIR"
}

# Execute main function with all arguments
main "$@"
