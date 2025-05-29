#!/bin/bash
# DropSentinel DEB Post-installation Script

set -e

PRODUCT_NAME="DropSentinel"
DESKTOP_FILE="/usr/share/applications/dropsentinel.desktop"
LOG_FILE="/tmp/dropsentinel-postinstall.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-POSTINSTALL] $1" | tee -a "$LOG_FILE"
}

log "Starting DropSentinel post-installation..."

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

# Set proper permissions for the application
if [ -d "/opt/DropSentinel" ]; then
    log "Setting application permissions..."
    chmod -R 755 /opt/DropSentinel/
    
    # Make the main executable file executable
    if [ -f "/opt/DropSentinel/dropsentinel" ]; then
        chmod +x /opt/DropSentinel/dropsentinel
    fi
fi

# Create symlink in /usr/local/bin if it doesn't exist
if [ -f "/opt/DropSentinel/dropsentinel" ] && [ ! -L "/usr/local/bin/dropsentinel" ]; then
    log "Creating command-line symlink..."
    ln -sf /opt/DropSentinel/dropsentinel /usr/local/bin/dropsentinel 2>/dev/null || true
fi

# Display installation success message
log "DropSentinel installation completed successfully!"

# Show user notification if possible
if command -v notify-send >/dev/null 2>&1; then
    notify-send "DropSentinel" "Installation completed successfully! You can now launch DropSentinel from your applications menu." 2>/dev/null || true
fi

log "Post-installation script completed"
exit 0
