#!/bin/bash
# DropSentinel RPM Post-removal Script

set -e

PRODUCT_NAME="DropSentinel"
LOG_FILE="/tmp/dropsentinel-postremove.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [RPM-POSTREMOVE] $1" | tee -a "$LOG_FILE"
}

log "Starting DropSentinel RPM post-removal cleanup..."

# Remove symlink from /usr/local/bin
if [ -L "/usr/local/bin/dropsentinel" ]; then
    log "Removing command-line symlink..."
    rm -f /usr/local/bin/dropsentinel
fi

# Remove PATH modification
if [ -f "/etc/profile.d/dropsentinel.sh" ]; then
    log "Removing PATH modification..."
    rm -f /etc/profile.d/dropsentinel.sh
fi

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    log "Updating desktop database..."
    update-desktop-database /usr/share/applications/ 2>/dev/null || true
fi

# Update MIME database
if command -v update-mime-database >/dev/null 2>&1; then
    log "Updating MIME database..."
    update-mime-database /usr/share/mime/ 2>/dev/null || true
fi

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    log "Updating icon cache..."
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor/ 2>/dev/null || true
fi

# Clean up any remaining configuration files (optional)
# Note: We preserve user data by default, but clean up system-wide configs
if [ -d "/etc/dropsentinel" ]; then
    log "Removing system configuration directory..."
    rm -rf /etc/dropsentinel/ 2>/dev/null || true
fi

# Show user notification if possible
if command -v notify-send >/dev/null 2>&1; then
    notify-send "DropSentinel" "DropSentinel has been successfully removed from your system." 2>/dev/null || true
fi

log "DropSentinel RPM removal completed successfully!"
log "RPM post-removal script completed"
exit 0
