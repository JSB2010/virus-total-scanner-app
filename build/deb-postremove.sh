#!/bin/bash
# DropSentinel DEB Post-removal Script
# Enhanced cleanup with comprehensive system cleanup

set -e

PRODUCT_NAME="DropSentinel"
EXECUTABLE_NAME="dropsentinel"
INSTALL_DIR="/opt/DropSentinel"
DESKTOP_FILE="/usr/share/applications/dropsentinel.desktop"
MIME_FILE="/usr/share/mime/packages/dropsentinel.xml"
ICON_DIR="/usr/share/icons/hicolor"
LOG_FILE="/tmp/dropsentinel-postremove.log"
SERVICE_FILE="/etc/systemd/user/dropsentinel-monitor.service"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-POSTREMOVE] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-POSTREMOVE] ✅ $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-POSTREMOVE] ⚠️  $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-POSTREMOVE] ❌ $1" | tee -a "$LOG_FILE"
}

log "Starting DropSentinel comprehensive post-removal cleanup..."

# Remove symlink if it exists
if [ -L "/usr/local/bin/$EXECUTABLE_NAME" ]; then
    log "Removing command-line symlink..."
    rm -f "/usr/local/bin/$EXECUTABLE_NAME" && log_success "Command-line symlink removed" || log_warning "Could not remove symlink"
fi

# Remove systemd service file
if [ -f "$SERVICE_FILE" ]; then
    log "Removing systemd service file..."
    rm -f "$SERVICE_FILE" && log_success "Systemd service file removed" || log_warning "Could not remove service file"
fi

# Remove MIME type file
if [ -f "$MIME_FILE" ]; then
    log "Removing MIME type definitions..."
    rm -f "$MIME_FILE" && log_success "MIME type file removed" || log_warning "Could not remove MIME file"
fi

# Remove udev rules
if [ -f "/etc/udev/rules.d/99-dropsentinel.rules" ]; then
    log "Removing udev rules..."
    rm -f /etc/udev/rules.d/99-dropsentinel.rules && log_success "Udev rules removed" || log_warning "Could not remove udev rules"

    # Reload udev rules
    if command -v udevadm >/dev/null 2>&1; then
        udevadm control --reload-rules 2>/dev/null || true
    fi
fi

# Remove logrotate configuration
if [ -f "/etc/logrotate.d/dropsentinel" ]; then
    log "Removing logrotate configuration..."
    rm -f /etc/logrotate.d/dropsentinel && log_success "Logrotate config removed" || log_warning "Could not remove logrotate config"
fi

# Remove PATH modification
if [ -f "/etc/profile.d/dropsentinel.sh" ]; then
    log "Removing PATH modification..."
    rm -f /etc/profile.d/dropsentinel.sh && log_success "PATH modification removed" || log_warning "Could not remove PATH modification"
fi

# Clean up application data directories (ask user first in real scenario)
if [ -d "/var/lib/dropsentinel" ]; then
    log "Cleaning up application data directories..."

    # Remove cache and logs, but preserve quarantine for security review
    rm -rf /var/lib/dropsentinel/cache 2>/dev/null || true
    rm -rf /var/lib/dropsentinel/logs 2>/dev/null || true

    # Only remove quarantine if it's empty or user specifically requested it
    if [ -d "/var/lib/dropsentinel/quarantine" ]; then
        if [ -z "$(ls -A /var/lib/dropsentinel/quarantine 2>/dev/null)" ]; then
            rmdir /var/lib/dropsentinel/quarantine 2>/dev/null || true
        else
            log_warning "Quarantine directory contains files - preserved for security review"
            echo "⚠️  Quarantine directory preserved at /var/lib/dropsentinel/quarantine"
            echo "   Review contents before manual removal"
        fi
    fi

    # Remove main directory if empty
    rmdir /var/lib/dropsentinel 2>/dev/null || log_warning "Application data directory not empty - preserved"
fi

# Clean up any remaining configuration files (optional)
# Note: We preserve user data by default, but clean up system-wide configs
if [ -d "/etc/dropsentinel" ]; then
    log "Removing system configuration directory..."
    rm -rf /etc/dropsentinel/ 2>/dev/null && log_success "System config directory removed" || log_warning "Could not remove system config"
fi

# Update system databases
log "Updating system databases..."

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    log "Updating desktop database..."
    update-desktop-database /usr/share/applications/ 2>/dev/null && log_success "Desktop database updated" || log_warning "Desktop database update failed"
fi

# Update MIME database
if command -v update-mime-database >/dev/null 2>&1; then
    log "Updating MIME database..."
    update-mime-database /usr/share/mime/ 2>/dev/null && log_success "MIME database updated" || log_warning "MIME database update failed"
fi

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    log "Updating icon cache..."
    gtk-update-icon-cache -f -t "$ICON_DIR/" 2>/dev/null && log_success "Icon cache updated" || log_warning "Icon cache update failed"
fi

# Update font cache
if command -v fc-cache >/dev/null 2>&1; then
    log "Updating font cache..."
    fc-cache -f 2>/dev/null && log_success "Font cache updated" || log_warning "Font cache update failed"
fi

# Show user notification if possible
if command -v notify-send >/dev/null 2>&1; then
    notify-send "DropSentinel" "DropSentinel has been successfully removed from your system. Thank you for using DropSentinel!" 2>/dev/null || true
fi

# Display removal completion message
echo ""
echo "🗑️  DropSentinel has been successfully removed!"
echo ""
echo "Cleaned up:"
echo "  • Application files"
echo "  • Desktop integration"
echo "  • System services"
echo "  • Command-line access"
echo "  • System database entries"
echo ""

# Check for any remaining files
if [ -d "$INSTALL_DIR" ] || [ -f "/usr/local/bin/$EXECUTABLE_NAME" ]; then
    echo "⚠️  Some files may still remain:"
    [ -d "$INSTALL_DIR" ] && echo "  • $INSTALL_DIR"
    [ -f "/usr/local/bin/$EXECUTABLE_NAME" ] && echo "  • /usr/local/bin/$EXECUTABLE_NAME"
    echo ""
fi

log_success "DropSentinel post-removal cleanup completed"
exit 0
